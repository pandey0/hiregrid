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
    <div className="w-full px-8 lg:px-16 py-12 relative transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto">
        {/* Navigation & Header */}
        <div className="mb-12">
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/dashboard" className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    Dashboard //
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-slate-300 dark:text-slate-700" />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/programs/${programId}`} className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {program.name} //
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-slate-300 dark:text-slate-700" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-900 dark:text-white">
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
              <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] mb-3 block">
                Talent Logistics //
              </span>
              <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">Candidates</h1>
              <p className="text-[16px] text-slate-500 dark:text-slate-400 mt-4 font-medium max-w-2xl leading-relaxed">
                Managing <span className="text-slate-900 dark:text-white font-bold">{candidates.length.toString().padStart(2, '0')} total entries</span> for the {program.name} sequence.
              </p>
            </motion.div>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="h-12 px-8 rounded-2xl border-slate-200 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all uppercase tracking-widest text-[11px]">
                Export // Data
              </Button>
              <AddCandidateForm programId={program.id} />
              <BulkUploadForm programId={program.id} />
            </div>
          </div>
        </div>

        <Tabs defaultValue="pipeline" className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-1">
            <TabsList className="bg-slate-100/50 dark:bg-slate-900/50 p-1.5 rounded-[24px] border border-slate-200/60 dark:border-slate-800 h-auto inline-flex">
              <TabsTrigger value="pipeline" className="rounded-[18px] px-8 py-3 text-[13px] font-black uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-lg dark:data-[state=active]:shadow-none data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 transition-all">
                Live Pipeline [{pipeline.length}]
              </TabsTrigger>
              <TabsTrigger value="screening" className="rounded-[18px] px-8 py-3 text-[13px] font-black uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-lg dark:data-[state=active]:shadow-none data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400 transition-all">
                Screening Queue [{screening.length}]
              </TabsTrigger>
            </TabsList>

            <div className="w-full md:w-80">
              <div className="relative">
                <Input 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter by identity..." 
                  className="h-11 rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 px-6 font-bold text-[12px] uppercase tracking-widest placeholder:text-slate-300 dark:placeholder:text-slate-600 text-slate-900 dark:text-white focus:ring-blue-500/10 focus:border-blue-200 dark:focus:border-blue-900 transition-all shadow-sm dark:shadow-none"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[9px] font-black text-slate-200 dark:text-slate-700">[ SEARCH ]</div>
              </div>
            </div>
          </div>

          <TabsContent value="pipeline" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
            {pipeline.length === 0 ? (
              <div className="p-32 rounded-[48px] border-2 border-dashed border-slate-100 dark:border-slate-800 text-center bg-slate-50/30 dark:bg-slate-900/20">
                <span className="font-mono text-[12px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-[0.4em] block mb-4">[ PIPELINE VACANT ]</span>
                <p className="text-[16px] text-slate-400 dark:text-slate-500 font-medium">Initialize candidates to populate the active flow.</p>
              </div>
            ) : filteredPipeline.length === 0 ? (
              <div className="py-24 text-center">
                <span className="font-mono text-[12px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest">Zero matches for &quot;{search}&quot;</span>
              </div>
            ) : (
              <div className="rounded-[40px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.04)] dark:shadow-none">
                <CandidateTable candidates={filteredPipeline} rounds={program.rounds} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="screening" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none space-y-8">
            <div className="p-10 rounded-[40px] bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 relative overflow-hidden shadow-2xl shadow-slate-200 dark:shadow-none transition-colors duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 dark:bg-blue-400/20 blur-[100px] -mr-32 -mt-32" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                  <span className="font-mono text-[10px] font-black text-blue-400 dark:text-blue-600 uppercase tracking-[0.4em] block mb-4">Verification Layer //</span>
                  <h3 className="text-2xl font-black tracking-tight">Agency Submissions</h3>
                  <p className="text-slate-400 dark:text-slate-500 text-[15px] font-medium leading-relaxed mt-2 max-w-2xl">
                    Review external candidate entries. Approval deploys them into the architectural sequence and triggers automated ATS analysis.
                  </p>
                </div>
                <Button className="h-12 px-8 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:bg-blue-50 dark:hover:bg-slate-800 font-black text-[11px] uppercase tracking-widest shadow-xl dark:shadow-none transition-all active:scale-95 shrink-0 border-none">
                  Bulk Validate //
                </Button>
              </div>
            </div>

            {screening.length === 0 ? (
              <div className="p-32 rounded-[48px] border-2 border-dashed border-slate-100 dark:border-slate-800 text-center bg-slate-50/30 dark:bg-slate-900/20">
                <span className="font-mono text-[12px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-[0.4em] block mb-4">[ QUEUE CLEAR ]</span>
                <p className="text-[16px] text-slate-400 dark:text-slate-500 font-medium">No external entries awaiting verification.</p>
              </div>
            ) : filteredScreening.length === 0 ? (
              <div className="py-24 text-center">
                <span className="font-mono text-[12px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest">Zero matches for &quot;{search}&quot;</span>
              </div>
            ) : (
              <div className="rounded-[40px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.04)] dark:shadow-none">
                <CandidateTable candidates={filteredScreening} rounds={program.rounds} />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
