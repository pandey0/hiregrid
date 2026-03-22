import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import BookingClient from "./BookingClient";

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
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[40px] p-12 shadow-2xl shadow-slate-200 text-center border border-slate-100">
          <span className="font-mono text-[12px] font-black text-rose-600 uppercase tracking-[0.4em] block mb-6">[ EXPIRED ]</span>
          <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">Access Revoked</h1>
          <p className="text-slate-500 text-[15px] leading-relaxed mb-8 font-medium">
            This booking link has expired. Please contact your recruiter for a new unique link.
          </p>
          <div className="h-px w-12 bg-slate-100 mx-auto" />
        </div>
      </div>
    );
  }

  if (candidate.status === "BOOKED" || candidate.status === "COMPLETED") {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[40px] p-12 shadow-2xl shadow-slate-200 text-center border border-slate-100">
          <span className="font-mono text-[12px] font-black text-blue-600 uppercase tracking-[0.4em] block mb-6">[ SECURED ]</span>
          <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">Confirmed</h1>
          <p className="text-slate-500 text-[15px] leading-relaxed mb-8 font-medium">
            You&apos;ve already secured your slot. Please check your email for the calendar invitation and meeting link.
          </p>
          <div className="h-px w-12 bg-slate-100 mx-auto" />
        </div>
      </div>
    );
  }

  if (candidate.status === "REJECTED") {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[40px] p-12 shadow-2xl shadow-slate-200 text-center border border-slate-100">
          <span className="font-mono text-[12px] font-black text-slate-400 uppercase tracking-[0.4em] block mb-6">[ CLOSED ]</span>
          <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">Withdrawn</h1>
          <p className="text-slate-500 text-[15px] leading-relaxed mb-8 font-medium">
            You have successfully withdrawn from this hiring sequence.
          </p>
          <div className="h-px w-12 bg-slate-100 mx-auto" />
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
    <BookingClient 
      candidate={candidate}
      availableSlots={availableSlots}
      token={token}
    />
  );
}
