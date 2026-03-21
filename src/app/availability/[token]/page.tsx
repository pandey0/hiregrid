import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import AvailabilityGrid from "./AvailabilityGrid";

export default async function AvailabilityPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const panelist = await prisma.programPanelist.findUnique({
    where: { magicLinkToken: token },
    include: {
      program: true,
      round: true,
    },
  });

  if (!panelist) notFound();

  const existingSlots = Array.isArray(panelist.availableSlots)
    ? (panelist.availableSlots as { start: string; end: string }[])
    : [];

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 mb-1">
            HireGrid · Panelist availability
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            {panelist.program.name}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Round: {panelist.round.name} · {panelist.round.durationMinutes} min per slot
          </p>
          {panelist.externalName && (
            <p className="text-sm text-zinc-400 mt-0.5">Hi, {panelist.externalName}</p>
          )}
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-6">
          <p className="text-sm text-zinc-500 mb-6">
            Select the times you&apos;re available to interview. Each slot will be exactly{" "}
            <strong>{panelist.round.durationMinutes} minutes</strong>. Candidates will book from these slots.
          </p>
          <AvailabilityGrid
            token={token}
            durationMinutes={panelist.round.durationMinutes}
            existingSlots={existingSlots}
          />
        </div>
      </div>
    </div>
  );
}
