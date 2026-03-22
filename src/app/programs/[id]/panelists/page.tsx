import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import PanelistsClient from "./PanelistsClient";

export default async function PanelistsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const membership = await prisma.organizationMember.findFirst({ where: { userId: session.user.id } });
  if (!membership) redirect("/onboarding");

  const program = await prisma.program.findFirst({
    where: { id: parseInt(id), organizationId: membership.organizationId, deletedAt: null },
    include: {
      rounds: { where: { deletedAt: null }, orderBy: { roundNumber: "asc" } },
      panelists: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        include: { round: true },
      },
    },
  });

  if (!program) notFound();

  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <PanelistsClient 
      program={program}
      panelists={program.panelists}
      baseUrl={baseUrl}
      programId={id}
    />
  );
}
