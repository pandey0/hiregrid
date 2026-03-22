import { prisma } from "./prisma";

export type EffectiveProgramRole = "ADMIN" | "LEAD" | "HR" | "NONE";

/**
 * Story 16.4: Unified access checker for hiring programs.
 * Returns the highest level of access a user has for a specific program.
 */
export async function checkProgramAccess(programId: number, userId: string): Promise<EffectiveProgramRole> {
  // 1. Check Organization-level ADMIN status
  const orgMember = await prisma.organizationMember.findFirst({
    where: { 
      userId,
      organization: {
        programs: { some: { id: programId } }
      }
    }
  });

  if (orgMember?.role === "ADMIN") return "ADMIN";

  // 2. Check Program-level assignments
  const programMember = await prisma.programMember.findUnique({
    where: {
      programId_userId: {
        programId,
        userId
      }
    }
  });

  if (programMember) {
    return programMember.role as EffectiveProgramRole;
  }

  return "NONE";
}
