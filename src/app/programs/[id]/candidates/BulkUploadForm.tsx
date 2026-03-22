"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
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
import { cn } from "@/lib/utils";

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
          toast.success(`Ingested ${res.created} identities`);
        }
      } catch (err: unknown) {
        const error = err as Error;
        toast.error(error.message || "Bulk ingestion failed");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if(!val) setResult(null); }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-12 px-8 rounded-2xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest text-[11px]">
          Bulk Ingest //
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-[40px] border-slate-100 p-10 max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="mb-10 text-left">
          <span className="font-mono text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-4 block">
            Logistics // Bulk Inflow
          </span>
          <DialogTitle className="text-4xl font-black text-slate-900 tracking-tighter">Identity Schematic</DialogTitle>
          <DialogDescription className="text-[15px] text-slate-500 font-medium mt-2 leading-relaxed">
            Upload an Excel or CSV file to perform mass candidate ingestion. Ensure your file matches the required architectural schematic.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-10">
          {/* Schematic Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-50">
              <h3 className="font-mono text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
                [ SCHEMATIC ]
              </h3>
              <a href="/api/template/candidates" download="candidates-template.xlsx" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">
                Download Template //
              </a>
            </div>
            
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Required Headers:</span>
              <div className="flex flex-wrap gap-2">
                {["name", "email", "phone", "linkedin", "current_role", "current_company", "years_experience"].map((col) => (
                  <div key={col} className="px-2 py-1 rounded bg-white border border-slate-200 font-mono text-[10px] font-bold text-slate-600">
                    {col}
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-4 italic">
                * Note: &quot;name&quot; and &quot;email&quot; are mandatory for successful deployment.
              </p>
            </div>
          </section>

          <form id="bulk-upload-form" onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <Label className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Source File // CSV or XLSX</Label>
              <Input
                name="file"
                type="file"
                accept=".xlsx,.xls,.csv"
                required
                className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold uppercase tracking-widest pt-2.5"
              />
            </div>

            {result && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-[24px] border border-blue-100 bg-blue-50/30 space-y-4"
              >
                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="font-mono text-[9px] font-bold text-blue-400 uppercase tracking-widest">Created</span>
                    <span className="text-xl font-black text-blue-700">{result.created.toString().padStart(2, '0')}</span>
                  </div>
                  <div className="w-px h-8 bg-blue-100" />
                  <div className="flex flex-col">
                    <span className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest">Skipped</span>
                    <span className="text-xl font-black text-slate-600">{result.skipped.toString().padStart(2, '0')}</span>
                  </div>
                  {result.errors.length > 0 && (
                    <>
                      <div className="w-px h-8 bg-blue-100" />
                      <div className="flex flex-col">
                        <span className="font-mono text-[9px] font-bold text-rose-400 uppercase tracking-widest">Errors</span>
                        <span className="text-xl font-black text-rose-600">{result.errors.length.toString().padStart(2, '0')}</span>
                      </div>
                    </>
                  )}
                </div>

                {result.errors.length > 0 && (
                  <div className="pt-4 border-t border-blue-100">
                    <span className="font-mono text-[9px] font-black text-rose-600 uppercase tracking-widest block mb-2">[ FAILURE LOG ]</span>
                    <div className="max-h-32 overflow-y-auto space-y-1 pr-2 scrollbar-hide">
                      {result.errors.map((e, i) => (
                        <p key={i} className="text-[11px] font-bold text-rose-700/70 uppercase tracking-tighter">
                          Row {e.row} // {e.reason}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            <div className="pt-6 flex items-center justify-between gap-6">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-all">
                [ DISMISS ]
              </Button>
              <Button 
                type="submit" 
                disabled={isPending} 
                className="bg-slate-900 hover:bg-blue-600 text-white font-black h-14 px-12 rounded-2xl uppercase tracking-widest text-[12px] shadow-xl shadow-slate-200 transition-all active:scale-95"
              >
                {isPending ? "INGESTING..." : "COMMENCE IMPORT //"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
