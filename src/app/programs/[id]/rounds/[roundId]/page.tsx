import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { checkProgramAccess } from "@/lib/permissions";
import RoundClient from "./RoundClient";

export default async function RoundPage({ 
  params 
}: { 
  params: Promise<{ id: string; roundId: string }> 
}) {
  const { id, roundId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: session.user.id },
  });
  if (!membership) redirect("/onboarding");

  const access = await checkProgramAccess(parseInt(id), session.user.id);
  if (access === "NONE") notFound();

  const round = await prisma.round.findFirst({
    where: { 
      id: parseInt(roundId), 
      programId: parseInt(id),
      deletedAt: null 
    },
    include: {
      program: true,
      panelists: {
        where: { deletedAt: null },
        include: { user: true }
      },
      bookings: {
        include: { candidate: true },
        orderBy: { slotStart: "asc" }
      },
      activeCandidates: {
        where: { deletedAt: null },
        include: { agency: true }
      }
    }
  });

  if (!round) notFound();

  // Supply/Demand Math
  let totalUsableSlots = 0;
  round.panelists.forEach((p) => {
    const slots = Array.isArray(p.availableSlots) 
      ? (p.availableSlots as any[]) 
      : [];
    totalUsableSlots += slots.length;
  });

  const activeDemand = round.activeCandidates.length;
  const delta = totalUsableSlots - activeDemand;
  const healthStatus = delta < 0 ? "DEFICIT" : delta < 3 ? "WARNING" : "HEALTHY";

  const scheduledCount = round.bookings.filter(b => b.status === "SCHEDULED").length;

  return (
    <RoundClient 
      round={round}
      delta={delta}
      healthStatus={healthStatus}
      totalUsableSlots={totalUsableSlots}
      activeDemand={activeDemand}
      scheduledCount={scheduledCount}
      programId={id}
    />
  );
}
