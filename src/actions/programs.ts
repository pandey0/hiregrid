"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function getOrgMembership(userId: string) {
  return prisma.organizationMember.findFirst({
    where: { userId },
    include: { organization: true },
  });
}

export async function createProgram(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const membership = await getOrgMembership(session.user.id);
  if (!membership) throw new Error("No organization found");

  const name = (formData.get("name") as string | null)?.trim();
  const description = (formData.get("description") as string | null)?.trim();
  const roundsRaw = formData.get("rounds") as string | null;

  if (!name) throw new Error("Program name is required");

  let rounds: { name: string; durationMinutes: number; roundType: string; description?: string }[] = [];
  if (roundsRaw) {
    try {
      rounds = JSON.parse(roundsRaw);
    } catch {
      rounds = [];
    }
  }

  const program = await prisma.program.create({
    data: {
      name,
      description: description || null,
      organizationId: membership.organizationId,
      rounds: {
        create: rounds.map((r, i) => ({
          name: r.name,
          description: r.description || null,
          roundNumber: i + 1,
          durationMinutes: r.durationMinutes,
          roundType: (r.roundType as "ATS_SCREENING" | "HUMAN_INTERVIEW" | "ASSIGNMENT") || "HUMAN_INTERVIEW",
        })),
      },
      // Story 17.5: Only auto-assign LEAD if the creator is NOT an Org Admin
      // Admins already have "God Mode" over all programs.
      members: membership.role !== "ADMIN" ? {
        create: {
          userId: session.user.id,
          role: "LEAD",
        }
      } : undefined
    },
  });

  revalidatePath("/dashboard");
  redirect(`/programs/${program.id}`);
}

export async function updateProgram(programId: number, formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const membership = await getOrgMembership(session.user.id);
  if (!membership) throw new Error("No organization found");

  // Story 16.2 & 16.4: Only organization ADMIN or program LEAD can update
  const isOrgAdmin = membership.role === "ADMIN";
  const isProgramLead = await prisma.programMember.findFirst({
    where: { programId, userId: session.user.id, role: "LEAD" }
  });

  if (!isOrgAdmin && !isProgramLead) {
    throw new Error("Only organization administrators or the program lead can update this program.");
  }

  const name = (formData.get("name") as string | null)?.trim();
  const description = (formData.get("description") as string | null)?.trim();

  if (!name) throw new Error("Program name is required");

  await prisma.program.update({
    where: { id: programId, organizationId: membership.organizationId },
    data: {
      name,
      description: description || null,
    },
  });

  revalidatePath(`/programs/${programId}`);
  revalidatePath("/dashboard");
}

export async function deleteProgram(programId: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const membership = await getOrgMembership(session.user.id);
  if (!membership) throw new Error("No organization found");

  // Story 16.2 & 16.4: Only organization ADMIN or program LEAD can delete
  const isOrgAdmin = membership.role === "ADMIN";
  const isProgramLead = await prisma.programMember.findFirst({
    where: { programId, userId: session.user.id, role: "LEAD" }
  });

  if (!isOrgAdmin && !isProgramLead) {
    throw new Error("Only organization administrators or the program lead can delete this program.");
  }

  // Story 13.3: Cascade cancellation of upcoming bookings
  await prisma.booking.updateMany({
    where: {
      round: {
        programId: programId
      },
      status: "SCHEDULED",
      slotStart: { gte: new Date() }
    },
    data: {
      status: "CANCELLED"
    }
  });

  await prisma.program.updateMany({
    where: { 
      id: programId, 
      organizationId: membership.organizationId 
    },
    data: {
      deletedAt: new Date()
    }
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateRound(programId: number, roundId: number, data: { name?: string; durationMinutes?: number }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const membership = await getOrgMembership(session.user.id);
  if (!membership) throw new Error("No organization found");

  // Story 16.3: Only Admin or LEAD can modify structure
  const isOrgAdmin = membership.role === "ADMIN";
  const isProgramLead = await prisma.programMember.findFirst({
    where: { programId, userId: session.user.id, role: "LEAD" }
  });

  if (!isOrgAdmin && !isProgramLead) {
    throw new Error("Only organization administrators or the program lead can modify the interview structure.");
  }

  const currentRound = await prisma.round.findUnique({ where: { id: roundId } });
  const durationChanged = data.durationMinutes !== undefined && data.durationMinutes !== currentRound?.durationMinutes;

  await prisma.$transaction(async (tx) => {
    await tx.round.update({
      where: { id: roundId, programId },
      data: {
        name: data.name,
        durationMinutes: data.durationMinutes,
      }
    });

    if (durationChanged) {
      // Clear unbooked slots for all panelists in this round
      const panelists = await tx.programPanelist.findMany({ where: { roundId } });
      for (const p of panelists) {
        const slots = (p.availableSlots as SlotEntry[]) || [];
        const filteredSlots = slots.filter(s => s.booked); // Keep only booked slots
        await tx.programPanelist.update({
          where: { id: p.id },
          data: { availableSlots: filteredSlots }
        });
      }
    }
  });

  revalidatePath(`/programs/${programId}`);
}

type SlotEntry = { start: string; end: string; booked: boolean; bookingId?: number };

export async function updateRoundFocusAreas(programId: number, roundId: number, focusAreas: string[]) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const access = await checkProgramAccess(programId, session.user.id);
  if (access !== "ADMIN" && access !== "LEAD") {
    throw new Error("Unauthorized");
  }

  await prisma.round.update({
    where: { id: roundId, programId },
    data: { focusAreas }
  });

  revalidatePath(`/programs/${programId}`);
}
