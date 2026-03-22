import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import CandidatesClient from "./CandidatesClient";

export default async function CandidatesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const membership = await prisma.organizationMember.findFirst({ where: { userId: session.user.id } });
  if (!membership) redirect("/onboarding");

  const program = await prisma.program.findFirst({
    where: { id: parseInt(id), organizationId: membership.organizationId, deletedAt: null },
    include: {
      rounds: { where: { deletedAt: null }, orderBy: { roundNumber: "asc" } },
      candidates: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        include: { activeRound: true, agency: true },
      },
    },
  });

  if (!program) notFound();

  const screening = program.candidates.filter((c) => c.status === "SCREENING");
  const pipeline = program.candidates.filter((c) => c.status !== "SCREENING");

  return (
    <CandidatesClient 
      program={program}
      candidates={program.candidates}
      screening={screening}
      pipeline={pipeline}
      programId={id}
    />
  );
}
