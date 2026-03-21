import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: session.user.id },
    include: { organization: true },
  });
  if (!membership) redirect("/onboarding");

  const [programs, candidates, bookings] = await Promise.all([
    prisma.program.findMany({
      where: { organizationId: membership.organizationId },
      include: { rounds: true, _count: { select: { candidates: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.candidate.count({ where: { organizationId: membership.organizationId } }),
    prisma.booking.count({
      where: {
        candidate: { organizationId: membership.organizationId },
        status: "SCHEDULED",
      },
    }),
  ]);

  const completedBookings = await prisma.booking.count({
    where: {
      candidate: { organizationId: membership.organizationId },
      status: "COMPLETED",
    },
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            {membership.organization.name}
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">Hiring overview</p>
        </div>
        <Link
          href="/programs/create"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-md hover:bg-zinc-800 transition-colors"
        >
          New program
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Programs", value: programs.length },
          { label: "Candidates", value: candidates },
          { label: "Active bookings", value: bookings },
          { label: "Completed", value: completedBookings },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-zinc-200 rounded-lg px-5 py-4">
            <p className="text-2xl font-semibold tabular-nums text-zinc-900">{stat.value}</p>
            <p className="text-xs text-zinc-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {programs.length === 0 ? (
        <div className="border border-dashed border-zinc-200 rounded-lg px-8 py-16 text-center">
          <p className="text-sm text-zinc-400 mb-4">No programs yet</p>
          <Link
            href="/programs/create"
            className="inline-flex items-center px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-md hover:bg-zinc-800 transition-colors"
          >
            Create your first program
          </Link>
        </div>
      ) : (
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 mb-3">
            Programs
          </p>
          <div className="space-y-2">
            {programs.map((program) => (
              <Link
                key={program.id}
                href={`/programs/${program.id}`}
                className="flex items-center justify-between bg-white border border-zinc-200 rounded-lg px-5 py-4 hover:border-zinc-300 transition-colors group"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900 group-hover:text-zinc-700">
                    {program.name}
                  </p>
                  {program.description && (
                    <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">{program.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-5 text-xs text-zinc-400">
                  <span>{program.rounds.length} rounds</span>
                  <span>{program._count.candidates} candidates</span>
                  <span className="text-zinc-300">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
