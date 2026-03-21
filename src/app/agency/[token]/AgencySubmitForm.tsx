"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { agencySubmitCandidate } from "@/actions/agencies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

export default function AgencySubmitForm({ token }: { token: string }) {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(0);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const form = e.currentTarget;

    startTransition(async () => {
      try {
        await agencySubmitCandidate(token, fd);
        toast.success("Candidate submitted for review");
        form.reset();
        setSubmitted((n) => n + 1);
      } catch (err: any) {
        toast.error(err?.message || "Failed to submit candidate");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {submitted > 0 && (
        <div className="bg-green-50 border border-green-100 rounded-lg px-4 py-2.5 text-sm text-green-700">
          {submitted} candidate{submitted !== 1 ? "s" : ""} submitted successfully.
        </div>
      )}

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
          <Label>Resume URL</Label>
          <Input name="resumeUrl" placeholder="https://drive.google.com/..." />
          <p className="text-[11px] text-zinc-400">Google Drive, Dropbox, or any public link</p>
        </div>
        <div className="space-y-1.5">
          <Label>Notes</Label>
          <Textarea name="notes" rows={2} placeholder="Additional notes about this candidate..." className="resize-none" />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Submitting..." : "Submit candidate"}
        </Button>
      </div>
    </form>
  );
}
