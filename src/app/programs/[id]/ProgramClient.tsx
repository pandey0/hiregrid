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
import { ArrowLeft, Settings, Users, Layers, Activity, ArrowUpRight } from "lucide-react";

const roundTypeLabels: Record<string, string> = {
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
    { label: "Stages", value: program.rounds.length, icon: Layers },
    { label: "Total Supply", value: program._count.candidates, icon: Users },
    { label: "Screening Queue", value: screeningCount, icon: Activity },
    { label: "Staff Pool", value: program._count.panelists, icon: Settings },
  ];

  return (
    <div className="page-container">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-app-accent/5 blur-[140px] rounded-full opacity-50 -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Navigation & Header */}
      <div className="mb-16">
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
                Program Architecture
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-end justify-start gap-12 text-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1"
          >
            <span className="arch-mono-label px-3 py-1 mb-4 inline-block">
              Operational Sequence
            </span>
            <h1 className="text-6xl font-black text-app-text-main tracking-tighter leading-none">{program.name}</h1>
            {program.description && (
              <p className="text-xl font-medium text-app-text-sub mt-6 max-w-2xl leading-relaxed italic">
                {program.description}
              </p>
            )}
          </motion.div>
          <div className="flex items-center gap-4 shrink-0">
            <Button asChild className="h-16 px-10 rounded-2xl bg-app-text-main text-app-bg hover:bg-app-accent font-black transition-all uppercase tracking-widest text-[12px] shadow-2xl shadow-app-accent/10 border-none">
              <Link href={`/programs/${program.id}/candidates`}>Manage Pipeline //</Link>
            </Button>
            <Button variant="outline" asChild className="h-16 px-10 rounded-2xl border-app-border bg-app-card/50 text-app-text-main hover:bg-app-accent hover:text-white transition-all uppercase tracking-widest text-[12px] shadow-none">
              <Link href={`/programs/${program.id}/edit`}>Configuration</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Top KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
        {stats.map((s, idx) => (
          <motion.div 
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-8 rounded-[32px] bg-white dark:bg-app-card border border-app-border shadow-sm text-left"
          >
            <p className="text-5xl font-black text-app-text-main tabular-nums tracking-tighter">{s.value.toString().padStart(2, '0')}</p>
            <p className="font-mono text-[10px] font-black text-app-text-sub uppercase tracking-[0.2em] mt-3">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-16">
        {/* Main Execution Sequence */}
        <div className="lg:col-span-8 space-y-16">
          <section className="space-y-10">
            <div className="flex items-center gap-6">
              <h2 className="text-[13px] font-bold text-app-text-main uppercase tracking-[0.4em] whitespace-nowrap text-left">
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
                    <div className="arch-card p-10 flex items-center justify-start gap-12 group-hover:border-app-accent/50 text-left bg-white dark:bg-app-card shadow-sm relative overflow-hidden">
                      <div className="flex items-center gap-8 relative z-10 shrink-0">
                        <div className="w-16 h-16 rounded-2xl bg-app-text-main text-app-bg flex items-center justify-center text-2xl font-black transition-colors group-hover:bg-app-accent shadow-xl shadow-app-accent/5">
                          {round.roundNumber.toString().padStart(2, '0')}
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-3xl font-black text-app-text-main group-hover:text-app-accent transition-colors tracking-tighter uppercase">
                            {round.name}
                          </h4>
                          <div className="flex items-center gap-4">
                            <span className="arch-mono-label px-2 py-0.5">
                              {roundTypeLabels[round.roundType]}
                            </span>
                            <span className="font-mono text-[11px] text-app-text-sub font-black uppercase tracking-widest opacity-40">
                              {round.durationMinutes} MIN // SESSION
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="h-12 w-px bg-app-border/50 hidden md:block" />

                      <div className="hidden md:flex items-center gap-12 relative z-10">
                        <div className="space-y-1">
                          <span className="font-mono text-[9px] font-black text-app-text-sub uppercase tracking-[0.3em]">Utilization</span>
                          <p className="text-[16px] font-black text-app-text-main uppercase tracking-tight">
                            {round._count.panelists} STAFF // {round._count.bookings} BOOKED
                          </p>
                        </div>
                      </div>

                      <div className="ml-auto relative z-10">
                        <ArrowUpRight className="w-6 h-6 text-app-text-sub/20 group-hover:text-app-accent transition-all group-hover:translate-x-1 group-hover:translate-y-[-4px]" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        </div>

        {/* Management Sidebar */}
        <div className="lg:col-span-4 space-y-16 text-left">
          <section>
            <h2 className="text-[12px] font-bold text-app-text-main mb-8 uppercase tracking-[0.4em]">
              Management // Hub
            </h2>
            <div className="grid gap-4">
              {[
                { label: "Candidate Pipeline", href: `/programs/${program.id}/candidates`, badge: screeningCount > 0 ? screeningCount : undefined },
                { label: "Interviewer Pool", href: `/programs/${program.id}/panelists` },
                { label: "Partner Agencies", href: `/programs/${program.id}/agencies` },
                { label: "Operational Hub", href: `/programs/${program.id}/control-tower` },
              ].map((link) => (
                <Button key={link.href} variant="outline" asChild className="w-full h-16 justify-between text-[12px] font-black rounded-2xl border-app-border hover:bg-app-text-main hover:text-app-bg transition-all px-8 group uppercase tracking-widest bg-app-card/50 text-app-text-main shadow-none">
                  <Link href={link.href}>
                    {link.label}
                    {link.badge ? (
                      <span className="font-mono text-[11px] font-black bg-app-accent text-white px-3 py-1 rounded-lg ml-2 shadow-lg shadow-app-accent/20">
                        {link.badge}
                      </span>
                    ) : (
                      <ArrowUpRight className="w-4 h-4 opacity-20 group-hover:opacity-100 transition-opacity" />
                    )}
                  </Link>
                </Button>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[12px] font-bold text-app-text-main uppercase tracking-[0.4em]">
                Team // Access
              </h2>
              {canManageTeam && (
                <Link href={`/programs/${program.id}/team`} className="text-[10px] font-mono font-black text-app-accent hover:underline uppercase tracking-widest">
                  Manage Access //
                </Link>
              )}
            </div>
            <div className="bg-white dark:bg-app-card border border-app-border rounded-[32px] p-8 space-y-6 shadow-sm">
              {programMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-app-mono-bg flex items-center justify-center text-app-text-main font-black text-[13px] uppercase shrink-0">
                      {member.user.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[15px] font-black text-app-text-main truncate leading-tight uppercase">{member.user.name}</p>
                      <p className="text-[11px] text-app-text-sub font-bold uppercase tracking-tighter truncate mt-1">{member.user.email}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "font-mono text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest transition-colors",
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
  );
}
