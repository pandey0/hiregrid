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
import { logger } from "@/lib/logger";
import { withShield } from "@/lib/shield";
import { sendEmail } from "@/lib/mail";

async function getOrgMembership(userId: string) {
  return prisma.organizationMember.findFirst({ where: { userId } });
}

// ─── ADD SINGLE CANDIDATE (recruiter, direct) ──────────────────────────────

export async function addCandidate(formData: FormData) {
  const programId = parseInt(formData.get("programId") as string);
  
  return await withShield({ programId, auditAction: "CANDIDATE_ADD" }, async ({ organizationId, traceId }) => {
    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const phone = (formData.get("phone") as string)?.trim() || null;
    const linkedIn = (formData.get("linkedIn") as string)?.trim() || null;
    const notes = (formData.get("notes") as string)?.trim() || null;
    
    // UploadThing integration
    let resumeUrl = (formData.get("resumeUrl") as string | null) || null;
    let resumeKey = (formData.get("resumeKey") as string | null) || null;
    const resumeFile = formData.get("resume") as File | null;

    if (!name || !email) throw new Error("Name and email are required");

    const program = await prisma.program.findUnique({
      where: { id: programId, deletedAt: null },
    });
    if (!program) throw new Error("Program not found");

    let atsScore: number | null = null;
    let atsReason: string | null = null;
    let currentRole: string | null = null;
    let currentCompany: string | null = null;
    let yearsExperience: number | null = null;

    // AI Processing
    let pdfBuffer: Buffer | null = null;

    if (resumeUrl) {
      try {
        const response = await fetch(resumeUrl);
        pdfBuffer = Buffer.from(await response.arrayBuffer());
      } catch (err) {
        logger.error("RESUME_FETCH_ERROR", err, { programId, traceId });
      }
    } else if (resumeFile && resumeFile.size > 0) {
      pdfBuffer = Buffer.from(await resumeFile.arrayBuffer());
    }

    if (pdfBuffer) {
      try {
        const aiResult = await parseResumeAndScore(pdfBuffer, program.name, program.description || undefined);
        atsScore = aiResult.score;
        atsReason = aiResult.reason;
        if (aiResult.extractedInfo) {
          currentRole = aiResult.extractedInfo.currentRole || null;
          currentCompany = aiResult.extractedInfo.currentCompany || null;
          yearsExperience = aiResult.extractedInfo.yearsExperience || null;
        }
      } catch (error) {
        logger.error("RESUME_PARSE_ERROR", error, { programId, traceId });
        atsScore = null;
        atsReason = "Resume parsing failed or PDF unreadable. Manual review required.";
      }
    }

    await prisma.candidate.upsert({
      where: { programId_email: { programId, email } },
      create: {
        programId,
        organizationId,
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
        resumeUrl,
        resumeKey,
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
        resumeUrl: resumeUrl ?? undefined,
        resumeKey: resumeKey ?? undefined,
        deletedAt: null 
      },
    });

    await invalidateCache(`control-tower:${programId}`);
    revalidatePath(`/programs/${programId}/candidates`);
    return { success: true, traceId };
  });
}

// ─── BULK UPLOAD (recruiter, Excel) ────────────────────────────────────────

export type BulkUploadResult = {
  created: number;
  skipped: number;
  errors: { row: number; reason: string }[];
  traceId?: string;
};

export async function bulkUploadCandidates(formData: FormData): Promise<BulkUploadResult> {
  const programId = parseInt(formData.get("programId") as string);
  
  return await withShield({ programId, auditAction: "CANDIDATE_BULK_UPLOAD" }, async ({ organizationId, traceId }) => {
    const file = formData.get("file") as File;
    if (!file) throw new Error("File required");

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: "" });

    const result: BulkUploadResult = { created: 0, skipped: 0, errors: [], traceId };

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
            organizationId,
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
  });
}

// ─── SCREEN CANDIDATE (SCREENING → DRAFT) ─────────────────────────────────

export async function approveScreening(candidateId: number) {
  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    select: { programId: true }
  });
  if (!candidate) throw new Error("Candidate not found");

  return await withShield({ programId: candidate.programId, auditAction: "CANDIDATE_APPROVE_SCREENING" }, async ({ traceId }) => {
    await prisma.candidate.update({
      where: { id: candidateId },
      data: { status: "DRAFT" },
    });

    await invalidateCache(`control-tower:${candidate.programId}`);
    revalidatePath(`/programs/${candidate.programId}/candidates`);
    return { success: true, traceId };
  });
}

// ─── SHORTLIST & ACTIVATE ──────────────────────────────────────────────────

export async function shortlistAndActivate(candidateId: number, roundId: number) {
  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    select: { programId: true, status: true }
  });
  if (!candidate) throw new Error("Candidate not found");

  return await withShield({ programId: candidate.programId, auditAction: "CANDIDATE_ACTIVATE" }, async ({ traceId }) => {
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
    return { success: true, traceId };
  });
}

// ─── REJECT ────────────────────────────────────────────────────────────────

export async function rejectCandidate(candidateId: number) {
  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    select: { programId: true }
  });
  if (!candidate) throw new Error("Candidate not found");

  return await withShield({ programId: candidate.programId, auditAction: "CANDIDATE_REJECT" }, async ({ traceId }) => {
    await prisma.candidate.update({
      where: { id: candidateId },
      data: { status: "REJECTED" },
    });

    await invalidateCache(`control-tower:${candidate.programId}`);
    revalidatePath(`/programs/${candidate.programId}/candidates`);
    return { success: true, traceId };
  });
}

export async function promoteCandidate(candidateId: number) {
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

  return await withShield({ programId: candidate.programId, auditAction: "CANDIDATE_PROMOTE" }, async ({ traceId }) => {
    if (candidate.bookings.length > 0) {
      throw new Error("Cannot promote candidate while they have a scheduled interview. Please complete or cancel the current booking first.");
    }

    const currentRoundNumber = candidate.activeRound?.roundNumber || 0;
    const nextRound = candidate.program.rounds.find(r => r.roundNumber > currentRoundNumber);

    if (!nextRound) {
      throw new Error("This candidate is already in the final round");
    }

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
    return { success: true, traceId };
  });
}

// ─── CONFIRM BOOKING (Public Magic Link) ──

type SlotEntry = { start: string; end: string; booked: boolean; bookingId?: number };

export async function confirmBooking(token: string, panelistId: number, slotStart: string, slotEnd: string) {
  return await logger.trace("CONFIRM_BOOKING", { token, panelistId }, async (traceId) => {
    const booking = await prisma.$transaction(async (tx) => {
      const candidate = await tx.candidate.findUnique({
        where: { bookingToken: token },
        include: { program: true, activeRound: true }
      });

      if (!candidate || candidate.program.deletedAt) throw new Error("Invalid booking link or program closed");
      
      if (candidate.status !== "ACTIVE") {
        throw new Error("This candidate has already been scheduled or is in a different state. Please check your email.");
      }

      if (!candidate.bookingTokenExp || candidate.bookingTokenExp < new Date()) {
        throw new Error("Booking link has expired");
      }
      if (!candidate.activeRoundId) throw new Error("No active round assigned");

      const startTime = new Date(slotStart);
      if (startTime < new Date()) {
        throw new Error("This slot is in the past. Please pick another one.");
      }

      const endTime = new Date(slotEnd);
      const duration = (endTime.getTime() - startTime.getTime()) / 60000;
      if (duration !== candidate.activeRound?.durationMinutes) {
        throw new Error("Invalid slot duration for this round");
      }

      const panelist = await tx.programPanelist.findUnique({
        where: { id: panelistId },
      });

      if (!panelist) throw new Error("Panelist not found");

      const existingConflict = await tx.booking.findFirst({
        where: {
          programPanelist: { externalEmail: panelist.externalEmail },
          status: "SCHEDULED",
          OR: [
            { slotStart: { lte: startTime }, slotEnd: { gt: startTime } },
            { slotStart: { lt: endTime }, slotEnd: { gte: endTime } }
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
        data: { status: "BOOKED", bookingToken: null },
      });

      return newBooking;
    }, {
      isolationLevel: "Serializable",
    });

    await invalidateCache(`control-tower:${booking.candidate.programId}`);

    dispatchInterviewFulfillment(booking.id).catch((err) => {
      logger.error("FULFILLMENT_ASYNC_FAILURE", err, { bookingId: booking.id, traceId });
    });

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
          logger.info("AI_RUBRIC_GENERATED", { bookingId: booking.id, traceId });
        }
      } catch (err) {
        logger.error("AI_RUBRIC_GEN_FAILURE", err, { bookingId: booking.id, traceId });
      }
    })();

    return { success: true, traceId };
  });
}

// ─── RECRUITER ACTIONS ─────────────────────────────────────────────────────

export async function cancelBookingByRecruiter(bookingId: number) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { candidate: true }
  });
  if (!booking) throw new Error("Booking not found");

  return await withShield({ programId: booking.candidate.programId, auditAction: "BOOKING_CANCEL_RECRUITER" }, async ({ traceId }) => {
    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED" }
      });

      const bp = await tx.booking.findUnique({ where: { id: bookingId }, include: { programPanelist: true } });
      if (bp) {
        const slots = (bp.programPanelist.availableSlots as SlotEntry[]) || [];
        const updatedSlots = slots.map(s => s.bookingId === bookingId ? { ...s, booked: false, bookingId: undefined } : s);
        await tx.programPanelist.update({ where: { id: bp.programPanelistId }, data: { availableSlots: updatedSlots } });
      }

      const newToken = generateToken();
      const exp = tokenExpiresAt(72);
      await tx.candidate.update({
        where: { id: booking.candidateId },
        data: { status: "ACTIVE", bookingToken: newToken, bookingTokenExp: exp }
      });
    });

    await invalidateCache(`control-tower:${booking.candidate.programId}`);
    revalidatePath(`/programs/${booking.candidate.programId}/candidates/${booking.candidateId}`);
    return { success: true, traceId };
  });
}

export async function reassignPanelist(bookingId: number, newPanelistId: number) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { candidate: true }
  });
  if (!booking) throw new Error("Booking not found");

  return await withShield({ programId: booking.candidate.programId, auditAction: "BOOKING_REASSIGN" }, async ({ traceId }) => {
    await prisma.$transaction(async (tx) => {
      const b = await tx.booking.findUnique({ where: { id: bookingId }, include: { programPanelist: true } });
      const newPanelist = await tx.programPanelist.findUnique({ where: { id: newPanelistId } });
      if (!b || !newPanelist) throw new Error("Reassignment target not found");

      const oldSlots = (b.programPanelist.availableSlots as SlotEntry[]) || [];
      const updatedOldSlots = oldSlots.map(s => s.bookingId === bookingId ? { ...s, booked: false, bookingId: undefined } : s);
      await tx.programPanelist.update({ where: { id: b.programPanelistId }, data: { availableSlots: updatedOldSlots } });

      await tx.booking.update({ where: { id: bookingId }, data: { programPanelistId: newPanelistId } });

      const newSlots = (newPanelist.availableSlots as SlotEntry[]) || [];
      const slotStartStr = b.slotStart.toISOString();
      const slotEndStr = b.slotEnd.toISOString();
      const updatedNewSlots = newSlots.map(s => (s.start === slotStartStr && s.end === slotEndStr) ? { ...s, booked: true, bookingId: bookingId } : s);
      await tx.programPanelist.update({ where: { id: newPanelistId }, data: { availableSlots: updatedNewSlots } });
    });

    await invalidateCache(`control-tower:${booking.candidate.programId}`);
    revalidatePath(`/programs/${booking.candidate.programId}/candidates/${booking.candidateId}`);
    return { success: true, traceId };
  });
}

// ─── BULK ACTIONS ──────────────────────────────────────────────────────────

export async function bulkShortlistAndActivate(candidateIds: number[], roundId: number) {
  const round = await prisma.round.findUnique({ where: { id: roundId }, select: { programId: true } });
  if (!round) throw new Error("Round not found");

  return await withShield({ programId: round.programId, auditAction: "CANDIDATE_BULK_ACTIVATE" }, async ({ traceId }) => {
    await Promise.all(candidateIds.map(async (id) => {
      const candidate = await prisma.candidate.findUnique({ where: { id } });
      if (!candidate || candidate.programId !== round.programId) return null;
      if (candidate.status === "BOOKED" || candidate.status === "COMPLETED") return null;

      const token = generateToken();
      const exp = tokenExpiresAt(72);
      return prisma.candidate.update({
        where: { id },
        data: { status: "ACTIVE", activeRoundId: roundId, bookingToken: token, bookingTokenExp: exp, bookingRoundId: roundId },
      });
    }));

    await invalidateCache(`control-tower:${round.programId}`);
    revalidatePath(`/programs/${round.programId}/candidates`);
    return { success: true, traceId };
  });
}

export async function resendCandidateBookingLink(candidateId: number) {
  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    include: { program: true, activeRound: true }
  });

  if (!candidate) throw new Error("Candidate not found");

  return await withShield({ programId: candidate.programId, auditAction: "CANDIDATE_RESEND_LINK" }, async ({ traceId }) => {
    if (candidate.status !== "ACTIVE" || !candidate.bookingToken) {
      throw new Error("Candidate is not in an active booking state");
    }

    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const bookingLink = `${baseUrl}/book/${candidate.bookingToken}`;

    await prisma.candidate.update({
      where: { id: candidateId },
      data: {
        nudgeCount: { increment: 1 },
        lastNudgedAt: new Date(),
      },
    });

    const subject = `Reminder: Schedule your interview for ${candidate.program.name}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0f172a;">Hi ${candidate.name},</h1>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">
          This is a friendly reminder to schedule your interview for the <strong>${candidate.program.name}</strong> 
          (round: <strong>${candidate.activeRound?.name || "Interview"}</strong>).
        </p>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">
          Please use the link below to pick a time slot that works for you:
        </p>
        <div style="margin: 32px 0;">
          <a href="${bookingLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Schedule Interview
          </a>
        </div>
      </div>
    `;

    await sendEmail({
      to: candidate.email,
      subject,
      html,
      type: "REMINDER"
    });

    revalidatePath(`/programs/${candidate.programId}/candidates`);
    revalidatePath(`/programs/${candidate.programId}/candidates/${candidateId}`);
    return { success: true, traceId };
  });
}

export async function bulkRejectCandidates(candidateIds: number[]) {
  const firstCandidate = await prisma.candidate.findUnique({ where: { id: candidateIds[0] }, select: { programId: true } });
  if (!firstCandidate) return;

  return await withShield({ programId: firstCandidate.programId, auditAction: "CANDIDATE_BULK_REJECT" }, async ({ organizationId, traceId }) => {
    await Promise.all(candidateIds.map(async (id) => {
      const candidate = await prisma.candidate.findUnique({ where: { id }, include: { program: true } });
      if (!candidate || candidate.program.organizationId !== organizationId) return null;
      return prisma.candidate.update({ where: { id }, data: { status: "REJECTED" } });
    }));

    await invalidateCache(`control-tower:${firstCandidate.programId}`);
    revalidatePath(`/programs/${firstCandidate.programId}/candidates`);
    return { success: true, traceId };
  });
}

export async function updateCandidateResume(candidateId: number, resumeUrl: string, resumeKey?: string) {
  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    select: { programId: true }
  });

  if (!candidate) throw new Error("Candidate not found");

  return await withShield({ programId: candidate.programId, auditAction: "CANDIDATE_UPDATE_RESUME" }, async () => {
    await prisma.candidate.update({
      where: { id: candidateId },
      data: { 
        resumeUrl,
        resumeKey: resumeKey || null
      },
    });
    
    revalidatePath(`/programs/${candidate.programId}/candidates`);
    revalidatePath(`/programs/${candidate.programId}/candidates/${candidateId}`);
    return { success: true };
  });
}

// ─── PII CLEANUP ───────────────────────────────────────────────────────────

export async function performPIICleanup() {
  return await withShield({ auditAction: "PII_CLEANUP", requiredRole: ["ADMIN"] }, async ({ traceId }) => {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const candidatesToClean = await prisma.candidate.findMany({
      where: { createdAt: { lt: ninetyDaysAgo }, status: { in: ["REJECTED", "COMPLETED"] }, deletedAt: null },
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

    for(const pid of pIds) await invalidateCache(`control-tower:${pid}`);
    return { cleaned: ids.length, traceId };
  });
}

export async function withdrawCandidate(token: string) {
  const candidate = await prisma.candidate.findUnique({
    where: { bookingToken: token },
    include: { bookings: { where: { status: "SCHEDULED" } } }
  });

  if (!candidate) throw new Error("Candidate not found");

  await prisma.$transaction(async (tx) => {
    for (const booking of candidate.bookings) {
      await tx.booking.update({ where: { id: booking.id }, data: { status: "CANCELLED" } });
      const bp = await tx.programPanelist.findUnique({ where: { id: booking.programPanelistId } });
      if (bp) {
        const slots = (bp.availableSlots as SlotEntry[]) || [];
        const updatedSlots = slots.map(s => s.bookingId === booking.id ? { ...s, booked: false, bookingId: undefined } : s);
        await tx.programPanelist.update({ where: { id: bp.id }, data: { availableSlots: updatedSlots } });
      }
    }
    await tx.candidate.update({
      where: { id: candidate.id },
      data: { status: "REJECTED", notes: (candidate.notes ? candidate.notes + "\n" : "") + "Candidate withdrew.", bookingToken: null }
    });
  });

  await invalidateCache(`control-tower:${candidate.programId}`);
  revalidatePath("/book/" + token);
  return { success: true };
}
