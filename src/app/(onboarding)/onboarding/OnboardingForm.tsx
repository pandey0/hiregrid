"use client";

import { useFormStatus } from "react-dom";
import { createOrganization } from "@/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button 
      type="submit" 
      disabled={pending} 
      className="w-full h-14 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black uppercase tracking-widest text-[12px] shadow-xl shadow-slate-200 dark:shadow-none rounded-2xl transition-all active:scale-95 disabled:opacity-50 border-none"
    >
      {pending ? "INITIALIZING WORKSPACE..." : "CREATE ARCHITECTURE //"}
    </Button>
  );
}

export default function OnboardingForm({ userName }: { userName: string }) {
  const firstName = userName.split(" ")[0];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex items-center justify-center px-4 py-12 transition-colors duration-500 relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-blue-50/40 dark:bg-blue-900/10 blur-[140px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-12 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-[24px] bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xl shadow-slate-200 dark:shadow-none mb-8"
          >
            <span className="text-xl font-black tracking-tighter">H</span>
          </motion.div>
          <span className="font-mono text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.4em] mb-4 block">
            Workspace // Setup
          </span>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
            Hello, {firstName}
          </h1>
          <p className="text-[16px] text-slate-500 dark:text-slate-400 mt-4 font-medium leading-relaxed">
            Initialize your organizational architecture to begin talent logistics.
          </p>
        </div>

        <Card className="border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-2xl shadow-slate-200/40 dark:shadow-none rounded-[40px] overflow-hidden">
          <CardContent className="p-10">
            <form action={createOrganization} className="space-y-10">
              <div className="space-y-8">
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-1 px-1">
                    <Label htmlFor="name" className="font-mono text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Identity Label</Label>
                  </div>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    autoFocus
                    placeholder="ACME NETWORK"
                    className="h-14 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 transition-all font-black uppercase tracking-widest placeholder:text-slate-200 dark:placeholder:text-slate-700 text-slate-900 dark:text-white"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 px-1 font-bold uppercase tracking-tighter leading-relaxed">
                    Primary identifier for your hiring supply chain.
                  </p>
                </div>

                <div className="p-6 rounded-[24px] bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-900/30">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
                    <span className="font-mono text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest">[ READY ]</span>
                  </div>
                  <p className="text-[13px] text-blue-900/70 dark:text-blue-300/60 font-medium leading-relaxed">
                    Dashboard and program interfaces will be active immediately upon deployment.
                  </p>
                </div>
              </div>

              <SubmitButton />
            </form>
          </CardContent>
        </Card>

        <div className="mt-12 text-center">
          <a href="#" className="font-mono text-[10px] font-black text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 uppercase tracking-widest transition-colors">
            SUPPORT // NETWORK ACCESS
          </a>
        </div>
      </div>
    </div>
  );
}
