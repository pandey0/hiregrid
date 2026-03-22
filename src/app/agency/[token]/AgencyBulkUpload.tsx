"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { agencyBulkUpload, type AgencyBulkResult } from "@/actions/agencies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function AgencyBulkUpload({ token }: { token: string }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<AgencyBulkResult | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const form = e.currentTarget;

    startTransition(async () => {
      try {
        const res = await agencyBulkUpload(token, fd);
        setResult(res);
        form.reset();
        if (res.created > 0) {
          toast.success(`Deployment of ${res.created} identities successful`);
        }
      } catch (err: unknown) {
        const error = err as Error;
        toast.error(error.message || "Bulk deployment failed");
      }
    });
  }

  return (
    <div className="space-y-12">
      <section className="space-y-8">
        <h3 className="font-mono text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] pb-2 border-b border-slate-50">
          [ LOGISTICS // BULK ]
        </h3>
        <div className="p-8 rounded-[32px] bg-slate-50 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-[14px] text-slate-500 font-medium leading-relaxed max-w-xl">
            Execute mass candidate ingestion using the required architectural schematic. System will automatically skip existing network identities.
          </p>
          <Button variant="outline" asChild className="h-12 px-8 rounded-2xl border-slate-200 font-black text-[11px] uppercase tracking-widest shrink-0">
            <a href="/api/template/candidates" download="candidates-template.xlsx">
              Download Schematic //
            </a>
          </Button>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="space-y-2">
          <Label htmlFor="agency-bulk-file" className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Source Schematic // Excel or CSV</Label>
          <Input
            id="agency-bulk-file"
            name="file"
            type="file"
            accept=".xlsx,.xls,.csv"
            required
            className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-bold uppercase tracking-widest pt-3.5"
          />
        </div>

        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-[32px] border border-blue-100 bg-blue-50/30 space-y-6"
          >
            <div className="flex items-center gap-10">
              <div className="flex flex-col">
                <span className="font-mono text-[9px] font-bold text-blue-400 uppercase tracking-widest">Ingested</span>
                <span className="text-2xl font-black text-blue-700">{result.created.toString().padStart(2, '0')}</span>
              </div>
              <div className="w-px h-10 bg-blue-100" />
              <div className="flex flex-col">
                <span className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest">Redundant</span>
                <span className="text-2xl font-black text-slate-600">{result.skipped.toString().padStart(2, '0')}</span>
              </div>
              {result.errors.length > 0 && (
                <>
                  <div className="w-px h-10 bg-blue-100" />
                  <div className="flex flex-col">
                    <span className="font-mono text-[9px] font-bold text-rose-400 uppercase tracking-widest">Failures</span>
                    <span className="text-2xl font-black text-rose-600">{result.errors.length.toString().padStart(2, '0')}</span>
                  </div>
                </>
              )}
            </div>

            {result.errors.length > 0 && (
              <div className="pt-6 border-t border-blue-100">
                <span className="font-mono text-[10px] font-black text-rose-600 uppercase tracking-widest block mb-4">[ ARCHITECTURAL ERRORS ]</span>
                <div className="space-y-2">
                  {result.errors.map((e, i) => (
                    <p key={i} className="text-[12px] font-bold text-rose-700/60 uppercase tracking-tighter">
                      Row {e.row} // {e.reason}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isPending}
            className="h-16 px-12 rounded-2xl bg-slate-900 hover:bg-blue-600 text-white font-black uppercase tracking-widest text-[12px] shadow-2xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-50"
          >
            {isPending ? "PROCESSING..." : "COMMENCE IMPORT //"}
          </Button>
        </div>
      </form>
    </div>
  );
}
