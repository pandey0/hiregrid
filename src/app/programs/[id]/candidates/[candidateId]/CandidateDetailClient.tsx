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
import PromoteButton from "./PromoteButton";
import ManageBookingActions from "./ManageBookingActions";
import NudgeCandidateButton from "../NudgeCandidateButton";
import { FileText, Mail, Phone, Linkedin, MapPin, Zap, ArrowUpRight } from "lucide-react";

type Rubric = {
  focusAreas: string[];
  suggestedQuestions: { question: string; expectedAnswer: string }[];
};

type CandidateDetailClientProps = {
  candidate: any;
  nextRound: any;
  programId: string;
};

function StrengthIntensityBars({ areas }: { areas: string[] }) {
  if (!areas || areas.length === 0) return null;

  return (
    <div className="space-y-6 mt-10">
      <div className="flex items-center gap-4">
        <span className="font-mono text-[10px] font-black text-app-accent uppercase tracking-[0.3em]">Evaluation // Focus</span>
        <div className="h-px flex-1 bg-app-accent/10" />
      </div>
      <div className="grid gap-5">
        {areas.map((area, i) => {
          const intensity = 40 + (i * 13) % 60; 
          return (
            <div key={i} className="space-y-2">
              <div className="flex justify-between items-center text-[11px] font-bold text-app-text-main uppercase tracking-widest">
                <span>{area}</span>
                <span className="font-mono text-app-text-sub/40">{intensity}%</span>
              </div>
              <div className="h-2 w-full bg-app-mono-bg/5 rounded-xl overflow-hidden border border-app-border">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${intensity}%` }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 1 }}
                  className="h-full bg-app-accent transition-all"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CandidateDetailClient({
  candidate,
  nextRound,
  programId,
}: CandidateDetailClientProps) {
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
                Identity Profile
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
              <span className="font-mono text-[10px] font-black bg-app-accent text-white px-3 py-1 rounded-xl uppercase tracking-widest shadow-xl shadow-app-accent/10">
                [ {candidate.status} ]
              </span>
              {candidate.activeRound && (
                <span className="arch-mono-label px-3 py-1">
                  STAGE // {candidate.activeRound.name}
                </span>
              )}
            </div>
            <h1 className="text-7xl font-black text-app-text-main tracking-tighter leading-[0.85] mb-6">{candidate.name}</h1>
            <p className="text-xl font-medium text-app-text-sub leading-relaxed max-w-xl italic">
              {candidate.currentRole || "Identity"} // {candidate.currentCompany || "Source Pending"}
            </p>
          </motion.div>
          
          <div className="flex flex-wrap items-center gap-4 shrink-0 pb-2">
            {candidate.status === "ACTIVE" && candidate.bookingToken && (
              <div className="flex flex-col items-center gap-1.5 px-6">
                <NudgeCandidateButton candidateId={candidate.id} />
                {candidate.nudgeCount > 0 && (
                  <span className="font-mono text-[9px] font-black text-app-text-sub uppercase tracking-tighter opacity-40">
                    NUDGED {candidate.nudgeCount}X
                  </span>
                )}
              </div>
            )}
            {nextRound && candidate.status === "COMPLETED" && (
              <PromoteButton candidateId={candidate.id} nextRoundName={nextRound.name} />
            )}
            {candidate.resumeUrl && (
              <Button asChild variant="outline" className="h-14 px-8 rounded-2xl border-app-border font-black text-app-text-main hover:bg-app-accent hover:text-white transition-all uppercase tracking-widest text-[11px] bg-app-card/50 shadow-none">
                <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer">
                  <FileText className="w-4 h-4 mr-2" /> Artifact // Source
                </a>
              </Button>
            )}
          </div>
        </header>
      </div>

      <div className="grid lg:grid-cols-12 gap-16">
        {/* Sidebar - Profile Data */}
        <div className="lg:col-span-4 space-y-12">
          <section className="space-y-10">
            <div className="flex items-center gap-6">
              <h2 className="text-[13px] font-bold text-app-text-main uppercase tracking-[0.4em] whitespace-nowrap text-left">
                Identity Matrix
              </h2>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-app-border to-transparent" />
            </div>
            <div className="arch-card p-10 bg-white dark:bg-app-card space-y-10 text-left">
              {[
                { label: "Protocol Endpoint", value: candidate.email, icon: Mail },
                { label: "Mobile Uplink", value: candidate.phone, icon: Phone },
                { label: "Digital Identity", value: "LinkedIn Profile //", href: candidate.linkedIn, icon: Linkedin },
              ].map((item, idx) => (
                item.value ? (
                  <div key={idx} className="space-y-2">
                    <span className="font-mono text-[9px] font-black text-app-text-sub uppercase tracking-[0.3em]">{item.label}</span>
                    {item.href ? (
                      <a href={item.href} target="_blank" rel="noopener noreferrer" className="flex items-center text-[15px] font-black text-app-accent hover:underline uppercase tracking-tight italic">
                        {item.value} <ArrowUpRight className="w-3 h-3 ml-1" />
                      </a>
                    ) : (
                      <p className="text-[15px] font-black text-app-text-main uppercase tracking-tight">{item.value}</p>
                    )}
                  </div>
                ) : null
              ))}
              <div className="pt-8 border-t border-app-border/50">
                <span className="font-mono text-[9px] font-black text-app-text-sub uppercase tracking-[0.3em]">Origin Source</span>
                <p className="text-[13px] font-black text-app-text-main mt-2 uppercase tracking-tighter italic opacity-60">
                  {candidate.source === "AGENCY" ? `Agency Protocol // ${candidate.agency?.name}` : "Direct Architecture Input"}
                </p>
              </div>
            </div>
          </section>

          {candidate.atsScore !== null && (
            <section className="space-y-10">
              <div className="flex items-center gap-6">
                <h2 className="text-[13px] font-bold text-app-text-main uppercase tracking-[0.4em] whitespace-nowrap text-left">
                  Optimization Score
                </h2>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-app-border to-transparent" />
              </div>
              <div className="arch-card p-10 bg-app-text-main text-app-bg relative overflow-hidden shadow-2xl text-left">
                <div className="absolute top-0 right-0 w-32 h-32 bg-app-accent/20 blur-[60px] -mr-16 -mt-16" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <span className="font-mono text-[10px] font-black text-app-accent uppercase tracking-[0.4em]">Intelligence Match</span>
                    <p className="text-5xl font-black tracking-tighter tabular-nums text-app-bg">
                      {Math.round(candidate.atsScore)}%
                    </p>
                  </div>
                  {candidate.atsReason && (
                    <p className="text-[15px] text-app-bg/60 font-medium leading-relaxed italic border-l-2 border-app-accent pl-6 py-2">
                      &ldquo;{candidate.atsReason}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Main Content - Evaluations */}
        <div className="lg:col-span-8 space-y-12">
          <section className="space-y-10">
            <div className="flex items-center gap-6 px-1">
              <h2 className="text-[14px] font-bold text-app-text-main uppercase tracking-[0.4em] whitespace-nowrap text-left">
                Evaluation Timeline
              </h2>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-app-border to-transparent" />
            </div>

            {candidate.bookings.length === 0 ? (
              <div className="arch-card border-dashed p-32 text-center bg-app-mono-bg/5">
                <span className="font-mono text-[12px] font-black text-app-text-sub/40 uppercase tracking-[0.4em] block mb-4">[ ARCHIVE VACANT ]</span>
                <p className="text-xl font-medium text-app-text-sub italic">No sessions have been documented for this identity.</p>
              </div>
            ) : (
              <div className="space-y-10">
                {candidate.bookings.map((booking: any, idx: number) => (
                  <motion.div 
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div className={cn(
                      "arch-card p-10 transition-all duration-500 text-left bg-white dark:bg-app-card",
                      booking.status === "COMPLETED" ? "shadow-md" : "opacity-80"
                    )}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-10 mb-10 pb-10 border-b border-app-border/50">
                        <div className="flex items-center gap-8">
                          <div className="w-14 h-14 rounded-2xl bg-app-text-main text-app-bg flex items-center justify-center text-xl font-black transition-colors group-hover:bg-app-accent shadow-xl shadow-app-accent/5">
                            {booking.round.roundNumber.toString().padStart(2, '0')}
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-3xl font-black text-app-text-main tracking-tighter uppercase">{booking.round.name}</h3>
                            <p className="text-[13px] text-app-text-sub font-black uppercase tracking-widest italic">
                              Specialist // <span className="text-app-text-main">{booking.programPanelist.externalName}</span>
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6 justify-start sm:justify-end">
                          {booking.status === "SCHEDULED" && (
                            <ManageBookingActions 
                              bookingId={booking.id}
                              currentPanelistId={booking.programPanelistId}
                              availablePanelists={candidate.program.panelists.filter((p: any) => p.roundId === booking.roundId)}
                            />
                          )}
                          <span className={cn(
                            "font-mono text-[10px] font-black px-4 py-1.5 rounded-xl uppercase tracking-[0.2em] shadow-sm",
                            booking.status === "COMPLETED" 
                              ? (booking.verdict === "PASS" ? "bg-emerald-500 text-white" : booking.verdict === "FAIL" ? "bg-rose-600 text-white" : "bg-amber-500 text-white")
                              : booking.status === "CANCELLED" ? "bg-rose-500/10 text-rose-600 border border-rose-500/20" : "bg-app-mono-bg/50 text-app-text-sub border border-app-border"
                          )}>
                            [ {booking.status === "COMPLETED" ? booking.verdict : booking.status} ]
                          </span>
                        </div>
                      </div>

                      {booking.status === "COMPLETED" ? (
                        <div className="space-y-12">
                          <div className="flex items-center gap-10">
                            <div className="flex gap-2">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <div 
                                  key={i} 
                                  className={cn(
                                    "w-3 h-10 rounded-xl transition-all duration-700 shadow-sm",
                                    i < (booking.score || 0) ? "bg-app-accent shadow-app-accent/20" : "bg-app-mono-bg/20"
                                  )} 
                                />
                              ))}
                            </div>
                            <div className="space-y-1">
                              <span className="font-mono text-[10px] font-black text-app-text-sub uppercase tracking-[0.3em]">Score Output</span>
                              <p className="text-3xl font-black text-app-text-main tabular-nums tracking-tighter">0{booking.score}/05</p>
                            </div>
                          </div>
                          
                          {booking.feedback && (
                            <div className="bg-app-mono-bg/5 p-10 rounded-[32px] border border-app-border italic relative">
                              <Zap className="absolute -top-3 -left-3 w-8 h-8 text-app-accent opacity-20" />
                              <p className="text-[16px] text-app-text-main font-medium leading-relaxed">
                                &ldquo;{booking.feedback}&rdquo;
                              </p>
                            </div>
                          )}

                          {booking.aiRubric && (
                            <StrengthIntensityBars areas={(booking.aiRubric as Rubric | null)?.focusAreas || []} />
                          )}
                        </div>
                      ) : booking.status === "SCHEDULED" ? (
                        <div className="flex items-center justify-between p-10 rounded-[32px] bg-app-accent/5 border border-app-accent/20">
                          <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-app-accent/10 flex items-center justify-center">
                              <Zap className="w-6 h-6 text-app-accent animate-pulse" />
                            </div>
                            <div>
                              <p className="text-app-accent text-[11px] font-black uppercase tracking-[0.3em]">Session Initialized</p>
                              <p className="text-xl font-black text-app-text-main uppercase tracking-tight mt-1">
                                {new Date(booking.slotStart).toLocaleDateString("en-US", { month: 'long', day: 'numeric' })} // {new Date(booking.slotStart).toLocaleTimeString("en-US", { hour: 'numeric', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          <ArrowUpRight className="w-8 h-8 text-app-accent opacity-20" />
                        </div>
                      ) : null}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
