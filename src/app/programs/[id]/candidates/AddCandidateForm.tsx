"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { addCandidate } from "@/actions/candidates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

export default function AddCandidateForm({ programId }: { programId: number }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

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
        setOpen(false);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to add candidate");
      }
    });
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        + Add candidate manually
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Full name <span className="text-red-400">*</span></Label>
          <Input name="name" required placeholder="Jane Smith" />
        </div>
        <div className="space-y-1.5">
          <Label>Email <span className="text-red-400">*</span></Label>
          <Input name="email" type="email" required placeholder="jane@example.com" />
        </div>
        <div className="space-y-1.5">
          <Label>Phone</Label>
          <Input name="phone" placeholder="+1 555 000 0000" />
        </div>
        <div className="space-y-1.5">
          <Label>LinkedIn URL</Label>
          <Input name="linkedIn" placeholder="https://linkedin.com/in/jane" />
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label>Current role</Label>
          <Input name="currentRole" placeholder="Senior Engineer" />
        </div>
        <div className="space-y-1.5">
          <Label>Current company</Label>
          <Input name="currentCompany" placeholder="Acme Corp" />
        </div>
        <div className="space-y-1.5">
          <Label>Years of experience</Label>
          <Input name="yearsExperience" type="number" min="0" max="50" placeholder="5" />
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Resume (PDF)</Label>
          <Input name="resume" type="file" accept=".pdf" />
          <p className="text-[11px] text-zinc-400">Upload PDF for AI-powered scoring</p>
        </div>
        <div className="space-y-1.5">
          <Label>Notes</Label>
          <Textarea name="notes" rows={2} placeholder="Any recruiter notes..." className="resize-none" />
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)} className="text-zinc-400">
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Adding..." : "Add candidate"}
        </Button>
      </div>
    </form>
  );
}
