import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type HealthResult = { label: string; variant: "default" | "secondary" | "outline" | "destructive"; className?: string };

function healthLabel(supply: number, demand: number): HealthResult {
  if (demand === 0) return { label: "No demand", variant: "secondary" };
  const delta = supply - demand;
  if (delta < 0) return { label: "Deficit", variant: "destructive" };
  if (delta < 2) return { label: "Tight", variant: "outline", className: "border-amber-300 text-amber-600" };
  return { label: "Healthy", variant: "outline", className: "border-green-300 text-green-600" };
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
        <Button variant="ghost" size="sm" asChild className="text-zinc-400 hover:text-zinc-700 -ml-2 mb-1">
          <Link href={`/programs/${id}`}>← {program.name}</Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 mt-1">Control Tower</h1>
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
              <Card key={round.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">{round.name}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Round {round.roundNumber} · {round.durationMinutes} min
                      </p>
                    </div>
                    <Badge variant={health.variant} className={health.className}>
                      {health.label}
                    </Badge>
                  </div>

                  <Separator className="mb-4" />

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
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
