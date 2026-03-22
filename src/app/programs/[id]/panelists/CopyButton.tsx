"use client";

import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard?.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={handleCopy}
          className="text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors"
        >
          {copied ? "[ COPIED ]" : "COPY LINK //"}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs break-all font-mono text-[10px] bg-slate-900 text-white rounded-lg p-3">
        {value}
      </TooltipContent>
    </Tooltip>
  );
}
