"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { agencySubmitCandidate } from "@/actions/agencies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";

export default function AgencySubmitForm({ token }: { token: string }) {
  const [isPending, startTransition] = useTransition();
  const [submittedCount, setSubmittedCount] = useState(0);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const form = e.currentTarget;

    startTransition(async () => {
      try {
        await agencySubmitCandidate(token, fd);
        toast.success("Identity deployment successful");
        form.reset();
        setSubmittedCount((n) => n + 1);
      } catch (err: unknown) {
        const error = err as Error;
        toast.error(error.message || "Deployment failed");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      {submittedCount > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between"
        >
          <span className="text-emerald-700 font-black text-[12px] uppercase tracking-widest">
            {submittedCount.toString().padStart(2, '0')} // ENTRIES COMMITTED SUCCESSFULLY
          </span>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </motion.div>
      )}

      {/* Identity Section */}
      <section className="space-y-8">
        <h3 className="font-mono text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] pb-2 border-b border-slate-50">
          [ IDENTITY // CORE ]
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <Label className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</Label>
            <Input name="name" required placeholder="IDENTIFY PERSON" className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold uppercase tracking-widest" />
          </div>
          <div className="space-y-2">
            <Label className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Network Email</Label>
            <Input name="email" type="email" required placeholder="PERSON@NETWORK.COM" className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold uppercase tracking-widest" />
          </div>
          <div className="space-y-2">
            <Label className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Line</Label>
            <Input name="phone" placeholder="+0 000 000 0000" className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold uppercase tracking-widest" />
          </div>
          <div className="space-y-2">
            <Label className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Digital Profile</Label>
            <Input name="linkedIn" placeholder="LINKEDIN.COM/IN/USER" className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold uppercase tracking-widest" />
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="space-y-8">
        <h3 className="font-mono text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] pb-2 border-b border-slate-50">
          [ ARCHITECTURE // CONTEXT ]
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <Label className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Active Role</Label>
            <Input name="currentRole" placeholder="ENGINEER" className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold uppercase tracking-widest" />
          </div>
          <div className="space-y-2">
            <Label className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Organization</Label>
            <Input name="currentCompany" placeholder="COMPANY" className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold uppercase tracking-widest" />
          </div>
          <div className="space-y-2">
            <Label className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tenure // Years</Label>
            <Input name="yearsExperience" type="number" placeholder="00" className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold uppercase tracking-widest" />
          </div>
        </div>
      </section>

      {/* Artifacts Section */}
      <section className="space-y-8">
        <h3 className="font-mono text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] pb-2 border-b border-slate-50">
          [ ARTIFACTS // REPOSITORY ]
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <Label className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Resume Source // URL</Label>
            <Input name="resumeUrl" placeholder="HTTPS://DRIVE.CLOUD/FILE" className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold uppercase tracking-widest" />
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Public link preferred for AI analysis.</p>
          </div>
          <div className="space-y-2">
            <Label className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contextual Notes</Label>
            <Textarea name="notes" rows={2} placeholder="OBSERVATIONS..." className="resize-none rounded-2xl border-slate-100 bg-slate-50/50 font-bold uppercase tracking-widest p-4" />
          </div>
        </div>
      </section>

      <div className="flex justify-end pt-6">
        <Button 
          type="submit" 
          disabled={isPending}
          className="h-16 px-12 rounded-2xl bg-slate-900 hover:bg-blue-600 text-white font-black uppercase tracking-widest text-[12px] shadow-2xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-50"
        >
          {isPending ? "INITIALIZING..." : "COMMENCE DEPLOYMENT //"}
        </Button>
      </div>
    </form>
  );
}
