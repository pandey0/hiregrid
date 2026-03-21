"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { shortlistAndActivate, rejectCandidate } from "@/actions/candidates";

type Round = { id: number; name: string; roundNumber: number };

export default function CandidateActions({
  candidateId,
  status,
  rounds,
}: {
  candidateId: number;
  status: string;
  rounds: Round[];
}) {
  const [isPending, startTransition] = useTransition();
  const [selectedRoundId, setSelectedRoundId] = useState<number>(rounds[0]?.id ?? 0);

  if (status === "REJECTED" || status === "COMPLETED") return null;

  async function activate() {
    if (!selectedRoundId) return;
    startTransition(async () => {
      try {
        await shortlistAndActivate(candidateId, selectedRoundId);
        toast.success("Candidate activated — booking link generated");
      } catch (err: any) {
        toast.error(err?.message || "Failed");
      }
    });
  }

  async function reject() {
    startTransition(async () => {
      try {
        await rejectCandidate(candidateId);
        toast.success("Candidate rejected");
      } catch (err: any) {
        toast.error(err?.message || "Failed");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      {(status === "DRAFT" || status === "SHORTLISTED") && rounds.length > 0 && (
        <>
          <select
            value={selectedRoundId}
            onChange={(e) => setSelectedRoundId(parseInt(e.target.value))}
            className="text-xs px-2 py-1 border border-zinc-200 rounded text-zinc-600 focus:outline-none"
          >
            {rounds.map((r) => (
              <option key={r.id} value={r.id}>
                R{r.roundNumber}
              </option>
            ))}
          </select>
          <button
            onClick={activate}
            disabled={isPending}
            className="text-xs px-2.5 py-1 bg-zinc-900 text-white rounded hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            Activate
          </button>
        </>
      )}
      {status !== "REJECTED" && (
        <button
          onClick={reject}
          disabled={isPending}
          className="text-xs text-zinc-300 hover:text-red-400 transition-colors"
        >
          Reject
        </button>
      )}
    </div>
  );
}
