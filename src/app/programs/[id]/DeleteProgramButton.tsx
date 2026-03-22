"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { deleteProgram } from "@/actions/programs";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function DeleteProgramButton({ programId }: { programId: number }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteProgram(programId);
      } catch (err: unknown) {
        if (err instanceof Error && !err.message.includes("NEXT_REDIRECT")) {
          toast.error(err.message);
        }
      }
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          className="text-zinc-400 hover:text-red-500 hover:bg-red-50"
        >
          {isPending ? "Deleting..." : "Delete program"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this program?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the program, all its rounds, panelists, and candidates. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
          >
            Delete program
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
