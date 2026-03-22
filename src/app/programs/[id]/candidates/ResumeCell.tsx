"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateCandidateResume } from "@/actions/candidates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ResumeCell({ candidateId, resumeUrl }: { candidateId: number; resumeUrl: string | null }) {
  const [editing, setEditing] = useState(false);
  const [url, setUrl] = useState(resumeUrl ?? "");
  const [isPending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      try {
        await updateCandidateResume(candidateId, url);
        toast.success("Artifact updated");
        setEditing(false);
      } catch {
        toast.error("Process failed");
      }
    });
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2 min-w-48">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="SOURCE URL"
          className="h-8 rounded-lg font-mono text-[10px] font-bold uppercase tracking-widest px-3 border-slate-200"
          autoFocus
          onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
        />
        <button onClick={save} disabled={isPending} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline whitespace-nowrap">
          SAVE
        </button>
        <button onClick={() => setEditing(false)} className="text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-slate-900 whitespace-nowrap">
          [X]
        </button>
      </div>
    );
  }

  if (resumeUrl) {
    return (
      <div className="flex items-center gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] hover:text-blue-600 transition-colors underline decoration-slate-200 underline-offset-4"
            >
              SOURCE //
            </a>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs break-all font-mono text-[10px] bg-slate-900 text-white rounded-lg p-3">
            {resumeUrl}
          </TooltipContent>
        </Tooltip>
        <button 
          onClick={() => setEditing(true)} 
          className="text-[10px] font-black text-slate-300 hover:text-slate-900 uppercase tracking-widest"
        >
          EDIT
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="text-[11px] font-black text-blue-600/40 hover:text-blue-600 uppercase tracking-[0.2em] transition-colors"
    >
      + ADD ARTIFACT
    </button>
  );
}
