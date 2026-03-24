"use client";

import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
import { Layers, Zap, Search, ArrowUpRight, Activity, Clock } from "lucide-react";
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
    <div className="page-container pb-20">
      {/* Background Decorative Element */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-app-accent/5 blur-[140px] rounded-full opacity-50 translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Navigation & Header */}
      <div className="mb-20">
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard" className="text-[11px] font-mono font-bold uppercase tracking-widest text-app-text-sub hover:text-app-accent transition-colors">
                  Dashboard //
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-app-border" />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/programs/${programId}`} className="text-[11px] font-mono font-bold uppercase tracking-widest text-app-text-sub hover:text-app-accent transition-colors">
                  Sequence Overview //
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-app-border" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-[11px] font-mono font-bold uppercase tracking-widest text-app-text-main">
                Stage Execution
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <header className="flex items-end justify-start gap-12 text-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="arch-mono-label px-3 py-1">Operational Sequence</span>
              <span className="text-[10px] font-mono font-bold text-app-text-sub uppercase tracking-widest">
                Stage {round.roundNumber} // {round.roundType.replace("_", " ")}
              </span>
            </div>
            <h1 className="text-7xl font-black text-app-text-main tracking-tighter leading-[0.85] mb-6">{round.name}</h1>
            <p className="text-xl font-medium text-app-text-sub leading-relaxed max-w-xl italic">
              Stage-specific pipeline management and supply optimization metrics.
            </p>
          </motion.div>
          
          <div className="flex items-center gap-4 shrink-0 pb-2">
            <RoundConfigDialog programId={parseInt(programId)} round={round}>
              <Button variant="outline" className="h-14 px-8 rounded-2xl border-app-border font-black text-app-text-main hover:bg-app-accent hover:text-white transition-all uppercase tracking-widest text-[11px] bg-app-card/50">
                Configuration
              </Button>
            </RoundConfigDialog>
          </div>
        </header>
      </div>

      {/* Dynamic Health Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="arch-card p-8 flex items-center justify-between bg-white dark:bg-app-card"
        >
          <div className="text-left">
            <span className="font-mono text-[10px] font-black text-app-text-sub uppercase tracking-[0.2em] block mb-2">Supply Delta</span>
            <p className={cn(
              "text-5xl font-black tracking-tighter tabular-nums",
              delta < 0 ? "text-rose-600" : "text-app-text-main"
            )}>
              {delta > 0 ? `+${delta}` : delta}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className={cn(
              "w-2.5 h-2.5 rounded-full shadow-lg shadow-current",
              healthStatus === "DEFICIT" ? "bg-rose-600 animate-pulse" : healthStatus === "WARNING" ? "bg-amber-500" : "bg-emerald-500"
            )} />
            <span className={cn(
              "font-mono text-[10px] font-black uppercase tracking-widest",
              healthStatus === "DEFICIT" ? "text-rose-600" : healthStatus === "WARNING" ? "text-amber-600" : "text-emerald-600"
            )}>
              [ {healthStatus === "DEFICIT" ? "DEFICIT" : healthStatus === "WARNING" ? "TIGHT" : "HEALTHY"} ]
            </span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="arch-card p-8 flex items-center justify-between bg-white dark:bg-app-card"
        >
          <div className="text-left">
            <span className="font-mono text-[10px] font-black text-app-text-sub uppercase tracking-[0.2em] block mb-2">Scheduled Sessions</span>
            <p className="text-5xl font-black text-app-text-main tabular-nums tracking-tighter">{scheduledCount.toString().padStart(2, '0')}</p>
          </div>
          <div className="text-right">
            <span className="font-mono text-[10px] font-black text-app-text-sub uppercase tracking-[0.2em] block mb-2">Active Demand</span>
            <p className="text-3xl font-black text-app-text-main tabular-nums tracking-tighter opacity-40">{activeDemand.toString().padStart(2, '0')}</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="arch-card p-8 bg-app-text-main text-app-bg shadow-2xl flex items-center justify-between overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-app-accent/20 blur-[60px] -mr-16 -mt-16" />
          <div className="relative z-10 text-left">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-4 h-4 text-app-accent" />
              <span className="font-mono text-[10px] font-black text-app-accent uppercase tracking-[0.3em]">Intelligence</span>
            </div>
            <p className="text-xl font-black tracking-tight uppercase">AI Rubric Protocol</p>
            <p className="text-[11px] text-app-bg/40 font-black uppercase tracking-widest mt-1">{(round.focusAreas as string[] || []).length} Optimization Fields</p>
          </div>
          <RoundConfigDialog programId={parseInt(programId)} round={round}>
            <Button variant="ghost" className="relative z-10 text-app-accent font-black text-[11px] uppercase tracking-widest hover:bg-white/10 px-4 h-12 rounded-xl">
              Config <ArrowUpRight className="w-4 h-4 ml-2" />
            </Button>
          </RoundConfigDialog>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-12 gap-16">
        {/* Main Pipeline */}
        <div className="lg:col-span-9 space-y-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-app-border pb-8">
            <div className="flex items-center gap-6">
              <h2 className="text-[13px] font-bold text-app-text-main uppercase tracking-[0.4em] whitespace-nowrap text-left">
                Stage Pipeline
              </h2>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-app-border to-transparent" />
            </div>
            
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-app-text-sub group-focus-within:text-app-accent transition-colors" />
              <Input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter identity..." 
                className="h-12 w-64 pl-11 rounded-2xl border-app-border bg-app-mono-bg/5 focus:bg-white transition-all font-bold uppercase tracking-widest text-[11px] placeholder:text-app-text-sub/30"
              />
            </div>
          </div>

          {round.activeCandidates.length === 0 ? (
            <div className="arch-card border-dashed p-32 text-center bg-app-mono-bg/5">
              <span className="font-mono text-[12px] font-black text-app-text-sub/40 uppercase tracking-[0.4em] block mb-4">[ STAGE VACANT ]</span>
              <p className="text-xl font-medium text-app-text-sub italic">No candidates are currently active in this execution sequence.</p>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-app-text-sub font-mono font-black uppercase tracking-widest text-sm opacity-40">Zero Registry Matches for &quot;{search}&quot;</p>
            </div>
          ) : (
            <div className="arch-card overflow-hidden bg-white dark:bg-app-card shadow-none">
              <CandidateTable candidates={filteredCandidates} rounds={[round]} />
            </div>
          )}
        </div>

        {/* Sidebar Section */}
        <div className="lg:col-span-3 space-y-12 text-left">
          <div className="flex items-center gap-6">
            <h2 className="text-[12px] font-bold text-app-text-main uppercase tracking-[0.4em] whitespace-nowrap">
              Interviewer Pool
            </h2>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-app-border to-transparent" />
          </div>

          <div className="space-y-4">
            {round.panelists.length === 0 ? (
              <div className="arch-card border-dashed p-10 text-center bg-app-mono-bg/5">
                <p className="text-[12px] text-app-text-sub font-black uppercase tracking-widest italic">No specialists assigned</p>
              </div>
            ) : (
              round.panelists.map((panelist: any) => {
                const slots = Array.isArray(panelist.availableSlots) ? (panelist.availableSlots as any[]) : [];
                const panelistBookings = round.bookings.filter((b: any) => b.programPanelistId === panelist.id);
                const name = panelist.user?.name || panelist.externalName || "Specialist";
                
                return (
                  <motion.div
                    key={panelist.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="arch-card p-6 bg-white dark:bg-app-card shadow-sm hover:border-app-accent/50 group transition-all duration-500">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-app-text-main text-app-bg flex items-center justify-center text-[11px] font-black uppercase transition-colors group-hover:bg-app-accent">
                            {name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[14px] font-black text-app-text-main truncate max-w-[120px] uppercase tracking-tight leading-tight group-hover:text-app-accent transition-colors">{name}</p>
                            <p className="text-[10px] text-app-text-sub font-black uppercase tracking-tighter truncate max-w-[120px] mt-1 opacity-60">
                              {slots.length} SLOTS AVAILABLE
                            </p>
                          </div>
                        </div>
                        <span className="font-mono text-[10px] font-black text-app-accent bg-app-accent/10 px-2 py-1 rounded-lg">
                          {panelistBookings.length}
                        </span>
                      </div>
                      <div className="flex gap-1 h-1.5">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <div 
                            key={i} 
                            className={cn(
                              "flex-1 rounded-full transition-colors duration-700 shadow-sm",
                              i < panelistBookings.length ? "bg-app-accent" : "bg-app-mono-bg/20"
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
              <Button variant="outline" className="w-full h-16 rounded-[32px] border-2 border-dashed border-app-border text-app-text-sub/40 font-black text-[11px] hover:border-app-accent hover:text-app-accent hover:bg-app-accent/5 transition-all uppercase tracking-widest bg-transparent">
                + Deploy Specialist //
              </Button>
            </InvitePanelistDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
