"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import BookingGrid from "./BookingGrid";
import { withdrawCandidate } from "@/actions/candidates";

type BookingClientProps = {
  candidate: any;
  availableSlots: any[];
  token: string;
};

export default function BookingClient({
  candidate,
  availableSlots,
  token,
}: BookingClientProps) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col items-center justify-center p-8 lg:p-16 relative overflow-hidden transition-colors duration-500">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-blue-50/40 dark:bg-blue-900/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 -z-10 w-[600px] h-[600px] bg-indigo-50/20 dark:bg-indigo-900/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-2xl w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="font-mono text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.4em] mb-6 block">
            Talent // Interface
          </span>
          <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-6">
            {candidate.program.name}
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 font-medium tracking-tight">
            Greetings, {candidate.name.split(" ")[0]}. Select your preferred window for the <span className="text-slate-900 dark:text-white font-bold underline decoration-blue-200 dark:decoration-blue-900 decoration-4 underline-offset-8">{candidate.activeRound?.name}</span>.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {availableSlots.length === 0 ? (
            <div className="p-16 rounded-[40px] border-2 border-dashed border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/20 backdrop-blur-sm text-center shadow-xl shadow-slate-200/50 dark:shadow-none">
              <span className="font-mono text-[12px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-[0.4em] block mb-4">[ SUPPLY DEPLETED ]</span>
              <p className="text-[16px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                Our interviewers are currently optimizing their availability. Please check back shortly or contact your hiring lead.
              </p>
            </div>
          ) : (
            <div className="p-10 rounded-[48px] bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-[0_48px_96px_-12px_rgba(0,0,0,0.08)] dark:shadow-none">
              <div className="mb-10 flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Selection Grid //</span>
                <span className="font-mono text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                  {candidate.activeRound?.durationMinutes} MIN SESSION
                </span>
              </div>
              <BookingGrid
                token={token}
                slots={availableSlots}
                durationMinutes={candidate.activeRound?.durationMinutes ?? 60}
              />
            </div>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-20 pt-12 border-t border-slate-100 dark:border-slate-800"
        >
          <div className="bg-slate-900 dark:bg-slate-100 rounded-[32px] p-10 text-white dark:text-slate-900 relative overflow-hidden shadow-2xl shadow-slate-200 dark:shadow-none transition-colors duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 dark:bg-blue-400/20 blur-[60px] -mr-16 -mt-16" />
            <div className="relative z-10">
              <h3 className="text-xl font-black tracking-tight mb-3">Withdraw Application //</h3>
              <p className="text-[14px] text-slate-400 dark:text-slate-600 font-medium leading-relaxed max-w-lg mb-8">
                If your circumstances have changed and you no longer wish to proceed, you can terminate your application sequence here.
              </p>
              <form action={withdrawCandidate.bind(null, token)}>
                <Button 
                  type="submit" 
                  variant="ghost" 
                  className="h-12 px-8 rounded-2xl border border-slate-800 dark:border-slate-200 text-slate-400 dark:text-slate-500 hover:text-rose-400 dark:hover:text-rose-600 hover:bg-rose-950/30 dark:hover:bg-rose-100/10 font-black text-[11px] uppercase tracking-widest transition-all"
                >
                  [ TERMINATE FLOW ]
                </Button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
