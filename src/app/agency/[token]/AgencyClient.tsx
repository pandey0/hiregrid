"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import AgencySubmitForm from "./AgencySubmitForm";
import AgencyBulkUpload from "./AgencyBulkUpload";

type Candidate = {
  id: number;
  name: string;
  email: string;
  status: string;
  createdAt: Date;
  activeRound?: { name: string; roundNumber: number } | null;
};

type AgencyClientProps = {
  agency: any;
  candidates: Candidate[];
  token: string;
};

export default function AgencyClient({
  agency,
  candidates,
  token,
}: AgencyClientProps) {
  const statusConfig: Record<string, { label: string; color: string }> = {
    SCREENING:   { label: "[ SCREENING ]",   color: "text-purple-600" },
    ACTIVE:      { label: "[ ACTIVE ]",      color: "text-blue-600" },
    BOOKED:      { label: "[ BOOKED ]",      color: "text-emerald-600" },
    COMPLETED:   { label: "[ FINISHED ]",    color: "text-slate-900" },
    REJECTED:    { label: "[ REJECTED ]",    color: "text-rose-600" },
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1600px] mx-auto px-8 lg:px-16 py-20 relative overflow-hidden">
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-blue-50/40 blur-[140px] rounded-full pointer-events-none" />

        <header className="mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="font-mono text-[11px] font-black text-blue-600 uppercase tracking-[0.4em]">
                Partner Portal // Network Access
              </span>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {agency._count.candidates.toString().padStart(2, '0')} Identities Deployed
                </span>
              </div>
            </div>
            <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-none mb-4">
              {agency.name}
            </h1>
            <p className="text-xl text-slate-500 font-medium tracking-tight">
              Direct sourcing interface for <span className="text-slate-900 font-bold underline decoration-blue-200 decoration-4 underline-offset-8">{agency.program.name}</span>.
            </p>
          </motion.div>
        </header>

        <Tabs defaultValue="candidates" className="space-y-12">
          <TabsList className="bg-slate-100/50 p-1.5 rounded-[24px] border border-slate-200/60 h-auto inline-flex">
            <TabsTrigger value="candidates" className="rounded-[18px] px-8 py-3 text-[13px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 transition-all">
              My Pipeline //
            </TabsTrigger>
            <TabsTrigger value="individual" className="rounded-[18px] px-8 py-3 text-[13px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 transition-all">
              New Ingestion
            </TabsTrigger>
            <TabsTrigger value="bulk" className="rounded-[18px] px-8 py-3 text-[13px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 transition-all">
              Bulk Deployment
            </TabsTrigger>
          </TabsList>

          <TabsContent value="candidates" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
            <div className="rounded-[40px] border border-slate-100 bg-white overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-slate-50/30">
                  <TableRow className="hover:bg-transparent border-slate-100 h-16">
                    <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-8">Identity // Path</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-4">Architecture Stage</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-4">Status</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-8 text-right">Initialized</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates.map((c, idx) => {
                    const cfg = statusConfig[c.status] || { label: `[ ${c.status} ]`, color: "text-slate-400" };
                    return (
                      <motion.tr 
                        key={c.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group transition-all duration-500 border-slate-50 h-24 hover:bg-slate-50/30"
                      >
                        <TableCell className="px-8">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm uppercase shrink-0 shadow-lg shadow-slate-100">
                              {c.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-[16px] tracking-tight leading-none">{c.name}</p>
                              <p className="font-mono text-[11px] font-bold text-slate-400 mt-1.5 uppercase tracking-tighter">{c.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4">
                          {c.activeRound ? (
                            <div className="flex items-center gap-2">
                              <div className="w-1 h-4 bg-slate-900 rounded-full" />
                              <span className="font-bold text-slate-900 text-[13px] tracking-tight uppercase">
                                R{c.activeRound.roundNumber} // {c.activeRound.name}
                              </span>
                            </div>
                          ) : (
                            <span className="font-mono text-[10px] text-slate-300 font-bold uppercase tracking-widest">[ PENDING REVIEW ]</span>
                          )}
                        </TableCell>
                        <TableCell className="px-4">
                          <span className={cn("font-mono text-[11px] font-black tracking-tighter uppercase whitespace-nowrap", cfg.color)}>
                            {cfg.label}
                          </span>
                        </TableCell>
                        <TableCell className="px-8 text-right">
                          <span className="font-mono text-[12px] font-black text-slate-900">
                            {new Date(c.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric' }).toUpperCase()}
                          </span>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                  {candidates.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-32">
                        <span className="font-mono text-[12px] font-bold text-slate-300 uppercase tracking-[0.4em] block mb-4">[ PIPELINE VACANT ]</span>
                        <p className="text-[16px] text-slate-400 font-medium">Deploy candidates to see their tracking status.</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="individual" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
            <div className="p-12 rounded-[48px] bg-white border border-slate-100 shadow-sm">
              <AgencySubmitForm token={token} />
            </div>
          </TabsContent>

          <TabsContent value="bulk" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
            <div className="p-12 rounded-[48px] bg-white border border-slate-100 shadow-sm">
              <AgencyBulkUpload token={token} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
