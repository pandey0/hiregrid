"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { createAgency } from "@/actions/agencies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CreateAgencyForm({ programId }: { programId: number }) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.append("programId", String(programId));
    const form = e.currentTarget;

    startTransition(async () => {
      try {
        await createAgency(fd);
        toast.success("Identity network expanded");
        form.reset();
      } catch (err: unknown) {
        const error = err as Error;
        toast.error(error.message || "Expansion failed");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-8">
      <div className="space-y-2">
        <Label className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Agency Label</Label>
        <Input 
          name="name" 
          required 
          placeholder="TALENT NETWORK" 
          className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold uppercase tracking-widest placeholder:text-slate-200" 
        />
      </div>
      <div className="space-y-2">
        <Label className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contact Person</Label>
        <Input 
          name="contactPerson" 
          placeholder="IDENTIFY CONTACT" 
          className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold uppercase tracking-widest placeholder:text-slate-200" 
        />
      </div>
      <div className="space-y-2">
        <Label className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Network Email</Label>
        <Input 
          name="email" 
          type="email" 
          required 
          placeholder="AGENCY@NETWORK.COM" 
          className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold uppercase tracking-widest placeholder:text-slate-200" 
        />
      </div>
      <div className="flex items-end pb-0.5">
        <Button 
          type="submit" 
          disabled={isPending} 
          className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-blue-600 text-white font-black uppercase tracking-widest text-[11px] shadow-xl shadow-slate-200 transition-all active:scale-95"
        >
          {isPending ? "INITIALIZING..." : "CONNECT PARTNER //"}
        </Button>
      </div>
    </form>
  );
}
