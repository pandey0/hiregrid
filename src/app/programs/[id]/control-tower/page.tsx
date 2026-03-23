import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import ControlTowerClient from "./ControlTowerClient";
import { withCache } from "@/lib/redis";

export default async function ControlTowerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const membership = await prisma.organizationMember.findFirst({ 
    where: { userId: session.user.id },
    select: { organizationId: true }
  });
  if (!membership) redirect("/onboarding");

  // Performance: Cache the heavy Control Tower calculation
  const cacheKey = `control-tower:${id}`;
  
  const data = await withCache(cacheKey, async () => {
    const program = await prisma.program.findFirst({
      where: { id: parseInt(id), organizationId: membership.organizationId, deletedAt: null },
      select: {
        name: true,
        rounds: {
          where: { deletedAt: null },
          orderBy: { roundNumber: "asc" },
          select: {
            id: true,
            name: true,
            roundNumber: true,
            durationMinutes: true,
            panelists: {
              where: { deletedAt: null },
              select: { availableSlots: true }
            },
            activeCandidates: { 
              where: { status: { in: ["ACTIVE", "BOOKED"] }, deletedAt: null },
              select: { id: true } 
            },
            bookings: { 
              where: { status: "SCHEDULED" },
              select: { id: true }
            },
          },
        },
      }
    });

    if (!program) return null;

    const fulfillmentIssuesRaw = await prisma.booking.findMany({
      where: {
        candidate: { programId: parseInt(id), deletedAt: null },
        fulfillmentStatus: "FAILED",
        status: "SCHEDULED"
      },
      select: {
        id: true,
        candidate: { select: { name: true } },
        round: { select: { name: true } },
        programPanelist: { select: { externalName: true } }
      },
      take: 10
    });

    return {
      program,
      fulfillmentIssues: fulfillmentIssuesRaw.map(b => ({ candidate: b.candidate, booking: b }))
    };
  }, 60); // Cache for 60 seconds

  if (!data || !data.program) notFound();

  return (
    <ControlTowerClient 
      program={data.program}
      fulfillmentIssues={data.fulfillmentIssues}
      programId={id}
    />
  );
}
