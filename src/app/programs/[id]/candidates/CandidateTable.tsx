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
import { Button } from "@/components/ui/button";

const statusConfig: Record<string, { label: string; color: string }> = {
  SCREENING:   { label: "[ SCREENING ]",   color: "text-purple-600 dark:text-purple-400" },
  DRAFT:       { label: "[ DRAFT ]",       color: "text-slate-400 dark:text-slate-500" },
  SHORTLISTED: { label: "[ SHORTLIST ]",   color: "text-amber-600 dark:text-amber-400" },
  ACTIVE:      { label: "[ ACTIVE ]",      color: "text-blue-600 dark:text-blue-400" },
  BOOKED:      { label: "[ BOOKED ]",      color: "text-emerald-600 dark:text-emerald-400" },
  COMPLETED:   { label: "[ FINISHED ]",    color: "text-slate-900 dark:text-white" },
  REJECTED:    { label: "[ REJECTED ]",    color: "text-rose-600 dark:text-rose-400" },
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
    <div className="space-y-6 transition-colors duration-500">
      {selected.length > 0 && (
        <div className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-8 py-4 rounded-3xl flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500 shadow-2xl shadow-slate-200 dark:shadow-none border-none">
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Selection</span>
              <span className="text-[15px] font-black">{selected.length.toString().padStart(2, '0')} // CANDIDATES</span>
            </div>
            
            <div className="h-8 w-px bg-slate-800 dark:bg-slate-200" />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" disabled={isPending} className="text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 font-black h-10 px-6 rounded-xl uppercase tracking-widest text-[11px] border-none">
                  Deploy to Round ->
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 rounded-2xl border-slate-800 dark:border-slate-200 bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl p-2">
                <DropdownMenuLabel className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.3em] px-4 py-3">Architecture Path</DropdownMenuLabel>
                {rounds.map((r) => (
                  <DropdownMenuItem 
                    key={r.id} 
                    onClick={() => handleBulkActivate(r.id)}
                    className="focus:bg-blue-600 focus:text-white rounded-xl cursor-pointer py-3 px-4 font-bold text-[12px] uppercase tracking-wider"
                  >
                    R{r.roundNumber} // {r.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="ghost" 
              onClick={handleBulkReject}
              disabled={isPending}
              className="text-rose-400 dark:text-rose-600 hover:text-rose-300 dark:hover:text-rose-700 hover:bg-rose-950/50 dark:hover:bg-rose-50 font-black h-10 px-6 rounded-xl uppercase tracking-widest text-[11px] border-none"
            >
              Terminate Flow
            </Button>
          </div>
          <button onClick={() => setSelected([])} className="text-slate-500 dark:text-slate-400 hover:text-white dark:hover:text-slate-900 font-bold uppercase tracking-widest text-[10px]">
            [ DISMISS ]
          </button>
        </div>
      )}

      <div className="rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900/50">
        <Table>
          <TableHeader className="bg-slate-50/30 dark:bg-slate-900/50">
            <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800 h-16">
              <TableHead className="w-16 px-8">
                <Checkbox 
                  checked={selected.length === candidates.length && candidates.length > 0}
                  onCheckedChange={toggleAll}
                  className="rounded-md border-slate-300 dark:border-slate-700"
                />
              </TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 px-4">Identify // Path</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 px-4">Role // Experience</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 px-4 text-center">Score</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 px-4">Status</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 px-4">Active Stage</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 px-4">Artifacts</TableHead>
              <TableHead className="w-20 px-8"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.map((c) => {
              const cfg = statusConfig[c.status] ?? { label: `[ ${c.status} ]`, color: "text-slate-400 dark:text-slate-500" };
              const score = c.atsScore !== null && c.atsScore !== undefined ? Math.round(c.atsScore) : null;
              
              return (
                <TableRow key={c.id} className={cn(
                  "group transition-all duration-500 border-slate-50 dark:border-slate-800 h-24",
                  selected.includes(c.id) ? "bg-blue-50/20 dark:bg-blue-900/10" : "hover:bg-slate-50/30 dark:hover:bg-slate-900/30"
                )}>
                  <TableCell className="px-8">
                    <Checkbox 
                      checked={selected.includes(c.id)}
                      onCheckedChange={() => toggleOne(c.id)}
                      className="rounded-md border-slate-200 dark:border-slate-800"
                    />
                  </TableCell>
                  <TableCell className="px-4">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-black text-sm uppercase shrink-0 shadow-lg shadow-slate-100 dark:shadow-none transition-colors">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <Link href={`/programs/${c.programId}/candidates/${c.id}`} className="block group/name">
                          <p className="font-bold text-slate-900 dark:text-white text-[16px] tracking-tight group-hover/name:text-blue-600 dark:group-hover/name:text-blue-400 transition-colors leading-none">{c.name}</p>
                        </Link>
                        <p className="font-mono text-[11px] font-bold text-slate-400 dark:text-slate-500 mt-1.5 uppercase tracking-tighter">{c.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4">
                    {c.currentRole || c.currentCompany ? (
                      <div className="space-y-1">
                        {c.currentRole && <p className="text-[14px] font-bold text-slate-700 dark:text-slate-300 leading-tight">{c.currentRole}</p>}
                        {c.currentCompany && <p className="font-mono text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{c.currentCompany}</p>}
                      </div>
                    ) : (
                      <span className="font-mono text-[10px] text-slate-200 dark:text-slate-800 font-bold uppercase tracking-widest">[ NO DATA ]</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 text-center">
                    {score !== null ? (
                      <div className="flex flex-col items-center">
                        <span className={cn(
                          "text-xl font-black tabular-nums tracking-tighter",
                          score > 80 ? "text-emerald-600 dark:text-emerald-400" : score > 60 ? "text-blue-600 dark:text-blue-400" : "text-amber-600 dark:text-amber-400"
                        )}>{score.toString().padStart(2, '0')}</span>
                        <span className="font-mono text-[8px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest mt-0.5">MATCH</span>
                      </div>
                    ) : (
                      <span className="font-mono text-[10px] text-slate-200 dark:text-slate-800 font-bold uppercase tracking-widest">[ -- ]</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4">
                    <span className={cn("font-mono text-[11px] font-black tracking-tighter uppercase whitespace-nowrap", cfg.color)}>
                      {cfg.label}
                    </span>
                  </TableCell>
                  <TableCell className="px-4">
                    <div className="flex items-center gap-2">
                      {c.activeRound ? (
                        <>
                          <div className="w-1 h-4 bg-slate-900 dark:bg-slate-100 rounded-full transition-colors" />
                          <span className="font-bold text-slate-900 dark:text-white text-[13px] tracking-tight uppercase">
                            {c.activeRound.name}
                          </span>
                        </>
                      ) : (
                        <span className="font-mono text-[10px] text-slate-200 dark:text-slate-800 font-bold uppercase tracking-widest">[ UNASSIGNED ]</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4">
                    <ResumeCell candidateId={c.id} resumeUrl={c.resumeUrl} />
                  </TableCell>
                  <TableCell className="px-8 text-right">
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
