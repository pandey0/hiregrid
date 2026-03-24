"use client";

import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
import { Search, Download, CheckSquare } from "lucide-react";
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
    <div className="page-container pb-20">
      {/* Background Decorative Element */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-app-accent/5 blur-[140px] rounded-full opacity-50 translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Navigation & Header - Strictly Left Anchored */}
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
                Talent Logistics
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
              <span className="arch-mono-label px-3 py-1">Candidate Pipeline</span>
              <span className="text-[10px] font-mono font-bold text-app-text-sub uppercase tracking-widest">
                System Registry
              </span>
            </div>
            <h1 className="text-7xl font-black text-app-text-main tracking-tighter leading-[0.85] mb-6">
              Supply <span className="text-app-accent">Registry</span>.
            </h1>
            <p className="text-xl font-medium text-app-text-sub leading-relaxed max-w-xl italic">
              Managing <span className="text-app-text-main font-black border-b-2 border-app-accent">{candidates.length} unique identities</span> for the {program.name} sequence.
            </p>
          </motion.div>

          <div className="flex flex-wrap items-center gap-4 shrink-0 pb-2">
            <Button variant="outline" className="h-14 px-8 rounded-2xl border-app-border font-black text-app-text-main hover:bg-app-accent hover:text-white transition-all uppercase tracking-widest text-[11px] bg-app-card/50 shadow-none">
              <Download className="w-4 h-4 mr-2" /> Export // Data
            </Button>
            <AddCandidateForm programId={program.id} />
            <BulkUploadForm programId={program.id} />
          </div>
        </header>
      </div>

      <Tabs defaultValue="pipeline" className="space-y-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-app-border pb-8">
          <TabsList className="bg-app-mono-bg/20 p-1.5 rounded-[20px] border border-app-border h-auto inline-flex">
            <TabsTrigger value="pipeline" className="rounded-xl px-10 py-3 text-[12px] font-black uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-app-card data-[state=active]:shadow-lg data-[state=active]:text-app-accent transition-all">
              Live Pipeline // {pipeline.length}
            </TabsTrigger>
            <TabsTrigger value="screening" className="rounded-xl px-10 py-3 text-[12px] font-black uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-app-card data-[state=active]:shadow-lg data-[state=active]:text-purple-500 transition-all">
              Screening Queue // {screening.length}
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-app-text-sub group-focus-within:text-app-accent transition-colors" />
              <Input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter identity..." 
                className="h-12 w-64 pl-11 rounded-2xl border-app-border bg-app-mono-bg/5 focus:bg-white transition-all font-bold uppercase tracking-widest text-[11px] placeholder:text-app-text-sub/30"
              />
            </div>
          </div>
        </div>

        <TabsContent value="pipeline" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
          {pipeline.length === 0 ? (
            <div className="arch-card border-dashed p-32 text-center bg-app-mono-bg/5">
              <span className="font-mono text-[12px] font-black text-app-text-sub/40 uppercase tracking-[0.4em] block mb-4">[ REGISTRY EMPTY ]</span>
              <p className="text-xl font-medium text-app-text-sub italic">Initialize identities to populate the active pipeline sequence.</p>
            </div>
          ) : filteredPipeline.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-app-text-sub font-mono font-black uppercase tracking-widest text-sm opacity-40">Zero Registry Matches for &quot;{search}&quot;</p>
            </div>
          ) : (
            <div className="arch-card overflow-hidden bg-white dark:bg-app-card">
              <CandidateTable candidates={filteredPipeline} rounds={program.rounds} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="screening" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none space-y-12">
          {/* Verification Banner */}
          <div className="arch-card p-10 bg-app-text-main text-app-bg relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-app-accent/20 blur-[100px] -mr-32 -mt-32" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
              <div className="text-left">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-6 h-[1px] bg-app-accent" />
                  <span className="font-mono text-[10px] font-black text-app-accent uppercase tracking-[0.4em]">Verification Layer //</span>
                </div>
                <h3 className="text-3xl font-black tracking-tight uppercase">Agency Gateway</h3>
                <p className="text-app-bg/60 text-[16px] font-medium leading-relaxed mt-4 max-w-2xl italic">
                  Review external candidate entries. Verification deploys them into the architectural sequence and triggers automated ATS analysis.
                </p>
              </div>
              <Button className="h-16 px-10 rounded-2xl bg-app-bg text-app-text-main hover:bg-app-accent hover:text-white font-black text-[12px] uppercase tracking-widest transition-all active:scale-95 shrink-0 border-none shadow-2xl">
                <CheckSquare className="w-5 h-5 mr-3" /> Bulk Validate //
              </Button>
            </div>
          </div>

          {screening.length === 0 ? (
            <div className="arch-card border-dashed p-32 text-center bg-app-mono-bg/5">
              <span className="font-mono text-[12px] font-black text-app-text-sub/40 uppercase tracking-[0.4em] block mb-4">[ QUEUE CLEAR ]</span>
              <p className="text-xl font-medium text-app-text-sub italic">No external entries awaiting system verification.</p>
            </div>
          ) : filteredScreening.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-app-text-sub font-mono font-black uppercase tracking-widest text-sm opacity-40">Zero Registry Matches for &quot;{search}&quot;</p>
            </div>
          ) : (
            <div className="arch-card overflow-hidden bg-white dark:bg-app-card">
              <CandidateTable candidates={filteredScreening} rounds={program.rounds} />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
