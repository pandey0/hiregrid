"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { generateToken } from "@/lib/tokens";
import * as XLSX from "xlsx";

async function getOrgMembership(userId: string) {
  return prisma.organizationMember.findFirst({ where: { userId } });
}

// ─── CREATE AGENCY ─────────────────────────────────────────────────────────

export async function createAgency(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const membership = await getOrgMembership(session.user.id);
  if (!membership) throw new Error("No organization found");

  const programId = parseInt(formData.get("programId") as string);
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const contactPerson = (formData.get("contactPerson") as string)?.trim() || null;

  if (!name || !email || !programId) throw new Error("Agency name and email are required");

  // 10.1: Verify program ownership
  const program = await prisma.program.findUnique({
    where: { id: programId, organizationId: membership.organizationId, deletedAt: null }
  });
  if (!program) throw new Error("Unauthorized or program not found");

  await prisma.agency.create({
    data: {
      name,
      email,
      contactPerson,
      magicLinkToken: generateToken(),
      organizationId: membership.organizationId,
      programId,
    },
  });

  revalidatePath(`/programs/${programId}/agencies`);
}

// ─── DELETE AGENCY ─────────────────────────────────────────────────────────

export async function deleteAgency(agencyId: number, programId: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const membership = await getOrgMembership(session.user.id);
  if (!membership) throw new Error("No organization found");

  // 10.1: Verify ownership
  const agency = await prisma.agency.findUnique({
    where: { id: agencyId, organizationId: membership.organizationId }
  });
  if (!agency) throw new Error("Unauthorized");

  await prisma.agency.delete({ where: { id: agencyId } });
  revalidatePath(`/programs/${programId}/agencies`);
}

// ─── AGENCY SUBMIT SINGLE CANDIDATE (headless) ─────────────────────────────

export async function agencySubmitCandidate(token: string, formData: FormData) {
  const agency = await prisma.agency.findUnique({ 
    where: { magicLinkToken: token },
    include: { program: true }
  });
  
  if (!agency || agency.program.deletedAt) throw new Error("Invalid agency link or program closed");

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const phone = (formData.get("phone") as string)?.trim() || null;
  const linkedIn = (formData.get("linkedIn") as string)?.trim() || null;
  const currentRole = (formData.get("currentRole") as string)?.trim() || null;
  const currentCompany = (formData.get("currentCompany") as string)?.trim() || null;
  const yearsRaw = formData.get("yearsExperience") as string;
  const yearsExperience = yearsRaw ? parseInt(yearsRaw) : null;
  const resumeUrl = (formData.get("resumeUrl") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!name || !email) throw new Error("Name and email are required");

  const existing = await prisma.candidate.findUnique({
    where: { programId_email: { programId: agency.programId, email } },
  });
  if (existing) throw new Error(`Candidate with email ${email} already exists in this program`);

  await prisma.candidate.create({
    data: {
      programId: agency.programId,
      organizationId: agency.organizationId,
      name,
      email,
      phone,
      linkedIn,
      currentRole,
      currentCompany,
      yearsExperience,
      resumeUrl,
      notes,
      source: "AGENCY",
      agencyId: agency.id,
      status: "SCREENING",
    },
  });
}

// ─── AGENCY BULK UPLOAD (headless, Excel) ──────────────────────────────────

export type AgencyBulkResult = {
  created: number;
  skipped: number;
  errors: { row: number; reason: string }[];
};

export async function agencyBulkUpload(token: string, formData: FormData): Promise<AgencyBulkResult> {
  const agency = await prisma.agency.findUnique({ 
    where: { magicLinkToken: token },
    include: { program: true }
  });
  
  if (!agency || agency.program.deletedAt) throw new Error("Invalid agency link or program closed");

  const file = formData.get("file") as File;
  if (!file) throw new Error("No file provided");

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: "" });

  const result: AgencyBulkResult = { created: 0, skipped: 0, errors: [] };

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
    const resumeUrl = String(row["resume_url"] || row["Resume URL"] || "").trim() || null;

    try {
      const existing = await prisma.candidate.findUnique({
        where: { programId_email: { programId: agency.programId, email } },
      });
      if (existing) { result.skipped++; continue; }

      await prisma.candidate.create({
        data: {
          programId: agency.programId,
          organizationId: agency.organizationId,
          name,
          email,
          phone,
          linkedIn,
          currentRole,
          currentCompany,
          yearsExperience,
          resumeUrl,
          source: "AGENCY",
          agencyId: agency.id,
          status: "SCREENING",
        },
      });
      result.created++;
    } catch {
      result.errors.push({ row: rowNum, reason: "Failed to save" });
    }
  }

  return result;
}
