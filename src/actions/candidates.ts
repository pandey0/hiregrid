"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { generateToken, tokenExpiresAt } from "@/lib/tokens";

async function getOrgMembership(userId: string) {
  return prisma.organizationMember.findFirst({
    where: { userId },
  });
}

export async function addCandidate(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const membership = await getOrgMembership(session.user.id);
  if (!membership) throw new Error("No organization found");

  const programId = parseInt(formData.get("programId") as string);
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();

  if (!programId || !name || !email) throw new Error("All fields required");

  await prisma.candidate.upsert({
    where: { programId_email: { programId, email } },
    create: {
      programId,
      organizationId: membership.organizationId,
      name,
      email,
      status: "DRAFT",
    },
    update: { name },
  });

  revalidatePath(`/programs/${programId}/candidates`);
}

export async function shortlistAndActivate(candidateId: number, roundId: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

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

  const candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });
  revalidatePath(`/programs/${candidate?.programId}/candidates`);
}

export async function rejectCandidate(candidateId: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const candidate = await prisma.candidate.update({
    where: { id: candidateId },
    data: { status: "REJECTED" },
  });

  revalidatePath(`/programs/${candidate.programId}/candidates`);
}

export async function confirmBooking(token: string, panelistId: number, slotStart: string, slotEnd: string) {
  const candidate = await prisma.candidate.findUnique({
    where: { bookingToken: token },
  });

  if (!candidate) throw new Error("Invalid booking link");
  if (!candidate.bookingTokenExp || candidate.bookingTokenExp < new Date()) {
    throw new Error("Booking link has expired");
  }
  if (!candidate.activeRoundId) throw new Error("No active round assigned");

  const booking = await prisma.booking.create({
    data: {
      candidateId: candidate.id,
      programPanelistId: panelistId,
      roundId: candidate.activeRoundId,
      slotStart: new Date(slotStart),
      slotEnd: new Date(slotEnd),
      status: "SCHEDULED",
    },
  });

  const panelist = await prisma.programPanelist.findUnique({ where: { id: panelistId } });
  const currentSlots = (panelist?.availableSlots as { start: string; end: string; booked: boolean; bookingId?: number }[]) ?? [];
  const updatedSlots = currentSlots.map((s) =>
    s.start === slotStart && s.end === slotEnd ? { ...s, booked: true, bookingId: booking.id } : s
  );

  await prisma.programPanelist.update({
    where: { id: panelistId },
    data: { availableSlots: updatedSlots },
  });

  await prisma.candidate.update({
    where: { id: candidate.id },
    data: { status: "BOOKED", bookingToken: null },
  });

  return booking;
}
