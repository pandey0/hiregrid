"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { confirmBooking, cancelBooking } from "@/actions/candidates";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type SlotEntry = { start: string; end: string };
type AvailableSlot = { panelistId: number; slot: SlotEntry };

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
  const [bookedBookingId, setBookedBookingId] = useState<number | null>(null);
  const [isOptimisticBooking, setIsOptimisticBooking] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  function handleConfirm() {
    if (!selected) return;

    // HG-008: Optimistic UI transition
    setIsOptimisticBooking(true);

    startTransition(async () => {
      try {
        const b = await confirmBooking(token, selected.panelistId, selected.slot.start, selected.slot.end);
        setBookedBookingId(b.id);
        toast.success("Interview booked!");
      } catch (err: unknown) {
        setIsOptimisticBooking(false); // Rollback on error
        toast.error(err instanceof Error ? err.message : "Failed to book. Please try again.");
      }
    });
  }

  function handleCancel() {
    if (!bookedBookingId) return;
    startTransition(async () => {
      try {
        const result = await cancelBooking(bookedBookingId);
        if (result?.newToken) {
          toast.success("Booking cancelled. You can now pick a new slot.");
          router.push(`/book/${result.newToken}`);
          setBookedBookingId(null);
          setSelected(null);
          setIsOptimisticBooking(false);
        } else {
          toast.error("Booking could not be cancelled or was already cancelled.");
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to cancel.");
      }
    });
  }

  if (bookedBookingId || isOptimisticBooking) {
    return (
      <div className="text-center py-12 animate-in fade-in duration-500">
        <div className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-700",
          bookedBookingId ? "bg-emerald-50 text-emerald-600 scale-110" : "bg-blue-50 text-blue-600 animate-pulse"
        )}>
          {bookedBookingId ? (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          {bookedBookingId ? "Interview Booked" : "Confirming Slot..."}
        </h2>
        <p className="text-slate-500 mb-8 max-w-sm mx-auto">
          {bookedBookingId 
            ? "Your session has been confirmed. You will receive a calendar invitation shortly."
            : "We're securing your spot in the calendar. Please don't close this page."}
        </p>
        {selected && (
          <div className="bg-slate-50 rounded-2xl p-4 inline-block border border-slate-100 mb-8">
            <p className="text-sm font-bold text-slate-900">{formatDateTime(selected.slot.start)}</p>
            <p className="text-xs text-slate-400 mt-1">{userTimezone}</p>
          </div>
        )}
        {bookedBookingId && (
          <div className="block">
            <Button 
              variant="ghost" 
              onClick={handleCancel}
              disabled={isPending}
              className="text-slate-400 hover:text-rose-600 font-bold"
            >
              {isPending ? "Processing..." : "Cancel / Reschedule Interview"}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <p className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">Available Slots</p>
        <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{userTimezone}</span>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {slots.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-[24px]">
            <p className="text-slate-400 font-medium">No slots available. Please contact the recruiter.</p>
          </div>
        ) : (
          slots.map(({ panelistId, slot }) => {
            const key = `${panelistId}-${slot.start}`;
            const isSelected = selected?.slot.start === slot.start && selected?.panelistId === panelistId;
            return (
              <button
                key={key}
                onClick={() => setSelected({ panelistId, slot })}
                className={cn(
                  "w-full text-left px-5 py-4 rounded-2xl border transition-all duration-200 group",
                  isSelected
                    ? "border-blue-600 bg-blue-50 shadow-md shadow-blue-100"
                    : "border-slate-200 hover:border-slate-400 bg-white"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={cn("text-[15px] font-bold", isSelected ? "text-blue-700" : "text-slate-900")}>
                      {formatDateTime(slot.start)}
                    </p>
                    <p className={cn("text-[12px] font-medium mt-0.5", isSelected ? "text-blue-500" : "text-slate-400")}>
                      {durationMinutes} minute session
                    </p>
                  </div>
                  {isSelected && <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>}
                </div>
              </button>
            );
          })
        )}
      </div>

      <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
        <div className="min-w-0">
          {selected ? (
            <div className="animate-in fade-in slide-in-from-left-2 duration-300">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Selected</p>
              <p className="text-[13px] font-bold text-slate-900 truncate">{formatDateTime(selected.slot.start)}</p>
            </div>
          ) : (
            <p className="text-[13px] font-medium text-slate-400 italic">Select a time to continue</p>
          )}
        </div>
        <Button 
          onClick={handleConfirm} 
          disabled={!selected || isPending}
          className="h-11 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200/50 transition-all active:scale-[0.98] shrink-0 font-bold"
        >
          {isPending ? "Confirming..." : "Confirm Booking"}
        </Button>
      </div>
    </div>
  );
}
