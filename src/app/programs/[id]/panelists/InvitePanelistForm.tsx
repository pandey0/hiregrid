"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { invitePanelist } from "@/actions/panelists";

type Round = { id: number; name: string; roundNumber: number };

export default function InvitePanelistForm({
  programId,
  rounds,
}: {
  programId: number;
  rounds: Round[];
}) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.append("programId", String(programId));
    const form = e.currentTarget;

    startTransition(async () => {
      try {
        await invitePanelist(fd);
        toast.success("Panelist invited — copy their magic link from the table below");
        form.reset();
      } catch (err: any) {
        toast.error(err?.message || "Failed to invite panelist");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
      <div>
        <label className="block text-xs font-medium text-zinc-600 mb-1.5">Name</label>
        <input
          name="name"
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
          placeholder="panelist@company.com"
          className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-md placeholder:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-600 mb-1.5">Round</label>
        <select
          name="roundId"
          required
          className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-500"
        >
          {rounds.map((r) => (
            <option key={r.id} value={r.id}>
              {r.roundNumber}. {r.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-end">
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2 px-4 bg-zinc-900 text-white text-sm font-medium rounded-md hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          {isPending ? "Inviting..." : "Invite"}
        </button>
      </div>
    </form>
  );
}
