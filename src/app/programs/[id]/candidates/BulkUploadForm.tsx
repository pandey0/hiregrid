"use client";

import { useState, useTransition } from "react";
import { toast } from "@/lib/toast";
import { bulkUploadCandidates, type BulkUploadResult } from "@/actions/candidates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { FileSpreadsheet, Download, AlertCircle, CheckCircle2, Database, Zap, Activity } from "lucide-react";

export default function BulkUploadForm({ programId }: { programId: number }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<BulkUploadResult | null>(null);
  const [open, setOpen] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.append("programId", String(programId));

    startTransition(async () => {
      try {
        const res = await bulkUploadCandidates(fd);
        setResult(res);
        if (res.created > 0) {
          toast.success(`Mass ingestion successful: ${res.created} entries`);
        }
      } catch (err: unknown) {
        const error = err as Error;
        toast.error(error.message || "Bulk ingestion protocol failed");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if(!val) setResult(null); }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-14 px-8 rounded-2xl border-app-border font-black text-app-text-main hover:bg-app-accent hover:text-white transition-all uppercase tracking-widest text-[11px] bg-app-card/50 group">
          <FileSpreadsheet className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" /> Bulk Ingest //
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0 max-w-2xl shadow-[0_0_80px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[90vh] bg-app-card border border-app-border/50 rounded-[40px] w-[95vw]">
        {/* Command Header */}
        <div className="p-10 pb-10 bg-app-text-main text-app-bg relative overflow-hidden border-b border-app-accent/20">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-app-accent/30 blur-[120px] -mr-48 -mt-48 animate-pulse" />
          
          <DialogHeader className="relative z-10 text-left">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-app-accent text-white font-mono text-[9px] font-black px-2 py-0.5 rounded tracking-widest animate-pulse">
                MASS_INFLOW_PROTOCOL
              </span>
              <div className="h-px w-12 bg-app-bg/20" />
              <span className="font-mono text-[9px] font-black text-app-bg/40 uppercase tracking-[0.3em]">Logistics // Batch</span>
            </div>
            <DialogTitle className="text-6xl font-black tracking-tighter text-app-bg leading-[0.8] mb-4">
              Bulk <br/> <span className="text-app-accent">Schematic</span>.
            </DialogTitle>
            <DialogDescription className="text-[15px] text-app-bg/50 font-medium leading-relaxed max-w-md italic">
              Perform high-volume identity ingestion. Validate source files against architectural schematics.
            </DialogDescription>
          </DialogHeader>

          {/* Corner Brackets */}
          <div className="absolute top-6 left-6 w-4 h-4 border-t-2 border-l-2 border-app-accent/20" />
          <div className="absolute bottom-6 right-6 w-4 h-4 border-b-2 border-r-2 border-app-accent/20" />
        </div>

        {/* Console Body */}
        <div className="flex-1 overflow-y-auto p-10 space-y-16 scrollbar-hide bg-white dark:bg-app-card relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--app-border)_1px,_transparent_1px)] bg-[size:24px_24px] opacity-[0.15] pointer-events-none" />

          <section className="space-y-10 relative z-10">
            <div className="flex items-center justify-between pb-2 border-b border-app-border/50">
              <div className="flex items-center gap-6">
                <div className="w-10 h-10 rounded-xl bg-app-mono-bg flex items-center justify-center border border-app-border">
                  <Database className="w-5 h-5 text-app-text-sub" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-black text-app-text-main text-[13px] uppercase tracking-[0.2em]">Required Schema</h3>
                  <span className="text-[9px] font-mono font-bold text-app-text-sub/40 uppercase">Architecture // Headers</span>
                </div>
              </div>
              <a href="/api/template/candidates" download="candidates-template.xlsx" className="flex items-center gap-3 text-[10px] font-black text-app-accent uppercase tracking-widest hover:bg-app-accent/5 px-4 py-2 rounded-xl transition-all border border-app-accent/20">
                <Download className="w-3.5 h-3.5" /> Get Schematic //
              </a>
            </div>
            
            <div className="p-8 rounded-3xl bg-app-mono-bg/5 border border-app-border/50 space-y-6">
              <div className="flex flex-wrap gap-2">
                {["name", "email", "phone", "linkedin", "current_role", "current_company", "years_experience"].map((col) => (
                  <div key={col} className="px-3 py-1.5 rounded-xl bg-app-text-main text-app-bg font-mono text-[10px] font-black uppercase shadow-lg shadow-app-text-main/5">
                    {col}
                  </div>
                ))}
              </div>
              <p className="text-[12px] text-app-text-sub font-medium italic opacity-60 flex items-start gap-2">
                <Zap className="w-4 h-4 text-app-accent mt-0.5" />
                Mandatory fields: name, email. Protocol will bypass non-compliant rows.
              </p>
            </div>
          </section>

          <form id="bulk-upload-form" onSubmit={handleSubmit} className="space-y-12 relative z-10">
            <div className="space-y-4">
              <Label className="font-mono text-[9px] font-black text-app-text-sub uppercase tracking-widest ml-1">Source Dataset // XLSX OR CSV</Label>
              <Input
                name="file"
                type="file"
                accept=".xlsx,.xls,.csv"
                required
                className="h-16 rounded-2xl border-app-border bg-app-mono-bg/5 font-black uppercase tracking-widest pt-4.5 text-[11px] shadow-inner"
              />
            </div>

            <AnimatePresence>
              {result && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-8 rounded-[32px] border-2 border-app-accent/20 bg-app-accent/[0.02] space-y-8"
                >
                  <div className="flex items-center gap-10">
                    <div className="flex flex-col text-left">
                      <span className="font-mono text-[10px] font-black text-app-accent uppercase tracking-widest mb-2">Ingested</span>
                      <span className="text-4xl font-black text-app-text-main tabular-nums tracking-tighter">{result.created.toString().padStart(2, '0')}</span>
                    </div>
                    <div className="w-px h-12 bg-app-accent/20" />
                    <div className="flex flex-col text-left">
                      <span className="font-mono text-[10px] font-black text-app-text-sub uppercase tracking-widest mb-2">Identified</span>
                      <span className="text-4xl font-black text-app-text-main/40 tabular-nums tracking-tighter">{result.skipped.toString().padStart(2, '0')}</span>
                    </div>
                    {result.errors.length > 0 && (
                      <>
                        <div className="w-px h-12 bg-app-accent/20" />
                        <div className="flex flex-col text-left">
                          <span className="font-mono text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">Failures</span>
                          <span className="text-4xl font-black text-rose-600 tabular-nums tracking-tighter">{result.errors.length.toString().padStart(2, '0')}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {result.errors.length > 0 && (
                    <div className="pt-8 border-t border-app-accent/10">
                      <div className="flex items-center gap-3 mb-6">
                        <Activity className="w-4 h-4 text-rose-500" />
                        <span className="font-mono text-[10px] font-black text-rose-600 uppercase tracking-[0.3em]">[ DISCREPANCY LOG ]</span>
                      </div>
                      <div className="max-h-40 overflow-y-auto space-y-3 pr-4 scrollbar-hide">
                        {result.errors.map((e, i) => (
                          <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
                            <span className="font-mono text-[10px] font-black text-rose-600/30">ID_{e.row}</span>
                            <p className="text-[12px] font-black text-rose-600 uppercase tracking-tight">
                              {e.reason}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        {/* Footer Protocol */}
        <div className="p-10 pt-8 border-t border-app-border/50 bg-app-mono-bg/10 flex items-center justify-between gap-6 backdrop-blur-md">
          <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-[11px] font-black text-app-text-sub/40 uppercase tracking-widest hover:text-app-text-main transition-all group">
            <span className="group-hover:translate-x-[-4px] transition-transform mr-2">{"<"}</span> [ ABORT_COMMAND ]
          </Button>
          <Button 
            type="submit" 
            form="bulk-upload-form"
            disabled={isPending} 
            className="bg-app-text-main text-app-bg hover:bg-app-accent font-black h-16 px-12 rounded-2xl uppercase tracking-[0.2em] text-[12px] shadow-2xl shadow-app-accent/20 transition-all border-none active:scale-95"
          >
            {isPending ? "INGESTING..." : "EXECUTE_BATCH_PROTOCOL //"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
