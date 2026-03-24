"use client";

import { useTransition } from "react";
import { resendCandidateBookingLink } from "@/actions/candidates";
import { toast } from "sonner";

export default function NudgeCandidateButton({ candidateId }: { candidateId: number }) {
  const [isPending, startTransition] = useTransition();

  const handleNudge = () => {
    startTransition(async () => {
      try {
        await resendCandidateBookingLink(candidateId);
        toast.success("Candidate nudge dispatched");
      } catch (err: unknown) {
        const error = err as Error;
        toast.error(error.message || "Dispatch failed");
      }
    });
  };

  return (
    <button
      onClick={handleNudge}
      disabled={isPending}
      className="text-[10px] font-black text-blue-600/40 hover:text-blue-600 uppercase tracking-widest transition-colors disabled:opacity-30"
    >
      {isPending ? "SENDING..." : "NUDGE //"}
    </button>
  );
}
