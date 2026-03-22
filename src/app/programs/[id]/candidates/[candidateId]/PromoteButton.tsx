"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { promoteCandidate } from "@/actions/candidates";
import { toast } from "sonner";
import { ArrowUpCircle } from "lucide-react";

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
        await promoteCandidate(candidateId);
        toast.success(`Candidate promoted to ${nextRoundName}`);
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
      className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200/50 rounded-xl h-11 px-6 font-bold transition-all active:scale-[0.98]"
    >
      {isPending ? "Promoting..." : `Promote to ${nextRoundName}`}
      <ArrowUpCircle className="w-4 h-4 ml-2" />
    </Button>
  );
}
