import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import AgencyClient from "./AgencyClient";

export default async function AgencyPortalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const agency = await prisma.agency.findUnique({
    where: { magicLinkToken: token },
    include: {
      program: { include: { rounds: { where: { deletedAt: null }, orderBy: { roundNumber: "asc" } } } },
      candidates: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        include: { activeRound: true }
      },
      _count: { select: { candidates: true } },
    },
  });

  if (!agency || agency.program.deletedAt) notFound();

  return (
    <AgencyClient 
      agency={agency}
      candidates={agency.candidates}
      token={token}
    />
  );
}
