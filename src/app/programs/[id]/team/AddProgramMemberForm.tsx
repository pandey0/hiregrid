"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addProgramMember } from "@/actions/permissions";
import { toast } from "sonner";
import { UserPlus, Loader2 } from "lucide-react";

export default function AddProgramMemberForm({ 
  programId,
  availableUsers 
}: { 
  programId: number;
  availableUsers: { id: string; email: string; name: string }[];
}) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    const email = formData.get("email") as string;
    const role = formData.get("role") as "LEAD" | "HR";

    startTransition(async () => {
      try {
        await addProgramMember(programId, email, role);
        toast.success("Member added to program");
      } catch (err: unknown) {
        const error = err as Error;
        toast.error(error.message || "Failed to add member");
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-[13px] font-bold text-slate-700 ml-1">Select Staff Member</Label>
        <Select name="email" required>
          <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all font-medium">
            <SelectValue placeholder="Choose a member..." />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-slate-200 shadow-xl shadow-slate-900/5">
            {availableUsers.map((u) => (
              <SelectItem key={u.id} value={u.email} className="rounded-lg my-0.5">
                {u.name} ({u.email})
              </SelectItem>
            ))}
            {availableUsers.length === 0 && (
              <div className="p-4 text-center text-[12px] text-slate-400 italic">
                All organization members are already assigned to this program.
              </div>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role" className="text-[13px] font-bold text-slate-700 ml-1">Program Role</Label>
        <Select name="role" defaultValue="HR">
          <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all font-medium">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-slate-200 shadow-xl shadow-slate-900/5">
            <SelectItem value="LEAD" className="rounded-lg my-0.5">Program Lead (Full Control)</SelectItem>
            <SelectItem value="HR" className="rounded-lg my-0.5">Program HR (Operations Only)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button 
        type="submit" 
        disabled={isPending || availableUsers.length === 0}
        className="w-full bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200/50 rounded-xl h-11 font-bold transition-all mt-2"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
        Assign to Program
      </Button>
    </form>
  );
}
