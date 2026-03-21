"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createProgram } from "@/actions/programs";

type Round = {
  name: string;
  durationMinutes: number;
  roundType: "ATS_SCREENING" | "HUMAN_INTERVIEW" | "ASSIGNMENT";
  description: string;
};

const defaultRound = (): Round => ({
  name: "",
  durationMinutes: 60,
  roundType: "HUMAN_INTERVIEW",
  description: "",
});

const roundTypeLabels = {
  ATS_SCREENING: "ATS / Auto screening",
  HUMAN_INTERVIEW: "Human interview",
  ASSIGNMENT: "Assignment",
};

export default function CreateProgramForm() {
  const [rounds, setRounds] = useState<Round[]>([defaultRound()]);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function updateRound(index: number, field: keyof Round, value: string | number) {
    setRounds((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  }

  function addRound() {
    setRounds((prev) => [...prev, defaultRound()]);
  }

  function removeRound(index: number) {
    if (rounds.length === 1) return;
    setRounds((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    for (let i = 0; i < rounds.length; i++) {
      if (!rounds[i].name.trim()) {
        toast.error(`Round ${i + 1} needs a name`);
        return;
      }
    }

    fd.append("rounds", JSON.stringify(rounds));

    startTransition(async () => {
      try {
        await createProgram(fd);
      } catch (err: any) {
        if (!err?.message?.includes("NEXT_REDIRECT")) {
          toast.error(err?.message || "Failed to create program");
        }
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white border border-zinc-200 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1.5">Program name</label>
          <input
            name="name"
            required
            placeholder="e.g. Senior Frontend Engineer Hiring Drive"
            className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-md placeholder:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1.5">Description</label>
          <textarea
            name="description"
            rows={2}
            placeholder="What is this program for?"
            className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-md placeholder:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 resize-none"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">Rounds</p>
          <button
            type="button"
            onClick={addRound}
            className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            + Add round
          </button>
        </div>

        <div className="space-y-3">
          {rounds.map((round, index) => (
            <div
              key={index}
              className="bg-white border border-zinc-200 rounded-xl p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-medium">Round {index + 1}</span>
                {rounds.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRound(index)}
                    className="text-xs text-zinc-300 hover:text-red-400 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1.5">Round name</label>
                  <input
                    value={round.name}
                    onChange={(e) => updateRound(index, "name", e.target.value)}
                    placeholder="e.g. Technical Interview"
                    className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-md placeholder:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1.5">Type</label>
                  <select
                    value={round.roundType}
                    onChange={(e) => updateRound(index, "roundType", e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500"
                  >
                    {Object.entries(roundTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {round.roundType !== "ATS_SCREENING" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1.5">Duration (minutes)</label>
                    <select
                      value={round.durationMinutes}
                      onChange={(e) => updateRound(index, "durationMinutes", parseInt(e.target.value))}
                      className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500"
                    >
                      {[30, 45, 60, 75, 90, 120].map((m) => (
                        <option key={m} value={m}>
                          {m} min
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1.5">Description (optional)</label>
                    <input
                      value={round.description}
                      onChange={(e) => updateRound(index, "description", e.target.value)}
                      placeholder="Optional notes"
                      className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-md placeholder:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2 bg-zinc-900 text-white text-sm font-medium rounded-md hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          {isPending ? "Creating..." : "Create program"}
        </button>
      </div>
    </form>
  );
}
