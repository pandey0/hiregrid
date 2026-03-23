"use client";

import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import CandidateTable from "../../candidates/CandidateTable";
import InvitePanelistDialog from "./InvitePanelistDialog";
import RoundConfigDialog from "./RoundConfigDialog";

type RoundClientProps = {
  round: any;
  delta: number;
  healthStatus: string;
  totalUsableSlots: number;
  activeDemand: number;
  scheduledCount: number;
  programId: string;
};

export default function RoundClient({
  round,
  delta,
  healthStatus,
  totalUsableSlots,
  activeDemand,
  scheduledCount,
  programId,
}: RoundClientProps) {
  const [search, setSearch] = useState("");

  const filteredCandidates = useMemo(() => {
    return round.activeCandidates.filter((c: any) => 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [round.activeCandidates, search]);

  return (
    <div className="w-full px-8 lg:px-16 py-12 relative transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-12">
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/dashboard" className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    Dashboard //
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-slate-300 dark:text-slate-700" />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/programs/${programId}`} className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {round.program.name} //
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-slate-300 dark:text-slate-700" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-900 dark:text-white">
                  {round.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="font-mono text-[10px] font-bold bg-blue-600 dark:bg-blue-500 text-white px-2 py-0.5 rounded uppercase tracking-widest">
                  Stage {round.roundNumber}
                </span>
                <span className="font-mono text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded uppercase tracking-widest">
                  {round.roundType.replace("_", " ")}
                </span>
              </div>
              <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{round.name}</h1>
              <p className="text-[16px] text-slate-500 dark:text-slate-400 mt-4 font-medium max-w-2xl leading-relaxed">
                Stage-specific pipeline management and supply optimization.
              </p>
            </motion.div>
            <div className="flex items-center gap-4">
              <RoundConfigDialog programId={parseInt(programId)} round={round}>
                <Button variant="outline" className="h-12 px-8 rounded-2xl border-slate-200 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all uppercase tracking-widest text-[11px]">
                  Config //
                </Button>
              </RoundConfigDialog>
            </div>
          </div>
        </div>

        {/* Dynamic Health Header - Streamlined */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-[32px] bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between"
          >
            <div>
              <span className="font-mono text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Supply Delta</span>
              <p className={cn(
                "text-4xl font-black tracking-tighter transition-colors",
                delta < 0 ? "text-rose-600 dark:text-rose-500" : "text-slate-900 dark:text-white"
              )}>
                {delta > 0 ? `+${delta}` : delta}
              </p>
            </div>
            <div className="flex flex-col items-end">
              <div className={cn(
                "w-2 h-2 rounded-full mb-2",
                healthStatus === "DEFICIT" ? "bg-rose-600 animate-pulse" : healthStatus === "WARNING" ? "bg-amber-500" : "bg-emerald-500"
              )} />
              <span className={cn(
                "font-mono text-[9px] font-black uppercase tracking-widest transition-colors",
                healthStatus === "DEFICIT" ? "text-rose-600 dark:text-rose-500" : healthStatus === "WARNING" ? "text-amber-600 dark:text-amber-500" : "text-emerald-600 dark:text-emerald-500"
              )}>
                {healthStatus === "DEFICIT" ? "[ DEFICIT ]" : healthStatus === "WARNING" ? "[ TIGHT ]" : "[ HEALTHY ]"}
              </span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-8 rounded-[32px] bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between"
          >
            <div>
              <span className="font-mono text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Booked Calls</span>
              <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{scheduledCount.toString().padStart(2, '0')}</p>
            </div>
            <div className="h-8 w-px bg-slate-50 dark:bg-slate-800" />
            <div className="text-right">
              <span className="font-mono text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Live Demand</span>
              <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{activeDemand.toString().padStart(2, '0')}</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-8 rounded-[32px] bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm flex items-center justify-between overflow-hidden relative border-none"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 dark:bg-blue-400/20 blur-[60px] -mr-16 -mt-16" />
            <div className="relative z-10">
              <span className="font-mono text-[10px] font-bold text-blue-400 dark:text-blue-600 uppercase tracking-widest block mb-1">Intelligence</span>
              <p className="text-lg font-bold tracking-tight">AI Rubric Active</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1">{(round.focusAreas as string[] || []).length} Focus Areas</p>
            </div>
            <RoundConfigDialog programId={parseInt(programId)} round={round}>
              <Button variant="ghost" className="relative z-10 text-blue-400 dark:text-blue-600 font-black text-[10px] uppercase tracking-widest hover:text-white dark:hover:text-slate-900 hover:bg-white/10 dark:hover:bg-slate-900/10 px-4 h-10 rounded-xl">
                Edit ->
              </Button>
            </RoundConfigDialog>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-12 gap-16">
          {/* Main Pipeline */}
          <div className="lg:col-span-9 space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-1">
              <div className="flex items-center gap-6 flex-1">
                <h2 className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-[0.4em] whitespace-nowrap">
                  Stage Pipeline
                </h2>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-100 dark:from-slate-800 to-transparent" />
              </div>
              
              <div className="w-full md:w-80">
                <div className="relative">
                  <Input 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Filter stage..." 
                    className="h-11 rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 px-6 font-bold text-[12px] uppercase tracking-widest placeholder:text-slate-300 dark:placeholder:text-slate-600 text-slate-900 dark:text-white focus:ring-blue-500/10 focus:border-blue-200 dark:focus:border-blue-900 transition-all shadow-sm dark:shadow-none"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[9px] font-black text-slate-200 dark:text-slate-700">[ SEARCH ]</div>
                </div>
              </div>
            </div>

            {round.activeCandidates.length === 0 ? (
              <div className="p-24 rounded-[48px] border-2 border-dashed border-slate-100 dark:border-slate-800 text-center bg-slate-50/30 dark:bg-slate-900/20">
                <span className="font-mono text-[12px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-[0.4em] block mb-4">[ STAGE EMPTY ]</span>
                <p className="text-[16px] text-slate-400 dark:text-slate-500 font-medium">No candidates are currently active in this stage.</p>
              </div>
            ) : filteredCandidates.length === 0 ? (
              <div className="py-20 text-center">
                <span className="font-mono text-[12px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest">Zero matches for &quot;{search}&quot;</span>
              </div>
            ) : (
              <div className="rounded-[40px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.04)] dark:shadow-none">
                <CandidateTable candidates={filteredCandidates} rounds={[round]} />
              </div>
            )}
          </div>

          {/* Sidebar Section */}
          <div className="lg:col-span-3 space-y-12">
            <div className="flex items-center gap-6 px-1">
              <h2 className="text-[12px] font-bold text-slate-900 dark:text-white uppercase tracking-[0.4em] whitespace-nowrap">
                Interviewers
              </h2>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-100 dark:from-slate-800 to-transparent" />
            </div>

            <div className="space-y-4">
              {round.panelists.length === 0 ? (
                <div className="p-10 rounded-[32px] border-2 border-dashed border-slate-100 dark:border-slate-800 text-center bg-white dark:bg-slate-900/50">
                  <p className="text-[12px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">No interviewers assigned</p>
                </div>
              ) : (
                round.panelists.map((panelist: any) => {
                  const slots = Array.isArray(panelist.availableSlots) ? (panelist.availableSlots as any[]) : [];
                  const panelistBookings = round.bookings.filter((b: any) => b.programPanelistId === panelist.id);
                  const name = panelist.user?.name || panelist.externalName || "Interviewer";
                  
                  return (
                    <motion.div
                      key={panelist.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <div className="p-6 rounded-[32px] bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-blue-100 dark:hover:border-blue-900 transition-all duration-500">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center text-[10px] font-black uppercase transition-colors">
                              {name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate max-w-[100px] leading-tight">{name}</p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tighter truncate max-w-[100px]">
                                {slots.length} SLOTS
                              </p>
                            </div>
                          </div>
                          <span className="font-mono text-[9px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
                            {panelistBookings.length}
                          </span>
                        </div>
                        <div className="flex gap-1 h-1">
                          {Array.from({ length: 10 }).map((_, i) => (
                            <div 
                              key={i} 
                              className={cn(
                                "flex-1 rounded-full transition-colors",
                                i < panelistBookings.length ? "bg-blue-600 dark:bg-blue-500" : "bg-slate-50 dark:bg-slate-800"
                              )} 
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}

              <InvitePanelistDialog programId={parseInt(programId)} roundId={round.id}>
                <Button variant="outline" className="w-full h-14 rounded-[32px] border-2 border-dashed border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-black text-[10px] hover:border-blue-200 dark:hover:border-blue-900 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all uppercase tracking-widest bg-transparent">
                  + Add Interviewer //
                </Button>
              </InvitePanelistDialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
