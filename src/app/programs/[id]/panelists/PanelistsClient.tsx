"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import InvitePanelistForm from "./InvitePanelistForm";
import CopyButton from "./CopyButton";
import NudgeButton from "./NudgeButton";
import { deletePanelist } from "@/actions/panelists";

type Panelist = {
  id: number;
  externalName: string | null;
  externalEmail: string | null;
  magicLinkToken: string;
  availableSlots: any;
  round: { name: string };
};

type PanelistsClientProps = {
  program: any;
  panelists: Panelist[];
  baseUrl: string;
  programId: string;
};

export default function PanelistsClient({
  program,
  panelists,
  baseUrl,
  programId,
}: PanelistsClientProps) {
  function formatSlots(slots: unknown): number {
    if (!Array.isArray(slots)) return 0;
    return slots.length;
  }

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
                <BreadcrumbLink asChild>
                  <Link href={`/programs/${programId}`} className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
                    {program.name} //
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-slate-300" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-900">
                  Interviewer Pool
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="font-mono text-[11px] font-bold text-blue-600 uppercase tracking-[0.3em] mb-3 block">
              Supply Management //
            </span>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">Interviewers</h1>
            <p className="text-[16px] text-slate-500 mt-4 font-medium max-w-2xl leading-relaxed">
              Coordinating <span className="text-slate-900 font-bold">{panelists.length.toString().padStart(2, '0')} assigned specialists</span> for the {program.name} sequence.
            </p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-16">
            {program.rounds.length === 0 ? (
              <div className="p-32 rounded-[48px] border-2 border-dashed border-slate-100 text-center bg-slate-50/30">
                <span className="font-mono text-[12px] font-bold text-slate-300 uppercase tracking-[0.4em] block mb-4">[ ARCHITECTURE REQUIRED ]</span>
                <p className="text-[16px] text-slate-400 font-medium">Define hiring rounds first to begin interviewer deployment.</p>
              </div>
            ) : (
              <>
                <section className="space-y-10">
                  <div className="flex items-center gap-6">
                    <h2 className="text-[13px] font-bold text-slate-900 uppercase tracking-[0.4em] whitespace-nowrap">
                      Deploy Interviewer
                    </h2>
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-100 to-transparent" />
                  </div>
                  <div className="p-10 rounded-[40px] bg-white border border-slate-100 shadow-sm">
                    <InvitePanelistForm programId={program.id} rounds={program.rounds} />
                  </div>
                </section>

                <section className="space-y-10">
                  <div className="flex items-center gap-6">
                    <h2 className="text-[13px] font-bold text-slate-900 uppercase tracking-[0.4em] whitespace-nowrap">
                      Interviewer Roster
                    </h2>
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-100 to-transparent" />
                  </div>

                  {panelists.length === 0 ? (
                    <div className="p-24 rounded-[40px] border-2 border-dashed border-slate-100 text-center">
                      <p className="text-[14px] text-slate-400 font-bold uppercase tracking-widest">Zero interviewers deployed</p>
                    </div>
                  ) : (
                    <div className="rounded-[40px] border border-slate-100 bg-white overflow-hidden shadow-sm">
                      <Table>
                        <TableHeader className="bg-slate-50/30">
                          <TableRow className="hover:bg-transparent border-slate-100 h-16">
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-8">Identity // Access</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-4">Stage</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-4">Availability</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-4">Magic Link</TableHead>
                            <TableHead className="w-20 px-8"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {panelists.map((p, idx) => {
                            const magicLink = `${baseUrl}/availability/${p.magicLinkToken}`;
                            const slotCount = formatSlots(p.availableSlots);
                            return (
                              <motion.tr 
                                key={p.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group transition-all duration-500 border-slate-50 h-24 hover:bg-slate-50/30"
                              >
                                <TableCell className="px-8">
                                  <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm uppercase shrink-0 shadow-lg shadow-slate-100">
                                      {(p.externalName || "P").charAt(0)}
                                    </div>
                                    <div>
                                      <p className="font-bold text-slate-900 text-[16px] tracking-tight group-hover:text-blue-600 transition-colors leading-none">{p.externalName || "Unnamed Interviewer"}</p>
                                      <p className="font-mono text-[11px] font-bold text-slate-400 mt-1.5 uppercase tracking-tighter">{p.externalEmail}</p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="px-4">
                                  <span className="font-mono text-[11px] font-black text-slate-900 uppercase tracking-widest">
                                    {p.round.name}
                                  </span>
                                </TableCell>
                                <TableCell className="px-4">
                                  <div className="flex items-center gap-2">
                                    <div className={cn(
                                      "w-2 h-2 rounded-full",
                                      slotCount > 0 ? "bg-emerald-500" : "bg-slate-200"
                                    )} />
                                    <span className={cn(
                                      "font-mono text-[11px] font-black uppercase tracking-widest",
                                      slotCount > 0 ? "text-emerald-600" : "text-slate-400"
                                    )}>
                                      {slotCount.toString().padStart(2, '0')} // SLOTS
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="px-4">
                                  <CopyButton value={magicLink} />
                                </TableCell>
                                <TableCell className="px-8 text-right">
                                  <div className="flex items-center justify-end gap-6">
                                    <NudgeButton panelistId={p.id} />
                                    <form action={deletePanelist.bind(null, p.id, program.id)}>
                                      <button
                                        type="submit"
                                        className="text-[10px] font-black text-rose-600/40 hover:text-rose-600 uppercase tracking-widest transition-colors"
                                      >
                                        DISCONNECT //
                                      </button>
                                    </form>
                                  </div>
                                </TableCell>
                              </motion.tr>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </section>
              </>
            )}
          </div>

          <div className="lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-slate-900 border-none rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-200">
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/20 blur-[80px] -mr-24 -mt-24" />
                <div className="relative z-10">
                  <span className="font-mono text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] block mb-6">Execution Strategy //</span>
                  <h3 className="text-2xl font-black tracking-tight mb-4 leading-tight text-white">Headless Scheduling Logic</h3>
                  <p className="text-slate-400 text-[15px] font-medium leading-relaxed mb-10">
                    Interviewers utilize a secure, login-free interface to populate the hiring supply chain with availability.
                  </p>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-1.5 h-6 bg-blue-600 rounded-full shrink-0" />
                      <p className="text-[13px] font-bold text-slate-300 uppercase tracking-widest">Smart Slot Snapping</p>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-1.5 h-6 bg-blue-600 rounded-full shrink-0" />
                      <p className="text-[13px] font-bold text-slate-300 uppercase tracking-widest">Global Conflict Guard</p>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-1.5 h-6 bg-blue-600 rounded-full shrink-0" />
                      <p className="text-[13px] font-bold text-slate-300 uppercase tracking-widest">Zero-Login Submission</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
