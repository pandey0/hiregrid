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
      members: {
        create: {
          userId: session.user.id,
          role: "LEAD",
        }
      }
    },
  });

  revalidatePath("/dashboard");
  redirect(`/programs/${program.id}`);
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
