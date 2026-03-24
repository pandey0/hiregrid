import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";
import { requireAuth } from "@/lib/auth-context";

export default async function DashboardPage() {
  // performance: Using cached auth context (0 DB cost if already called in layout)
  const { session, membership } = await requireAuth();

  const programWhereClause: any = {
    organizationId: membership!.organizationId,
    deletedAt: null,
  };

  if (membership!.role !== "ADMIN") {
    programWhereClause.members = {
      some: { userId: session.user.id }
    };
  }

  const countFilters: any = {
    organizationId: membership!.organizationId,
    deletedAt: null,
  };

  if (membership!.role !== "ADMIN") {
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
      candidate: { organizationId: membership!.organizationId },
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
