"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
import { Network, Globe, Zap, ShieldCheck, ArrowUpRight } from "lucide-react";
import CreateAgencyForm from "./CreateAgencyForm";
import AgencyCopyButton from "./AgencyCopyButton";
import { deleteAgency } from "@/actions/agencies";

type Agency = {
  id: number;
  name: string;
  email: string;
  contactPerson: string | null;
  magicLinkToken: string;
  _count: { candidates: number };
};

type AgenciesClientProps = {
  program: any;
  agencies: Agency[];
  baseUrl: string;
  programId: string;
};

export default function AgenciesClient({
  program,
  agencies,
  baseUrl,
  programId,
}: AgenciesClientProps) {
  return (
    <div className="page-container pb-20">
      {/* Background Decorative Element */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-app-accent/5 blur-[140px] rounded-full opacity-50 translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Navigation & Header */}
      <div className="mb-20">
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
              <BreadcrumbLink asChild>
                <Link href={`/programs/${programId}`} className="text-[11px] font-mono font-bold uppercase tracking-widest text-app-text-sub hover:text-app-accent transition-colors">
                  Sequence Overview //
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-app-border" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-[11px] font-mono font-bold uppercase tracking-widest text-app-text-main">
                Partner Ecosystem
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <header className="flex items-end justify-start gap-12 text-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="arch-mono-label px-3 py-1">Sourcing Networks</span>
              <span className="text-[10px] font-mono font-bold text-app-text-sub uppercase tracking-widest">
                Partner Protocol
              </span>
            </div>
            <h1 className="text-7xl font-black text-app-text-main tracking-tighter leading-[0.85] mb-6">
              Agency <span className="text-app-accent">Connect</span>.
            </h1>
            <p className="text-xl font-medium text-app-text-sub leading-relaxed max-w-2xl italic">
              Managing external sourcing channels. Partners utilize secure portals to deploy candidates into the {program.name} sequence.
            </p>
          </motion.div>
        </header>
      </div>

      <div className="grid lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-16">
          <section className="space-y-10">
            <div className="flex items-center gap-6">
              <h2 className="text-[13px] font-bold text-app-text-main uppercase tracking-[0.4em] whitespace-nowrap text-left">
                Connect Partner
              </h2>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-app-border to-transparent" />
            </div>
            <div className="arch-card p-10 bg-white dark:bg-app-card">
              <CreateAgencyForm programId={program.id} />
            </div>
          </section>

          <section className="space-y-10">
            <div className="flex items-center gap-6">
              <h2 className="text-[13px] font-bold text-app-text-main uppercase tracking-[0.4em] whitespace-nowrap text-left">
                Active Partnerships
              </h2>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-app-border to-transparent" />
            </div>

            {agencies.length === 0 ? (
              <div className="arch-card border-dashed p-24 text-center bg-app-mono-bg/5">
                <p className="text-[14px] text-app-text-sub font-bold uppercase tracking-widest italic">Zero partner networks connected</p>
              </div>
            ) : (
              <div className="arch-card overflow-hidden bg-white dark:bg-app-card shadow-none">
                <Table>
                  <TableHeader className="bg-app-mono-bg/5">
                    <TableRow className="hover:bg-transparent border-app-border h-16">
                      <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-app-text-sub px-8">Agency // Identity</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-app-text-sub px-4 text-center">Contact</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-app-text-sub px-4 text-center">Inflow</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-app-text-sub px-4 text-center">Portal Access</TableHead>
                      <TableHead className="w-20 px-8 text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agencies.map((agency, idx) => {
                      const portalLink = `${baseUrl}/agency/${agency.magicLinkToken}`;
                      return (
                        <motion.tr 
                          key={agency.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="group transition-all duration-500 border-app-border h-24 hover:bg-app-accent/[0.02]"
                        >
                          <TableCell className="px-8 text-left">
                            <div className="flex items-center gap-5">
                              <div className="w-12 h-12 rounded-2xl bg-app-text-main text-app-bg flex items-center justify-center font-black text-sm uppercase shrink-0 shadow-xl shadow-app-accent/5 transition-colors">
                                {agency.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-black text-app-text-main text-[16px] tracking-tight group-hover:text-app-accent transition-colors leading-none uppercase">{agency.name}</p>
                                <p className="font-mono text-[11px] font-bold text-app-text-sub mt-1.5 uppercase tracking-tighter">{agency.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 text-center">
                            <span className="text-[13px] font-black text-app-text-main uppercase tracking-tighter tabular-nums">
                              {agency.contactPerson || "// —"}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-xl font-black text-app-text-main tracking-tighter tabular-nums">{agency._count.candidates.toString().padStart(2, '0')}</span>
                              <span className="font-mono text-[9px] font-black text-app-text-sub uppercase tracking-widest mt-1">Entries</span>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 text-center">
                            <AgencyCopyButton value={portalLink} />
                          </TableCell>
                          <TableCell className="px-8 text-right">
                            <form action={deleteAgency.bind(null, agency.id, parseInt(programId))}>
                              <button
                                type="submit"
                                className="text-[10px] font-black text-rose-600/40 hover:text-rose-600 uppercase tracking-widest transition-colors"
                              >
                                DISCONNECT //
                              </button>
                            </form>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </section>
        </div>

        <div className="lg:col-span-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="sticky top-32"
          >
            <div className="arch-card bg-app-text-main text-app-bg p-10 relative overflow-hidden shadow-2xl transition-colors duration-500">
              <div className="absolute top-0 right-0 w-48 h-48 bg-app-accent/20 blur-[80px] -mr-24 -mt-24" />
              <div className="relative z-10 text-left">
                <span className="font-mono text-[10px] font-black text-app-accent uppercase tracking-[0.4em] block mb-6">Network Strategy //</span>
                <h3 className="text-2xl font-black tracking-tight mb-4 leading-tight">Direct Sourcing Pipeline</h3>
                <p className="text-app-bg/60 text-[15px] font-medium leading-relaxed mb-10 italic">
                  Streamline external acquisition without portal overhead. Partners manage inflow through unique, secure interfaces.
                </p>
                <div className="space-y-6">
                  {[
                    { label: "Headless Submission", icon: Zap },
                    { label: "Automated Decisions", icon: ShieldCheck },
                    { label: "Architecture Sync", icon: Globe }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="w-1.5 h-6 bg-app-accent rounded-full shrink-0" />
                      <div>
                        <p className="text-[13px] font-bold text-app-bg uppercase tracking-widest">{item.label}</p>
                        <p className="text-[10px] font-mono text-app-bg/40 mt-1 uppercase">Automated Protocol Enabled</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
