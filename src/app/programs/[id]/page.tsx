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
    where: { id: parseInt(id), organizationId: membership.organizationId, deletedAt: null },
    include: {
      rounds: {
        where: { deletedAt: null },
        orderBy: { roundNumber: "asc" },
        include: { _count: { select: { panelists: true, bookings: true } } },
      },
      _count: { select: { candidates: true, panelists: true, agencies: true } },
    },
  });

  if (!program) notFound();

  const screeningCount = await prisma.candidate.count({
    where: { programId: parseInt(id), status: "SCREENING", deletedAt: null },
  });

  const programMembers = await prisma.programMember.findMany({
    where: { programId: program.id },
    include: { user: true },
    orderBy: { role: "asc" }
  });

  const isAdmin = membership.role === "ADMIN";
  const isLead = programMembers.some(m => m.userId === session.user.id && m.role === "LEAD");
  const canManageTeam = isAdmin || isLead;

  const stats = [
    { label: "Rounds", value: program.rounds.length },
    { label: "Panelists", value: program._count.panelists },
    { label: "Candidates", value: program._count.candidates },
    { label: "Agencies", value: program._count.agencies },
  ];

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
              Edit Program
            </Button>
            <DeleteProgramButton programId={program.id} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {stats.map((s) => (
          <Card key={s.label} className="border-slate-200/60 bg-white/80 backdrop-blur-sm rounded-[24px] shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-6">
              <div>
                <p className="text-2xl font-bold text-slate-900 tabular-nums tracking-tight">{s.value}</p>
                <p className="text-[13px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[15px] font-bold text-slate-900 uppercase tracking-widest">
              Interview Rounds
            </h2>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 font-bold text-[13px] h-auto p-0">
              Manage
            </Button>
          </div>

          {program.rounds.length === 0 ? (
            <Card className="border-dashed border-slate-200 bg-slate-50/30 rounded-[24px]">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <h3 className="text-lg font-bold text-slate-900">Define your process</h3>
                <p className="text-[14px] text-slate-500 mt-2 mb-8 max-w-[320px] leading-relaxed">
                  Add interview rounds to structure your hiring pipeline and assign panelists.
                </p>
                <Button variant="outline" className="rounded-xl h-10 px-6 border-slate-200 shadow-sm">
                  Add First Round
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="relative space-y-4">
              <div className="absolute left-[29px] top-6 bottom-6 w-0.5 bg-slate-100" />
              
              {program.rounds.map((round) => (
                <Card key={round.id} className="relative border-slate-200/60 bg-white hover:border-slate-300 rounded-[20px] shadow-sm hover:shadow-md transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex items-center gap-5">
                        <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-[13px] font-bold text-slate-500 z-10 group-hover:border-slate-400 group-hover:text-slate-900 transition-colors">
                          {round.roundNumber}
                        </div>
                        <div>
                          <h4 className="text-[16px] font-bold text-slate-900 transition-colors">
                            {round.name}
                          </h4>
                          <div className="flex items-center gap-3 mt-1.5 font-medium">
                            <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[10px] uppercase font-bold tracking-wider px-2 rounded-md h-5">
                              {roundTypeLabel[round.roundType]}
                            </Badge>
                            {round.roundType !== "ATS_SCREENING" && (
                              <span className="text-[12px] text-slate-400">
                                {round.durationMinutes} min
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 pr-4 border-r border-slate-100">
                          <Badge variant="outline" className="border-slate-200 text-[11px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5">
                            {round._count.panelists} panelists
                          </Badge>
                          <Badge variant="outline" className="border-slate-200 text-[11px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5">
                            {round._count.bookings} bookings
                          </Badge>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-900 transition-all duration-300 font-bold">
                          →
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-10">
          <div>
            <h2 className="text-[15px] font-bold text-slate-900 mb-6 px-2 uppercase tracking-widest">Manage Pipeline</h2>
            <div className="grid gap-3">
              {[
                { label: "Candidates", href: `/programs/${program.id}/candidates`, badge: screeningCount > 0 ? screeningCount : undefined },
                { label: "Panelists", href: `/programs/${program.id}/panelists` },
                { label: "Agencies", href: `/programs/${program.id}/agencies` },
                { label: "Control Tower", href: `/programs/${program.id}/control-tower` },
              ].map((link) => (
                <Button key={link.href} variant="outline" asChild className="w-full h-14 justify-start text-[14px] font-bold rounded-2xl border-slate-200/60 hover:bg-slate-50 hover:border-slate-300 transition-all px-5 group shadow-sm">
                  <Link href={link.href}>
                    {link.label}
                    {link.badge ? (
                      <Badge className="ml-auto bg-blue-600 text-white border-none text-[10px] h-5 min-w-[20px] px-1 shadow-sm">{link.badge}</Badge>
                    ) : (
                      <span className="ml-auto font-bold text-slate-300 group-hover:text-slate-600 transition-colors">→</span>
                    )}
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-6 px-2">
              <h2 className="text-[15px] font-bold text-slate-900 uppercase tracking-widest">Program Team</h2>
              {canManageTeam && (
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 font-bold text-[13px] h-auto p-0">
                  Manage
                </Button>
              )}
            </div>
            <Card className="border-slate-200/60 bg-white rounded-2xl p-5 shadow-sm">
              <div className="space-y-4">
                {programMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-[10px] uppercase shrink-0">
                        {member.user.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold text-slate-900 truncate leading-tight">{member.user.name}</p>
                        <p className="text-[11px] text-slate-400 font-medium truncate">{member.user.email}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn(
                      "text-[9px] font-bold uppercase tracking-wider h-5 px-1.5 border-none",
                      member.role === "LEAD" ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-500"
                    )}>
                      {member.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
