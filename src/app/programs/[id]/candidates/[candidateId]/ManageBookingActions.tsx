"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cancelBookingByRecruiter, reassignPanelist, markAsNoShow } from "@/actions/candidates";
import { toast } from "sonner";
import { MoreHorizontal, XCircle, UserPlus, Loader2, UserX } from "lucide-react";

export default function ManageBookingActions({ 
  bookingId, 
  currentPanelistId,
  availablePanelists 
}: { 
  bookingId: number; 
  currentPanelistId: number;
  availablePanelists: { id: number; externalName: string | null }[];
}) {
  const [isPending, startTransition] = useTransition();

  const handleCancel = () => {
    if (!confirm("Are you sure you want to cancel this interview? Both parties will be notified.")) return;
    startTransition(async () => {
      try {
        await cancelBookingByRecruiter(bookingId);
        toast.success("Interview cancelled");
      } catch (err: unknown) {
        const error = err as Error;
        toast.error(error.message || "Failed to cancel");
      }
    });
  };

  const handleReassign = (newPanelistId: number) => {
    startTransition(async () => {
      try {
        await reassignPanelist(bookingId, newPanelistId);
        toast.success("Interviewer reassigned");
      } catch (err: unknown) {
        const error = err as Error;
        toast.error(error.message || "Failed to reassign");
      }
    });
  };

  const handleNoShow = () => {
    if (!confirm("Mark this candidate as No-Show? This will archive the booking status.")) return;
    startTransition(async () => {
      try {
        await markAsNoShow(bookingId);
        toast.success("Marked as No-Show");
      } catch (err: unknown) {
        const error = err as Error;
        toast.error(error.message || "Failed to update status");
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={isPending} className="h-8 w-8 p-0 rounded-lg">
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreHorizontal className="w-4 h-4 text-slate-400" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-xl border-slate-200 shadow-xl">
        <DropdownMenuLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2">Manage Interview</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="px-2 py-1.5 text-[12px] font-bold text-slate-900">Reassign Interviewer</div>
        {availablePanelists
          .filter(p => p.id !== currentPanelistId)
          .map(p => (
            <DropdownMenuItem 
              key={p.id} 
              onClick={() => handleReassign(p.id)}
              className="text-[13px] rounded-lg mx-1 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 mr-2 text-slate-400" />
              {p.externalName || "Unnamed Panelist"}
            </DropdownMenuItem>
          ))}
        
        {availablePanelists.length <= 1 && (
          <div className="px-3 py-2 text-[11px] text-slate-400 italic">No other panelists available for this round</div>
        )}

        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleNoShow}
          className="text-amber-600 focus:text-amber-600 focus:bg-amber-50 text-[13px] rounded-lg mx-1 cursor-pointer font-bold"
        >
          <UserX className="w-3.5 h-3.5 mr-2" />
          Mark as No-Show
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={handleCancel}
          className="text-rose-600 focus:text-rose-600 focus:bg-rose-50 text-[13px] rounded-lg mx-1 cursor-pointer font-bold"
        >
          <XCircle className="w-3.5 h-3.5 mr-2" />
          Cancel Interview
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
