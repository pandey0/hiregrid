import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import DeleteProgramButton from "./DeleteProgramButton";
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
import { 
  Users, 
  Settings, 
  BarChart3, 
  Building2, 
  ChevronRight, 
  Clock, 
  Layers,
  Sparkles
} from "lucide-react";

const roundTypeLabel: Record<string, string> = {
  ATS_SCREENING: "ATS",
  HUMAN_INTERVIEW: "Interview",
  ASSIGNMENT: "Assignment",
};

export default async function ProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: session.user.id },
  });
  if (!membership) redirect("/onboarding");

  const program = await prisma.program.findFirst({
    where: { id: parseInt(id), organizationId: membership.organizationId },
    include: {
      rounds: {
        orderBy: { roundNumber: "asc" },
        include: { _count: { select: { panelists: true, bookings: true } } },
      },
      _count: { select: { candidates: true, panelists: true, agencies: true } },
    },
  });

  if (!program) notFound();

  const screeningCount = await prisma.candidate.count({
    where: { programId: parseInt(id), status: "SCREENING" },
  });

  const stats = [
    { label: "Rounds", value: program.rounds.length, icon: Layers },
    { label: "Panelists", value: program._count.panelists, icon: Users },
    { label: "Candidates", value: program._count.candidates, icon: Users },
    { label: "Agencies", value: program._count.agencies, icon: Building2 },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-12">
      {/* Header & Breadcrumb */}
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
              <BreadcrumbPage className="text-slate-900 font-bold">{program.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{program.name}</h1>
            {program.description && (
              <p className="text-[15px] text-slate-500 mt-2 font-medium max-w-2xl leading-relaxed">{program.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="h-10 px-4 rounded-xl border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition-all">
              <Settings className="w-4 h-4 mr-2" />
              Edit Program
            </Button>
            <DeleteProgramButton programId={program.id} />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {stats.map((s) => (
          <Card key={s.label} className="border-slate-200/60 bg-white/80 backdrop-blur-sm rounded-[24px] shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <s.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 tabular-nums tracking-tight">{s.value}</p>
                  <p className="text-[13px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-12">
        {/* Rounds List */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[15px] font-bold text-slate-900 flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-slate-400" />
              Interview Rounds
            </h2>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 font-bold text-[13px] h-auto p-0">
              Manage Rounds
            </Button>
          </div>

          {program.rounds.length === 0 ? (
            <Card className="border-dashed border-slate-200 bg-slate-50/30 rounded-[24px]">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-5">
                  <Layers className="w-7 h-7 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Define your process</h3>
                <p className="text-[14px] text-slate-500 mt-2 mb-8 max-w-[320px] leading-relaxed">
                  Add interview rounds to structure your hiring pipeline and assign panelists.
                </p>
                <Button variant="outline" className="rounded-xl h-10 px-6 border-slate-200">
                  Add First Round
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="relative space-y-4">
              {/* Timeline Connector */}
              <div className="absolute left-[29px] top-6 bottom-6 w-0.5 bg-slate-100" />
              
              {program.rounds.map((round) => (
                <Card key={round.id} className="relative border-slate-200/60 bg-white hover:border-blue-200/60 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex items-center gap-5">
                        <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center text-[13px] font-bold text-slate-400 z-10 group-hover:border-blue-600 group-hover:text-blue-600 transition-colors">
                          {round.roundNumber}
                        </div>
                        <div>
                          <h4 className="text-[16px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {round.name}
                          </h4>
                          <div className="flex items-center gap-3 mt-1.5 font-medium">
                            <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[10px] uppercase font-bold tracking-wider px-2 rounded-md h-5">
                              {roundTypeLabel[round.roundType]}
                            </Badge>
                            {round.roundType !== "ATS_SCREENING" && (
                              <span className="text-[12px] text-slate-400 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                {round.durationMinutes} min
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 pr-4 border-r border-slate-100">
                          <Badge variant="outline" className="border-slate-100 text-[11px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5">
                            {round._count.panelists} panelists
                          </Badge>
                          <Badge variant="outline" className="border-slate-100 text-[11px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5">
                            {round._count.bookings} bookings
                          </Badge>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Action Sidebar */}
        <div className="lg:col-span-4 space-y-10">
          <div>
            <h2 className="text-[15px] font-bold text-slate-900 mb-6 px-2">Manage Pipeline</h2>
            <div className="grid gap-3">
              {[
                { label: "Candidates", href: `/programs/${program.id}/candidates`, icon: Users, badge: screeningCount > 0 ? screeningCount : undefined },
                { label: "Panelists", href: `/programs/${program.id}/panelists`, icon: Users },
                { label: "Agencies", href: `/programs/${program.id}/agencies`, icon: Building2 },
                { label: "Control Tower", href: `/programs/${program.id}/control-tower`, icon: BarChart3 },
              ].map((link) => (
                <Button key={link.href} variant="outline" asChild className="w-full h-14 justify-start text-[14px] font-bold rounded-2xl border-slate-200/60 hover:bg-slate-50 hover:border-slate-300 transition-all px-4 group">
                  <Link href={link.href}>
                    <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 flex items-center justify-center mr-3.5 transition-colors">
                      <link.icon className="w-4 h-4" />
                    </div>
                    {link.label}
                    {link.badge ? (
                      <Badge className="ml-auto bg-blue-600 text-white border-none text-[10px] h-5 min-w-[20px] px-1 shadow-sm">{link.badge}</Badge>
                    ) : (
                      <ChevronRight className="ml-auto w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                    )}
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          <Card className="bg-slate-900 border-none rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Invite Agencies</h3>
              <p className="text-slate-400 text-[14px] leading-relaxed mb-8">
                Onboard external recruiters and agencies to source candidates directly into your pipeline.
              </p>
              <Button className="w-full h-11 bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-bold transition-all">
                Create Agency Link
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
