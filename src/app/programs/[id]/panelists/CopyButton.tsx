"use client";

import { Button } from "@/components/ui/button";

export default function CopyButton({ value }: { value: string }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => {
        navigator.clipboard?.writeText(value);
      }}
      title={value}
      className="text-xs h-7 px-2 text-zinc-400 hover:text-zinc-700"
    >
      Copy link
    </Button>
  );
}
