"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveAvailability } from "@/actions/panelists";

type Slot = { start: string; end: string };

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export default function AvailabilityGrid({
  token,
  durationMinutes,
  existingSlots,
}: {
  token: string;
  durationMinutes: number;
  existingSlots: Slot[];
}) {
  const [slots, setSlots] = useState<Slot[]>(existingSlots);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function addSlot() {
    if (!date || !startTime) {
      toast.error("Pick a date and start time first");
      return;
    }
    const start = new Date(`${date}T${startTime}:00`);
    if (isNaN(start.getTime())) {
      toast.error("Invalid date/time");
      return;
    }
    const end = addMinutes(start, durationMinutes);
    const startIso = start.toISOString();
    const endIso = end.toISOString();

    if (slots.some((s) => s.start === startIso)) {
      toast.error("Slot already added");
      return;
    }

    setSlots((prev) => [...prev, { start: startIso, end: endIso }].sort((a, b) => a.start.localeCompare(b.start)));
    setSaved(false);
  }

  function removeSlot(startIso: string) {
    setSlots((prev) => prev.filter((s) => s.start !== startIso));
    setSaved(false);
  }

  function handleSave() {
    startTransition(async () => {
      try {
        await saveAvailability(token, slots);
        setSaved(true);
        toast.success("Availability saved — thank you!");
      } catch (err: any) {
        toast.error(err?.message || "Failed to save");
      }
    });
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1.5">Date</label>
          <input
            type="date"
            min={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1.5">
            Start time (slot ends {durationMinutes} min later)
          </label>
          <input
            type="time"
            step="900"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={addSlot}
        className="text-sm text-zinc-500 hover:text-zinc-900 border border-zinc-200 rounded-md px-4 py-2 hover:border-zinc-400 transition-colors"
      >
        + Add this slot
      </button>

      {slots.length > 0 && (
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 mb-3">
            Your slots ({slots.length})
          </p>
          <div className="space-y-1.5">
            {slots.map((slot) => (
              <div
                key={slot.start}
                className="flex items-center justify-between px-4 py-2.5 bg-zinc-50 border border-zinc-100 rounded-lg"
              >
                <div>
                  <p className="text-sm text-zinc-900">{formatDateTime(slot.start)}</p>
                  <p className="text-xs text-zinc-400">→ {formatDateTime(slot.end)}</p>
                </div>
                <button
                  onClick={() => removeSlot(slot.start)}
                  className="text-xs text-zinc-300 hover:text-red-400 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
        <p className="text-xs text-zinc-400">
          {saved ? "Availability saved." : slots.length === 0 ? "No slots added yet." : `${slots.length} slot${slots.length !== 1 ? "s" : ""} pending save.`}
        </p>
        <button
          onClick={handleSave}
          disabled={isPending || slots.length === 0}
          className="px-5 py-2 bg-zinc-900 text-white text-sm font-medium rounded-md hover:bg-zinc-800 transition-colors disabled:opacity-40"
        >
          {isPending ? "Saving..." : "Save availability"}
        </button>
      </div>
    </div>
  );
}
