"use client";

import { useState, useTransition } from "react";
import { toast } from "@/lib/toast";
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
import NudgeCandidateButton from "./NudgeCandidateButton";

type Round = { id: number; name: string; roundNumber: number };

export default function CandidateActions({
  candidateId,
  status,
  rounds,
  nudgeCount = 0,
}: {
  candidateId: number;
  status: string;
  rounds: Round[];
  nudgeCount?: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [selectedRoundId, setSelectedRoundId] = useState<string>(String(rounds[0]?.id ?? ""));

  if (status === "REJECTED" || status === "COMPLETED") return null;

  async function activate() {
    if (!selectedRoundId) return;
    startTransition(async () => {
      try {
        const result = await shortlistAndActivate(candidateId, parseInt(selectedRoundId));
        toast.success("Deployment successful", { traceId: result?.traceId });
      } catch (err: unknown) {
        const error = err as Error;
        toast.error(error.message || "Process failed");
      }
    });
  }

  async function reject() {
    startTransition(async () => {
      try {
        const result = await rejectCandidate(candidateId);
        toast.success("Flow terminated", { traceId: result?.traceId });
      } catch (err: unknown) {
        const error = err as Error;
        toast.error(error.message || "Process failed");
      }
    });
  }

  async function approve() {
    startTransition(async () => {
      try {
        const result = await approveScreening(candidateId);
        toast.success("Entry approved", { traceId: result?.traceId });
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
          className="text-[11px] font-black text-app-accent uppercase tracking-widest hover:underline"
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
      <div className="flex items-center justify-end gap-6">
        {status === "ACTIVE" && (
          <div className="flex flex-col items-end gap-1">
            <NudgeCandidateButton candidateId={candidateId} />
            {nudgeCount > 0 && (
              <span className="font-mono text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                NUDGED {nudgeCount}X
              </span>
            )}
          </div>
        )}
        <button
          onClick={reject}
          disabled={isPending}
          className="text-[11px] font-black text-rose-600/40 hover:text-rose-600 uppercase tracking-widest transition-colors"
        >
          TERMINATE
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Select value={selectedRoundId} onValueChange={setSelectedRoundId}>
        <SelectTrigger className="h-8 rounded-lg font-mono text-[10px] font-black w-20 border-app-border bg-app-card/50 shadow-none">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-app-border bg-app-card shadow-2xl">
          {rounds.map((r) => (
            <SelectItem key={r.id} value={String(r.id)} className="text-[11px] font-bold uppercase tracking-widest">
              R{r.roundNumber}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isPending} className="h-8 rounded-lg border-app-border font-black text-[10px] uppercase tracking-widest px-4 hover:bg-app-text-main hover:text-app-bg transition-all shadow-none">
            MANAGE ->
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 rounded-2xl border-app-border bg-app-card shadow-2xl p-2">
          <DropdownMenuLabel className="font-mono text-[10px] font-bold text-app-text-sub uppercase tracking-widest px-4 py-3">Operations // HUD</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-app-border/50" />
          <DropdownMenuItem onClick={activate} className="py-4 px-4 font-bold text-[12px] uppercase tracking-wider cursor-pointer rounded-xl focus:bg-app-accent focus:text-white">
            Activate // Generate Link
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-app-border/50" />
          <DropdownMenuItem
            onClick={reject}
            className="py-4 px-4 font-bold text-[12px] uppercase tracking-wider cursor-pointer rounded-xl text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/30 focus:text-rose-700"
          >
            Reject // Terminate Flow
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
