"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { generateToken, tokenExpiresAt } from "@/lib/tokens";
import { parseResumeAndScore, generateInterviewRubric } from "@/lib/ai";
import * as XLSX from "xlsx";
import { dispatchInterviewFulfillment } from "@/lib/mcp";
import { checkProgramAccess } from "@/lib/permissions";
import { invalidateCache } from "@/lib/redis";

async function getOrgMembership(userId: string) {
  return prisma.organizationMember.findFirst({ where: { userId } });
}

// ─── ADD SINGLE CANDIDATE (recruiter, direct) ──────────────────────────────

export async function addCandidate(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const membership = await getOrgMembership(session.user.id);
  if (!membership) throw new Error("No organization found");

  const programId = parseInt(formData.get("programId") as string);
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const phone = (formData.get("phone") as string)?.trim() || null;
  const linkedIn = (formData.get("linkedIn") as string)?.trim() || null;
  const resumeFile = formData.get("resume") as File | null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!programId || !name || !email) throw new Error("Name and email are required");

  // Story 16.4: Granular Access Check
  const accessRole = await checkProgramAccess(programId, session.user.id);
  if (accessRole === "NONE") {
    throw new Error("You do not have access to manage candidates for this program.");
  }

  // 10.1: Verify program exists
  const program = await prisma.program.findUnique({
    where: { id: programId, deletedAt: null },
  });
  if (!program) throw new Error("Program not found");

  let atsScore: number | null = null;
  let atsReason: string | null = null;
  let currentRole: string | null = null;
  let currentCompany: string | null = null;
  let yearsExperience: number | null = null;

  if (resumeFile && resumeFile.size > 0) {
    try {
      const buffer = Buffer.from(await resumeFile.arrayBuffer());
      const aiResult = await parseResumeAndScore(buffer, program.name, program.description || undefined);
      atsScore = aiResult.score;
      atsReason = aiResult.reason;
      if (aiResult.extractedInfo) {
        currentRole = aiResult.extractedInfo.currentRole || null;
        currentCompany = aiResult.extractedInfo.currentCompany || null;
        yearsExperience = aiResult.extractedInfo.yearsExperience || null;
      }
    } catch (error) {
      console.error("[addCandidate] Resume parsing failed, continuing with null score:", error);
      atsScore = null;
      atsReason = "Resume parsing failed or PDF unreadable. Manual review required.";
    }
  }

  await prisma.candidate.upsert({
    where: { programId_email: { programId, email } },
    create: {
      programId,
      organizationId: membership.organizationId,
      name,
      email,
      phone,
      linkedIn,
      currentRole,
      currentCompany,
      yearsExperience,
      notes,
      source: "DIRECT",
      status: "DRAFT",
      atsScore,
      atsReason,
    },
    update: { 
      name, 
      phone, 
      linkedIn, 
      currentRole: currentRole ?? undefined, 
      currentCompany: currentCompany ?? undefined, 
      yearsExperience: yearsExperience ?? undefined, 
      notes,
      atsScore,
      atsReason,
      deletedAt: null // Restore if it was deleted
    },
  });

  await invalidateCache(`control-tower:${programId}`);
  revalidatePath(`/programs/${programId}/candidates`);
}

// ─── BULK UPLOAD (recruiter, Excel) ────────────────────────────────────────

export type BulkUploadResult = {
  created: number;
  skipped: number;
  errors: { row: number; reason: string }[];
};

export async function bulkUploadCandidates(formData: FormData): Promise<BulkUploadResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const membership = await getOrgMembership(session.user.id);
  if (!membership) throw new Error("No organization found");

  const programId = parseInt(formData.get("programId") as string);
  const file = formData.get("file") as File;
  if (!file || !programId) throw new Error("File and program ID required");

  // 10.1: Verify ownership
  const program = await prisma.program.findUnique({
    where: { id: programId, organizationId: membership.organizationId, deletedAt: null }
  });
  if (!program) throw new Error("Unauthorized");

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: "" });

  const result: BulkUploadResult = { created: 0, skipped: 0, errors: [] };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;
    const name = String(row["name"] || row["Name"] || "").trim();
    const email = String(row["email"] || row["Email"] || "").trim().toLowerCase();

    if (!name || !email) {
      result.errors.push({ row: rowNum, reason: "Missing name or email" });
      continue;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      result.errors.push({ row: rowNum, reason: `Invalid email: ${email}` });
      continue;
    }

    const phone = String(row["phone"] || row["Phone"] || "").trim() || null;
    const linkedIn = String(row["linkedin"] || row["LinkedIn"] || row["linkedIn"] || "").trim() || null;
    const currentRole = String(row["current_role"] || row["currentRole"] || row["Current Role"] || "").trim() || null;
    const currentCompany = String(row["current_company"] || row["currentCompany"] || row["Current Company"] || "").trim() || null;
    const yearsRaw = String(row["years_experience"] || row["Years Experience"] || "").trim();
    const yearsExperience = yearsRaw && !isNaN(parseInt(yearsRaw)) ? parseInt(yearsRaw) : null;

    try {
      const existing = await prisma.candidate.findUnique({
        where: { programId_email: { programId, email } },
      });
      if (existing) {
        result.skipped++;
        continue;
      }
      await prisma.candidate.create({
        data: {
          programId,
          organizationId: membership.organizationId,
          name,
          email,
          phone,
          linkedIn,
          currentRole,
          currentCompany,
          yearsExperience,
          source: "DIRECT",
          status: "DRAFT",
        },
      });
      result.created++;
    } catch {
      result.errors.push({ row: rowNum, reason: "Failed to save (possible duplicate)" });
    }
  }

  await invalidateCache(`control-tower:${programId}`);
  revalidatePath(`/programs/${programId}/candidates`);
  return result;
}

// ─── UPDATE RESUME URL ─────────────────────────────────────────────────────

export async function updateCandidateResume(candidateId: number, resumeUrl: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const membership = await getOrgMembership(session.user.id);
  if (!membership) throw new Error("Unauthorized");

  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    include: { program: true }
  });

  if (!candidate || candidate.program.organizationId !== membership.organizationId) {
    throw new Error("Unauthorized");
  }

  await prisma.candidate.update({
    where: { id: candidateId },
    data: { resumeUrl: resumeUrl.trim() || null },
  });

  revalidatePath(`/programs/${candidate.programId}/candidates`);
}

// ─── SCREEN CANDIDATE (SCREENING → DRAFT) ─────────────────────────────────

export async function approveScreening(candidateId: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const membership = await getOrgMembership(session.user.id);
  if (!membership) throw new Error("Unauthorized");

  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    include: { program: true }
  });

  if (!candidate || candidate.program.organizationId !== membership.organizationId) {
    throw new Error("Unauthorized");
  }

  await prisma.candidate.update({
    where: { id: candidateId },
    data: { status: "DRAFT" },
  });

  await invalidateCache(`control-tower:${candidate.programId}`);
  revalidatePath(`/programs/${candidate.programId}/candidates`);
}

// ─── SHORTLIST & ACTIVATE ──────────────────────────────────────────────────

export async function shortlistAndActivate(candidateId: number, roundId: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const membership = await getOrgMembership(session.user.id);
  if (!membership) throw new Error("Unauthorized");

  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    include: { program: true }
  });

  if (!candidate || candidate.program.organizationId !== membership.organizationId) {
    throw new Error("Unauthorized");
  }

  if (candidate.status === "BOOKED" || candidate.status === "COMPLETED") {
    throw new Error("Candidate is already scheduled or completed. Cancel existing booking first.");
  }

  const token = generateToken();
  const exp = tokenExpiresAt(72);

  await prisma.candidate.update({
    where: { id: candidateId },
    data: {
      status: "ACTIVE",
      activeRoundId: roundId,
      bookingToken: token,
      bookingTokenExp: exp,
      bookingRoundId: roundId,
    },
  });

  await invalidateCache(`control-tower:${candidate.programId}`);
  revalidatePath(`/programs/${candidate.programId}/candidates`);
}

// ─── REJECT ────────────────────────────────────────────────────────────────

export async function rejectCandidate(candidateId: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const membership = await getOrgMembership(session.user.id);
  if (!membership) throw new Error("Unauthorized");

  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    include: { program: true }
  });

  if (!candidate || candidate.program.organizationId !== membership.organizationId) {
    throw new Error("Unauthorized");
  }

  await prisma.candidate.update({
    where: { id: candidateId },
    data: { status: "REJECTED" },
  });

  await invalidateCache(`control-tower:${candidate.programId}`);
  revalidatePath(`/programs/${candidate.programId}/candidates`);
}

export async function promoteCandidate(candidateId: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    include: { 
      program: { 
        include: { 
          rounds: { 
            where: { deletedAt: null },
            include: { panelists: true },
            orderBy: { roundNumber: "asc" } 
          } 
        } 
      },
      activeRound: true,
      bookings: {
        where: { status: "SCHEDULED" }
      }
    }
  });

  if (!candidate) throw new Error("Candidate not found");

  // Story 16.4: Granular Access Check
  const accessRole = await checkProgramAccess(candidate.programId, session.user.id);
  if (accessRole === "NONE") {
    throw new Error("You do not have access to manage candidates for this program.");
  }

  // Story 15.13: Premature Promotion Guard
  if (candidate.bookings.length > 0) {
    throw new Error("Cannot promote candidate while they have a scheduled interview. Please complete or cancel the current booking first.");
  }

  const currentRoundNumber = candidate.activeRound?.roundNumber || 0;
  const nextRound = candidate.program.rounds.find(r => r.roundNumber > currentRoundNumber);

  if (!nextRound) {
    throw new Error("This candidate is already in the final round");
  }

  // Story 15.11: Supply-Aware Promotion
  if (nextRound.panelists.length === 0) {
    throw new Error(`Cannot promote to ${nextRound.name}: No panelists assigned to this round yet. Please assign panelists before activating candidates.`);
  }

  const token = generateToken();
  const exp = tokenExpiresAt(72);

  await prisma.candidate.update({
    where: { id: candidateId },
    data: {
      status: "ACTIVE",
      activeRoundId: nextRound.id,
      bookingToken: token,
      bookingTokenExp: exp,
      bookingRoundId: nextRound.id,
    },
  });

  await invalidateCache(`control-tower:${candidate.programId}`);
  revalidatePath(`/programs/${candidate.programId}/candidates/${candidateId}`);
}

// ─── CONFIRM BOOKING ───────────────────────────────────────────────────────

type SlotEntry = { start: string; end: string; booked: boolean; bookingId?: number };

export async function confirmBooking(token: string, panelistId: number, slotStart: string, slotEnd: string) {
  const booking = await prisma.$transaction(async (tx) => {
    const candidate = await tx.candidate.findUnique({
      where: { bookingToken: token },
      include: { program: true, activeRound: true }
    });

    if (!candidate || candidate.program.deletedAt) throw new Error("Invalid booking link or program closed");
    
    // Story 15.19: Transactional Double-Booking Prevention
    if (candidate.status !== "ACTIVE") {
      throw new Error("This candidate has already been scheduled or is in a different state. Please check your email.");
    }

    if (!candidate.bookingTokenExp || candidate.bookingTokenExp < new Date()) {
      throw new Error("Booking link has expired");
    }
    if (!candidate.activeRoundId) throw new Error("No active round assigned");

    // 10.3: Temporal validation
    const startTime = new Date(slotStart);
    if (startTime < new Date()) {
      throw new Error("This slot is in the past. Please pick another one.");
    }

    // 10.3: Duration validation
    const endTime = new Date(slotEnd);
    const duration = (endTime.getTime() - startTime.getTime()) / 60000;
    if (duration !== candidate.activeRound?.durationMinutes) {
      throw new Error("Invalid slot duration for this round");
    }

    const panelist = await tx.programPanelist.findUnique({
      where: { id: panelistId },
    });

    if (!panelist) throw new Error("Panelist not found");

    // Story 13.1: Global conflict check (across all programs for this human interviewer)
    const existingConflict = await tx.booking.findFirst({
      where: {
        programPanelist: {
          externalEmail: panelist.externalEmail,
        },
        status: "SCHEDULED",
        OR: [
          {
            slotStart: { lte: startTime },
            slotEnd: { gt: startTime },
          },
          {
            slotStart: { lt: endTime },
            slotEnd: { gte: endTime },
          }
        ]
      }
    });

    if (existingConflict) {
      throw new Error("This interviewer just became busy in another program for this time slot. Please pick another time.");
    }

    const slots = (panelist.availableSlots as SlotEntry[]) || [];
    const slotIndex = slots.findIndex(s => s.start === slotStart && s.end === slotEnd);

    if (slotIndex === -1) throw new Error("Slot no longer exists");
    if (slots[slotIndex].booked) throw new Error("This slot was just taken by someone else. Please refresh and pick another.");

    const newBooking = await tx.booking.create({
      data: {
        candidateId: candidate.id,
        programPanelistId: panelistId,
        roundId: candidate.activeRoundId,
        slotStart: startTime,
        slotEnd: endTime,
        status: "SCHEDULED",
      },
    });

    slots[slotIndex].booked = true;
    slots[slotIndex].bookingId = newBooking.id;

    await tx.programPanelist.update({
      where: { id: panelistId },
      data: { availableSlots: slots },
    });

    await tx.candidate.update({
      where: { id: candidate.id },
      data: { 
        status: "BOOKED", 
        bookingToken: null 
      },
    });

    return newBooking;
  }, {
    isolationLevel: "Serializable",
  });

  await invalidateCache(`control-tower:${booking.candidate.programId}`);

  // Story 6.2: Dispatch fulfillment asynchronously
  dispatchInterviewFulfillment(booking.id).catch(console.error);

  // Story 12.1: Generate AI Rubric asynchronously
  (async () => {
    try {
      const fullBooking = await prisma.booking.findUnique({
        where: { id: booking.id },
        include: { candidate: true, round: true, programPanelist: { include: { program: true } } }
      });
      if (!fullBooking) return;

      const rubric = await generateInterviewRubric(
        fullBooking.candidate.resumeUrl,
        fullBooking.programPanelist.program.name,
        fullBooking.round.name,
        (fullBooking.round.focusAreas as string[]) || undefined
      );

      if (rubric) {
        await prisma.booking.update({
          where: { id: booking.id },
          data: { aiRubric: rubric }
        });
      }
    } catch (err) {
      console.error("Async Rubric Gen Error:", err);
    }
  })();

  return booking;
}

// ─── CANCEL BOOKING (Candidate side) ──────────────────────────────────────

export async function cancelBooking(bookingId: number) {
  const b = await prisma.booking.findUnique({ 
    where: { id: bookingId },
    include: { candidate: true } 
  });
  if (!b) throw new Error("Booking not found");

  // Story 14.3: Rescheduling Lock (2 hours)
  const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000);
  if (b.slotStart < twoHoursFromNow) {
    throw new Error("Interviews cannot be cancelled or rescheduled within 2 hours of the start time. Please contact your recruiter.");
  }

  const result = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: { 
        candidate: true,
        programPanelist: true
      }
    });

    if (!booking) throw new Error("Booking not found");
    if (booking.status === "CANCELLED") return null;

    // 1. Mark booking as cancelled
    await tx.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" }
    });

    // 2. Free up panelist slot
    const slots = (booking.programPanelist.availableSlots as SlotEntry[]) || [];
    const updatedSlots = slots.map(s => 
      s.bookingId === bookingId ? { ...s, booked: false, bookingId: undefined } : s
    );

    await tx.programPanelist.update({
      where: { id: booking.programPanelistId },
      data: { availableSlots: updatedSlots }
    });

    // 3. Reactivate candidate and generate NEW token for rescheduling
    const newToken = generateToken();
    const exp = tokenExpiresAt(72);

    await tx.candidate.update({
      where: { id: booking.candidateId },
      data: {
        status: "ACTIVE",
        bookingToken: newToken,
        bookingTokenExp: exp
      }
    });

    return { newToken };
  });

  await invalidateCache(`control-tower:${b.candidate.programId}`);
  return result;
}

// ─── RECRUITER ACTIONS (Story 14.1 & 14.2) ──────────────────────────────────

export async function cancelBookingByRecruiter(bookingId: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { candidate: { include: { program: true } }, programPanelist: true }
  });

  if (!booking) throw new Error("Booking not found");

  // Story 16.4: Granular Access Check
  const accessRole = await checkProgramAccess(booking.candidate.programId, session.user.id);
  if (accessRole === "NONE") {
    throw new Error("You do not have access to manage bookings for this program.");
  }

  await prisma.$transaction(async (tx) => {
    // 1. Cancel booking
    await tx.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" }
    });

    // 2. Restore slot
    const slots = (booking.programPanelist.availableSlots as SlotEntry[]) || [];
    const updatedSlots = slots.map(s => 
      s.bookingId === bookingId ? { ...s, booked: false, bookingId: undefined } : s
    );

    await tx.programPanelist.update({
      where: { id: booking.programPanelistId },
      data: { availableSlots: updatedSlots }
    });

    // 3. Reset candidate to ACTIVE so they can re-book (if not finished)
    const newToken = generateToken();
    const exp = tokenExpiresAt(72);

    await tx.candidate.update({
      where: { id: booking.candidateId },
      data: {
        status: "ACTIVE",
        bookingToken: newToken,
        bookingTokenExp: exp
      }
    });
  });

  await invalidateCache(`control-tower:${booking.candidate.programId}`);
  revalidatePath(`/programs/${booking.candidate.programId}/candidates/${booking.candidateId}`);
}

export async function reassignPanelist(bookingId: number, newPanelistId: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { candidate: true, programPanelist: true }
  });

  if (!booking) throw new Error("Booking not found");

  // Story 16.4: Granular Access Check
  const accessRole = await checkProgramAccess(booking.candidate.programId, session.user.id);
  if (accessRole === "NONE") {
    throw new Error("You do not have access to manage bookings for this program.");
  }

  return await prisma.$transaction(async (tx) => {
    const newPanelist = await tx.programPanelist.findUnique({
      where: { id: newPanelistId }
    });

    if (!newPanelist) throw new Error("New panelist not found");

    // 1. Restore slot for old panelist
    const oldSlots = (booking.programPanelist.availableSlots as SlotEntry[]) || [];
    const updatedOldSlots = oldSlots.map(s => 
      s.bookingId === bookingId ? { ...s, booked: false, bookingId: undefined } : s
    );
    await tx.programPanelist.update({
      where: { id: booking.programPanelistId },
      data: { availableSlots: updatedOldSlots }
    });

    // 2. Update booking with new panelist
    await tx.booking.update({
      where: { id: bookingId },
      data: { programPanelistId: newPanelistId }
    });

    // 3. Mark slot as booked for new panelist (if they have this slot)
    const newSlots = (newPanelist.availableSlots as SlotEntry[]) || [];
    const slotStartStr = booking.slotStart.toISOString();
    const slotEndStr = booking.slotEnd.toISOString();
    
    const updatedNewSlots = newSlots.map(s => 
      (s.start === slotStartStr && s.end === slotEndStr) ? { ...s, booked: true, bookingId: bookingId } : s
    );

    await tx.programPanelist.update({
      where: { id: newPanelistId },
      data: { availableSlots: updatedNewSlots }
    });

    await invalidateCache(`control-tower:${booking.candidate.programId}`);
    revalidatePath(`/programs/${booking.candidate.programId}/candidates/${booking.candidateId}`);
  });
}

export async function markAsNoShow(bookingId: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { candidate: true }
  });

  if (!booking) throw new Error("Booking not found");

  // Story 16.4: Granular Access Check
  const accessRole = await checkProgramAccess(booking.candidate.programId, session.user.id);
  if (accessRole === "NONE") {
    throw new Error("You do not have access to manage bookings for this program.");
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "NO_SHOW" }
  });

  await invalidateCache(`control-tower:${booking.candidate.programId}`);
  revalidatePath(`/programs/${booking.candidate.programId}/candidates/${booking.candidateId}`);
}

// ─── BULK ACTIONS ──────────────────────────────────────────────────────────

export async function bulkShortlistAndActivate(candidateIds: number[], roundId: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const round = await prisma.round.findUnique({ where: { id: roundId } });
  if (!round) throw new Error("Round not found");

  // Story 16.4: Granular Access Check
  const accessRole = await checkProgramAccess(round.programId, session.user.id);
  if (accessRole === "NONE") {
    throw new Error("Unauthorized");
  }

  const results = await Promise.all(candidateIds.map(async (id) => {
    const candidate = await prisma.candidate.findUnique({
      where: { id },
    });

    if (!candidate || candidate.programId !== round.programId) {
      return null;
    }

    if (candidate.status === "BOOKED" || candidate.status === "COMPLETED") {
      return null; // Skip already booked/completed
    }

    const token = generateToken();
    const exp = tokenExpiresAt(72);
    
    return prisma.candidate.update({
      where: { id },
      data: {
        status: "ACTIVE",
        activeRoundId: roundId,
        bookingToken: token,
        bookingTokenExp: exp,
        bookingRoundId: roundId,
      },
    });
  }));

  const validResults = results.filter(r => r !== null);
  if (validResults.length > 0) {
    await invalidateCache(`control-tower:${round.programId}`);
    revalidatePath(`/programs/${validResults[0].programId}/candidates`);
  }
}

export async function bulkRejectCandidates(candidateIds: number[]) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const membership = await getOrgMembership(session.user.id);
  if (!membership) throw new Error("Unauthorized");

  let programId: number | null = null;

  const results = await Promise.all(candidateIds.map(async (id) => {
    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: { program: true }
    });

    if (!candidate || candidate.program.organizationId !== membership.organizationId) {
      return null;
    }

    programId = candidate.programId;

    return prisma.candidate.update({
      where: { id },
      data: { status: "REJECTED" },
    });
  }));

  const validResults = results.filter(r => r !== null);
  if (validResults.length > 0 && programId) {
    await invalidateCache(`control-tower:${programId}`);
    revalidatePath(`/programs/${programId}/candidates`);
  }
}

// ─── PII CLEANUP (Story 7.2 / HG-007) ──────────────────────────────────────

export async function withdrawCandidate(token: string) {
  const candidate = await prisma.candidate.findUnique({
    where: { bookingToken: token },
    include: { bookings: { where: { status: "SCHEDULED" } } }
  });

  if (!candidate) throw new Error("Candidate not found or invalid token");

  await prisma.$transaction(async (tx) => {
    // 1. Cancel all active bookings
    for (const booking of candidate.bookings) {
      await tx.booking.update({
        where: { id: booking.id },
        data: { status: "CANCELLED" }
      });

      // Restore panelist slot
      const panelist = await tx.programPanelist.findUnique({
        where: { id: booking.programPanelistId }
      });

      if (panelist) {
        const slots = (panelist.availableSlots as SlotEntry[]) || [];
        const updatedSlots = slots.map(s => 
          s.bookingId === booking.id ? { ...s, booked: false, bookingId: undefined } : s
        );

        await tx.programPanelist.update({
          where: { id: panelist.id },
          data: { availableSlots: updatedSlots }
        });
      }
    }

    // 2. Mark candidate as REJECTED (withdrawn)
    await tx.candidate.update({
      where: { id: candidate.id },
      data: { 
        status: "REJECTED",
        notes: (candidate.notes ? candidate.notes + "\n" : "") + "Candidate withdrew from the portal.",
        bookingToken: null // Kill the token
      }
    });
  });

  await invalidateCache(`control-tower:${candidate.programId}`);
  revalidatePath("/book/" + token);
}

export async function performPIICleanup() {
  // This would normally be a restricted internal job
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const candidatesToClean = await prisma.candidate.findMany({
    where: {
      createdAt: { lt: ninetyDaysAgo },
      status: { in: ["REJECTED", "COMPLETED"] },
      deletedAt: null
    },
    select: { id: true, programId: true }
  });

  const ids = candidatesToClean.map(c => c.id);
  const pIds = Array.from(new Set(candidatesToClean.map(c => c.programId)));

  await prisma.candidate.updateMany({
    where: { id: { in: ids } },
    data: {
      email: "anonymized@hiregrid.ai",
      phone: null,
      resumeUrl: null,
      linkedIn: null,
      notes: "Data anonymized per retention policy.",
      deletedAt: new Date()
    }
  });

  for(const pid of pIds) {
    await invalidateCache(`control-tower:${pid}`);
  }

  return { cleaned: ids.length };
}
