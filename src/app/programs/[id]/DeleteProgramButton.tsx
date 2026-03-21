"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { deleteProgram } from "@/actions/programs";

export default function DeleteProgramButton({ programId }: { programId: number }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Delete this program? This cannot be undone.")) return;
    startTransition(async () => {
      try {
        await deleteProgram(programId);
      } catch (err: any) {
        if (!err?.message?.includes("NEXT_REDIRECT")) {
          toast.error(err?.message || "Failed to delete");
        }
      }
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-xs text-zinc-300 hover:text-red-400 transition-colors disabled:opacity-50"
    >
      {isPending ? "Deleting..." : "Delete program"}
    </button>
  );
}
