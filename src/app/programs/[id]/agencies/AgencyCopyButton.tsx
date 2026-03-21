"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function AgencyCopyButton({ value }: { value: string }) {
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
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="text-xs h-7 px-2 text-zinc-400 hover:text-zinc-700"
        >
          {copied ? "Copied!" : "Copy link"}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs break-all text-xs">{value}</TooltipContent>
    </Tooltip>
  );
}
