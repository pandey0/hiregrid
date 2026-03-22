"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { invitePanelist } from "@/actions/panelists";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Round = { id: number; name: string; roundNumber: number };

export default function InvitePanelistForm({
  programId,
  rounds,
}: {
  programId: number;
  rounds: Round[];
}) {
  const [isPending, startTransition] = useTransition();
  const [selectedRoundId, setSelectedRoundId] = useState<string>(String(rounds[0]?.id ?? ""));

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("roundId", selectedRoundId);
    fd.append("programId", String(programId));
    const form = e.currentTarget;

    startTransition(async () => {
      try {
        await invitePanelist(fd);
        toast.success("Panelist invited — magic link sent via email");
        form.reset();
        setSelectedRoundId(String(rounds[0]?.id ?? ""));
      } catch (err: unknown) {
        const error = err as Error;
        toast.error(error.message || "Failed to invite panelist");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="space-y-2">
        <Label className="text-[13px] font-bold text-slate-700 ml-1">Name</Label>
        <Input name="name" placeholder="Jane Smith" className="h-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all font-medium" />
      </div>
      <div className="space-y-2">
        <Label className="text-[13px] font-bold text-slate-700 ml-1">Email</Label>
        <Input name="email" type="email" required placeholder="panelist@company.com" className="h-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all font-medium" />
      </div>
      <div className="space-y-2">
        <Label className="text-[13px] font-bold text-slate-700 ml-1">Round</Label>
        <Select value={selectedRoundId} onValueChange={setSelectedRoundId}>
          <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all font-medium">
            <SelectValue placeholder="Select round" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-slate-200 shadow-xl shadow-slate-900/5">
            {rounds.map((r) => (
              <SelectItem key={r.id} value={String(r.id)} className="rounded-lg my-0.5">
                {r.roundNumber}. {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={isPending} className="w-full bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200/50 rounded-xl h-11 font-bold transition-all">
          {isPending ? "Inviting..." : "Invite Panelist"}
        </Button>
      </div>
    </form>
  );
}
