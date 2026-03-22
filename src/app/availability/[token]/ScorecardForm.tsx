"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { submitScorecard } from "@/actions/panelists";
import { CheckCircle2, Sparkles, HelpCircle, Target } from "lucide-react";

type Rubric = {
  focusAreas: string[];
  suggestedQuestions: { question: string; expectedAnswer: string }[];
};

export default function ScorecardForm({ 
  bookingId, 
  token,
  rubric 
}: { 
  bookingId: number; 
  token: string;
  rubric?: Rubric | null;
}) {
  const [score, setScore] = useState("3");
  const [verdict, setVerdict] = useState<"PASS" | "FAIL" | "HOLD">("HOLD");
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await submitScorecard(bookingId, token, {
          score: parseInt(score),
          verdict,
          feedback
        });
        toast.success("Scorecard submitted");
        setSubmitted(true);
      } catch (err: unknown) {
        const error = err as Error;
        toast.error(error.message || "Failed to submit");
      }
    });
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100 animate-in fade-in zoom-in-95 mt-4">
        <CheckCircle2 className="w-4 h-4" />
        Evaluation Submitted Successfully
      </div>
    );
  }

  return (
    <div className="space-y-8 pt-6 border-t border-slate-100 mt-6 animate-in slide-in-from-top-2 duration-300">
      {/* Story 12.2: AI Rubric Guidance */}
      {rubric && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-[12px] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            AI Interview Guide
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-[13px]">
                <Target className="w-4 h-4 text-slate-400" />
                Focus Areas
              </div>
              <div className="flex flex-wrap gap-2">
                {rubric.focusAreas.map((area, i) => (
                  <div key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[12px] font-medium border border-slate-200/50">
                    {area}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-[13px]">
                <HelpCircle className="w-4 h-4 text-slate-400" />
                Suggested Questions
              </div>
              <div className="space-y-3">
                {rubric.suggestedQuestions.map((q, i) => (
                  <div key={i} className="group/q">
                    <p className="text-[13px] text-slate-700 font-bold leading-tight mb-1">
                      &quot;{q.question}&quot;
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed group-hover/q:text-slate-500 transition-colors">
                      <span className="text-blue-500/70 font-bold">Hint:</span> {q.expectedAnswer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Overall Score</Label>
            <Select value={score} onValueChange={setScore}>
              <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-slate-50/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                {[1, 2, 3, 4, 5].map(n => (
                  <SelectItem key={n} value={String(n)} className="rounded-lg my-0.5">
                    {n} - {n === 5 ? "Strong Hire" : n === 4 ? "Hire" : n === 3 ? "Neutral" : n === 2 ? "No Hire" : "Strong No Hire"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Verdict</Label>
            <Select value={verdict} onValueChange={(v: "PASS" | "FAIL" | "HOLD") => setVerdict(v)}>
              <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-slate-50/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                <SelectItem value="PASS" className="text-emerald-600 font-bold rounded-lg my-0.5">PASS</SelectItem>
                <SelectItem value="HOLD" className="text-amber-600 font-bold rounded-lg my-0.5">HOLD</SelectItem>
                <SelectItem value="FAIL" className="text-rose-600 font-bold rounded-lg my-0.5">FAIL</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Feedback Notes</Label>
          <Textarea 
            placeholder="Share your thoughts on the candidate's performance, technical skills, and cultural fit..." 
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="min-h-[120px] rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all resize-none p-4 text-[14px]"
            required
          />
        </div>
        <Button type="submit" disabled={isPending || !feedback} className="w-full h-11 bg-slate-900 hover:bg-slate-800 rounded-xl font-bold transition-all shadow-lg shadow-slate-200">
          {isPending ? "Submitting..." : "Submit Evaluation"}
        </Button>
      </form>
    </div>
  );
}
