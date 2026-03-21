import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import AddCandidateForm from "./AddCandidateForm";
import CandidateActions from "./CandidateActions";

const statusColors: Record<string, string> = {
  DRAFT: "text-zinc-400",
  SHORTLISTED: "text-amber-500",
  ACTIVE: "text-blue-500",
  BOOKED: "text-green-500",
  COMPLETED: "text-zinc-900",
  REJECTED: "text-red-400",
};

export default async function CandidatesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const membership = await prisma.organizationMember.findFirst({ where: { userId: session.user.id } });
  if (!membership) redirect("/onboarding");

  const program = await prisma.program.findFirst({
    where: { id: parseInt(id), organizationId: membership.organizationId },
    include: {
      rounds: { orderBy: { roundNumber: "asc" } },
      candidates: {
        orderBy: { createdAt: "desc" },
        include: { activeRound: true },
      },
    },
  });

  if (!program) notFound();

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-8">
        <Link href={`/programs/${id}`} className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors">
          ← {program.name}
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 mt-3">Candidates</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Add candidates, review ATS scores, then shortlist and activate for booking.
        </p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl p-6 mb-8">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 mb-4">Add candidate</p>
        <AddCandidateForm programId={program.id} />
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 mb-3">
          Candidates ({program.candidates.length})
        </p>

        {program.candidates.length === 0 ? (
          <div className="border border-dashed border-zinc-200 rounded-lg px-6 py-10 text-center text-sm text-zinc-400">
            No candidates yet.
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="text-left px-5 py-3 text-xs font-medium text-zinc-400">Name</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-zinc-400">Email</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-zinc-400">Score</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-zinc-400">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-zinc-400">Round</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {program.candidates.map((c) => (
                  <tr key={c.id} className="border-b border-zinc-50 last:border-0">
                    <td className="px-5 py-3 font-medium text-zinc-900">{c.name}</td>
                    <td className="px-5 py-3 text-zinc-500">{c.email}</td>
                    <td className="px-5 py-3">
                      {c.atsScore !== null && c.atsScore !== undefined ? (
                        <span className="font-mono text-zinc-900">{Math.round(c.atsScore)}</span>
                      ) : (
                        <span className="text-zinc-300">—</span>
                      )}
                    </td>
                    <td className={`px-5 py-3 text-xs font-medium ${statusColors[c.status] ?? "text-zinc-400"}`}>
                      {c.status}
                    </td>
                    <td className="px-5 py-3 text-zinc-500">
                      {c.activeRound?.name ?? <span className="text-zinc-300">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      <CandidateActions
                        candidateId={c.id}
                        status={c.status}
                        rounds={program.rounds}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
