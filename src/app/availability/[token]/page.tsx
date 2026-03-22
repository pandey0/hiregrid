import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import AvailabilityGrid from "./AvailabilityGrid";
import ScorecardForm from "./ScorecardForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, User, CheckCircle2, MessageSquare } from "lucide-react";

type Rubric = {
  focusAreas: string[];
  suggestedQuestions: { question: string; expectedAnswer: string }[];
};

export default async function AvailabilityPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  // 1. Get the current context
  const panelist = await prisma.programPanelist.findUnique({
    where: { magicLinkToken: token },
    include: {
      program: true,
      round: true,
      bookings: {
        include: { candidate: true },
        orderBy: { slotStart: "desc" }
      }
    },
  });

  if (!panelist || panelist.program.deletedAt || panelist.deletedAt) notFound();
  
  if (panelist.magicLinkTokenExp && panelist.magicLinkTokenExp < new Date()) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-sm text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Link Expired</h1>
          <p className="text-slate-500 text-[15px] leading-relaxed mb-6">
            This magic link has expired. Please contact the recruiter to request a new availability link.
          </p>
        </div>
      </div>
    );
  }

  // 2. Identify the panelist and find all their other active links
  const otherPrograms = panelist.externalEmail ? await prisma.programPanelist.findMany({
    where: {
      externalEmail: panelist.externalEmail,
      id: { not: panelist.id },
      deletedAt: null,
      program: { deletedAt: null }
    },
    include: { program: true, round: true }
  }) : [];

  const scheduledInterviews = panelist.bookings.filter(b => b.status === "SCHEDULED");
  const completedInterviews = panelist.bookings.filter(b => b.status === "COMPLETED");

  const existingSlots = Array.isArray(panelist.availableSlots)
    ? (panelist.availableSlots as { start: string; end: string }[])
    : [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* 15.9: Unified Portal Sidebar */}
      {otherPrograms.length > 0 && (
        <aside className="w-72 bg-white border-r border-slate-200 hidden lg:flex flex-col p-6 shrink-0">
          <div className="mb-8">
            <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">My Hiring Programs</h2>
            <div className="space-y-2">
              {/* Current Program (Active) */}
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                <p className="text-[13px] font-bold text-blue-700 truncate">{panelist.program.name}</p>
                <p className="text-[11px] text-blue-500 font-medium">{panelist.round.name}</p>
              </div>

              {/* Other Programs */}
              {otherPrograms.map((op) => (
                <a 
                  key={op.id}
                  href={`/availability/${op.magicLinkToken}`}
                  className="block p-3 rounded-xl hover:bg-slate-50 border border-transparent transition-all group"
                >
                  <p className="text-[13px] font-bold text-slate-700 truncate group-hover:text-slate-900">{op.program.name}</p>
                  <p className="text-[11px] text-slate-400 font-medium">{op.round.name}</p>
                </a>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-slate-100">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Interviewer Identity:<br/>
              <span className="font-bold text-slate-600">{panelist.externalEmail}</span>
            </p>
          </div>
        </aside>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-16">
          {/* Mobile Switcher (Visible only if other programs exist) */}
          {otherPrograms.length > 0 && (
            <div className="lg:hidden mb-8 p-4 bg-slate-100 rounded-2xl flex items-center justify-between">
              <p className="text-[12px] font-bold text-slate-600">You have {otherPrograms.length + 1} active hiring links</p>
              <Button variant="outline" size="sm" className="h-8 text-[11px] font-bold rounded-lg border-slate-200">Switch</Button>
            </div>
          )}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[11px] font-bold uppercase tracking-wider mb-4">
            Panelist Portal
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {panelist.program.name}
          </h1>
          <p className="text-[15px] text-slate-500 mt-2 font-medium">
            Round: <span className="text-slate-900 font-bold">{panelist.round.name}</span> ({panelist.round.durationMinutes} min)
          </p>
          {panelist.externalName && (
            <p className="text-[14px] text-slate-400 mt-1">Welcome back, {panelist.externalName}</p>
          )}
        </div>

        <Tabs defaultValue="availability" className="space-y-8">
          <TabsList className="bg-slate-100/50 p-1 rounded-2xl border border-slate-200/60 h-auto flex-wrap">
            <TabsTrigger value="availability" className="rounded-xl px-6 py-2 text-[14px] font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600">
              My Availability
            </TabsTrigger>
            <TabsTrigger value="interviews" className="rounded-xl px-6 py-2 text-[14px] font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600">
              Upcoming Interviews
              {scheduledInterviews.length > 0 && (
                <Badge className="ml-2 bg-blue-600 text-white border-none px-1.5 h-5 text-[10px] font-bold shadow-sm">{scheduledInterviews.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed" className="rounded-xl px-6 py-2 text-[14px] font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600">
              Past Evaluations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="availability" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm rounded-[24px] shadow-sm overflow-hidden p-8">
              <p className="text-[14px] text-slate-500 mb-8 leading-relaxed">
                Please mark the blocks where you are available. We only show blocks that exactly match the 
                <strong> {panelist.round.durationMinutes}-minute</strong> duration required for this round.
              </p>
              <AvailabilityGrid
                token={token}
                durationMinutes={panelist.round.durationMinutes}
                existingSlots={existingSlots}
              />
            </Card>
          </TabsContent>

          <TabsContent value="interviews" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-4">
              {scheduledInterviews.length === 0 ? (
                <Card className="border-dashed border-slate-200 bg-slate-50/30 rounded-[24px]">
                  <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6 text-slate-200">
                      <Calendar className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">No interviews booked</h3>
                    <p className="text-[15px] text-slate-500 mt-2 max-w-[340px] leading-relaxed">
                      Once candidates pick slots from your availability, they will appear here with their resumes.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                scheduledInterviews.map((booking) => (
                  <Card key={booking.id} className="border-slate-200/60 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                            <User className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="text-[16px] font-bold text-slate-900">{booking.candidate.name}</h4>
                            <p className="text-[13px] text-slate-500 font-medium">{booking.candidate.currentRole || "Candidate"}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:items-end">
                          <p className="text-[14px] font-bold text-slate-900">
                            {new Date(booking.slotStart).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })}
                          </p>
                          <p className="text-[13px] text-slate-500 font-medium">
                            {new Date(booking.slotStart).toLocaleTimeString("en-US", { hour: 'numeric', minute: '2-digit' })} - {new Date(booking.slotEnd).toLocaleTimeString("en-US", { hour: 'numeric', minute: '2-digit' })}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          {booking.candidate.resumeUrl && (
                            <Button asChild variant="outline" className="rounded-xl h-10 border-slate-200 font-bold text-[13px]">
                              <a href={booking.candidate.resumeUrl} target="_blank" rel="noopener noreferrer">
                                <FileText className="w-4 h-4 mr-2" />
                                Resume
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
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-4">
              {completedInterviews.length === 0 ? (
                <Card className="border-dashed border-slate-200 bg-slate-50/30 rounded-[24px]">
                  <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6 text-slate-200">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">No past evaluations</h3>
                    <p className="text-[15px] text-slate-500 mt-2 max-w-[340px] leading-relaxed">
                      Evaluations you submit after interviews will be archived here for your reference.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                completedInterviews.map((booking) => (
                  <Card key={booking.id} className="border-slate-200/60 bg-white rounded-2xl shadow-sm opacity-80">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-[15px] font-bold text-slate-900">{booking.candidate.name}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge className={cn(
                                "text-[10px] font-bold px-1.5 h-5",
                                booking.verdict === "PASS" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                booking.verdict === "FAIL" ? "bg-rose-50 text-rose-700 border-rose-100" :
                                "bg-amber-50 text-amber-700 border-amber-100"
                              )}>
                                {booking.verdict}
                              </Badge>
                              <span className="text-[12px] text-slate-400 font-medium">Score: {booking.score}/5</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[13px] font-bold text-slate-900">
                            {new Date(booking.slotStart).toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      {booking.feedback && (
                        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex gap-3">
                          <MessageSquare className="w-4 h-4 text-slate-300 mt-0.5 shrink-0" />
                          <p className="text-[13px] text-slate-600 italic leading-relaxed">
                            {booking.feedback}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
