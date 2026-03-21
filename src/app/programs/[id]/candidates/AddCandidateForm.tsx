"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { addCandidate } from "@/actions/candidates";

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
      <div>
        <label className="block text-xs font-medium text-zinc-600 mb-1.5">Full name</label>
        <input
          name="name"
          required
          placeholder="Jane Smith"
          className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-md placeholder:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-600 mb-1.5">Email</label>
        <input
          name="email"
          type="email"
          required
          placeholder="candidate@email.com"
          className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-md placeholder:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
      </div>
      <div className="flex items-end">
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2 px-4 bg-zinc-900 text-white text-sm font-medium rounded-md hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          {isPending ? "Adding..." : "Add candidate"}
        </button>
      </div>
    </form>
  );
}
