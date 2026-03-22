import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { FileText, Mail, Phone, Linkedin, MessageSquare, Star, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import PromoteButton from "./PromoteButton";
import ManageBookingActions from "./ManageBookingActions";

type Rubric = {
  focusAreas: string[];
  suggestedQuestions: { question: string; expectedAnswer: string }[];
};

export default async function CandidateDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string; candidateId: string }> 
}) {
  const { id, candidateId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: session.user.id },
  });
  if (!membership) redirect("/onboarding");

  const candidate = await prisma.candidate.findFirst({
    where: { 
      id: parseInt(candidateId), 
      programId: parseInt(id),
      organizationId: membership.organizationId,
      deletedAt: null
    },
    include: {
      program: {
        include: {
          rounds: {
            where: { deletedAt: null },
            orderBy: { roundNumber: "asc" }
          },
          panelists: true
        }
      },
      activeRound: true,
      agency: true,
      bookings: {
        include: { round: true, programPanelist: true },
        orderBy: { slotStart: "desc" }
      }
    },
  });

  if (!candidate) notFound();

  const currentRoundNumber = candidate.activeRound?.roundNumber || 0;
  const nextRound = candidate.program.rounds.find(r => r.roundNumber > currentRoundNumber);

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-12">
      <div className="mb-12">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard" className="text-slate-400 hover:text-slate-900 font-medium transition-colors">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/programs/${id}`} className="text-slate-400 hover:text-slate-900 font-medium transition-colors">{candidate.program.name}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/programs/${id}/candidates`} className="text-slate-400 hover:text-slate-900 font-medium transition-colors">Candidates</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-slate-900 font-bold">{candidate.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-[24px] bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 font-bold text-xl uppercase">
              {candidate.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{candidate.name}</h1>
              <div className="flex items-center gap-3 mt-1.5">
                <Badge variant="outline" className="bg-white text-slate-600 border-slate-200 font-bold px-2 h-6">
                  {candidate.status}
                </Badge>
                {candidate.activeRound && (
                  <span className="text-[14px] text-slate-400 font-medium">Currently in: <span className="text-slate-900 font-bold">{candidate.activeRound.name}</span></span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {nextRound && candidate.status === "COMPLETED" && (
              <PromoteButton candidateId={candidate.id} nextRoundName={nextRound.name} />
            )}
            {candidate.resumeUrl && (
              <Button asChild variant="outline" className="h-11 px-5 rounded-xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all">
                <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer">
                  <FileText className="w-4 h-4 mr-2" />
                  View Resume
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-8">
          <section className="space-y-4">
            <h2 className="text-[13px] font-bold text-slate-400 uppercase tracking-widest px-1">Candidate Info</h2>
            <Card className="border-slate-200/60 bg-white rounded-[24px] shadow-sm overflow-hidden p-6">
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-slate-300 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email</p>
                    <p className="text-[14px] font-medium text-slate-900">{candidate.email}</p>
                  </div>
                </div>
                {candidate.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-slate-300 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                      <p className="text-[14px] font-medium text-slate-900">{candidate.phone}</p>
                    </div>
                  </div>
                )}
                {candidate.linkedIn && (
                  <div className="flex items-start gap-3">
                    <Linkedin className="w-4 h-4 text-slate-300 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">LinkedIn</p>
                      <a href={candidate.linkedIn} target="_blank" rel="noopener noreferrer" className="text-[14px] font-medium text-blue-600 hover:underline">Profile</a>
                    </div>
                  </div>
                )}
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Source</p>
                  <p className="text-[14px] font-medium text-slate-900 mt-1">
                    {candidate.source === "AGENCY" ? `Agency: ${candidate.agency?.name}` : "Direct Submission"}
                  </p>
                </div>
              </div>
            </Card>
          </section>

          {candidate.atsScore !== null && (
            <section className="space-y-4">
              <h2 className="text-[13px] font-bold text-slate-400 uppercase tracking-widest px-1">AI Insights</h2>
              <Card className="border-slate-200/60 bg-slate-900 rounded-[24px] shadow-sm overflow-hidden p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[14px] font-bold">Match Score</span>
                  <div className="px-3 py-1 rounded-full bg-blue-600 text-[16px] font-bold tabular-nums">
                    {Math.round(candidate.atsScore)}%
                  </div>
                </div>
                {candidate.atsReason && (
                  <p className="text-[13px] text-slate-400 leading-relaxed italic">
                    &quot;{candidate.atsReason}&quot;
                  </p>
                )}
              </Card>
            </section>
          )}
        </div>

        <div className="lg:col-span-8 space-y-8">
          <section className="space-y-6">
            <h2 className="text-[15px] font-bold text-slate-900 uppercase tracking-widest px-1">Interview evaluations</h2>
            {candidate.bookings.length === 0 ? (
              <Card className="border-dashed border-slate-200 bg-slate-50/30 rounded-[24px]">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6 text-slate-200">
                    <Star className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">No evaluations yet</h3>
                  <p className="text-[15px] text-slate-500 mt-2 max-w-[340px] leading-relaxed">
                    Evaluations will appear here once panelists submit their scorecards after interviews.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {candidate.bookings.map((booking) => (
                  <Card key={booking.id} className={cn(
                    "border-slate-200/60 rounded-[24px] shadow-sm overflow-hidden",
                    booking.status === "COMPLETED" ? "bg-white" : "bg-slate-50/50"
                  )}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-6 mb-6">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-1.5 rounded">
                              R{booking.round.roundNumber}
                            </span>
                            <h3 className="text-[16px] font-bold text-slate-900">{booking.round.name}</h3>
                          </div>
                          <p className="text-[13px] text-slate-500 mt-1 font-medium">
                            Interviewer: <span className="text-slate-900">{booking.programPanelist.externalName}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {booking.status === "SCHEDULED" && (
                            <ManageBookingActions 
                              bookingId={booking.id}
                              currentPanelistId={booking.programPanelistId}
                              availablePanelists={candidate.program.panelists.filter(p => p.roundId === booking.roundId)}
                            />
                          )}
                          {booking.status === "COMPLETED" ? (
                            <Badge className={cn(
                              "text-[11px] font-bold px-2 h-6 border shadow-none",
                              booking.verdict === "PASS" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                              booking.verdict === "FAIL" ? "bg-rose-50 text-rose-700 border-rose-100" :
                              "bg-amber-50 text-amber-700 border-amber-100"
                            )}>
                              {booking.verdict}
                            </Badge>
                          ) : booking.status === "CANCELLED" ? (
                            <Badge variant="outline" className="text-rose-600 border-rose-200 bg-rose-50 px-2 h-6 text-[11px] font-bold">
                              CANCELLED
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-slate-100 text-slate-400 border-none px-2 h-6 text-[11px] font-bold">
                              PENDING
                            </Badge>
                          )}
                        </div>
                      </div>

                      {booking.status === "COMPLETED" ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((n) => (
                                <Star key={n} className={cn(
                                  "w-4 h-4",
                                  n <= (booking.score || 0) ? "text-amber-400 fill-current" : "text-slate-200"
                                )} />
                              ))}
                            </div>
                            <span className="text-[13px] font-bold text-slate-900">Score: {booking.score}/5</span>
                          </div>
                          {booking.feedback && (
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex gap-3">
                              <MessageSquare className="w-4 h-4 text-slate-300 mt-0.5 shrink-0" />
                              <p className="text-[14px] text-slate-600 leading-relaxed italic">
                                {booking.feedback}
                              </p>
                            </div>
                          )}
                          {booking.aiRubric && (
                            <div className="mt-4 pt-4 border-t border-slate-100/50">
                              <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3 fill-current" />
                                AI Rubric Used
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {(booking.aiRubric as Rubric | null)?.focusAreas?.map((area: string, i: number) => (
                                  <Badge key={i} variant="outline" className="text-[10px] bg-slate-50 text-slate-500 border-slate-200">
                                    {area}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : booking.status === "SCHEDULED" ? (
                        <div className="flex items-center gap-2 text-slate-400 text-[13px] font-medium italic">
                          <Clock className="w-4 h-4" />
                          Interview scheduled for {new Date(booking.slotStart).toLocaleDateString("en-US", { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

import { Sparkles } from "lucide-react";
