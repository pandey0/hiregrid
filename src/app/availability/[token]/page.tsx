import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import AvailabilityClient from "./AvailabilityClient";

export default async function AvailabilityPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  // 1. Get the current context
  const panelist = await prisma.programPanelist.findUnique({
    where: { magicLinkToken: token },
    include: {
      program: true,
      round: true,
      bookings: {
        include: { candidate: true },
        orderBy: { slotStart: "desc" }
      }
    },
  });

  if (!panelist || panelist.program.deletedAt || panelist.deletedAt) notFound();
  
  if (panelist.magicLinkTokenExp && panelist.magicLinkTokenExp < new Date()) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[40px] p-12 shadow-2xl shadow-slate-200 text-center border border-slate-100">
          <span className="font-mono text-[12px] font-black text-rose-600 uppercase tracking-[0.4em] block mb-6">[ EXPIRED ]</span>
          <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">Access Revoked</h1>
          <p className="text-slate-500 text-[15px] leading-relaxed mb-8 font-medium">
            This security token has expired. Please request a new unique link from your recruiter.
          </p>
          <div className="h-px w-12 bg-slate-100 mx-auto" />
        </div>
      </div>
    );
  }

  // 2. Identify the panelist and find all their other active links
  const otherPrograms = panelist.externalEmail ? await prisma.programPanelist.findMany({
    where: {
      externalEmail: panelist.externalEmail,
      id: { not: panelist.id },
      deletedAt: null,
      program: { deletedAt: null }
    },
    include: { program: true, round: true }
  }) : [];

  const scheduledInterviews = panelist.bookings.filter(b => b.status === "SCHEDULED");
  const completedInterviews = panelist.bookings.filter(b => b.status === "COMPLETED");

  const existingSlots = Array.isArray(panelist.availableSlots)
    ? (panelist.availableSlots as { start: string; end: string }[])
    : [];

  return (
    <AvailabilityClient 
      panelist={panelist}
      otherPrograms={otherPrograms}
      scheduledInterviews={scheduledInterviews}
      completedInterviews={completedInterviews}
      existingSlots={existingSlots}
      token={token}
    />
  );
}
