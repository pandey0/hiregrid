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
        toast.success("Panelist invited — copy their magic link from the table below");
        form.reset();
        setSelectedRoundId(String(rounds[0]?.id ?? ""));
      } catch (err: any) {
        toast.error(err?.message || "Failed to invite panelist");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
      <div className="space-y-1.5">
        <Label>Name</Label>
        <Input name="name" placeholder="Jane Smith" />
      </div>
      <div className="space-y-1.5">
        <Label>Email</Label>
        <Input name="email" type="email" required placeholder="panelist@company.com" />
      </div>
      <div className="space-y-1.5">
        <Label>Round</Label>
        <Select value={selectedRoundId} onValueChange={setSelectedRoundId}>
          <SelectTrigger>
            <SelectValue placeholder="Select round" />
          </SelectTrigger>
          <SelectContent>
            {rounds.map((r) => (
              <SelectItem key={r.id} value={String(r.id)}>
                {r.roundNumber}. {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Inviting..." : "Invite"}
        </Button>
      </div>
    </form>
  );
}
