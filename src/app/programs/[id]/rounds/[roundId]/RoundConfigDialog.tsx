"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateRound } from "@/actions/programs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";

export default function RoundConfigDialog({
  programId,
  round,
  children
}: {
  programId: number;
  round: any;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = fd.get("name") as string;
    const durationMinutes = parseInt(fd.get("duration") as string);

    startTransition(async () => {
      try {
        await updateRound(programId, round.id, { name, durationMinutes });
        toast.success("Stage architecture updated");
        setOpen(false);
        router.refresh();
      } catch (err: unknown) {
        const error = err as Error;
        toast.error(error.message || "Update failed");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="rounded-[40px] border-app-border p-10 max-w-md shadow-2xl bg-app-card w-[95vw]">
        <DialogHeader className="mb-10 text-left">
          <span className="font-mono text-[10px] font-black text-app-accent uppercase tracking-[0.4em] mb-4 block">
            System // Architecture
          </span>
          <DialogTitle className="text-4xl font-black text-app-text-main tracking-tighter">Stage Config</DialogTitle>
          <DialogDescription className="text-[15px] text-app-text-sub font-medium mt-2 leading-relaxed">
            Modify the constraints and identifying labels for this hiring stage.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="space-y-2">
            <Label className="font-mono text-[10px] font-bold text-app-text-sub uppercase tracking-widest ml-1">Stage Label</Label>
            <Input name="name" defaultValue={round.name} className="h-12 rounded-2xl border-app-border bg-app-mono-bg/50 font-bold uppercase tracking-widest placeholder:text-app-text-sub/20" required />
          </div>
          
          {round.roundType !== "AUTOMATED_SCREENING" && (
            <div className="space-y-2">
              <Label className="font-mono text-[10px] font-bold text-app-text-sub uppercase tracking-widest ml-1">Temporal Window // Minutes</Label>
              <Input name="duration" type="number" defaultValue={round.durationMinutes} className="h-12 rounded-2xl border-app-border bg-app-mono-bg/50 font-bold uppercase tracking-widest placeholder:text-app-text-sub/20" required />
              <p className="text-[10px] text-app-text-sub font-medium leading-relaxed px-1 opacity-60">
                * Note: Changing duration will clear existing unbooked slots for all interviewers in this stage.
              </p>
            </div>
          )}

          <div className="pt-6 flex items-center justify-between gap-6">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-[11px] font-black text-app-text-sub/40 uppercase tracking-widest hover:text-app-text-main transition-all">
              [ CANCEL ]
            </Button>
            <Button 
              type="submit" 
              disabled={isPending} 
              className="bg-app-text-main text-app-bg hover:bg-app-accent font-black h-14 px-10 rounded-2xl uppercase tracking-widest text-[12px] shadow-xl shadow-app-accent/10 transition-all border-none active:scale-95"
            >
              {isPending ? "PROCESSING..." : "COMMIT CHANGES //"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
