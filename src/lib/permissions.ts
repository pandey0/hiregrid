import { prisma } from "./prisma";
import { cache } from "react";

export type EffectiveProgramRole = "ADMIN" | "LEAD" | "HR" | "NONE";

/**
 * Story 16.4: Unified access checker for hiring programs.
 * Returns the highest level of access a user has.
 * 
 * Performance Note: Wrapped in React.cache to prevent redundant DB lookups
 * within the same request lifecycle (e.g. Layout check + Page check).
 */
export const checkProgramAccess = cache(async (programId: number, userId: string): Promise<EffectiveProgramRole> => {
  // 1. Check if user is a global organization ADMIN
  const membership = await prisma.organizationMember.findFirst({
    where: {
      userId,
      role: "ADMIN"
    },
    select: { organizationId: true } // Payload Pruning: Only need ID
  });

  if (membership) {
    // Check if the program belongs to the user's organization
    const program = await prisma.program.findUnique({
      where: { id: programId, organizationId: membership.organizationId },
      select: { id: true }
    });
    if (program) return "ADMIN";
  }

  // 2. Check for program-specific assignment (LEAD or HR)
  const programMember = await prisma.programMember.findUnique({
    where: {
      programId_userId: {
        programId,
        userId
      }
    },
    select: { role: true }
  });

  if (programMember) {
    return programMember.role as EffectiveProgramRole;
  }

  return "NONE";
});
