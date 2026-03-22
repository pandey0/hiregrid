"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { checkProgramAccess } from "@/lib/permissions";

export async function addProgramMember(programId: number, email: string, role: "LEAD" | "HR") {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  // Story 16.4: Only ADMIN or LEAD can manage team
  const access = await checkProgramAccess(programId, session.user.id);
  if (access !== "ADMIN" && access !== "LEAD") {
    throw new Error("Unauthorized: Only program leads or admins can manage the team.");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found. They must have a HireGrid account first.");

  // Verify user is in the same organization
  const program = await prisma.program.findUnique({ where: { id: programId } });
  const orgMember = await prisma.organizationMember.findUnique({
    where: { 
      userId_organizationId: {
        userId: user.id,
        organizationId: program!.organizationId
      }
    }
  });

  if (!orgMember) {
    throw new Error("This user is not a member of your organization.");
  }

  await prisma.programMember.upsert({
    where: {
      programId_userId: {
        programId,
        userId: user.id
      }
    },
    update: { role },
    create: {
      programId,
      userId: user.id,
      role
    }
  });

  revalidatePath(`/programs/${programId}`);
}

export async function removeProgramMember(programId: number, userId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const access = await checkProgramAccess(programId, session.user.id);
  if (access !== "ADMIN" && access !== "LEAD") {
    throw new Error("Unauthorized");
  }

  // Prevent removing the last lead
  const memberToRemove = await prisma.programMember.findUnique({
    where: { programId_userId: { programId, userId } }
  });

  if (memberToRemove?.role === "LEAD") {
    const leadCount = await prisma.programMember.count({
      where: { programId, role: "LEAD" }
    });
    if (leadCount <= 1) {
      throw new Error("Cannot remove the last program lead.");
    }
  }

  await prisma.programMember.delete({
    where: { programId_userId: { programId, userId } }
  });

  revalidatePath(`/programs/${programId}`);
}
