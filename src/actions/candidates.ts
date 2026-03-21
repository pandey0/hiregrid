"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { generateToken, tokenExpiresAt } from "@/lib/tokens";
import * as XLSX from "xlsx";

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
  const currentRole = (formData.get("currentRole") as string)?.trim() || null;
  const currentCompany = (formData.get("currentCompany") as string)?.trim() || null;
  const yearsExperienceRaw = formData.get("yearsExperience") as string;
  const yearsExperience = yearsExperienceRaw ? parseInt(yearsExperienceRaw) : null;
  const resumeUrl = (formData.get("resumeUrl") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!programId || !name || !email) throw new Error("Name and email are required");

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
      resumeUrl,
      notes,
      source: "DIRECT",
      status: "DRAFT",
    },
    update: { name, phone, linkedIn, currentRole, currentCompany, yearsExperience, resumeUrl, notes },
  });

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

  revalidatePath(`/programs/${programId}/candidates`);
  return result;
}

// ─── UPDATE RESUME URL ─────────────────────────────────────────────────────

export async function updateCandidateResume(candidateId: number, resumeUrl: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const candidate = await prisma.candidate.update({
    where: { id: candidateId },
    data: { resumeUrl: resumeUrl.trim() || null },
  });

  revalidatePath(`/programs/${candidate.programId}/candidates`);
}

// ─── SCREEN CANDIDATE (SCREENING → DRAFT) ─────────────────────────────────

export async function approveScreening(candidateId: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const candidate = await prisma.candidate.update({
    where: { id: candidateId },
    data: { status: "DRAFT" },
  });

  revalidatePath(`/programs/${candidate.programId}/candidates`);
}

// ─── SHORTLIST & ACTIVATE ──────────────────────────────────────────────────

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

// ─── REJECT ────────────────────────────────────────────────────────────────

export async function rejectCandidate(candidateId: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const candidate = await prisma.candidate.update({
    where: { id: candidateId },
    data: { status: "REJECTED" },
  });

  revalidatePath(`/programs/${candidate.programId}/candidates`);
}

// ─── CONFIRM BOOKING ───────────────────────────────────────────────────────

export async function confirmBooking(token: string, panelistId: number, slotStart: string, slotEnd: string) {
  const candidate = await prisma.candidate.findUnique({ where: { bookingToken: token } });
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
