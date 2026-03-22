"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveAvailability } from "@/actions/panelists";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to save");
      }
    });
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="slot-date">Date</Label>
          <Input
            id="slot-date"
            type="date"
            min={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slot-time">
            Start time (slot ends {durationMinutes} min later)
          </Label>
          <Input
            id="slot-time"
            type="time"
            step="900"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
      </div>

      <Button type="button" variant="outline" onClick={addSlot}>
        + Add this slot
      </Button>

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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSlot(slot.start)}
                  className="text-xs h-7 text-zinc-300 hover:text-red-500 hover:bg-red-50"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
        <p className="text-xs text-zinc-400">
          {saved
            ? "Availability saved."
            : slots.length === 0
            ? "No slots added yet."
            : `${slots.length} slot${slots.length !== 1 ? "s" : ""} pending save.`}
        </p>
        <Button onClick={handleSave} disabled={isPending || slots.length === 0}>
          {isPending ? "Saving..." : "Save availability"}
        </Button>
      </div>
    </div>
  );
}
