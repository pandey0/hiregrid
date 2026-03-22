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
      <DialogContent className="rounded-[40px] border-slate-100 p-10 max-w-md shadow-2xl">
        <DialogHeader className="mb-8">
          <span className="font-mono text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-4 block">
            System // Architecture
          </span>
          <DialogTitle className="text-3xl font-black text-slate-900 tracking-tighter">Stage Config</DialogTitle>
          <DialogDescription className="text-[14px] text-slate-500 font-medium">
            Modify the constraints and identifying labels for this hiring stage.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Stage Label</Label>
            <Input name="name" defaultValue={round.name} className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold uppercase tracking-widest placeholder:text-slate-200" required />
          </div>
          
          {round.roundType !== "ATS_SCREENING" && (
            <div className="space-y-2">
              <Label className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Duration // Minutes</Label>
              <Input name="duration" type="number" defaultValue={round.durationMinutes} className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold uppercase tracking-widest placeholder:text-slate-200" required />
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed px-1">
                Changing duration will clear existing unbooked slots for all interviewers in this stage.
              </p>
            </div>
          )}

          <div className="pt-6">
            <Button type="submit" disabled={isPending} className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black h-14 rounded-2xl uppercase tracking-widest text-[12px] shadow-xl shadow-slate-200 transition-all active:scale-95">
              {isPending ? "PROCESSING..." : "COMMIT CHANGES //"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
