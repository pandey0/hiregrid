import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import CandidateDetailClient from "./CandidateDetailClient";

export default async function CandidateDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string; candidateId: string }> 
}) {
  const { id, candidateId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: session.user.id },
  });
  if (!membership) redirect("/onboarding");

  const candidate = await prisma.candidate.findFirst({
    where: { 
      id: parseInt(candidateId), 
      programId: parseInt(id),
      organizationId: membership.organizationId,
      deletedAt: null
    },
    include: {
      program: {
        include: {
          rounds: {
            where: { deletedAt: null },
            orderBy: { roundNumber: "asc" }
          },
          panelists: true
        }
      },
      activeRound: true,
      agency: true,
      bookings: {
        include: { round: true, programPanelist: true },
        orderBy: { slotStart: "desc" }
      }
    },
  });

  if (!candidate) notFound();

  const currentRoundNumber = candidate.activeRound?.roundNumber || 0;
  const nextRound = candidate.program.rounds.find(r => r.roundNumber > currentRoundNumber);

  return (
    <CandidateDetailClient 
      candidate={candidate}
      nextRound={nextRound}
      programId={id}
    />
  );
}
