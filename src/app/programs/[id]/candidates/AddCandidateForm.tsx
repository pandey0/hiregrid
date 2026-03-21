"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { addCandidate } from "@/actions/candidates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AddCandidateForm({ programId }: { programId: number }) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.append("programId", String(programId));
    const form = e.currentTarget;

    startTransition(async () => {
      try {
        await addCandidate(fd);
        toast.success("Candidate added");
        form.reset();
      } catch (err: any) {
        toast.error(err?.message || "Failed to add candidate");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div className="space-y-1.5">
        <Label>Full name</Label>
        <Input name="name" required placeholder="Jane Smith" />
      </div>
      <div className="space-y-1.5">
        <Label>Email</Label>
        <Input name="email" type="email" required placeholder="candidate@email.com" />
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Adding..." : "Add candidate"}
        </Button>
      </div>
    </form>
  );
}
