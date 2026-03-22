import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: session.user.id },
    include: { organization: true },
  });
  if (!membership) redirect("/onboarding");

  // Story 16.4: Admin Oversight vs Program-level Visibility
  const programWhereClause: any = {
    organizationId: membership.organizationId,
    deletedAt: null,
  };

  // If not an admin, only show programs they are assigned to
  if (membership.role !== "ADMIN") {
    programWhereClause.members = {
      some: { userId: session.user.id }
    };
  }

  const [programs, candidatesCount, bookingsCount, failedBookingsCount] = await Promise.all([
    prisma.program.findMany({
      where: programWhereClause,
      include: { rounds: { where: { deletedAt: null } }, _count: { select: { candidates: { where: { deletedAt: null } } } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.candidate.count({ where: { organizationId: membership.organizationId, deletedAt: null } }),
    prisma.booking.count({
      where: {
        candidate: { organizationId: membership.organizationId, deletedAt: null },
        status: "SCHEDULED",
      },
    }),
    prisma.booking.count({
      where: {
        candidate: { organizationId: membership.organizationId, deletedAt: null },
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

  const stats = [
    { label: "Programs", value: programs.length },
    { label: "Candidates", value: candidatesCount },
    { label: "Bookings", value: bookingsCount },
    { label: "Completed", value: completedBookings },
  ];

  const firstName = session.user.name.split(" ")[0];

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-12">
      {failedBookingsCount > 0 && (
        <div className="mb-8 p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-[14px] font-bold text-rose-900">{failedBookingsCount} Action Required</p>
              <p className="text-[13px] text-rose-700 font-medium">Some calendar invites failed to generate. Please handle them manually.</p>
            </div>
          </div>
          <Button asChild variant="outline" className="h-9 px-4 rounded-xl border-rose-200 text-rose-700 hover:bg-rose-100 font-bold text-[13px] shadow-none">
            <Link href="/bookings/failed">Resolve All</Link>
          </Button>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Good morning, {firstName}
          </h1>
          <p className="text-slate-500 mt-1.5 font-medium">
            You have <span className="text-blue-600">{bookingsCount} interviews</span> scheduled for today.
          </p>
        </div>
        <Button asChild className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200/50 transition-all active:scale-[0.98]">
          <Link href="/programs/create">
            New Program
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {stats.map((stat) => (
          <div key={stat.label} className="group relative">
            <div className="absolute inset-0 bg-slate-900/5 rounded-[20px] blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            <Card className="relative border-slate-200/60 bg-white/80 backdrop-blur-sm rounded-[20px] shadow-sm group-hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <div>
                  <p className="text-3xl font-bold text-slate-900 tabular-nums tracking-tight">
                    {stat.value}
                  </p>
                  <p className="text-[13px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
                    {stat.label}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[15px] font-bold text-slate-900 uppercase tracking-widest">
            Active Programs
          </h2>
        </div>

        {programs.length === 0 ? (
          <Card className="border-dashed border-slate-200 bg-slate-50/30 rounded-[20px]">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <h3 className="text-lg font-bold text-slate-900">Start your first program</h3>
              <p className="text-[14px] text-slate-500 mt-2 mb-6 max-w-[320px] leading-relaxed">
                HireGrid helps you manage multi-round interviews with automated scheduling and AI screening.
              </p>
              <Button asChild variant="outline" className="rounded-xl h-10 px-6 border-slate-200 shadow-sm">
                <Link href="/programs/create">Create Program</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {programs.slice(0, 5).map((program) => (
              <Link
                key={program.id}
                href={`/programs/${program.id}`}
                className="block group"
              >
                <Card className="border-slate-200/60 bg-white group-hover:border-slate-300 rounded-[20px] shadow-sm group-hover:shadow-md transition-all duration-300">
                  <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <h4 className="text-[16px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {program.name}
                        </h4>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[10px] uppercase font-bold tracking-wider px-2 rounded-md">
                          {program.rounds.length} rounds
                        </Badge>
                      </div>
                      {program.description && (
                        <p className="text-[13px] text-slate-500 mt-1.5 line-clamp-1 max-w-md">
                          {program.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-[13px] font-medium text-slate-400 shrink-0">
                      <span>{program._count.candidates} candidates</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span>Updated 2d ago</span>
                      <span className="text-slate-300 group-hover:text-blue-600 transition-colors ml-2">→</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

