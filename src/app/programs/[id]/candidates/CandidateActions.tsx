"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { shortlistAndActivate, rejectCandidate } from "@/actions/candidates";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [selectedRoundId, setSelectedRoundId] = useState<string>(String(rounds[0]?.id ?? ""));

  if (status === "REJECTED" || status === "COMPLETED") return null;

  async function activate() {
    if (!selectedRoundId) return;
    startTransition(async () => {
      try {
        await shortlistAndActivate(candidateId, parseInt(selectedRoundId));
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
          <Select value={selectedRoundId} onValueChange={setSelectedRoundId}>
            <SelectTrigger className="h-7 text-xs w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {rounds.map((r) => (
                <SelectItem key={r.id} value={String(r.id)} className="text-xs">
                  R{r.roundNumber}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            onClick={activate}
            disabled={isPending}
            className="h-7 text-xs px-2.5"
          >
            Activate
          </Button>
        </>
      )}
      {status !== "REJECTED" && (
        <Button
          variant="ghost"
          size="sm"
          onClick={reject}
          disabled={isPending}
          className="h-7 text-xs text-zinc-300 hover:text-red-500 hover:bg-red-50"
        >
          Reject
        </Button>
      )}
    </div>
  );
}
