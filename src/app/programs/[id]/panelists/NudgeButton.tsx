"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { resendPanelistLink } from "@/actions/panelists";
import { toast } from "sonner";
import { Mail } from "lucide-react";

export default function NudgeButton({ panelistId }: { panelistId: number }) {
  const [isPending, startTransition] = useTransition();

  const handleNudge = () => {
    startTransition(async () => {
      try {
        await resendPanelistLink(panelistId);
        toast.success("Nudge sent via email");
      } catch (err: unknown) {
        const error = err as Error;
        toast.error(error.message || "Failed to send nudge");
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleNudge}
      disabled={isPending}
      className="h-8 w-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
      title="Resend magic link"
    >
      <Mail className="w-3.5 h-3.5" />
    </Button>
  );
}
