import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { checkProgramAccess } from "@/lib/permissions";
import ProgramClient from "./ProgramClient";

export default async function ProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: session.user.id },
  });
  if (!membership) redirect("/onboarding");

  const access = await checkProgramAccess(parseInt(id), session.user.id);
  if (access === "NONE") {
    notFound();
  }

  const program = await prisma.program.findFirst({
    where: { id: parseInt(id), organizationId: membership.organizationId, deletedAt: null },
    include: {
      rounds: {
        where: { deletedAt: null },
        orderBy: { roundNumber: "asc" },
        include: { _count: { select: { panelists: true, bookings: true } } },
      },
      _count: { select: { candidates: { where: { deletedAt: null } }, panelists: { where: { deletedAt: null } }, agencies: true } },
    },
  });

  if (!program) notFound();

  // Fetch candidates to show inline
  const candidates = await prisma.candidate.findMany({
    where: { 
      programId: parseInt(id),
      deletedAt: null 
    },
    include: {
      activeRound: true,
      agency: true,
    },
    orderBy: { createdAt: "desc" }
  });

  const screeningCount = candidates.filter(c => c.status === "SCREENING").length;

  const programMembers = await prisma.programMember.findMany({
    where: { programId: program.id },
    include: { user: true },
    orderBy: { role: "asc" }
  });

  const isAdmin = membership.role === "ADMIN";
  const isLead = programMembers.some(m => m.userId === session.user.id && m.role === "LEAD");
  const canManageTeam = isAdmin || isLead;

  return (
    <ProgramClient 
      program={program}
      candidates={candidates}
      screeningCount={screeningCount}
      programMembers={programMembers}
      canManageTeam={canManageTeam}
    />
  );
}
