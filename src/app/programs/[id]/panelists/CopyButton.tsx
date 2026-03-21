"use client";

export default function CopyButton({ value }: { value: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(value);
      }}
      className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors underline underline-offset-2"
      title={value}
    >
      Copy link
    </button>
  );
}
