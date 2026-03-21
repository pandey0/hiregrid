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
        toast.success("Resume URL saved");
        setEditing(false);
      } catch {
        toast.error("Failed to save");
      }
    });
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1 min-w-40">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="h-6 text-xs px-2"
          autoFocus
          onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
        />
        <Button size="sm" onClick={save} disabled={isPending} className="h-6 text-xs px-2">Save</Button>
        <Button variant="ghost" size="sm" onClick={() => setEditing(false)} className="h-6 text-xs px-1">✕</Button>
      </div>
    );
  }

  if (resumeUrl) {
    return (
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-600 underline underline-offset-2 hover:text-zinc-900"
            >
              View
            </a>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs break-all text-xs">{resumeUrl}</TooltipContent>
        </Tooltip>
        <Button variant="ghost" size="sm" onClick={() => setEditing(true)} className="h-5 w-5 p-0 text-[10px] text-zinc-300 hover:text-zinc-600">
          ✎
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setEditing(true)}
      className="h-6 text-xs text-zinc-300 hover:text-zinc-600 px-1"
    >
      + Add
    </Button>
  );
}
