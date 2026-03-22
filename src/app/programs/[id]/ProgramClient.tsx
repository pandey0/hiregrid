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

const roundTypeLabel: Record<string, string> = {
  ATS_SCREENING: "ATS",
  HUMAN_INTERVIEW: "Interview",
  ASSIGNMENT: "Assignment",
};

type ProgramClientProps = {
  program: any;
  screeningCount: number;
  programMembers: any[];
  canManageTeam: boolean;
};

export default function ProgramClient({
  program,
  screeningCount,
  programMembers,
  canManageTeam,
}: ProgramClientProps) {
  const stats = [
    { label: "Stages", value: program.rounds.length },
    { label: "Panelists", value: program._count.panelists },
    { label: "Candidates", value: program._count.candidates },
    { label: "Agencies", value: program._count.agencies },
  ];

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
                <BreadcrumbPage className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-900">
                  {program.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <span className="font-mono text-[11px] font-bold text-blue-600 uppercase tracking-[0.3em] mb-3 block">
                Program Architecture //
              </span>
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{program.name}</h1>
              {program.description && (
                <p className="text-[16px] text-slate-500 mt-4 font-medium max-w-2xl leading-relaxed">
                  {program.description}
                </p>
              )}
            </motion.div>
            <div className="flex items-center gap-4">
              <Button variant="outline" asChild className="h-12 px-8 rounded-2xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest text-[11px]">
                <Link href={`/programs/${program.id}/edit`}>Edit Config //</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {stats.map((s, idx) => (
            <motion.div 
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 rounded-[32px] bg-white border border-slate-100 shadow-sm"
            >
              <p className="text-4xl font-black text-slate-900 tabular-nums tracking-tighter">{s.value.toString().padStart(2, '0')}</p>
              <p className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-12">
            <div className="flex items-center gap-6">
              <h2 className="text-[13px] font-bold text-slate-900 uppercase tracking-[0.4em] whitespace-nowrap">
                Hiring Sequence
              </h2>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-100 to-transparent" />
            </div>

            {program.rounds.length === 0 ? (
              <Card className="border-dashed border-slate-200 bg-slate-50/30 rounded-[40px]">
                <CardContent className="flex flex-col items-center justify-center py-24 text-center">
                  <span className="font-mono text-[12px] font-bold text-slate-300 mb-4 uppercase tracking-[0.4em]">[ EMPTY SEQUENCE ]</span>
                  <h3 className="text-xl font-bold text-slate-900">No rounds defined</h3>
                  <p className="text-[14px] text-slate-500 mt-2 mb-8 max-w-[320px] leading-relaxed">
                    Establish the hiring stages to begin candidate processing.
                  </p>
                  <Button variant="outline" className="rounded-2xl h-11 px-8 border-slate-200 font-bold uppercase tracking-widest text-[11px]">
                    Define First Stage //
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="relative space-y-6">
                {program.rounds.map((round: any, idx: number) => (
                  <motion.div
                    key={round.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                  >
                    <Link href={`/programs/${program.id}/rounds/${round.id}`} className="block group">
                      <div className="relative p-10 rounded-[40px] bg-white border border-slate-100 group-hover:border-blue-200 group-hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] transition-all duration-700 overflow-hidden flex items-center justify-between gap-8">
                        <div className="flex items-center gap-8">
                          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl font-black group-hover:bg-blue-600 transition-colors duration-500 shadow-xl shadow-slate-200">
                            {round.roundNumber.toString().padStart(2, '0')}
                          </div>
                          <div>
                            <h4 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors tracking-tighter">
                              {round.name}
                            </h4>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase tracking-widest">
                                {roundTypeLabel[round.roundType]}
                              </span>
                              {round.roundType !== "ATS_SCREENING" && (
                                <span className="font-mono text-[11px] text-slate-400 font-bold">
                                  {round.durationMinutes} MIN // SESSION
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-12">
                          <div className="hidden sm:flex flex-col items-end">
                            <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Utilization</span>
                            <p className="text-[15px] font-bold text-slate-900">
                              {round._count.panelists} <span className="text-slate-400 font-medium text-[13px]">PANELISTS</span> // {round._count.bookings} <span className="text-slate-400 font-medium text-[13px]">BOOKED</span>
                            </p>
                          </div>
                          <span className="font-mono text-[14px] font-black text-slate-200 group-hover:text-blue-600 transition-all duration-500 group-hover:translate-x-2">
                            VIEW ->
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-16">
            <section>
              <h2 className="text-[13px] font-bold text-slate-900 mb-8 uppercase tracking-[0.4em]">
                Management
              </h2>
              <div className="grid gap-4">
                {[
                  { label: "Pipeline", href: `/programs/${program.id}/candidates`, badge: screeningCount > 0 ? screeningCount : undefined },
                  { label: "Interviewer Pool", href: `/programs/${program.id}/panelists` },
                  { label: "Partner Agencies", href: `/programs/${program.id}/agencies` },
                  { label: "Operational Hub", href: `/programs/${program.id}/control-tower` },
                ].map((link) => (
                  <Button key={link.href} variant="outline" asChild className="w-full h-16 justify-between text-[13px] font-black rounded-3xl border-slate-100 hover:bg-slate-900 hover:text-white transition-all px-8 group uppercase tracking-widest">
                    <Link href={link.href}>
                      {link.label}
                      {link.badge ? (
                        <span className="font-mono text-[11px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded ml-2">
                          [{link.badge}]
                        </span>
                      ) : (
                        <span className="font-mono text-[12px] opacity-30 group-hover:opacity-100 transition-opacity">-></span>
                      )}
                    </Link>
                  </Button>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-[13px] font-bold text-slate-900 uppercase tracking-[0.4em]">
                  Program Team
                </h2>
                {canManageTeam && (
                  <Link href={`/programs/${program.id}/team`} className="text-[11px] font-mono font-bold text-blue-600 hover:underline uppercase tracking-widest">
                    Manage //
                  </Link>
                )}
              </div>
              <div className="bg-white rounded-[40px] border border-slate-100 p-8 space-y-6">
                {programMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 font-black text-xs uppercase shrink-0">
                        {member.user.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] font-bold text-slate-900 truncate leading-tight">{member.user.name}</p>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter truncate">{member.user.email}</p>
                      </div>
                    </div>
                    <span className={cn(
                      "font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-widest",
                      member.role === "LEAD" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                    )}>
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
