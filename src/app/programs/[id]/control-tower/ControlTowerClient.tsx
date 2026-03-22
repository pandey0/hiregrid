"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

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
    if (demand === 0) return { label: "[ IDLE ]", color: "text-slate-400", bg: "bg-slate-50", dot: "bg-slate-300" };
    const delta = supply - demand;
    if (delta < 0) return { label: "[ DEFICIT ]", color: "text-rose-600", bg: "bg-rose-50", dot: "bg-rose-600" };
    if (delta < 2) return { label: "[ TIGHT ]", color: "text-amber-600", bg: "bg-amber-50", dot: "bg-amber-500" };
    return { label: "[ HEALTHY ]", color: "text-emerald-600", bg: "bg-emerald-50", dot: "bg-emerald-500" };
  }

  return (
    <div className="w-full px-8 lg:px-16 py-12 relative">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-12">
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/dashboard" className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
                    Dashboard //
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-slate-300" />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/programs/${programId}`} className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
                    {program.name} //
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-slate-300" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-900">
                  Control Tower
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="font-mono text-[11px] font-bold text-blue-600 uppercase tracking-[0.3em] mb-3 block">
              Operational Monitoring //
            </span>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">Control Tower</h1>
            <p className="text-[16px] text-slate-500 mt-4 font-medium max-w-2xl leading-relaxed">
              Real-time synchronization of interviewer supply and candidate demand architectures.
            </p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-16">
            {/* Fulfillment Issues Section */}
            {fulfillmentIssues.length > 0 && (
              <section className="space-y-10">
                <div className="flex items-center gap-6">
                  <h2 className="text-[13px] font-bold text-slate-900 uppercase tracking-[0.4em] whitespace-nowrap">
                    Dispatch Failures
                  </h2>
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-rose-100 to-transparent" />
                </div>
                <div className="grid gap-4">
                  {fulfillmentIssues.map(({ candidate, booking }, idx) => (
                    <motion.div 
                      key={booking.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <div className="p-8 rounded-[32px] bg-rose-50 border border-rose-100 flex items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                          <span className="font-mono text-[10px] font-black bg-rose-600 text-white px-2 py-1 rounded">
                            [ ERROR ]
                          </span>
                          <div>
                            <p className="text-[15px] font-bold text-rose-900">Invite failed for {candidate.name}</p>
                            <p className="text-[12px] text-rose-700/70 font-mono font-bold uppercase tracking-tighter">
                              STAGE // {booking.round.name} // {booking.programPanelist.externalName}
                            </p>
                          </div>
                        </div>
                        <button className="text-[11px] font-black text-rose-600 uppercase tracking-widest hover:underline whitespace-nowrap">
                          FIX MANUALLY //
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Pipeline Health Section */}
            <section className="space-y-10">
              <div className="flex items-center gap-6 px-1">
                <h2 className="text-[14px] font-bold text-slate-900 uppercase tracking-[0.4em] whitespace-nowrap">
                  Architecture Health
                </h2>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-100 to-transparent" />
              </div>

              {program.rounds.length === 0 ? (
                <div className="p-32 rounded-[48px] border-2 border-dashed border-slate-100 text-center bg-slate-50/30">
                  <span className="font-mono text-[12px] font-bold text-slate-300 uppercase tracking-[0.4em] block mb-4">[ NO ROUNDS DEFINED ]</span>
                  <p className="text-[16px] text-slate-400 font-medium">Health metrics will initialize upon stage configuration.</p>
                </div>
              ) : (
                <div className="space-y-8">
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
                        <div className="p-10 rounded-[40px] bg-white border border-slate-100 shadow-sm hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.04)] transition-all duration-700">
                          <div className="flex items-start justify-between mb-10">
                            <div className="flex items-center gap-6">
                              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-sm font-black">
                                R{round.roundNumber.toString().padStart(2, '0')}
                              </div>
                              <div>
                                <h3 className="text-2xl font-bold text-slate-900 tracking-tighter">{round.name}</h3>
                                <p className="text-[13px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                  {round.durationMinutes} MIN // SESSION
                                </p>
                              </div>
                            </div>
                            <div className={cn("px-4 py-1.5 rounded-full border flex items-center gap-2.5", health.bg, health.color.replace("text-", "border-").replace("600", "100"))}>
                              <div className={cn("w-2 h-2 rounded-full", health.dot)} />
                              <span className={cn("font-mono text-[10px] font-black uppercase tracking-widest", health.color)}>
                                {health.label}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 border-t border-slate-50 pt-10">
                            {[
                              { label: "Staff Pool", value: round.panelists.length },
                              { label: "Free Supply", value: supply },
                              { label: "Active Demand", value: demand },
                              { label: "Secured", value: booked },
                            ].map((s) => (
                              <div key={s.label}>
                                <span className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] block mb-2">{s.label}</span>
                                <p className="text-3xl font-black text-slate-900 tabular-nums tracking-tighter">{s.value.toString().padStart(2, '0')}</p>
                              </div>
                            ))}
                          </div>

                          {supply < demand && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-10 p-6 rounded-[24px] bg-rose-50 border border-rose-100 flex items-center justify-between"
                            >
                              <p className="text-[14px] text-rose-900 font-medium">
                                <span className="font-black">[{demand - supply}] CANDIDATES</span> ARE STALLED DUE TO ZERO SUPPLY.
                              </p>
                              <Link
                                href={`/programs/${programId}/panelists`}
                                className="text-[11px] font-black text-rose-600 uppercase tracking-widest hover:underline"
                              >
                                DEPLOY STAFF ->
                              </Link>
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

          <div className="lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-slate-900 border-none rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-200">
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/20 blur-[80px] -mr-24 -mt-24" />
                <div className="relative z-10">
                  <span className="font-mono text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] block mb-6">Monitoring Logic //</span>
                  <h3 className="text-2xl font-black tracking-tight mb-4 leading-tight">Supply Chain States</h3>
                  <p className="text-slate-400 text-[15px] font-medium leading-relaxed mb-10">
                    The Control Tower evaluates the delta between interviewer &apos;inventory&apos; and candidate &apos;inflow&apos;.
                  </p>
                  <div className="space-y-8">
                    <div className="flex gap-4">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <div>
                        <p className="text-[13px] font-black text-white uppercase tracking-widest">Healthy</p>
                        <p className="text-[12px] text-slate-400 mt-1 font-medium">Supply exceeds demand by 2+ sessions.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <div>
                        <p className="text-[13px] font-black text-white uppercase tracking-widest">Tight</p>
                        <p className="text-[12px] text-slate-400 mt-1 font-medium">Supply matches demand with zero buffer.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-2 h-2 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                      <div>
                        <p className="text-[13px] font-black text-white uppercase tracking-widest">Deficit</p>
                        <p className="text-[12px] text-slate-400 mt-1 font-medium">Demand exceeds supply. Deployment required.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
