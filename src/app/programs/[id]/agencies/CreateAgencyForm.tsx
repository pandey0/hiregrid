"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { createAgency } from "@/actions/agencies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CreateAgencyForm({ programId }: { programId: number }) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.append("programId", String(programId));
    const form = e.currentTarget;

    startTransition(async () => {
      try {
        await createAgency(fd);
        toast.success("Agency created — copy their magic link from the table");
        form.reset();
      } catch (err: any) {
        toast.error(err?.message || "Failed to create agency");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
      <div className="space-y-1.5">
        <Label>Agency name</Label>
        <Input name="name" required placeholder="TalentFirst Agency" />
      </div>
      <div className="space-y-1.5">
        <Label>Contact person</Label>
        <Input name="contactPerson" placeholder="John Doe" />
      </div>
      <div className="space-y-1.5">
        <Label>Email</Label>
        <Input name="email" type="email" required placeholder="agency@example.com" />
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Creating..." : "Create agency"}
        </Button>
      </div>
    </form>
  );
}
