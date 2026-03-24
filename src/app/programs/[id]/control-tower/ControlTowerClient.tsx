"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import { AlertCircle, Activity, ShieldCheck, Zap, Globe, ArrowUpRight } from "lucide-react";

type ControlTowerClientProps = {
  program: any;
  fulfillmentIssues: any[];
  programId: string;
};

export default function ControlTowerClient({
  program,
  fulfillmentIssues,
  programId,
}: ControlTowerClientProps) {
  
  function getHealthStatus(supply: number, demand: number) {
    if (demand === 0) return { label: "IDLE", color: "text-app-text-sub", bg: "bg-app-mono-bg/5", dot: "bg-app-border" };
    const delta = supply - demand;
    if (delta < 0) return { label: "DEFICIT", color: "text-rose-600", bg: "bg-rose-500/10", dot: "bg-rose-600" };
    if (delta < 2) return { label: "TIGHT", color: "text-amber-600", bg: "bg-amber-500/10", dot: "bg-amber-500" };
    return { label: "HEALTHY", color: "text-emerald-600", bg: "bg-emerald-500/10", dot: "bg-emerald-500" };
  }

  function UtilizationBar({ supply, demand }: { supply: number, demand: number }) {
    const total = Math.max(supply, demand, 10);
    const supplyWidth = (supply / total) * 100;
    const isDeficit = demand > supply;

    return (
      <div className="space-y-3 mt-10">
        <div className="flex items-center justify-between font-mono text-[9px] font-black uppercase tracking-[0.2em] text-app-text-sub">
          <span>Supply // {supply} Slots</span>
          <span>Demand // {demand} Units</span>
        </div>
        <div className="h-3 w-full bg-app-mono-bg/5 rounded-xl overflow-hidden flex relative border border-app-border">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${supplyWidth}%` }}
            className={cn("h-full transition-colors duration-500 relative z-10", isDeficit ? "bg-amber-500" : "bg-app-accent")}
          />
          {isDeficit && (
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(demand - supply) / total * 100}%` }}
              className="h-full bg-rose-500/20 animate-pulse relative z-0"
            />
          )}
        </div>
        <div className="font-mono text-[8px] text-app-text-sub/20 uppercase tracking-tighter flex gap-1 justify-center">
          {Array.from({ length: 40 }).map((_, i) => (
            <span key={i}>|</span>
          ))}
        </div>
      </div>
    );
  }

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
                Control Tower
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
              <span className="arch-mono-label px-3 py-1">Operational Monitoring</span>
              <span className="text-[10px] font-mono font-bold text-app-text-sub uppercase tracking-widest">
                Real-Time Diagnostics
              </span>
            </div>
            <h1 className="text-7xl font-black text-app-text-main tracking-tighter leading-[0.85] mb-6">
              System <span className="text-app-accent">Vitals</span>.
            </h1>
            <p className="text-xl font-medium text-app-text-sub leading-relaxed max-w-xl italic">
              Real-time synchronization of interviewer supply and candidate demand architectures.
            </p>
          </motion.div>
        </header>
      </div>

      <div className="grid lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-16">
          {/* Fulfillment Issues Section */}
          {fulfillmentIssues.length > 0 && (
            <section className="space-y-10">
              <div className="flex items-center gap-6">
                <h2 className="text-[13px] font-bold text-app-text-main uppercase tracking-[0.4em] whitespace-nowrap text-left">
                  Dispatch Failures
                </h2>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-rose-500/40 to-transparent" />
              </div>
              <div className="grid gap-4">
                {fulfillmentIssues.map(({ candidate, booking }, idx) => (
                  <motion.div 
                    key={booking.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div className="arch-card p-8 bg-rose-500/5 border-rose-500/20 flex flex-col md:flex-row items-center justify-between gap-8">
                      <div className="flex items-center gap-6">
                        <span className="font-mono text-[10px] font-black bg-rose-600 text-white px-2 py-1 rounded">
                          [ ERROR ]
                        </span>
                        <div className="text-left">
                          <p className="text-[15px] font-black text-app-text-main uppercase tracking-tight">Invite failed for {candidate.name}</p>
                          <p className="text-[11px] text-app-text-sub font-mono font-bold uppercase tracking-widest mt-1">
                            {booking.round.name} // {booking.programPanelist.externalName}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" className="h-12 px-8 rounded-2xl border-rose-500/30 text-rose-600 hover:bg-rose-500/10 font-black text-[11px] uppercase tracking-widest transition-all shadow-none">
                        FIX MANUALLY //
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Pipeline Health Section */}
          <section className="space-y-10">
            <div className="flex items-center gap-6">
              <h2 className="text-[13px] font-bold text-app-text-main uppercase tracking-[0.4em] whitespace-nowrap text-left">
                Architecture Health
              </h2>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-app-border to-transparent" />
            </div>

            {program.rounds.length === 0 ? (
              <div className="arch-card border-dashed p-32 text-center bg-app-mono-bg/5">
                <span className="font-mono text-[12px] font-black text-app-text-sub/40 uppercase tracking-[0.4em] block mb-4">[ NO ROUNDS DEFINED ]</span>
                <p className="text-xl font-medium text-app-text-sub italic">Health metrics will initialize upon stage configuration.</p>
              </div>
            ) : (
              <div className="space-y-10">
                {program.rounds.map((round: any, idx: number) => {
                  const supply = round.panelists.reduce((acc: number, p: any) => {
                    const slots = Array.isArray(p.availableSlots) ? (p.availableSlots as { booked: boolean }[]) : [];
                    return acc + slots.filter((s) => !s.booked).length;
                  }, 0);
                  const demand = round.activeCandidates.length;
                  const booked = round.bookings.length;
                  const health = getHealthStatus(supply, demand);

                  return (
                    <motion.div 
                      key={round.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.1 }}
                    >
                      <div className="arch-card p-10 group bg-white dark:bg-app-card text-left">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-10 mb-12">
                          <div className="flex items-center gap-8">
                            <div className="w-16 h-16 rounded-2xl bg-app-text-main text-app-bg flex items-center justify-center text-2xl font-black transition-colors group-hover:bg-app-accent shadow-xl shadow-app-accent/5">
                              {round.roundNumber.toString().padStart(2, '0')}
                            </div>
                            <div className="space-y-2">
                              <h3 className="text-3xl font-black text-app-text-main tracking-tighter uppercase">{round.name}</h3>
                              <div className="flex items-center gap-4">
                                <span className="arch-mono-label px-2">SEQUENCE_{round.roundNumber}</span>
                                <span className="font-mono text-[11px] text-app-text-sub font-black uppercase tracking-widest">
                                  {round.durationMinutes} MIN // SESSION
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className={cn("px-6 py-2 rounded-2xl border flex items-center gap-3 transition-colors", health.bg, health.color.replace("text-", "border-").replace("600", "500/30"))}>
                            <div className={cn("w-2.5 h-2.5 rounded-full shadow-lg shadow-current", health.dot)} />
                            <span className={cn("font-mono text-[11px] font-black uppercase tracking-widest", health.color)}>
                              {health.label}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-app-border/50 pt-12">
                          {[
                            { label: "Staff Pool", value: round.panelists.length },
                            { label: "Free Supply", value: supply },
                            { label: "Active Demand", value: demand },
                            { label: "Secured", value: booked },
                          ].map((s) => (
                            <div key={s.label} className="space-y-1">
                              <span className="font-mono text-[10px] font-black text-app-text-sub uppercase tracking-[0.2em]">{s.label}</span>
                              <p className="text-4xl font-black text-app-text-main tabular-nums tracking-tighter">{s.value.toString().padStart(2, '0')}</p>
                            </div>
                          ))}
                        </div>

                        <UtilizationBar supply={supply} demand={demand} />

                        {supply < demand && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-12 p-8 rounded-[32px] bg-rose-500/5 border border-rose-500/20 flex flex-col sm:flex-row items-center justify-between gap-10"
                          >
                            <div className="flex items-center gap-6">
                              <AlertCircle className="w-6 h-6 text-rose-500" />
                              <p className="text-[15px] text-app-text-main font-black uppercase tracking-tight">
                                <span className="text-rose-500">{demand - supply} IDENTITIES</span> STALLED DUE TO ZERO SUPPLY.
                              </p>
                            </div>
                            <Button asChild className="h-14 px-10 rounded-2xl bg-app-text-main text-app-bg hover:bg-rose-600 hover:text-white font-black transition-all uppercase tracking-widest text-[11px] shadow-2xl border-none">
                              <Link href={`/programs/${programId}/panelists`}>DEPLOY STAFF //</Link>
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <div className="lg:col-span-4 space-y-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="sticky top-32"
          >
            <div className="arch-card bg-app-text-main text-app-bg p-10 relative overflow-hidden shadow-2xl transition-colors duration-500 text-left">
              <div className="absolute top-0 right-0 w-48 h-48 bg-app-accent/20 blur-[80px] -mr-24 -mt-24" />
              <div className="relative z-10">
                <span className="font-mono text-[10px] font-black text-app-accent uppercase tracking-[0.4em] block mb-6">Monitoring Logic //</span>
                <h3 className="text-2xl font-black tracking-tight mb-4 leading-tight uppercase">Supply Chain States</h3>
                <p className="text-app-bg/60 text-[15px] font-medium leading-relaxed mb-10 italic">
                  The Control Tower evaluates the delta between interviewer &apos;inventory&apos; and candidate &apos;inflow&apos;.
                </p>
                <div className="space-y-8">
                  {[
                    { label: "Healthy", desc: "Supply exceeds demand by 2+ sessions.", dot: "bg-emerald-500" },
                    { label: "Tight", desc: "Supply matches demand with zero buffer.", dot: "bg-amber-500" },
                    { label: "Deficit", desc: "Demand exceeds supply. Deployment required.", dot: "bg-rose-600" },
                  ].map((state) => (
                    <div key={state.label} className="flex gap-5">
                      <div className={cn("w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 shadow-lg shadow-current", state.dot)} />
                      <div>
                        <p className="text-[13px] font-black text-app-bg uppercase tracking-widest">{state.label}</p>
                        <p className="text-app-bg/40 text-[11px] mt-1 font-bold uppercase tracking-wider">{state.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-4">
            <Button asChild variant="outline" className="h-16 justify-between px-8 rounded-2xl border-app-border bg-app-card hover:bg-app-accent hover:text-white transition-all group shadow-none">
              <Link href={`/programs/${programId}/panelists`} className="flex items-center justify-between w-full">
                <span className="text-[11px] font-black uppercase tracking-widest">Deploy Interviewers</span>
                <ArrowUpRight className="w-5 h-5 opacity-20 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-16 justify-between px-8 rounded-2xl border-app-border bg-app-card hover:bg-app-accent hover:text-white transition-all group shadow-none">
              <Link href={`/programs/${programId}/candidates`} className="flex items-center justify-between w-full">
                <span className="text-[11px] font-black uppercase tracking-widest">Triage Pipeline</span>
                <ArrowUpRight className="w-5 h-5 opacity-20 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
