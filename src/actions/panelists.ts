"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { generateToken } from "@/lib/tokens";
import { sendPanelistInvite } from "@/lib/mail";
import { checkProgramAccess } from "@/lib/permissions";
import { invalidateCache } from "@/lib/redis";

async function getOrgMembership(userId: string) {
  return prisma.organizationMember.findFirst({ where: { userId } });
}

export async function invitePanelist(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const membership = await getOrgMembership(session.user.id);
  if (!membership) throw new Error("No organization found");

  const programId = parseInt(formData.get("programId") as string);
  const roundId = parseInt(formData.get("roundId") as string);
  const externalEmail = (formData.get("email") as string)?.trim();
  const externalName = (formData.get("name") as string)?.trim();

  if (!programId || !roundId || !externalEmail) {
    throw new Error("Program, round, and email are required");
  }

  // Story 16.4: Granular Access Check
  const accessRole = await checkProgramAccess(programId, session.user.id);
  if (accessRole === "NONE") {
    throw new Error("Unauthorized");
  }

  // 10.1: Verify program exists
  const program = await prisma.program.findUnique({
    where: { 
      id: programId, 
      deletedAt: null 
    },
    include: { rounds: { where: { id: roundId, deletedAt: null } } },
  });

  if (!program || program.rounds.length === 0) {
    throw new Error("Program or round not found");
  }

  const token = generateToken();
  const exp = new Date();
  exp.setDate(exp.getDate() + 30); // 30 days expiration

  await prisma.programPanelist.create({
    data: {
      programId,
      roundId,
      externalEmail,
      externalName: externalName || null,
      magicLinkToken: token,
      magicLinkTokenExp: exp,
      availableSlots: [],
    },
  });

  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const magicLink = `${baseUrl}/availability/${token}`;

  await sendPanelistInvite({
    email: externalEmail,
    name: externalName,
    programName: program.name,
    roundName: program.rounds[0].name,
    magicLink,
  });

  await invalidateCache(`control-tower:${programId}`);
  revalidatePath(`/programs/${programId}/panelists`);
  revalidatePath(`/programs/${programId}/rounds/${roundId}`);
}

export async function saveAvailability(token: string, slots: { start: string; end: string }[]) {
  const panelist = await prisma.programPanelist.findUnique({
    where: { magicLinkToken: token },
  });

  if (!panelist) throw new Error("Invalid link");

  // Story 13.2: Prevent past slots
  const now = new Date();
  const hasPastSlots = slots.some(s => new Date(s.start) < now);
  if (hasPastSlots) {
    throw new Error("Cannot provide availability for past time slots. Please refresh and pick future slots.");
  }

  // Story 15.2: Global Availability Conflicts
  if (panelist.externalEmail && slots.length > 0) {
    const otherPanelists = await prisma.programPanelist.findMany({
      where: { 
        externalEmail: panelist.externalEmail,
        id: { not: panelist.id } 
      }
    });

    const otherSlots = otherPanelists.flatMap(p => 
      Array.isArray(p.availableSlots) ? p.availableSlots as { start: string; end: string }[] : []
    );

    for (const slot of slots) {
      const start = new Date(slot.start).getTime();
      const end = new Date(slot.end).getTime();

      for (const otherSlot of otherSlots) {
        const otherStart = new Date(otherSlot.start).getTime();
        const otherEnd = new Date(otherSlot.end).getTime();

        if (start < otherEnd && end > otherStart) {
          throw new Error(`Conflict detected: You have already provided overlapping availability around ${new Date(slot.start).toLocaleTimeString()} for another program.`);
        }
      }
    }
  }

  await prisma.programPanelist.update({
    where: { magicLinkToken: token },
    data: {
      availableSlots: slots,
      magicLinkUsedAt: panelist.magicLinkUsedAt ?? new Date(),
    },
  });

  await invalidateCache(`control-tower:${panelist.programId}`);
}

export async function resendPanelistLink(panelistId: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const membership = await getOrgMembership(session.user.id);
  if (!membership) throw new Error("No organization found");

  const panelist = await prisma.programPanelist.findUnique({
    where: { id: panelistId },
    include: { 
      program: true,
      round: true
    },
  });

  if (!panelist || panelist.program.organizationId !== membership.organizationId) {
    throw new Error("Panelist not found in your organization");
  }

  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const magicLink = `${baseUrl}/availability/${panelist.magicLinkToken}`;

  await sendPanelistInvite({
    email: panelist.externalEmail!,
    name: panelist.externalName || undefined,
    programName: panelist.program.name,
    roundName: panelist.round.name,
    magicLink,
  });
}

export async function deletePanelist(panelistId: number, programId: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const membership = await getOrgMembership(session.user.id);
  if (!membership) throw new Error("No organization found");

  // 10.1: Verify ownership before delete
  const panelist = await prisma.programPanelist.findUnique({
    where: { id: panelistId },
    include: { program: true }
  });

  if (!panelist || panelist.program.organizationId !== membership.organizationId) {
    throw new Error("Unauthorized");
  }

  // Story 15.10: Handle orphaned bookings before deleting panelist
  await prisma.$transaction(async (tx) => {
    const upcomingBookings = await tx.booking.findMany({
      where: { 
        programPanelistId: panelistId,
        status: "SCHEDULED",
        slotStart: { gte: new Date() }
      },
      include: { candidate: true }
    });

    for (const booking of upcomingBookings) {
      // 1. Mark booking as cancelled
      await tx.booking.update({
        where: { id: booking.id },
        data: { status: "CANCELLED" }
      });

      // 2. Reactivate candidate for the same round
      const newToken = generateToken();
      const exp = new Date();
      exp.setHours(exp.getHours() + 72);

      await tx.candidate.update({
        where: { id: booking.candidateId },
        data: {
          status: "ACTIVE",
          bookingToken: newToken,
          bookingTokenExp: exp
        }
      });
    }

    // 3. Finally soft-delete the panelist record
    await tx.programPanelist.update({ 
      where: { id: panelistId },
      data: { deletedAt: new Date() }
    });
  });

  await invalidateCache(`control-tower:${programId}`);
  revalidatePath(`/programs/${programId}/panelists`);
}

export async function submitScorecard(
  bookingId: number, 
  token: string, 
  data: { score: number; verdict: "PASS" | "FAIL" | "HOLD"; feedback: string }
) {
  const panelist = await prisma.programPanelist.findUnique({
    where: { magicLinkToken: token }
  });

  if (!panelist) throw new Error("Invalid access");

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId, programPanelistId: panelist.id }
  });

  if (!booking) throw new Error("Booking not found");

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      score: data.score,
      verdict: data.verdict,
      feedback: data.feedback,
      status: "COMPLETED"
    }
  });

  // Story 11.3: Automatic Candidate Conclusion
  if (data.verdict === "FAIL") {
    await prisma.candidate.update({
      where: { id: booking.candidateId },
      data: { status: "REJECTED" }
    });
  }

  await invalidateCache(`control-tower:${panelist.programId}`);
  revalidatePath(`/availability/${token}`);
}
