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
  candidates: any[];
  screeningCount: number;
  programMembers: any[];
  canManageTeam: boolean;
};

export default function ProgramClient({
  program,
  candidates = [],
  screeningCount,
  programMembers,
  canManageTeam,
}: ProgramClientProps) {
  const stats = [
    { label: "Stages", value: program.rounds.length },
    { label: "Total Candidates", value: program._count.candidates },
    { label: "Screening Queue", value: screeningCount },
    { label: "Total Panelists", value: program._count.panelists },
  ];

  return (
    <div className="w-full px-8 lg:px-16 py-12 relative transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto">
        {/* Navigation & Header */}
        <div className="mb-12">
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
                <BreadcrumbPage className="text-[11px] font-mono font-bold uppercase tracking-widest text-app-text-main">
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
              <span className="font-mono text-[11px] font-bold text-app-accent uppercase tracking-[0.3em] mb-3 block">
                Active Program Architecture //
              </span>
              <h1 className="text-5xl font-black text-app-text-main tracking-tighter leading-none">{program.name}</h1>
              {program.description && (
                <p className="text-[16px] text-app-text-sub mt-4 font-medium max-w-2xl leading-relaxed">
                  {program.description}
                </p>
              )}
            </motion.div>
            <div className="flex items-center gap-4">
              <Button asChild className="h-12 px-8 rounded-2xl bg-app-text-main text-app-bg hover:bg-app-accent font-black transition-all uppercase tracking-widest text-[11px] shadow-xl shadow-app-accent/10 border-none">
                <Link href={`/programs/${program.id}/candidates`}>Manage Pipeline //</Link>
              </Button>
              <Button variant="outline" asChild className="h-12 px-8 rounded-2xl border-app-border bg-app-card/50 text-app-text-main hover:bg-app-accent hover:text-white transition-all uppercase tracking-widest text-[11px] shadow-none">
                <Link href={`/programs/${program.id}/edit`}>Config //</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((s, idx) => (
            <motion.div 
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 rounded-4xl bg-app-card border border-app-border shadow-sm"
            >
              <p className="text-4xl font-black text-app-text-main tabular-nums tracking-tighter">{s.value.toString().padStart(2, '0')}</p>
              <p className="font-mono text-[10px] font-bold text-app-text-sub uppercase tracking-[0.2em] mt-2">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-16">
          {/* Main Hiring Sequence */}
          <div className="lg:col-span-8 space-y-16">
            <section className="space-y-10">
              <div className="flex items-center gap-6">
                <h2 className="text-[13px] font-bold text-app-text-main uppercase tracking-[0.4em] whitespace-nowrap">
                  Hiring Sequence
                </h2>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-app-border to-transparent" />
              </div>
              
              <div className="space-y-6">
                {program.rounds.map((round: any, idx: number) => (
                  <motion.div
                    key={round.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                  >
                    <Link href={`/programs/${program.id}/rounds/${round.id}`} className="block group">
                      <div className="arch-card p-10 flex items-center justify-between gap-8 group-hover:border-app-accent/50">
                        <div className="flex items-center gap-10">
                          <div className="w-14 h-14 rounded-2xl bg-app-text-main text-app-bg flex items-center justify-center text-xl font-black transition-colors group-hover:bg-app-accent shadow-xl shadow-app-accent/5">
                            {round.roundNumber.toString().padStart(2, '0')}
                          </div>
                          <div>
                            <h4 className="text-2xl font-bold text-app-text-main group-hover:text-app-accent transition-colors tracking-tighter">
                              {round.name}
                            </h4>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="arch-mono-label">
                                {roundTypeLabel[round.roundType]}
                              </span>
                              {round.roundType !== "ATS_SCREENING" && (
                                <span className="font-mono text-[11px] text-app-text-sub font-bold">
                                  {round.durationMinutes} MIN // SESSION
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-12">
                          <div className="hidden sm:flex flex-col items-end">
                            <span className="font-mono text-[10px] font-bold text-app-text-sub uppercase tracking-widest mb-1">Utilization</span>
                            <p className="text-[15px] font-bold text-app-text-main">
                              {round._count.panelists} <span className="text-app-text-sub font-medium text-[13px]">STAFF</span> // {round._count.bookings} <span className="text-app-text-sub font-medium text-[13px]">BOOKED</span>
                            </p>
                          </div>
                          <span className="font-mono text-[14px] font-black text-app-text-sub/20 group-hover:text-app-accent transition-all duration-500 group-hover:translate-x-2">
                            VIEW ->
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Section */}
          <div className="lg:col-span-4 space-y-16">
            {/* Quick Overview */}
            <section>
              <h2 className="text-[12px] font-bold text-app-text-main mb-8 uppercase tracking-[0.4em]">
                Management // Hub
              </h2>
              <div className="grid gap-3">
                {[
                  { label: "Candidate Pipeline", href: `/programs/${program.id}/candidates`, badge: screeningCount > 0 ? screeningCount : undefined },
                  { label: "Interviewer Pool", href: `/programs/${program.id}/panelists` },
                  { label: "Partner Agencies", href: `/programs/${program.id}/agencies` },
                  { label: "Operational Hub", href: `/programs/${program.id}/control-tower` },
                ].map((link) => (
                  <Button key={link.href} variant="outline" asChild className="w-full h-14 justify-between text-[11px] font-black rounded-2xl border-app-border hover:bg-app-text-main hover:text-app-bg transition-all px-6 group uppercase tracking-widest bg-app-card/50 text-app-text-main shadow-none">
                    <Link href={link.href}>
                      {link.label}
                      {link.badge ? (
                        <span className="font-mono text-[10px] font-bold bg-app-accent text-white px-2 py-0.5 rounded ml-2">
                          [{link.badge}]
                        </span>
                      ) : (
                        <span className="font-mono text-[12px] opacity-20 group-hover:opacity-100 transition-opacity">-></span>
                      )}
                    </Link>
                  </Button>
                ))}
              </div>
            </section>

            {/* Internal Team */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-[12px] font-bold text-app-text-main uppercase tracking-[0.4em]">
                  Team // Access
                </h2>
                {canManageTeam && (
                  <Link href={`/programs/${program.id}/team`} className="text-[10px] font-mono font-bold text-app-accent hover:underline uppercase tracking-widest">
                    Manage //
                  </Link>
                )}
              </div>
              <div className="bg-app-card border border-app-border rounded-4xl p-8 space-y-6 shadow-sm">
                {programMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-app-mono-bg flex items-center justify-center text-app-mono-text font-black text-[10px] uppercase shrink-0">
                        {member.user.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] font-bold text-app-text-main truncate leading-tight">{member.user.name}</p>
                        <p className="text-[10px] text-app-text-sub font-bold uppercase tracking-tighter truncate">{member.user.email}</p>
                      </div>
                    </div>
                    <span className={cn(
                      "font-mono text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest transition-colors",
                      member.role === "LEAD" ? "bg-app-accent text-white" : "bg-app-mono-bg text-app-text-sub"
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
