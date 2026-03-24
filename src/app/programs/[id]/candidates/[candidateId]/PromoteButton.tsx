"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { promoteCandidate } from "@/actions/candidates";
import { toast } from "@/lib/toast";

export default function PromoteButton({ 
  candidateId, 
  nextRoundName 
}: { 
  candidateId: number; 
  nextRoundName: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handlePromote = () => {
    startTransition(async () => {
      try {
        const result = await promoteCandidate(candidateId);
        toast.success(`Candidate promoted to ${nextRoundName}`, { 
          traceId: result?.traceId 
        });
      } catch (err: unknown) {
        const error = err as Error;
        toast.error(error.message || "Failed to promote candidate");
      }
    });
  };

  return (
    <Button 
      onClick={handlePromote} 
      disabled={isPending}
      className="h-12 px-8 rounded-2xl bg-app-text-main text-app-bg hover:bg-app-accent font-black transition-all uppercase tracking-widest text-[11px] shadow-xl shadow-app-accent/10 border-none active:scale-[0.98]"
    >
      {isPending ? "OPERATING //" : `Promote to ${nextRoundName} //`}
    </Button>
  );
}
