"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { confirmBooking } from "@/actions/candidates";
import { Button } from "@/components/ui/button";

type SlotEntry = { start: string; end: string };
type AvailableSlot = { panelistId: number; slot: SlotEntry };

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function BookingGrid({
  token,
  slots,
  durationMinutes,
}: {
  token: string;
  slots: AvailableSlot[];
  durationMinutes: number;
}) {
  const [selected, setSelected] = useState<AvailableSlot | null>(null);
  const [booked, setBooked] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    if (!selected) return;

    startTransition(async () => {
      try {
        await confirmBooking(token, selected.panelistId, selected.slot.start, selected.slot.end);
        setBooked(true);
        toast.success("Interview booked! Check your email for confirmation.");
      } catch (err: any) {
        toast.error(err?.message || "Failed to book. Please try again.");
      }
    });
  }

  if (booked) {
    return (
      <div className="text-center py-6">
        <p className="text-lg font-semibold text-zinc-900 mb-1">Booked!</p>
        <p className="text-sm text-zinc-400">
          Your interview has been confirmed. You&apos;ll receive a confirmation email shortly.
        </p>
        {selected && (
          <p className="text-sm text-zinc-600 mt-3 font-medium">{formatDateTime(selected.slot.start)}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {slots.map(({ panelistId, slot }) => {
          const key = `${panelistId}-${slot.start}`;
          const isSelected = selected?.slot.start === slot.start && selected?.panelistId === panelistId;
          return (
            <button
              key={key}
              onClick={() => setSelected({ panelistId, slot })}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                isSelected
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-200 hover:border-zinc-400 text-zinc-900"
              }`}
            >
              <p className={`text-sm font-medium ${isSelected ? "text-white" : "text-zinc-900"}`}>
                {formatDateTime(slot.start)}
              </p>
              <p className={`text-xs mt-0.5 ${isSelected ? "text-zinc-300" : "text-zinc-400"}`}>
                {durationMinutes} min
              </p>
            </button>
          );
        })}
      </div>

      <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
        <p className="text-xs text-zinc-400">
          {selected ? `Selected: ${formatDateTime(selected.slot.start)}` : "No slot selected"}
        </p>
        <Button onClick={handleConfirm} disabled={!selected || isPending}>
          {isPending ? "Booking..." : "Confirm booking"}
        </Button>
      </div>
    </div>
  );
}
