"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createProgram } from "@/actions/programs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Round = {
  name: string;
  durationMinutes: number;
  roundType: "ATS_SCREENING" | "HUMAN_INTERVIEW" | "ASSIGNMENT";
  description: string;
};

const defaultRound = (): Round => ({
  name: "",
  durationMinutes: 60,
  roundType: "HUMAN_INTERVIEW",
  description: "",
});

const roundTypeLabels = {
  ATS_SCREENING: "ATS / Auto screening",
  HUMAN_INTERVIEW: "Human interview",
  ASSIGNMENT: "Assignment",
};

export default function CreateProgramForm() {
  const [rounds, setRounds] = useState<Round[]>([defaultRound()]);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function updateRound(index: number, field: keyof Round, value: string | number) {
    setRounds((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  }

  function addRound() {
    setRounds((prev) => [...prev, defaultRound()]);
  }

  function removeRound(index: number) {
    if (rounds.length === 1) return;
    setRounds((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    for (let i = 0; i < rounds.length; i++) {
      if (!rounds[i].name.trim()) {
        toast.error(`Round ${i + 1} needs a name`);
        return;
      }
    }

    fd.append("rounds", JSON.stringify(rounds));

    startTransition(async () => {
      try {
        await createProgram(fd);
      } catch (err: any) {
        if (!err?.message?.includes("NEXT_REDIRECT")) {
          toast.error(err?.message || "Failed to create program");
        }
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="prog-name">Program name</Label>
            <Input
              id="prog-name"
              name="name"
              required
              placeholder="e.g. Senior Frontend Engineer Hiring Drive"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="prog-desc">Description</Label>
            <Textarea
              id="prog-desc"
              name="description"
              rows={2}
              placeholder="What is this program for?"
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">Rounds</p>
          <Button type="button" variant="ghost" size="sm" onClick={addRound} className="text-xs h-7">
            + Add round
          </Button>
        </div>

        <div className="space-y-3">
          {rounds.map((round, index) => (
            <Card key={index}>
              <CardContent className="pt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-medium">Round {index + 1}</span>
                  {rounds.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRound(index)}
                      className="text-xs h-6 text-zinc-300 hover:text-red-500 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Round name</Label>
                    <Input
                      value={round.name}
                      onChange={(e) => updateRound(index, "name", e.target.value)}
                      placeholder="e.g. Technical Interview"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Type</Label>
                    <Select
                      value={round.roundType}
                      onValueChange={(v) => updateRound(index, "roundType", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(roundTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {round.roundType !== "ATS_SCREENING" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Duration (minutes)</Label>
                      <Select
                        value={String(round.durationMinutes)}
                        onValueChange={(v) => updateRound(index, "durationMinutes", parseInt(v))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[30, 45, 60, 75, 90, 120].map((m) => (
                            <SelectItem key={m} value={String(m)}>
                              {m} min
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Description (optional)</Label>
                      <Input
                        value={round.description}
                        onChange={(e) => updateRound(index, "description", e.target.value)}
                        placeholder="Optional notes"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="ghost" onClick={() => router.back()} className="text-zinc-400">
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create program"}
        </Button>
      </div>
    </form>
  );
}
