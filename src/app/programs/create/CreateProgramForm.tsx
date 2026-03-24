"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createProgram } from "@/actions/programs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type Round = {
  name: string;
  durationMinutes: number;
  roundType: "HUMAN_INTERVIEW" | "ASSIGNMENT";
  description: string;
  assignmentLink: string;
};

const defaultRound = (): Round => ({
  name: "",
  durationMinutes: 60,
  roundType: "HUMAN_INTERVIEW",
  description: "",
  assignmentLink: "",
});

const roundTypeLabels = {
  HUMAN_INTERVIEW: "Human Interview",
  ASSIGNMENT: "Offline Assignment",
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
        toast.error(`Stage ${i + 1} requires a label`);
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
          toast.error(error.message || "Architectural deployment failed");
        }
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700 transition-colors duration-500">
      {/* Program Details Section */}
      <section className="space-y-8">
        <div className="flex items-center gap-6 px-1">
          <h2 className="text-[13px] font-bold text-app-text-main uppercase tracking-[0.4em] whitespace-nowrap">
            Program Identity
          </h2>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-app-border to-transparent" />
        </div>
        
        <div className="arch-card p-10 space-y-8">
          <div className="space-y-2">
            <Label htmlFor="prog-name" className="font-mono text-[10px] font-bold text-app-text-sub uppercase tracking-widest ml-1">Architectural Label</Label>
            <Input
              id="prog-name"
              name="name"
              required
              placeholder="E.G. SENIOR ENGINEERING DRIVE"
              className="h-14 rounded-2xl border-app-border bg-app-mono-bg/5 focus:bg-white transition-all text-lg font-black uppercase tracking-tighter placeholder:text-app-text-sub/20 text-app-text-main"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prog-desc" className="font-mono text-[10px] font-bold text-app-text-sub uppercase tracking-widest ml-1">Contextual Description</Label>
            <Textarea
              id="prog-desc"
              name="description"
              rows={4}
              placeholder="DEFINE GOALS AND OBJECTIVES..."
              className="resize-none rounded-2xl border-app-border bg-app-mono-bg/5 focus:bg-white transition-all font-bold uppercase tracking-widest placeholder:text-app-text-sub/20 text-app-text-main p-6"
            />
          </div>
        </div>
      </section>

      {/* Rounds Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-6 flex-1">
            <h2 className="text-[13px] font-bold text-app-text-main uppercase tracking-[0.4em] whitespace-nowrap">
              Hiring Sequence
            </h2>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-app-border to-transparent" />
          </div>
          <button 
            type="button" 
            onClick={addRound} 
            className="ml-8 text-[11px] font-black text-app-accent uppercase tracking-widest hover:underline"
          >
            + ADD STAGE //
          </button>
        </div>

        <div className="space-y-8 relative">
          <AnimatePresence mode="popLayout">
            {rounds.map((round, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative"
              >
                <div className="arch-card p-10 group-focus-within:border-app-accent/40 transition-all duration-500">
                  <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-app-text-main text-app-bg flex items-center justify-center text-sm font-black shadow-xl shadow-app-accent/10 transition-colors">
                        {(index + 1).toString().padStart(2, '0')}
                      </div>
                      <span className="font-mono text-[11px] font-black text-app-text-main uppercase tracking-[0.3em]">Configure Architecture</span>
                    </div>
                    {rounds.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRound(index)}
                        className="text-[10px] font-black text-rose-600/40 hover:text-rose-600 uppercase tracking-widest transition-colors"
                      >
                        [ DISCONNECT ]
                      </button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-2">
                      <Label className="font-mono text-[10px] font-bold text-app-text-sub uppercase tracking-widest ml-1">Stage Label</Label>
                      <Input
                        value={round.name}
                        onChange={(e) => updateRound(index, "name", e.target.value)}
                        placeholder="E.G. TECHNICAL DEEP DIVE"
                        className="h-12 rounded-2xl border-app-border bg-app-mono-bg/5 focus:bg-white transition-all font-bold uppercase tracking-widest text-app-text-main"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-mono text-[10px] font-bold text-app-text-sub uppercase tracking-widest ml-1">Execution Type</Label>
                      <Select
                        value={round.roundType}
                        onValueChange={(v) => updateRound(index, "roundType", v as "HUMAN_INTERVIEW" | "ASSIGNMENT")}
                      >
                        <SelectTrigger className="h-12 rounded-2xl border-app-border bg-app-mono-bg/5 font-bold uppercase tracking-widest text-app-text-main">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-app-border bg-app-card shadow-2xl">
                          {Object.entries(roundTypeLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value} className="py-3 px-4 font-bold text-[12px] uppercase tracking-wider">
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {round.roundType === "ASSIGNMENT" && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="pt-10 mt-10 border-t border-app-border/50 space-y-2 px-1"
                    >
                      <Label className="font-mono text-[10px] font-bold text-app-text-sub uppercase tracking-widest ml-1">Assignment Resource Link</Label>
                      <Input
                        value={round.assignmentLink}
                        onChange={(e) => updateRound(index, "assignmentLink", e.target.value)}
                        placeholder="HTTPS://GITHUB.COM/REPOSITORY/ASSIGNMENT-TEMPLATE"
                        className="h-12 rounded-2xl border-app-border bg-app-mono-bg/5 focus:bg-white transition-all font-bold uppercase tracking-widest text-app-text-main"
                      />
                    </motion.div>
                  )}

                  {round.roundType === "HUMAN_INTERVIEW" && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="grid md:grid-cols-2 gap-10 pt-10 mt-10 border-t border-app-border/50"
                    >
                      <div className="space-y-2">
                        <Label className="font-mono text-[10px] font-bold text-app-text-sub uppercase tracking-widest ml-1">Temporal Window // Minutes</Label>
                        <Select
                          value={String(round.durationMinutes)}
                          onValueChange={(v) => updateRound(index, "durationMinutes", parseInt(v))}
                        >
                          <SelectTrigger className="h-12 rounded-2xl border-app-border bg-app-mono-bg/5 font-bold uppercase tracking-widest text-app-text-main">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-app-border bg-app-card shadow-2xl">
                            {[30, 45, 60, 75, 90, 120].map((m) => (
                              <SelectItem key={m} value={String(m)} className="py-3 px-4 font-bold text-[12px] uppercase tracking-wider">
                                {m} MINUTES //
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-mono text-[10px] font-bold text-app-text-sub uppercase tracking-widest ml-1">Operational Notes</Label>
                        <Input
                          value={round.description}
                          onChange={(e) => updateRound(index, "description", e.target.value)}
                          placeholder="GUIDELINES FOR INTERVIEWERS..."
                          className="h-12 rounded-2xl border-app-border bg-app-mono-bg/5 focus:bg-white transition-all font-bold uppercase tracking-widest text-app-text-main"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-12 border-t border-app-border/50">
        <button 
          type="button" 
          onClick={() => router.back()} 
          className="text-[11px] font-black text-app-text-sub/40 hover:text-app-text-main uppercase tracking-widest transition-colors"
        >
          [ ABORT SEQUENCE ]
        </button>
        <Button 
          type="submit" 
          disabled={isPending}
          className="bg-app-text-main text-app-bg hover:bg-app-accent font-black h-16 px-12 rounded-2xl uppercase tracking-widest text-[13px] shadow-2xl shadow-app-accent/10 transition-all active:scale-95 disabled:opacity-50 border-none"
        >
          {isPending ? "DEPLOYING ARCHITECTURE..." : "COMMENCE DEPLOYMENT //"}
        </Button>
      </div>
    </form>
  );
}
