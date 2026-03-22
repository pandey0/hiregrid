"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { invitePanelist } from "@/actions/panelists";
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

export default function InvitePanelistForm({
  programId,
  rounds,
}: {
  programId: number;
  rounds: { id: number; name: string; roundNumber: number }[];
}) {
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const form = e.currentTarget;

    startTransition(async () => {
      try {
        await invitePanelist(fd);
        toast.success("Interviewer deployment successful");
        form.reset();
      } catch (err: unknown) {
        const error = err as Error;
        toast.error(error.message || "Failed to invite interviewer");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <input type="hidden" name="programId" value={programId} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-2">
          <Label className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Identity Name</Label>
          <Input 
            name="name" 
            required 
            placeholder="ENTER NAME" 
            className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold uppercase tracking-widest placeholder:text-slate-200" 
          />
        </div>
        
        <div className="space-y-2">
          <Label className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Network Email</Label>
          <Input 
            name="email" 
            type="email" 
            required 
            placeholder="PERSON@COMPANY.COM" 
            className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold uppercase tracking-widest placeholder:text-slate-200" 
          />
        </div>

        <div className="space-y-2">
          <Label className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Target Stage</Label>
          <Select name="roundId" defaultValue={String(rounds[0]?.id)}>
            <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold uppercase tracking-widest">
              <SelectValue placeholder="SELECT ROUND" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
              {rounds.map((r) => (
                <SelectItem key={r.id} value={String(r.id)} className="py-3 px-4 font-bold text-[12px] uppercase tracking-wider">
                  R{r.roundNumber} // {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          type="submit" 
          disabled={isPending} 
          className="h-14 px-12 rounded-2xl bg-slate-900 hover:bg-blue-600 text-white font-black uppercase tracking-widest text-[12px] shadow-xl shadow-slate-200 transition-all active:scale-95"
        >
          {isPending ? "INITIALIZING..." : "DEPLOY INTERVIEWER //"}
        </Button>
      </div>
    </form>
  );
}
