"use client";

import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import CandidateTable from "./CandidateTable";
import AddCandidateForm from "./AddCandidateForm";
import BulkUploadForm from "./BulkUploadForm";

type CandidatesClientProps = {
  program: any;
  candidates: any[];
  screening: any[];
  pipeline: any[];
  programId: string;
};

export default function CandidatesClient({
  program,
  candidates,
  screening,
  pipeline,
  programId,
}: CandidatesClientProps) {
  const [search, setSearch] = useState("");

  const filteredPipeline = useMemo(() => {
    return pipeline.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [pipeline, search]);

  const filteredScreening = useMemo(() => {
    return screening.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [screening, search]);

  return (
    <div className="w-full px-8 lg:px-16 py-12 relative">
      <div className="max-w-[1600px] mx-auto">
        {/* Navigation & Header */}
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
                  Pipeline
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
                Talent Logistics //
              </span>
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">Candidates</h1>
              <p className="text-[16px] text-slate-500 mt-4 font-medium max-w-2xl leading-relaxed">
                Managing <span className="text-slate-900 font-bold">{candidates.length.toString().padStart(2, '0')} total entries</span> for the {program.name} sequence.
              </p>
            </motion.div>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="h-12 px-8 rounded-2xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest text-[11px]">
                Export // Data
              </Button>
              <AddCandidateForm programId={program.id} />
              <BulkUploadForm programId={program.id} />
            </div>
          </div>
        </div>

        <Tabs defaultValue="pipeline" className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-1">
            <TabsList className="bg-slate-100/50 p-1.5 rounded-[24px] border border-slate-200/60 h-auto inline-flex">
              <TabsTrigger value="pipeline" className="rounded-[18px] px-8 py-3 text-[13px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 transition-all">
                Live Pipeline [{pipeline.length}]
              </TabsTrigger>
              <TabsTrigger value="screening" className="rounded-[18px] px-8 py-3 text-[13px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-purple-600 transition-all">
                Screening Queue [{screening.length}]
              </TabsTrigger>
            </TabsList>

            <div className="w-full md:w-80">
              <div className="relative">
                <Input 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter by identity..." 
                  className="h-11 rounded-2xl border-slate-100 bg-white px-6 font-bold text-[12px] uppercase tracking-widest placeholder:text-slate-300 focus:ring-blue-500/10 focus:border-blue-200 transition-all shadow-sm"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[9px] font-black text-slate-200">[ SEARCH ]</div>
              </div>
            </div>
          </div>

          <TabsContent value="pipeline" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
            {pipeline.length === 0 ? (
              <div className="p-32 rounded-[48px] border-2 border-dashed border-slate-100 text-center bg-slate-50/30">
                <span className="font-mono text-[12px] font-bold text-slate-300 uppercase tracking-[0.4em] block mb-4">[ PIPELINE VACANT ]</span>
                <p className="text-[16px] text-slate-400 font-medium">Initialize candidates to populate the active flow.</p>
              </div>
            ) : filteredPipeline.length === 0 ? (
              <div className="py-24 text-center">
                <span className="font-mono text-[12px] font-bold text-slate-300 uppercase tracking-widest">Zero matches for &quot;{search}&quot;</span>
              </div>
            ) : (
              <div className="rounded-[40px] border border-slate-100 bg-white overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.04)]">
                <CandidateTable candidates={filteredPipeline} rounds={program.rounds} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="screening" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none space-y-8">
            <div className="p-10 rounded-[40px] bg-slate-900 text-white relative overflow-hidden shadow-2xl shadow-slate-200">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] -mr-32 -mt-32" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                  <span className="font-mono text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] block mb-4">Verification Layer //</span>
                  <h3 className="text-2xl font-black tracking-tight">Agency Submissions</h3>
                  <p className="text-slate-400 text-[15px] font-medium leading-relaxed mt-2 max-w-2xl">
                    Review external candidate entries. Approval deploys them into the architectural sequence and triggers automated ATS analysis.
                  </p>
                </div>
                <Button className="h-12 px-8 rounded-2xl bg-white text-slate-900 hover:bg-blue-50 font-black text-[11px] uppercase tracking-widest shadow-xl transition-all active:scale-95 shrink-0">
                  Bulk Validate //
                </Button>
              </div>
            </div>

            {screening.length === 0 ? (
              <div className="p-32 rounded-[48px] border-2 border-dashed border-slate-100 text-center bg-slate-50/30">
                <span className="font-mono text-[12px] font-bold text-slate-300 uppercase tracking-[0.4em] block mb-4">[ QUEUE CLEAR ]</span>
                <p className="text-[16px] text-slate-400 font-medium">No external entries awaiting verification.</p>
              </div>
            ) : filteredScreening.length === 0 ? (
              <div className="py-24 text-center">
                <span className="font-mono text-[12px] font-bold text-slate-300 uppercase tracking-widest">Zero matches for &quot;{search}&quot;</span>
              </div>
            ) : (
              <div className="rounded-[40px] border border-slate-100 bg-white overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.04)]">
                <CandidateTable candidates={filteredScreening} rounds={program.rounds} />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
