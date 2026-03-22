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
import { Plus, Trash2, Layers, Clock, ChevronRight, Briefcase } from "lucide-react";

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
      } catch (err: unknown) {
        const error = err as Error;
        if (!error?.message?.includes("NEXT_REDIRECT")) {
          toast.error(error.message || "Failed to create program");
        }
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Program Details Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Briefcase className="w-4 h-4" />
          </div>
          <h2 className="text-[15px] font-bold text-slate-900 uppercase tracking-widest">Program Details</h2>
        </div>
        
        <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm rounded-[24px] shadow-sm overflow-hidden">
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="prog-name" className="text-[13px] font-bold text-slate-700 ml-1">Program Name</Label>
              <Input
                id="prog-name"
                name="name"
                required
                placeholder="e.g. Senior Frontend Engineer Hiring Drive"
                className="h-12 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all text-[15px] font-medium placeholder:text-slate-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prog-desc" className="text-[13px] font-bold text-slate-700 ml-1">Description (Optional)</Label>
              <Textarea
                id="prog-desc"
                name="description"
                rows={3}
                placeholder="Outline the goals and context for this hiring program..."
                className="resize-none rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all text-[15px] font-medium placeholder:text-slate-400 p-4"
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Rounds Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="text-[15px] font-bold text-slate-900 uppercase tracking-widest">Interview Rounds</h2>
          </div>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={addRound} 
            className="text-[13px] font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg h-9"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Round
          </Button>
        </div>

        <div className="space-y-4 relative">
          {/* Timeline Connector */}
          <div className="absolute left-[39px] top-8 bottom-8 w-0.5 bg-slate-100 hidden md:block" />

          {rounds.map((round, index) => (
            <Card key={index} className="border-slate-200/60 bg-white rounded-[24px] shadow-sm hover:shadow-md transition-all duration-300 group">
              <CardContent className="p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-50 border-2 border-slate-100 flex items-center justify-center text-[14px] font-bold text-slate-400 group-focus-within:border-blue-600 group-focus-within:text-blue-600 transition-colors z-10">
                      {index + 1}
                    </div>
                    <span className="text-[14px] font-bold text-slate-900">Configure Round</span>
                  </div>
                  {rounds.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRound(index)}
                      className="h-10 w-10 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[13px] font-bold text-slate-700 ml-1">Round Name</Label>
                    <Input
                      value={round.name}
                      onChange={(e) => updateRound(index, "name", e.target.value)}
                      placeholder="e.g. Technical Deep Dive"
                      className="h-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[13px] font-bold text-slate-700 ml-1">Round Type</Label>
                    <Select
                      value={round.roundType}
                      onValueChange={(v) => updateRound(index, "roundType", v as "ATS_SCREENING" | "HUMAN_INTERVIEW" | "ASSIGNMENT")}
                    >
                      <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 shadow-xl shadow-slate-900/5">
                        {Object.entries(roundTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value} className="rounded-lg my-0.5 focus:bg-blue-50 focus:text-blue-700">
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {round.roundType !== "ATS_SCREENING" && (
                  <div className="grid md:grid-cols-2 gap-6 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-2">
                      <Label className="text-[13px] font-bold text-slate-700 ml-1 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Duration
                      </Label>
                      <Select
                        value={String(round.durationMinutes)}
                        onValueChange={(v) => updateRound(index, "durationMinutes", parseInt(v))}
                      >
                        <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all font-medium">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 shadow-xl shadow-slate-900/5">
                          {[30, 45, 60, 75, 90, 120].map((m) => (
                            <SelectItem key={m} value={String(m)} className="rounded-lg my-0.5 focus:bg-blue-50 focus:text-blue-700">
                              {m} minutes
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[13px] font-bold text-slate-700 ml-1">Internal Notes</Label>
                      <Input
                        value={round.description}
                        onChange={(e) => updateRound(index, "description", e.target.value)}
                        placeholder="Guidelines for panelists..."
                        className="h-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all font-medium"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-8 border-t border-slate-200/60">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={() => router.back()} 
          className="text-[14px] font-bold text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl h-11 px-6"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isPending}
          className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200/50 rounded-xl h-11 px-8 font-bold transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {isPending ? "Creating Program..." : "Launch Program"}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </form>
  );
}
