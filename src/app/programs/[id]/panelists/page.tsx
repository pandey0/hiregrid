import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import InvitePanelistForm from "./InvitePanelistForm";
import { deletePanelist } from "@/actions/panelists";
import CopyButton from "./CopyButton";

function formatSlots(slots: unknown): string {
  if (!Array.isArray(slots)) return "0 slots";
  return `${slots.length} slot${slots.length !== 1 ? "s" : ""}`;
}

export default async function PanelistsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const membership = await prisma.organizationMember.findFirst({ where: { userId: session.user.id } });
  if (!membership) redirect("/onboarding");

  const program = await prisma.program.findFirst({
    where: { id: parseInt(id), organizationId: membership.organizationId },
    include: {
      rounds: { orderBy: { roundNumber: "asc" } },
      panelists: {
        orderBy: { createdAt: "desc" },
        include: { round: true },
      },
    },
  });

  if (!program) notFound();

  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "";

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-8">
        <Link href={`/programs/${id}`} className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors">
          ← {program.name}
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 mt-3">Panelists</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Invite panelists to a round. They receive a private link to submit their availability — no account needed.
        </p>
      </div>

      {program.rounds.length === 0 ? (
        <div className="border border-dashed border-zinc-200 rounded-lg px-6 py-10 text-center text-sm text-zinc-400">
          Add rounds to the program first before inviting panelists.
        </div>
      ) : (
        <>
          <div className="bg-white border border-zinc-200 rounded-xl p-6 mb-8">
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 mb-4">Invite panelist</p>
            <InvitePanelistForm programId={program.id} rounds={program.rounds} />
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 mb-3">
              Panelists ({program.panelists.length})
            </p>

            {program.panelists.length === 0 ? (
              <div className="border border-dashed border-zinc-200 rounded-lg px-6 py-10 text-center text-sm text-zinc-400">
                No panelists invited yet.
              </div>
            ) : (
              <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-100">
                      <th className="text-left px-5 py-3 text-xs font-medium text-zinc-400">Name / Email</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-zinc-400">Round</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-zinc-400">Availability</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-zinc-400">Magic link</th>
                      <th className="px-5 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {program.panelists.map((p) => {
                      const magicLink = `${baseUrl}/availability/${p.magicLinkToken}`;
                      return (
                        <tr key={p.id} className="border-b border-zinc-50 last:border-0">
                          <td className="px-5 py-3">
                            <p className="font-medium text-zinc-900">{p.externalName || "—"}</p>
                            <p className="text-xs text-zinc-400">{p.externalEmail}</p>
                          </td>
                          <td className="px-5 py-3 text-zinc-600">{p.round.name}</td>
                          <td className="px-5 py-3 text-zinc-600">{formatSlots(p.availableSlots)}</td>
                          <td className="px-5 py-3">
                            <CopyButton value={magicLink} />
                          </td>
                          <td className="px-5 py-3">
                            <form action={deletePanelist.bind(null, p.id, program.id)}>
                              <button
                                type="submit"
                                className="text-xs text-zinc-300 hover:text-red-400 transition-colors"
                              >
                                Remove
                              </button>
                            </form>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

