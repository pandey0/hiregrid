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
                  Partner Ecosystem
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="font-mono text-[11px] font-bold text-blue-600 uppercase tracking-[0.3em] mb-3 block">
              Sourcing Networks //
            </span>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">Agencies</h1>
            <p className="text-[16px] text-slate-500 mt-4 font-medium max-w-3xl leading-relaxed">
              Managing external sourcing channels. Partners utilize secure portals to deploy candidates directly into the {program.name} architecture.
            </p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-16">
            <section className="space-y-10">
              <div className="flex items-center gap-6">
                <h2 className="text-[13px] font-bold text-slate-900 uppercase tracking-[0.4em] whitespace-nowrap">
                  Connect Partner
                </h2>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-100 to-transparent" />
              </div>
              <div className="p-10 rounded-[40px] bg-white border border-slate-100 shadow-sm">
                <CreateAgencyForm programId={program.id} />
              </div>
            </section>

            <section className="space-y-10">
              <div className="flex items-center gap-6">
                <h2 className="text-[13px] font-bold text-slate-900 uppercase tracking-[0.4em] whitespace-nowrap">
                  Active Partnerships
                </h2>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-100 to-transparent" />
              </div>

              {agencies.length === 0 ? (
                <div className="p-24 rounded-[40px] border-2 border-dashed border-slate-100 text-center">
                  <p className="text-[14px] text-slate-400 font-bold uppercase tracking-widest">Zero partner networks connected</p>
                </div>
              ) : (
                <div className="rounded-[40px] border border-slate-100 bg-white overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader className="bg-slate-50/30">
                      <TableRow className="hover:bg-transparent border-slate-100 h-16">
                        <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-8">Agency // Identity</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-4">Contact</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-4">Inflow</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-4">Portal Link</TableHead>
                        <TableHead className="w-20 px-8"></TableHead>
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
                            className="group transition-all duration-500 border-slate-50 h-24 hover:bg-slate-50/30"
                          >
                            <TableCell className="px-8">
                              <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm uppercase shrink-0 shadow-lg shadow-blue-50">
                                  {agency.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 text-[16px] tracking-tight group-hover:text-blue-600 transition-colors leading-none">{agency.name}</p>
                                  <p className="font-mono text-[11px] font-bold text-slate-400 mt-1.5 uppercase tracking-tighter">{agency.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="px-4">
                              <span className="text-[14px] font-bold text-slate-700">
                                {agency.contactPerson || "// —"}
                              </span>
                            </TableCell>
                            <TableCell className="px-4">
                              <div className="flex items-center gap-2">
                                <div className={cn(
                                  "w-2 h-2 rounded-full",
                                  agency._count.candidates > 0 ? "bg-blue-500" : "bg-slate-200"
                                )} />
                                <span className={cn(
                                  "font-mono text-[11px] font-black uppercase tracking-widest",
                                  agency._count.candidates > 0 ? "text-blue-600" : "text-slate-400"
                                )}>
                                  {agency._count.candidates.toString().padStart(2, '0')} // ENTRIES
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="px-4">
                              <AgencyCopyButton value={portalLink} />
                            </TableCell>
                            <TableCell className="px-8 text-right">
                              <form action={deleteAgency.bind(null, agency.id, parseInt(programId))}>
                                <button
                                  type="submit"
                                  className="text-[10px] font-black text-rose-600/40 hover:text-rose-600 uppercase tracking-widest transition-colors"
                                >
                                  TERMINATE //
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
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-slate-900 border-none rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-200">
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/20 blur-[80px] -mr-24 -mt-24" />
                <div className="relative z-10">
                  <span className="font-mono text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] block mb-6">Network Strategy //</span>
                  <h3 className="text-2xl font-black tracking-tight mb-4 leading-tight text-white">Direct Sourcing Pipeline</h3>
                  <p className="text-slate-400 text-[15px] font-medium leading-relaxed mb-10">
                    Streamline external acquisition without portal overhead. Partners manage inflow through unique, secure interfaces.
                  </p>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-1.5 h-6 bg-blue-600 rounded-full shrink-0" />
                      <p className="text-[13px] font-bold text-slate-300 uppercase tracking-widest">Headless Submission</p>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-1.5 h-6 bg-blue-600 rounded-full shrink-0" />
                      <p className="text-[13px] font-bold text-slate-300 uppercase tracking-widest">Automated Decisions</p>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-1.5 h-6 bg-blue-600 rounded-full shrink-0" />
                      <p className="text-[13px] font-bold text-slate-300 uppercase tracking-widest">Architecture Sync</p>
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
