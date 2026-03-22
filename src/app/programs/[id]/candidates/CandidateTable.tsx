"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { bulkShortlistAndActivate, bulkRejectCandidates } from "@/actions/candidates";
import { toast } from "sonner";
import ResumeCell from "./ResumeCell";
import CandidateActions from "./CandidateActions";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; dot: string; className: string }> = {
  SCREENING:   { label: "Screening",   dot: "bg-purple-500", className: "bg-purple-50 text-purple-700 border-purple-100" },
  DRAFT:       { label: "Draft",       dot: "bg-slate-400",  className: "bg-slate-50 text-slate-600 border-slate-100" },
  SHORTLISTED: { label: "Shortlisted", dot: "bg-amber-500",  className: "bg-amber-50 text-amber-700 border-amber-100" },
  ACTIVE:      { label: "Active",      dot: "bg-blue-500",   className: "bg-blue-50 text-blue-700 border-blue-100" },
  BOOKED:      { label: "Booked",      dot: "bg-emerald-500", className: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  COMPLETED:   { label: "Completed",   dot: "bg-slate-600",  className: "bg-slate-100 text-slate-800 border-slate-200" },
  REJECTED:    { label: "Rejected",    dot: "bg-rose-500",   className: "bg-rose-50 text-rose-700 border-rose-100" },
};

type Round = { id: number; name: string; roundNumber: number };
type Candidate = {
  id: number;
  programId: number;
  name: string;
  email: string;
  status: string;
  currentRole?: string | null;
  currentCompany?: string | null;
  atsScore?: number | null;
  resumeUrl: string | null;
  activeRound?: { name: string } | null;
  source?: string;
};

export default function CandidateTable({ 
  candidates, 
  rounds 
}: { 
  candidates: Candidate[], 
  rounds: Round[] 
}) {
  const [selected, setSelected] = useState<number[]>([]);
  const [isPending, startTransition] = useTransition();

  const toggleAll = () => {
    if (selected.length === candidates.length) {
      setSelected([]);
    } else {
      setSelected(candidates.map(c => c.id));
    }
  };

  const toggleOne = (id: number) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkActivate = (roundId: number) => {
    startTransition(async () => {
      try {
        await bulkShortlistAndActivate(selected, roundId);
        toast.success(`Activated ${selected.length} candidates`);
        setSelected([]);
      } catch (err: unknown) {
        const error = err as Error;
        toast.error(error.message || "Bulk action failed");
      }
    });
  };

  const handleBulkReject = () => {
    startTransition(async () => {
      try {
        await bulkRejectCandidates(selected);
        toast.success(`Rejected ${selected.length} candidates`);
        setSelected([]);
      } catch (err: unknown) {
        const error = err as Error;
        toast.error(error.message || "Bulk action failed");
      }
    });
  };

  return (
    <div className="space-y-4">
      {selected.length > 0 && (
        <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300 shadow-lg">
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-bold">{selected.length} selected</span>
            <div className="h-4 w-px bg-slate-700" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" disabled={isPending} className="text-white hover:bg-slate-800 font-bold h-8">
                  Move to Round...
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 rounded-xl border-slate-800 bg-slate-900 text-white shadow-2xl">
                <DropdownMenuLabel className="text-slate-400 text-[11px] uppercase tracking-widest px-3 py-2">Select Target Round</DropdownMenuLabel>
                {rounds.map((r) => (
                  <DropdownMenuItem 
                    key={r.id} 
                    onClick={() => handleBulkActivate(r.id)}
                    className="focus:bg-blue-600 focus:text-white rounded-lg mx-1 cursor-pointer py-2"
                  >
                    Round {r.roundNumber}: {r.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBulkReject}
              disabled={isPending}
              className="text-rose-400 hover:text-rose-300 hover:bg-rose-950 font-bold h-8"
            >
              Reject All
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setSelected([])} className="text-slate-400 hover:text-white h-8">
            Cancel
          </Button>
        </div>
      )}

      <div className="border-slate-200/60 rounded-[24px] shadow-sm overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="w-12 px-6">
                <Checkbox 
                  checked={selected.length === candidates.length && candidates.length > 0}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-widest text-slate-400 h-10 px-4">Candidate</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-widest text-slate-400 h-10 px-4">Experience</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-widest text-slate-400 h-10 px-4 text-center">ATS</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-widest text-slate-400 h-10 px-4">Status</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-widest text-slate-400 h-10 px-4">Round</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-widest text-slate-400 h-10 px-4">Resume</TableHead>
              <TableHead className="h-10 px-6"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.map((c) => {
              const cfg = statusConfig[c.status] ?? { label: c.status, dot: "bg-slate-400", className: "bg-slate-50 text-slate-600" };
              const score = c.atsScore !== null && c.atsScore !== undefined ? Math.round(c.atsScore) : null;
              
              return (
                <TableRow key={c.id} className={cn(
                  "group transition-colors border-slate-100",
                  selected.includes(c.id) ? "bg-blue-50/30" : "hover:bg-slate-50/50"
                )}>
                  <TableCell className="px-6">
                    <Checkbox 
                      checked={selected.includes(c.id)}
                      onCheckedChange={() => toggleOne(c.id)}
                    />
                  </TableCell>
                  <TableCell className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs uppercase shrink-0">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <Link href={`/programs/${c.programId}/candidates/${c.id}`} className="block group/name">
                          <p className="font-bold text-slate-900 text-[14px] leading-tight group-hover/name:text-blue-600 transition-colors">{c.name}</p>
                        </Link>
                        <p className="text-[12px] text-slate-500 mt-0.5">{c.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4">
                    {c.currentRole || c.currentCompany ? (
                      <div>
                        {c.currentRole && <p className="text-[13px] font-semibold text-slate-700 leading-tight">{c.currentRole}</p>}
                        {c.currentCompany && <p className="text-[11px] text-slate-400 mt-0.5">{c.currentCompany}</p>}
                      </div>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 text-center">
                    {score !== null ? (
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-slate-100 bg-slate-50">
                        <span className={cn(
                          "text-[11px] font-bold tabular-nums",
                          score > 80 ? "text-emerald-600" : score > 60 ? "text-blue-600" : "text-amber-600"
                        )}>{score}</span>
                      </div>
                    ) : (
                      <span className="text-slate-300 text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4">
                    <Badge className={cn("text-[11px] font-bold tracking-tight px-2 h-6 border shadow-none", cfg.className)}>
                      <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5 shrink-0", cfg.dot)} />
                      {cfg.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500 text-[13px] font-medium px-4">
                    {c.activeRound?.name ?? <span className="text-slate-300">—</span>}
                  </TableCell>
                  <TableCell className="px-4">
                    <ResumeCell candidateId={c.id} resumeUrl={c.resumeUrl} />
                  </TableCell>
                  <TableCell className="px-6 text-right">
                    <CandidateActions candidateId={c.id} status={c.status} rounds={rounds} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
