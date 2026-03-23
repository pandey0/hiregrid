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
import PromoteButton from "./PromoteButton";
import ManageBookingActions from "./ManageBookingActions";

type Rubric = {
  focusAreas: string[];
  suggestedQuestions: { question: string; expectedAnswer: string }[];
};

type CandidateDetailClientProps = {
  candidate: any;
  nextRound: any;
  programId: string;
};

export default function CandidateDetailClient({
  candidate,
  nextRound,
  programId,
}: CandidateDetailClientProps) {
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
                    {candidate.program.name} //
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-slate-300 dark:text-slate-700" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-900 dark:text-white">
                  {candidate.name}
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
                <span className="font-mono text-[10px] font-black bg-blue-600 dark:bg-blue-500 text-white px-2 py-0.5 rounded uppercase tracking-widest">
                  [ {candidate.status} ]
                </span>
                {candidate.activeRound && (
                  <span className="font-mono text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded uppercase tracking-widest">
                    STAGE // {candidate.activeRound.name}
                  </span>
                )}
              </div>
              <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{candidate.name}</h1>
              <p className="text-[16px] text-slate-500 dark:text-slate-400 mt-4 font-medium max-w-2xl leading-relaxed italic">
                {candidate.currentRole || "Candidate"} // {candidate.currentCompany || "Unassigned Organization"}
              </p>
            </motion.div>
            
            <div className="flex items-center gap-4">
              {nextRound && candidate.status === "COMPLETED" && (
                <PromoteButton candidateId={candidate.id} nextRoundName={nextRound.name} />
              )}
              {candidate.resumeUrl && (
                <Button asChild variant="outline" className="h-12 px-8 rounded-2xl border-slate-200 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all uppercase tracking-widest text-[11px] bg-white dark:bg-transparent">
                  <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer">
                    Artifact // Source
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-16">
          {/* Sidebar - Profile Data */}
          <div className="lg:col-span-4 space-y-12">
            <section className="space-y-6">
              <h2 className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-[0.4em] px-1">
                Profile // Data
              </h2>
              <div className="p-8 rounded-[40px] bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
                <div className="space-y-1">
                  <span className="font-mono text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Network Email</span>
                  <p className="text-[15px] font-bold text-slate-900 dark:text-white">{candidate.email}</p>
                </div>
                {candidate.phone && (
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Phone Line</span>
                    <p className="text-[15px] font-bold text-slate-900 dark:text-white">{candidate.phone}</p>
                  </div>
                )}
                {candidate.linkedIn && (
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Digital Identity</span>
                    <a href={candidate.linkedIn} target="_blank" rel="noopener noreferrer" className="block text-[15px] font-bold text-blue-600 dark:text-blue-400 hover:underline">LinkedIn Profile //</a>
                  </div>
                )}
                <div className="pt-6 border-t border-slate-50 dark:border-slate-800">
                  <span className="font-mono text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Origin Source</span>
                  <p className="text-[13px] font-black text-slate-900 dark:text-white mt-1 uppercase tracking-tighter">
                    {candidate.source === "AGENCY" ? `Agency // ${candidate.agency?.name}` : "Direct Submission"}
                  </p>
                </div>
              </div>
            </section>

            {candidate.atsScore !== null && (
              <section className="space-y-6">
                <h2 className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-[0.4em] px-1">
                  Intelligence // Match
                </h2>
                <div className="p-8 rounded-[40px] bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 relative overflow-hidden shadow-2xl shadow-slate-200 dark:shadow-none transition-colors duration-500">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 dark:bg-blue-400/20 blur-[60px] -mr-16 -mt-16" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-mono text-[10px] font-bold text-blue-400 dark:text-blue-600 uppercase tracking-widest">Optimization Score</span>
                      <p className="text-4xl font-black tracking-tighter tabular-nums">
                        {Math.round(candidate.atsScore)}%
                      </p>
                    </div>
                    {candidate.atsReason && (
                      <p className="text-[14px] text-slate-400 dark:text-slate-600 font-medium leading-relaxed italic">
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
                <h2 className="text-[14px] font-bold text-slate-900 dark:text-white uppercase tracking-[0.4em] whitespace-nowrap">
                  Evaluation Timeline
                </h2>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-100 dark:from-slate-800 to-transparent" />
              </div>

              {candidate.bookings.length === 0 ? (
                <div className="p-24 rounded-[48px] border-2 border-dashed border-slate-100 dark:border-slate-800 text-center bg-slate-50/30 dark:bg-slate-900/20">
                  <span className="font-mono text-[12px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-[0.4em] block mb-4">[ ARCHIVE EMPTY ]</span>
                  <p className="text-[16px] text-slate-400 dark:text-slate-500 font-medium">No sessions have been documented for this candidate yet.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {candidate.bookings.map((booking: any, idx: number) => (
                    <motion.div 
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card className={cn(
                        "rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden",
                        booking.status === "COMPLETED" ? "bg-white dark:bg-slate-900/50" : "bg-slate-50/50 dark:bg-slate-900/20"
                      )}>
                        <CardContent className="p-8">
                          <div className="flex items-start justify-between gap-10 mb-8 pb-8 border-b border-slate-50 dark:border-slate-800">
                            <div>
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center text-xs font-black transition-colors">
                                  R{booking.round.roundNumber.toString().padStart(2, '0')}
                                </div>
                                <div>
                                  <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{booking.round.name}</h3>
                                  <p className="text-[13px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1">
                                    Interviewer // <span className="text-slate-600 dark:text-slate-300">{booking.programPanelist.externalName}</span>
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-6">
                              {booking.status === "SCHEDULED" && (
                                <ManageBookingActions 
                                  bookingId={booking.id}
                                  currentPanelistId={booking.programPanelistId}
                                  availablePanelists={candidate.program.panelists.filter((p: any) => p.roundId === booking.roundId)}
                                />
                              )}
                              <span className={cn(
                                "font-mono text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest",
                                booking.status === "COMPLETED" 
                                  ? (booking.verdict === "PASS" ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400" : booking.verdict === "FAIL" ? "bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400" : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400")
                                  : booking.status === "CANCELLED" ? "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400" : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                              )}>
                                {booking.status === "COMPLETED" ? `[ ${booking.verdict} ]` : `[ ${booking.status} ]`}
                              </span>
                            </div>
                          </div>

                          {booking.status === "COMPLETED" ? (
                            <div className="space-y-8">
                              <div className="flex items-center gap-6">
                                <div className="flex gap-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <div 
                                      key={i} 
                                      className={cn(
                                        "w-2 h-6 rounded-full transition-colors",
                                        i < (booking.score || 0) ? "bg-blue-600 dark:bg-blue-500" : "bg-slate-100 dark:bg-slate-800"
                                      )} 
                                    />
                                  ))}
                                </div>
                                <span className="text-lg font-black text-slate-900 dark:text-white tabular-nums">SCORE // {booking.score}/05</span>
                              </div>
                              
                              {booking.feedback && (
                                <div className="bg-slate-50 dark:bg-slate-900/80 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800">
                                  <p className="text-[15px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed italic">
                                    &ldquo;{booking.feedback}&rdquo;
                                  </p>
                                </div>
                              )}

                              {booking.aiRubric && (
                                <div className="pt-6">
                                  <span className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] block mb-4">Intelligence Logic //</span>
                                  <div className="flex flex-wrap gap-2">
                                    {(booking.aiRubric as Rubric | null)?.focusAreas?.map((area: string, i: number) => (
                                      <div key={i} className="px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-tight">
                                        {area}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : booking.status === "SCHEDULED" ? (
                            <div className="flex items-center gap-4 p-6 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                              <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-500 animate-pulse" />
                              <p className="text-blue-700 dark:text-blue-400 text-[14px] font-black uppercase tracking-widest">
                                SESSION SCHEDULED // {new Date(booking.slotStart).toLocaleDateString("en-US", { month: 'short', day: 'numeric' }).toUpperCase()} // {new Date(booking.slotStart).toLocaleTimeString("en-US", { hour: 'numeric', minute: '2-digit' })}
                              </p>
                            </div>
                          ) : null}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
