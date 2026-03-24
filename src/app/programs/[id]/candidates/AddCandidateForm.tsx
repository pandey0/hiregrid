"use client";
import { useState, useTransition } from "react";
import { toast } from "@/lib/toast";
import { addCandidate } from "@/actions/candidates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { UploadButton } from "@/lib/uploadthing";
import { UserPlus, FileText, Cpu, Terminal, Zap, ShieldAlert } from "lucide-react";

export default function AddCandidateForm({ programId }: { programId: number }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [resume, setResume] = useState<{ url: string; key: string } | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.append("programId", String(programId));
    if (resume) {
      fd.append("resumeUrl", resume.url);
      fd.append("resumeKey", resume.key);
    }

    startTransition(async () => {
      try {
        const result = await addCandidate(fd);
        toast.success("Identity ingested successfully", { traceId: result?.traceId });
        setOpen(false);
      } catch (err: unknown) {
        const error = err as Error;
        toast.error(error.message || "Ingestion failed");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-14 px-8 rounded-2xl bg-app-text-main text-app-bg hover:bg-app-accent font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-app-accent/10 transition-all border-none active:scale-95 group">
          <UserPlus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" /> 
          Deploy Identity //
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0 max-w-2xl shadow-[0_0_80px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[90vh] bg-app-card border border-app-border/50 rounded-[40px]">
        {/* Command Header */}
        <div className="p-10 pb-10 bg-app-text-main text-app-bg relative overflow-hidden border-b border-app-accent/20">
          {/* Scanning Line Effect */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-app-accent/30 blur-[120px] -mr-48 -mt-48 animate-pulse" />
          
          <DialogHeader className="relative z-10 text-left">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-app-accent text-white font-mono text-[9px] font-black px-2 py-0.5 rounded tracking-widest animate-pulse shadow-[0_0_10px_rgba(var(--app-accent),0.5)]">
                LIVE_INGESTION_V.02
              </span>
              <div className="h-px w-12 bg-app-bg/20" />
              <span className="font-mono text-[9px] font-black text-app-bg/40 uppercase tracking-[0.3em]">Sector // Identity</span>
            </div>
            <DialogTitle className="text-6xl font-black tracking-tighter text-app-bg leading-[0.8] mb-4">
              Deploy <br/> <span className="text-app-accent">Identity</span>.
            </DialogTitle>
            <DialogDescription className="text-[15px] text-app-bg/50 font-medium leading-relaxed max-w-sm italic">
              Synchronizing external talent nodes into the program architecture sequence.
            </DialogDescription>
          </DialogHeader>

          {/* Corner Brackets */}
          <div className="absolute top-6 left-6 w-4 h-4 border-t-2 border-l-2 border-app-accent/20" />
          <div className="absolute bottom-6 right-6 w-4 h-4 border-b-2 border-r-2 border-app-accent/20" />
        </div>

        {/* Console Body */}
        <div className="flex-1 overflow-y-auto p-10 space-y-16 scrollbar-hide bg-white dark:bg-app-card relative">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--app-border)_1px,_transparent_1px)] bg-[size:24px_24px] opacity-[0.15] pointer-events-none" />

          <form id="add-candidate-form" onSubmit={handleSubmit} className="space-y-16 relative z-10">
            {/* Identity Module */}
            <section className="space-y-10">
              <div className="flex items-center gap-6">
                <div className="w-10 h-10 rounded-xl bg-app-mono-bg flex items-center justify-center border border-app-border shadow-inner">
                  <Terminal className="w-5 h-5 text-app-text-sub" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-black text-app-text-main text-[13px] uppercase tracking-[0.2em]">Registry Parameters</h3>
                  <span className="text-[9px] font-mono font-bold text-app-text-sub/40 uppercase">Module 01 // Core Identity</span>
                </div>
                <div className="h-px flex-1 bg-app-border/50" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { name: "name", label: "Identity Name", placeholder: "E.G. JANE SMITH", required: true },
                  { name: "email", label: "Protocol Email", placeholder: "JANE@NETWORK.COM", required: true, type: "email" },
                  { name: "phone", label: "Comms Line", placeholder: "+1 000 000 0000" },
                  { name: "linkedIn", label: "Global Alias", placeholder: "LINKEDIN.COM/IN/USER" },
                ].map((field) => (
                  <div key={field.name} className="space-y-3 group/field">
                    <Label className="font-mono text-[9px] font-black text-app-text-sub uppercase tracking-widest ml-1 group-focus-within/field:text-app-accent transition-colors">
                      {field.label} {field.required && "*"}
                    </Label>
                    <div className="relative">
                      <Input 
                        name={field.name} 
                        required={field.required} 
                        type={field.type}
                        placeholder={field.placeholder} 
                        className="h-12 rounded-xl border-app-border bg-app-mono-bg/5 focus:bg-white focus:ring-4 focus:ring-app-accent/5 transition-all font-black uppercase tracking-tight text-[13px] shadow-inner placeholder:text-app-text-sub/20" 
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-app-border group-focus-within/field:bg-app-accent transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Ingestion Port */}
            <section className="space-y-10">
              <div className="flex items-center gap-6">
                <div className="w-10 h-10 rounded-xl bg-app-mono-bg flex items-center justify-center border border-app-border shadow-inner">
                  <Cpu className="w-5 h-5 text-app-text-sub" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-black text-app-text-main text-[13px] uppercase tracking-[0.2em]">Artifact Port</h3>
                  <span className="text-[9px] font-mono font-bold text-app-text-sub/40 uppercase">Module 02 // External Data</span>
                </div>
                <div className="h-px flex-1 bg-app-border/50" />
              </div>

              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-4">
                  <Label className="font-mono text-[9px] font-black text-app-text-sub uppercase tracking-widest ml-1">Encrypted Artifact // PDF Source</Label>
                  <div className="flex flex-col items-start gap-4">
                    {!resume ? (
                      <UploadButton
                        endpoint="resumeUploader"
                        onClientUploadComplete={(res) => {
                          setResume({ url: res[0].url, key: res[0].key });
                          toast.success("Artifact detected and synced");
                        }}
                        onUploadError={(error: Error) => {
                          toast.error(`Ingestion failed: ${error.message}`);
                        }}
                        appearance={{
                          button: "ut-ready:bg-app-text-main ut-uploading:bg-app-accent/50 bg-app-text-main text-app-bg font-black uppercase tracking-[0.3em] text-[10px] h-16 w-full rounded-2xl border border-app-border shadow-xl hover:bg-app-accent transition-all duration-500",
                          allowedContent: "hidden",
                        }}
                      />
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-6 w-full p-8 rounded-3xl border-2 border-emerald-500/20 bg-emerald-500/[0.03] transition-all relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl -mr-12 -mt-12" />
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black text-sm shadow-xl shadow-emerald-500/20 relative z-10">
                          PDF
                        </div>
                        <div className="flex-1 min-w-0 relative z-10 text-left">
                          <p className="text-[14px] font-black text-emerald-600 uppercase tracking-widest truncate">Artifact Locked //</p>
                          <p className="text-[10px] font-mono text-emerald-600/40 truncate uppercase mt-1">ID_{resume.key}</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setResume(null)}
                          className="text-[10px] font-black text-rose-600/40 hover:text-rose-600 uppercase tracking-widest p-4 transition-colors relative z-10"
                        >
                          [ EJECT ]
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="font-mono text-[9px] font-black text-app-text-sub uppercase tracking-widest ml-1">Current Sector</Label>
                    <Input name="currentCompany" placeholder="E.G. GLOBAL CORP" className="h-12 rounded-xl border-app-border bg-app-mono-bg/5 focus:bg-white transition-all font-black uppercase tracking-tight text-[13px] shadow-inner" />
                  </div>
                  <div className="space-y-3">
                    <Label className="font-mono text-[9px] font-black text-app-text-sub uppercase tracking-widest ml-1">Active Specialization</Label>
                    <Input name="currentRole" placeholder="E.G. ARCHITECT" className="h-12 rounded-xl border-app-border bg-app-mono-bg/5 focus:bg-white transition-all font-black uppercase tracking-tight text-[13px] shadow-inner" />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="font-mono text-[9px] font-black text-app-text-sub uppercase tracking-widest ml-1">Operational Intel</Label>
                  <Textarea name="notes" rows={3} placeholder="ENTER CONTEXTUAL OVERVIEW OR SYSTEM OBSERVATIONS..." className="resize-none rounded-2xl border-app-border bg-app-mono-bg/5 focus:bg-white transition-all font-black uppercase tracking-tight text-[13px] p-6 shadow-inner" />
                </div>
              </div>
            </section>
          </form>
        </div>

        {/* Fixed Control Footer */}
        <div className="p-10 pt-8 border-t border-app-border/50 bg-app-mono-bg/10 flex items-center justify-between gap-6 backdrop-blur-md">
          <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-[11px] font-black text-app-text-sub/40 uppercase tracking-widest hover:text-app-text-main transition-all group">
            <span className="group-hover:translate-x-[-4px] transition-transform mr-2">{"<"}</span> [ ABORT_COMMAND ]
          </Button>
          <Button 
            type="submit" 
            form="add-candidate-form"
            disabled={isPending} 
            className="bg-app-text-main text-app-bg hover:bg-app-accent font-black h-16 px-12 rounded-2xl uppercase tracking-[0.2em] text-[12px] shadow-2xl shadow-app-accent/20 transition-all border-none active:scale-95"
          >
            {isPending ? "INGESTING..." : "EXECUTE_DEPLOYMENT //"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
