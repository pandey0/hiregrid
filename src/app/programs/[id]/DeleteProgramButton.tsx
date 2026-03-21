"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { deleteProgram } from "@/actions/programs";
import { Button } from "@/components/ui/button";

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
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={isPending}
      className="text-zinc-400 hover:text-red-500 hover:bg-red-50"
    >
      {isPending ? "Deleting..." : "Delete program"}
    </Button>
  );
}
