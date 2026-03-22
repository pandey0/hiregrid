"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { invitePanelist } from "@/actions/panelists";
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

export default function InvitePanelistDialog({
  programId,
  roundId,
  children
}: {
  programId: number;
  roundId: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("roundId", String(roundId));
    fd.set("programId", String(programId));

    startTransition(async () => {
      try {
        await invitePanelist(fd);
        toast.success("Interviewer deployment successful");
        setOpen(false);
      } catch (err: unknown) {
        const error = err as Error;
        toast.error(error.message || "Process failed");
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
            Supply // Pipeline
          </span>
          <DialogTitle className="text-3xl font-black text-slate-900 tracking-tighter">Invite Interviewer</DialogTitle>
          <DialogDescription className="text-[14px] text-slate-500 font-medium">
            Deploy an interviewer to this stage. They will receive a secure email link to provide availability.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Identity Name</Label>
            <Input name="name" placeholder="ENTER NAME" className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold uppercase tracking-widest placeholder:text-slate-200" required />
          </div>
          <div className="space-y-2">
            <Label className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Network Email</Label>
            <Input name="email" type="email" placeholder="PERSON@COMPANY.COM" className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold uppercase tracking-widest placeholder:text-slate-200" required />
          </div>

          <div className="pt-6">
            <Button type="submit" disabled={isPending} className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black h-14 rounded-2xl uppercase tracking-widest text-[12px] shadow-xl shadow-slate-200 transition-all active:scale-95">
              {isPending ? "SENDING INVITE..." : "DEPLOY INTERVIEWER //"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
