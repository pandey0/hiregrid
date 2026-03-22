import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: session.user.id },
    include: { organization: true },
  });
  if (!membership) redirect("/onboarding");

  const programWhereClause: any = {
    organizationId: membership.organizationId,
    deletedAt: null,
  };

  if (membership.role !== "ADMIN") {
    programWhereClause.members = {
      some: { userId: session.user.id }
    };
  }

  const countFilters: any = {
    organizationId: membership.organizationId,
    deletedAt: null,
  };

  if (membership.role !== "ADMIN") {
    countFilters.program = {
      members: { some: { userId: session.user.id } }
    };
  }

  const [programs, candidatesCount, bookingsCount, failedBookingsCount] = await Promise.all([
    prisma.program.findMany({
      where: programWhereClause,
      include: { 
        rounds: { where: { deletedAt: null } }, 
        _count: { select: { candidates: { where: { deletedAt: null } } } } 
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.candidate.count({ where: countFilters }),
    prisma.booking.count({
      where: {
        candidate: countFilters,
        status: "SCHEDULED",
      },
    }),
    prisma.booking.count({
      where: {
        candidate: countFilters,
        fulfillmentStatus: "FAILED"
      }
    })
  ]);

  const completedBookings = await prisma.booking.count({
    where: {
      candidate: { organizationId: membership.organizationId },
      status: "COMPLETED",
    },
  });

  const firstName = session.user.name.split(" ")[0];

  return (
    <DashboardClient 
      programs={programs}
      candidatesCount={candidatesCount}
      bookingsCount={bookingsCount}
      failedBookingsCount={failedBookingsCount}
      completedBookings={completedBookings}
      userName={firstName}
    />
  );
}
