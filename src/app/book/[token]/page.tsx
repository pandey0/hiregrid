import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import BookingGrid from "./BookingGrid";

export default async function BookingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const candidate = await prisma.candidate.findUnique({
    where: { bookingToken: token, deletedAt: null },
    include: {
      program: true,
      activeRound: true,
    },
  });

  if (!candidate || !candidate.activeRound || !candidate.bookingRoundId || candidate.program.deletedAt) notFound();

  if (candidate.bookingTokenExp && candidate.bookingTokenExp < new Date()) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6">
        <div className="max-w-sm text-center">
          <h1 className="text-xl font-semibold text-zinc-900 mb-2">Link expired</h1>
          <p className="text-sm text-zinc-400">
            This booking link has expired. Please contact your recruiter for a new link.
          </p>
        </div>
      </div>
    );
  }

  if (candidate.status === "BOOKED" || candidate.status === "COMPLETED") {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6">
        <div className="max-w-sm text-center">
          <h1 className="text-xl font-semibold text-zinc-900 mb-2">Already booked</h1>
          <p className="text-sm text-zinc-400">
            You&apos;ve already booked a slot. Check your email for confirmation details.
          </p>
        </div>
      </div>
    );
  }

  const panelists = await prisma.programPanelist.findMany({
    where: { 
      roundId: candidate.bookingRoundId,
      deletedAt: null 
    },
  });

  type SlotEntry = { start: string; end: string; booked?: boolean };
  const availableSlots: { panelistId: number; slot: SlotEntry }[] = [];

  for (const panelist of panelists) {
    const slots = Array.isArray(panelist.availableSlots) ? (panelist.availableSlots as SlotEntry[]) : [];
    for (const slot of slots) {
      if (!slot.booked) {
        availableSlots.push({ panelistId: panelist.id, slot });
      }
    }
  }

  availableSlots.sort((a, b) => a.slot.start.localeCompare(b.slot.start));

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-xl mx-auto px-6 py-12">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 mb-1">
            HireGrid · Interview booking
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            {candidate.program.name}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Hi {candidate.name} — pick a time for {candidate.activeRound?.name}
          </p>
        </div>

        {availableSlots.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-xl p-8 text-center">
            <p className="text-sm text-zinc-400">
              No slots are currently available. Your recruiter is working on scheduling. Please check back later or reply to your invitation email.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-xl p-6">
            <p className="text-sm text-zinc-500 mb-6">
              Select a slot below. Each slot is{" "}
              <strong>{candidate.activeRound?.durationMinutes} minutes</strong>. This booking is final.
            </p>
            <BookingGrid
              token={token}
              slots={availableSlots}
              durationMinutes={candidate.activeRound?.durationMinutes ?? 60}
            />
          </div>
        )}
      </div>
    </div>
  );
}
