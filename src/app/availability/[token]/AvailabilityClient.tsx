"use client";

import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import AvailabilityGrid from "./AvailabilityGrid";
import ScorecardForm from "./ScorecardForm";

type Rubric = {
  focusAreas: string[];
  suggestedQuestions: { question: string; expectedAnswer: string }[];
};

type AvailabilityClientProps = {
  panelist: any;
  otherPrograms: any[];
  scheduledInterviews: any[];
  completedInterviews: any[];
  existingSlots: any[];
  token: string;
};

export default function AvailabilityClient({
  panelist,
  otherPrograms,
  scheduledInterviews,
  completedInterviews,
  existingSlots,
  token,
}: AvailabilityClientProps) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      {/* 15.9: Unified Portal Sidebar - Icon Free */}
      {otherPrograms.length > 0 && (
        <aside className="w-80 bg-white border-r border-slate-100 hidden lg:flex flex-col p-8 shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 blur-[60px] -mr-16 -mt-16" />
          
          <div className="relative z-10 mb-12">
            <span className="font-mono text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 block">
              Program // Network
            </span>
            <div className="space-y-3">
              {/* Current Program */}
              <div className="p-5 rounded-[24px] bg-slate-900 text-white shadow-xl shadow-slate-200">
                <p className="text-[14px] font-black tracking-tight">{panelist.program.name}</p>
                <p className="text-[11px] text-blue-400 font-bold uppercase tracking-widest mt-1">Active // {panelist.round.name}</p>
              </div>

              {/* Other Programs */}
              {otherPrograms.map((op) => (
                <a 
                  key={op.id}
                  href={`/availability/${op.magicLinkToken}`}
                  className="block p-5 rounded-[24px] hover:bg-slate-50 border border-transparent transition-all group"
                >
                  <p className="text-[14px] font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{op.program.name}</p>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1 group-hover:text-slate-500 transition-colors">{op.round.name}</p>
                </a>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-8 border-t border-slate-50 relative z-10">
            <span className="font-mono text-[9px] font-bold text-slate-300 uppercase tracking-widest block mb-2">Authenticated As //</span>
            <p className="text-[13px] font-black text-slate-900 truncate">
              {panelist.externalEmail}
            </p>
          </div>
        </aside>
      )}

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 lg:px-16 py-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-blue-700 text-[10px] font-black uppercase tracking-[0.2em]">Panelist Interface</span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-4">
              {panelist.program.name}
            </h1>
            <div className="flex flex-wrap items-center gap-6 mt-6">
              <div className="flex flex-col">
                <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Round</span>
                <span className="text-[16px] font-bold text-slate-900">{panelist.round.name}</span>
              </div>
              <div className="w-px h-8 bg-slate-100" />
              <div className="flex flex-col">
                <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duration</span>
                <span className="text-[16px] font-bold text-slate-900">{panelist.round.durationMinutes} Minutes</span>
              </div>
            </div>
          </motion.div>

          <Tabs defaultValue="availability" className="space-y-12">
            <TabsList className="bg-slate-100/50 p-1.5 rounded-[24px] border border-slate-200/60 h-auto inline-flex">
              <TabsTrigger value="availability" className="rounded-[18px] px-8 py-3 text-[13px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 transition-all">
                Availability //
              </TabsTrigger>
              <TabsTrigger value="interviews" className="rounded-[18px] px-8 py-3 text-[13px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 transition-all">
                Interviews [{scheduledInterviews.length}]
              </TabsTrigger>
              <TabsTrigger value="completed" className="rounded-[18px] px-8 py-3 text-[13px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 transition-all">
                Evaluations //
              </TabsTrigger>
            </TabsList>

            <TabsContent value="availability" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
              <div className="p-10 rounded-[40px] bg-white border border-slate-100 shadow-sm">
                <div className="mb-10">
                  <span className="font-mono text-[11px] font-bold text-blue-600 uppercase tracking-[0.3em] block mb-2">Selection Logic //</span>
                  <p className="text-[15px] text-slate-500 font-medium leading-relaxed max-w-2xl">
                    Mark the blocks where you are available for sessions. The grid only accepts blocks that match the required <span className="text-slate-900 font-black underline decoration-blue-200 decoration-2 underline-offset-4">{panelist.round.durationMinutes}-minute</span> duration.
                  </p>
                </div>
                <AvailabilityGrid
                  token={token}
                  durationMinutes={panelist.round.durationMinutes}
                  existingSlots={existingSlots}
                />
              </div>
            </TabsContent>

            <TabsContent value="interviews" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
              <div className="space-y-6">
                {scheduledInterviews.length === 0 ? (
                  <div className="p-20 rounded-[40px] border-2 border-dashed border-slate-100 text-center">
                    <span className="font-mono text-[12px] font-bold text-slate-300 uppercase tracking-[0.4em] block mb-4">[ NO BOOKINGS ]</span>
                    <p className="text-[15px] text-slate-400 font-medium">Candidates will appear here as they pick slots.</p>
                  </div>
                ) : (
                  scheduledInterviews.map((booking, idx) => (
                    <motion.div 
                      key={booking.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-10 rounded-[40px] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-50/50 transition-all duration-500"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-10 pb-10 border-b border-slate-50">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-[24px] bg-slate-900 text-white flex items-center justify-center text-lg font-black uppercase">
                            {booking.candidate.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-2xl font-black text-slate-900 tracking-tighter">{booking.candidate.name}</h4>
                            <p className="text-[14px] text-slate-400 font-bold uppercase tracking-widest mt-1">{booking.candidate.currentRole || "Candidate"}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col md:items-end">
                          <span className="font-mono text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Scheduled //</span>
                          <p className="text-xl font-black text-slate-900 tracking-tighter">
                            {new Date(booking.slotStart).toLocaleDateString("en-US", { month: 'short', day: 'numeric' }).toUpperCase()} // {new Date(booking.slotStart).toLocaleTimeString("en-US", { hour: 'numeric', minute: '2-digit' })}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          {booking.candidate.resumeUrl && (
                            <Button asChild variant="outline" className="h-12 px-8 rounded-2xl border-slate-200 font-black text-[11px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">
                              <a href={booking.candidate.resumeUrl} target="_blank" rel="noopener noreferrer">
                                Artifact // Source
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>

                      <ScorecardForm 
                        bookingId={booking.id} 
                        token={token} 
                        rubric={booking.aiRubric as Rubric | null}
                      />
                    </motion.div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="completed" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
              <div className="grid grid-cols-1 gap-6">
                {completedInterviews.length === 0 ? (
                  <div className="p-20 rounded-[40px] border-2 border-dashed border-slate-100 text-center">
                    <span className="font-mono text-[12px] font-bold text-slate-300 uppercase tracking-[0.4em] block mb-4">[ ARCHIVE EMPTY ]</span>
                    <p className="text-[15px] text-slate-400 font-medium">Submitted evaluations will be stored here.</p>
                  </div>
                ) : (
                  completedInterviews.map((booking, idx) => (
                    <motion.div 
                      key={booking.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-8 rounded-[32px] bg-white border border-slate-100 opacity-80"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900 font-black text-sm uppercase">
                            {booking.candidate.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-[16px] font-black text-slate-900 tracking-tighter">{booking.candidate.name}</h4>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className={cn(
                                "font-mono text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest",
                                booking.verdict === "PASS" ? "bg-emerald-50 text-emerald-700" :
                                booking.verdict === "FAIL" ? "bg-rose-50 text-rose-700" :
                                "bg-amber-50 text-amber-700"
                              )}>
                                {booking.verdict} // VERDICT
                              </span>
                              <span className="font-mono text-[10px] text-slate-400 font-bold uppercase tracking-widest">Score: {booking.score}/5</span>
                            </div>
                          </div>
                        </div>
                        <p className="font-mono text-[12px] font-black text-slate-900">
                          {new Date(booking.slotStart).toLocaleDateString("en-US", { month: 'short', day: 'numeric' }).toUpperCase()}
                        </p>
                      </div>
                      {booking.feedback && (
                        <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-100">
                          <p className="text-[14px] text-slate-600 font-medium italic leading-relaxed">
                            &ldquo;{booking.feedback}&rdquo;
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
