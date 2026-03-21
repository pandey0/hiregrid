import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

function healthLabel(supply: number, demand: number) {
  if (demand === 0) return { label: "No demand", color: "text-zinc-400" };
  const delta = supply - demand;
  if (delta < 0) return { label: "Deficit", color: "text-red-500" };
  if (delta < 2) return { label: "Tight", color: "text-amber-500" };
  return { label: "Healthy", color: "text-green-600" };
}

export default async function ControlTowerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const membership = await prisma.organizationMember.findFirst({ where: { userId: session.user.id } });
  if (!membership) redirect("/onboarding");

  const program = await prisma.program.findFirst({
    where: { id: parseInt(id), organizationId: membership.organizationId },
    include: {
      rounds: {
        orderBy: { roundNumber: "asc" },
        include: {
          panelists: true,
          activeCandidates: { where: { status: { in: ["ACTIVE", "BOOKED"] } } },
          bookings: { where: { status: "SCHEDULED" } },
        },
      },
    },
  });

  if (!program) notFound();

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-8">
        <Link href={`/programs/${id}`} className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors">
          ← {program.name}
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 mt-3">Control Tower</h1>
        <p className="text-sm text-zinc-400 mt-1">Supply vs. demand health per round.</p>
      </div>

      {program.rounds.length === 0 ? (
        <div className="border border-dashed border-zinc-200 rounded-lg px-6 py-10 text-center text-sm text-zinc-400">
          No rounds yet.
        </div>
      ) : (
        <div className="space-y-4">
          {program.rounds.map((round) => {
            const supply = round.panelists.reduce((acc, p) => {
              const slots = Array.isArray(p.availableSlots) ? p.availableSlots : [];
              const unbooked = slots.filter((s: any) => !s.booked);
              return acc + unbooked.length;
            }, 0);
            const demand = round.activeCandidates.length;
            const booked = round.bookings.length;
            const health = healthLabel(supply, demand);

            return (
              <div key={round.id} className="bg-white border border-zinc-200 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">{round.name}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">Round {round.roundNumber} · {round.durationMinutes} min</p>
                  </div>
                  <span className={`text-sm font-semibold ${health.color}`}>{health.label}</span>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: "Panelists", value: round.panelists.length },
                    { label: "Available slots", value: supply },
                    { label: "Active candidates", value: demand },
                    { label: "Confirmed bookings", value: booked },
                  ].map((s) => (
                    <div key={s.label}>
                      <p className="text-xl font-semibold tabular-nums text-zinc-900">{s.value}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                {supply < demand && (
                  <div className="mt-4 px-4 py-2.5 bg-red-50 border border-red-100 rounded-lg">
                    <p className="text-xs text-red-600">
                      {demand - supply} candidate{demand - supply !== 1 ? "s" : ""} without available slots.{" "}
                      <Link href={`/programs/${id}/panelists`} className="underline underline-offset-2">
                        Invite more panelists
                      </Link>{" "}
                      or ask existing ones to add slots.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
