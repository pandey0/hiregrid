"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { shortlistAndActivate, rejectCandidate, approveScreening } from "@/actions/candidates";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
      } catch (err: unknown) {
        const error = err as Error;
        toast.error(error.message || "Failed");
      }
    });
  }

  async function reject() {
    startTransition(async () => {
      try {
        await rejectCandidate(candidateId);
        toast.success("Candidate rejected");
      } catch (err: unknown) {
        const error = err as Error;
        toast.error(error.message || "Failed");
      }
    });
  }

  async function approve() {
    startTransition(async () => {
      try {
        await approveScreening(candidateId);
        toast.success("Candidate approved — moved to pipeline");
      } catch (err: unknown) {
        const error = err as Error;
        toast.error(error.message || "Failed");
      }
    });
  }

  if (status === "SCREENING") {
    return (
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={approve} disabled={isPending} className="h-7 text-xs px-3">
          Approve
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={reject}
          disabled={isPending}
          className="h-7 text-xs text-zinc-300 hover:text-red-500 hover:bg-red-50"
        >
          Reject
        </Button>
      </div>
    );
  }

  if (status === "ACTIVE" || status === "BOOKED") {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={reject}
        disabled={isPending}
        className="h-7 text-xs text-zinc-300 hover:text-red-500 hover:bg-red-50"
      >
        Reject
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isPending} className="h-7 text-xs px-2">
            Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel className="text-xs text-zinc-400">Candidate actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={activate} className="text-xs cursor-pointer">
            Activate for booking
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={reject}
            className="text-xs text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
          >
            Reject candidate
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
