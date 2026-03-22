"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { addCandidate } from "@/actions/candidates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";

export default function AddCandidateForm({ programId }: { programId: number }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.append("programId", String(programId));

    startTransition(async () => {
      try {
        await addCandidate(fd);
        toast.success("Identity ingested successfully");
        setOpen(false);
      } catch (err: unknown) {
        const error = err as Error;
        toast.error(error.message || "Ingestion failed");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-12 px-8 rounded-2xl bg-slate-900 hover:bg-blue-600 text-white font-black uppercase tracking-widest text-[11px] shadow-xl shadow-slate-200 transition-all active:scale-95">
          Add Candidate //
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-[40px] border-slate-100 p-0 max-w-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh]">
        {/* Fixed Header */}
        <div className="p-10 pb-6 border-b border-slate-50">
          <DialogHeader className="text-left">
            <span className="font-mono text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-4 block">
              Ingestion // Manual Entry
            </span>
            <DialogTitle className="text-4xl font-black text-slate-900 tracking-tighter">New Candidate</DialogTitle>
            <DialogDescription className="text-[15px] text-slate-500 font-medium mt-2 leading-relaxed">
              Record a new talent identity into this program architecture.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Body with hidden scrollbar */}
        <div className="flex-1 overflow-y-auto p-10 space-y-12 scrollbar-hide">
          <form id="add-candidate-form" onSubmit={handleSubmit} className="space-y-12">
            {/* Identity Section */}
            <section className="space-y-6">
              <h3 className="font-mono text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] pb-2 border-b border-slate-50">
                [ IDENTITY ]
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</Label>
                  <Input name="name" required placeholder="Jane Smith" className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold uppercase tracking-widest placeholder:text-slate-200" />
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Network Email</Label>
                  <Input name="email" type="email" required placeholder="JANE@NETWORK.COM" className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold uppercase tracking-widest placeholder:text-slate-200" />
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Line</Label>
                  <Input name="phone" placeholder="+1 000 000 0000" className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold uppercase tracking-widest placeholder:text-slate-200" />
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Digital Identity</Label>
                  <Input name="linkedIn" placeholder="LINKEDIN.COM/IN/USER" className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold uppercase tracking-widest placeholder:text-slate-200" />
                </div>
              </div>
            </section>

            {/* Professional Context */}
            <section className="space-y-6">
              <h3 className="font-mono text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] pb-2 border-b border-slate-50">
                [ PROFESSIONAL ]
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Active Role</Label>
                  <Input name="currentRole" placeholder="SENIOR ENGINEER" className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold uppercase tracking-widest placeholder:text-slate-200" />
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Organization</Label>
                  <Input name="currentCompany" placeholder="COMPANY NAME" className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold uppercase tracking-widest placeholder:text-slate-200" />
                </div>
              </div>
            </section>

            {/* Artifacts & Notes */}
            <section className="space-y-6">
              <h3 className="font-mono text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] pb-2 border-b border-slate-50">
                [ ARTIFACTS ]
              </h3>
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Resume // PDF</Label>
                  <div className="relative">
                    <Input name="resume" type="file" accept=".pdf" className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold uppercase tracking-widest pt-2.5" />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded">[ SOURCE REQUIRED ]</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Internal Notes</Label>
                  <Textarea name="notes" rows={3} placeholder="OBSERVATIONS OR CONTEXT..." className="rounded-2xl border-slate-100 bg-slate-50/50 font-bold uppercase tracking-widest placeholder:text-slate-200 resize-none p-4" />
                </div>
              </div>
            </section>

            {/* End of Form Signal */}
            <div className="flex flex-col items-center py-10 opacity-20">
              <div className="h-px w-full bg-slate-200" />
              <span className="font-mono text-[9px] font-black uppercase tracking-[0.5em] mt-4">End of Inflow Sequence //</span>
            </div>
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="p-10 pt-6 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between gap-6">
          <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-all">
            [ DISCARD ]
          </Button>
          <Button 
            type="submit" 
            form="add-candidate-form"
            disabled={isPending} 
            className="bg-slate-900 hover:bg-blue-600 text-white font-black h-14 px-12 rounded-2xl uppercase tracking-widest text-[12px] shadow-xl shadow-slate-200 transition-all active:scale-95"
          >
            {isPending ? "INITIALIZING..." : "COMMENCE INGESTION //"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
