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
        toast.success("Deployment successful");
      } catch (err: unknown) {
        const error = err as Error;
        toast.error(error.message || "Process failed");
      }
    });
  }

  async function reject() {
    startTransition(async () => {
      try {
        await rejectCandidate(candidateId);
        toast.success("Flow terminated");
      } catch (err: unknown) {
        const error = err as Error;
        toast.error(error.message || "Process failed");
      }
    });
  }

  async function approve() {
    startTransition(async () => {
      try {
        await approveScreening(candidateId);
        toast.success("Entry approved");
      } catch (err: unknown) {
        const error = err as Error;
        toast.error(error.message || "Process failed");
      }
    });
  }

  if (status === "SCREENING") {
    return (
      <div className="flex items-center gap-4">
        <button 
          onClick={approve} 
          disabled={isPending} 
          className="text-[11px] font-black text-blue-600 uppercase tracking-widest hover:underline"
        >
          APPROVE
        </button>
        <button
          onClick={reject}
          disabled={isPending}
          className="text-[11px] font-black text-rose-600 uppercase tracking-widest hover:underline"
        >
          REJECT
        </button>
      </div>
    );
  }

  if (status === "ACTIVE" || status === "BOOKED") {
    return (
      <button
        onClick={reject}
        disabled={isPending}
        className="text-[11px] font-black text-rose-600/40 hover:text-rose-600 uppercase tracking-widest transition-colors"
      >
        TERMINATE
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Select value={selectedRoundId} onValueChange={setSelectedRoundId}>
        <SelectTrigger className="h-8 rounded-lg font-mono text-[10px] font-black w-20 border-slate-100 bg-slate-50 shadow-none">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-slate-100 shadow-xl">
          {rounds.map((r) => (
            <SelectItem key={r.id} value={String(r.id)} className="text-[11px] font-bold uppercase tracking-widest">
              R{r.roundNumber}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isPending} className="h-8 rounded-lg border-slate-200 font-black text-[10px] uppercase tracking-widest px-4 hover:bg-slate-900 hover:text-white transition-all">
            MANAGE ->
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 rounded-2xl border-slate-100 shadow-2xl p-2">
          <DropdownMenuLabel className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 py-3">Operations</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-50" />
          <DropdownMenuItem onClick={activate} className="py-3 px-4 font-bold text-[12px] uppercase tracking-wider cursor-pointer rounded-xl focus:bg-blue-600 focus:text-white">
            Activate // Generate Link
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-slate-50" />
          <DropdownMenuItem
            onClick={reject}
            className="py-3 px-4 font-bold text-[12px] uppercase tracking-wider cursor-pointer rounded-xl text-rose-600 focus:bg-rose-50 focus:text-rose-700"
          >
            Reject // Terminate Flow
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
