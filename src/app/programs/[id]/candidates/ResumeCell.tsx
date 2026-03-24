"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateCandidateResume } from "@/actions/candidates";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UploadButton } from "@/lib/uploadthing";
import { FileText, Plus, CheckCircle2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ResumeCell({ 
  candidateId, 
  resumeUrl, 
  resumeKey 
}: { 
  candidateId: number; 
  resumeUrl: string | null;
  resumeKey: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleUploadComplete(url: string, key: string) {
    startTransition(async () => {
      try {
        await updateCandidateResume(candidateId, url, key);
        toast.success("Artifact synchronized");
        setEditing(false);
      } catch {
        toast.error("Protocol failed");
      }
    });
  }

  if (editing) {
    return (
      <div className="flex items-center gap-3 min-w-48 animate-in fade-in zoom-in-95 duration-200">
        <UploadButton
          endpoint="resumeUploader"
          onClientUploadComplete={(res) => {
            handleUploadComplete(res[0].url, res[0].key);
          }}
          onUploadError={(error: Error) => {
            toast.error(`Upload failed: ${error.message}`);
          }}
          appearance={{
            button: "ut-ready:bg-app-accent ut-uploading:cursor-not-allowed bg-app-text-main text-app-bg font-black uppercase tracking-widest text-[9px] h-9 px-4 rounded-xl border-none shadow-lg shadow-app-accent/10 transition-all",
            allowedContent: "hidden",
          }}
        />
        <button 
          onClick={() => setEditing(false)} 
          className="text-[10px] font-black text-rose-600/40 hover:text-rose-600 uppercase tracking-widest p-2 transition-colors"
        >
          [ X ]
        </button>
      </div>
    );
  }

  if (resumeUrl) {
    return (
      <div className="flex items-center gap-4 group/cell">
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[11px] font-black text-app-text-main uppercase tracking-[0.2em] hover:text-app-accent transition-all underline decoration-app-border hover:decoration-app-accent underline-offset-4"
            >
              <FileText className="w-3.5 h-3.5 opacity-40 group-hover/cell:opacity-100 transition-opacity" />
              SOURCE //
            </a>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs break-all font-mono text-[9px] bg-app-text-main text-app-bg rounded-xl p-3 border-none shadow-2xl">
            <span className="text-app-accent block mb-1">STAGED_ARTIFACT</span>
            {resumeKey || resumeUrl}
          </TooltipContent>
        </Tooltip>
        <button 
          onClick={() => setEditing(true)} 
          className="opacity-0 group-hover/cell:opacity-100 text-[9px] font-black text-app-text-sub/40 hover:text-app-text-main uppercase tracking-widest transition-all"
        >
          [ UPDATE ]
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="flex items-center gap-2 text-[11px] font-black text-app-accent/40 hover:text-app-accent uppercase tracking-[0.2em] transition-all group"
    >
      <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" />
      DEPLOY ARTIFACT
    </button>
  );
}
