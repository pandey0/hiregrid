import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import DeleteProgramButton from "./DeleteProgramButton";

const roundTypeLabel = {
  ATS_SCREENING: "ATS",
  HUMAN_INTERVIEW: "Interview",
  ASSIGNMENT: "Assignment",
};

export default async function ProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: session.user.id },
  });
  if (!membership) redirect("/onboarding");

  const program = await prisma.program.findFirst({
    where: { id: parseInt(id), organizationId: membership.organizationId },
    include: {
      rounds: {
        orderBy: { roundNumber: "asc" },
        include: {
          _count: { select: { panelists: true, bookings: true } },
        },
      },
      _count: { select: { candidates: true, panelists: true } },
    },
  });

  if (!program) notFound();

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-8">
        <Link href="/dashboard" className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors">
          ← Dashboard
        </Link>
        <div className="flex items-start justify-between mt-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{program.name}</h1>
            {program.description && (
              <p className="text-sm text-zinc-400 mt-1">{program.description}</p>
            )}
          </div>
          <DeleteProgramButton programId={program.id} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: "Rounds", value: program.rounds.length },
          { label: "Panelists", value: program._count.panelists },
          { label: "Candidates", value: program._count.candidates },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-zinc-200 rounded-lg px-5 py-4">
            <p className="text-2xl font-semibold tabular-nums text-zinc-900">{s.value}</p>
            <p className="text-xs text-zinc-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-10">
        {[
          { label: "Manage panelists", href: `/programs/${program.id}/panelists` },
          { label: "Candidate inbox", href: `/programs/${program.id}/candidates` },
          { label: "Control Tower", href: `/programs/${program.id}/control-tower` },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="block px-5 py-4 bg-white border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 hover:border-zinc-300 hover:text-zinc-900 transition-colors"
          >
            {l.label} →
          </Link>
        ))}
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 mb-3">Rounds</p>
        {program.rounds.length === 0 ? (
          <div className="border border-dashed border-zinc-200 rounded-lg px-6 py-10 text-center text-sm text-zinc-400">
            No rounds defined yet. Edit the program to add rounds.
          </div>
        ) : (
          <div className="space-y-2">
            {program.rounds.map((round) => (
              <div
                key={round.id}
                className="flex items-center justify-between bg-white border border-zinc-200 rounded-lg px-5 py-4"
              >
                <div className="flex items-center gap-4">
                  <span className="text-xs tabular-nums text-zinc-300 w-5">{round.roundNumber}</span>
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{round.name}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {roundTypeLabel[round.roundType]}
                      {round.roundType !== "ATS_SCREENING" && ` · ${round.durationMinutes} min`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-5 text-xs text-zinc-400">
                  <span>{round._count.panelists} panelists</span>
                  <span>{round._count.bookings} bookings</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
