import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import ControlTowerClient from "./ControlTowerClient";

export default async function ControlTowerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const membership = await prisma.organizationMember.findFirst({ where: { userId: session.user.id } });
  if (!membership) redirect("/onboarding");

  const program = await prisma.program.findFirst({
    where: { id: parseInt(id), organizationId: membership.organizationId, deletedAt: null },
    include: {
      rounds: {
        where: { deletedAt: null },
        orderBy: { roundNumber: "asc" },
        include: {
          panelists: { where: { deletedAt: null } },
          activeCandidates: { where: { status: { in: ["ACTIVE", "BOOKED"] }, deletedAt: null } },
          bookings: { where: { status: "SCHEDULED" } },
        },
      },
      candidates: {
        where: {
          deletedAt: null,
          bookings: {
            some: { fulfillmentStatus: "FAILED" }
          }
        },
        include: {
          bookings: {
            where: { 
              fulfillmentStatus: "FAILED",
              round: { deletedAt: null }
            },
            include: { 
              round: true, 
              programPanelist: true 
            }
          }
        }
      }
    },
  });

  if (!program) notFound();

  const fulfillmentIssues = program.candidates.flatMap(c => 
    c.bookings.map(b => ({ candidate: c, booking: b }))
  );

  return (
    <ControlTowerClient 
      program={program}
      fulfillmentIssues={fulfillmentIssues}
      programId={id}
    />
  );
}
