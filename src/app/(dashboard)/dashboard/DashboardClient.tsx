"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { 
  Plus, 
  Search, 
  LayoutGrid, 
  List, 
  ArrowUpRight, 
  AlertCircle,
  Clock,
  CheckCircle2,
  Users,
  Briefcase
} from "lucide-react";

type DashboardClientProps = {
  programs: any[];
  candidatesCount: number;
  bookingsCount: number;
  failedBookingsCount: number;
  completedBookings: number;
  userName: string;
};

export default function DashboardClient({
  programs,
  candidatesCount,
  bookingsCount,
  failedBookingsCount,
  completedBookings,
  userName,
}: DashboardClientProps) {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const filteredPrograms = useMemo(() => {
    return programs.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
    );
  }, [programs, search]);

  const stats = [
    { label: "Active Programs", value: programs.length, icon: Briefcase, color: "text-blue-600 bg-blue-500/10" },
    { label: "Total Supply", value: candidatesCount, icon: Users, color: "text-app-text-main bg-app-text-main/5" },
    { label: "Scheduled", value: bookingsCount, icon: Clock, color: "text-indigo-600 bg-indigo-500/10" },
    { label: "Completed", value: completedBookings, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-500/10" },
  ];

  return (
    <div className="page-container">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-app-accent/5 blur-[140px] rounded-full opacity-50 translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Urgent Action Layer */}
      {failedBookingsCount > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 p-6 rounded-[32px] bg-rose-500 text-white shadow-2xl shadow-rose-500/20 flex items-center justify-between"
        >
          <div className="flex items-center gap-4 text-left">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <div>
              <p className="font-black uppercase tracking-[0.2em] text-[10px]">Action Required // System Alert</p>
              <p className="text-sm font-medium opacity-90">{failedBookingsCount} calendar dispatches failed. Manual override recommended.</p>
            </div>
          </div>
          <Button asChild className="bg-white text-rose-600 hover:bg-white/90 font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-xl">
            <Link href="/bookings/failed">Resolve Discrepancies //</Link>
          </Button>
        </motion.div>
      )}

      {/* Hero Command Section - Strictly Left Anchored */}
      <header className="flex items-end justify-start gap-16 mb-24">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-3xl text-left"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="arch-mono-label px-3 py-1">Operational Overview</span>
            <span className="text-[10px] font-mono font-bold text-app-text-sub uppercase tracking-widest">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}
            </span>
          </div>
          <h1 className="text-7xl font-black text-app-text-main tracking-tighter leading-[0.85] mb-6">
            Hello, <span className="text-app-accent">{userName}</span>.
          </h1>
          <p className="text-xl font-medium text-app-text-sub leading-relaxed max-w-xl italic">
            The hiring engine is currently managing <span className="text-app-text-main font-black border-b-2 border-app-accent">{bookingsCount} active sessions</span>. All sectors operational.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="shrink-0 pb-2"
        >
          <Button asChild className="h-16 px-10 rounded-2xl bg-app-text-main text-app-bg hover:bg-app-accent font-black transition-all duration-500 shadow-2xl shadow-app-accent/10 uppercase tracking-[0.2em] text-[12px] group border-none">
            <Link href="/programs/create">
              <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform" />
              New Program
            </Link>
          </Button>
        </motion.div>
      </header>

      {/* KPI matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
        {stats.map((stat, idx) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="arch-card group p-8 flex flex-col justify-between h-48 text-left"
          >
            <div className="flex items-center justify-between">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="font-mono text-[10px] font-black text-app-text-sub uppercase tracking-widest">{stat.label}</span>
            </div>
            <p className="text-5xl font-black tracking-tighter text-app-text-main tabular-nums">
              {stat.value.toString().padStart(2, '0')}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Registry Layer */}
      <section className="space-y-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-app-border pb-8">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black text-app-text-main tracking-tight uppercase">Registry</h2>
            <span className="arch-mono-label bg-app-text-main text-app-bg px-2">{programs.length} Active</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-app-text-sub group-focus-within:text-app-accent transition-colors" />
              <Input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter label..." 
                className="h-11 w-64 pl-11 rounded-xl border-app-border bg-app-mono-bg/5 focus:bg-white transition-all font-bold uppercase tracking-widest text-[11px] placeholder:text-app-text-sub/30"
              />
            </div>

            <div className="flex items-center bg-app-mono-bg/5 p-1 rounded-xl border border-app-border">
              <button 
                onClick={() => setViewMode("grid")}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  viewMode === "grid" ? "bg-white text-app-accent shadow-sm" : "text-app-text-sub hover:text-app-text-main"
                )}
              >
                Grid
              </button>
              <button 
                onClick={() => setViewMode("table")}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  viewMode === "table" ? "bg-white text-app-accent shadow-sm" : "text-app-text-sub hover:text-app-text-main"
                )}
              >
                Table
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {programs.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-32 flex flex-col items-center text-center bg-app-mono-bg/5 rounded-[48px] border-2 border-dashed border-app-border"
            >
              <div className="w-20 h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center mb-8 border border-app-border">
                <Briefcase className="w-8 h-8 text-app-accent" />
              </div>
              <h3 className="text-2xl font-black text-app-text-main tracking-tight">Zero Architectures Deployed</h3>
              <p className="text-app-text-sub font-medium max-w-sm mt-3 mb-10 leading-relaxed text-center">
                Provision your first hiring program to begin supply chain orchestration.
              </p>
              <Button asChild className="h-12 px-10 rounded-2xl bg-app-accent hover:bg-app-accent/90 text-white font-black uppercase tracking-widest text-[11px] shadow-xl shadow-app-accent/20 border-none transition-all active:scale-95">
                <Link href="/programs/create">Deploy Architecture //</Link>
              </Button>
            </motion.div>
          ) : filteredPrograms.length === 0 ? (
            <motion.div key="no-results" className="py-24 text-center">
              <p className="text-app-text-sub font-mono font-black uppercase tracking-widest text-sm opacity-40">Zero Registry Matches</p>
            </motion.div>
          ) : viewMode === "grid" ? (
            <motion.div 
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 xl:grid-cols-2 gap-8"
            >
              {filteredPrograms.map((program, idx) => (
                <motion.div
                  key={program.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link
                    href={`/programs/${program.id}`}
                    className="block group h-full"
                  >
                    <div className="arch-card h-full p-10 flex flex-col justify-between group-hover:border-app-accent/50 group-hover:translate-y-[-4px] transition-all duration-500 relative overflow-hidden text-left bg-white dark:bg-app-card">
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-8">
                          <div className="space-y-3 text-left">
                            <h4 className="text-3xl font-black text-app-text-main group-hover:text-app-accent transition-colors tracking-tighter">
                              {program.name}
                            </h4>
                            <div className="flex items-center gap-3">
                              <span className="arch-mono-label bg-app-text-main text-app-bg px-2">{program.rounds.length} STAGES</span>
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20" />
                              <span className="text-[10px] font-mono font-black text-emerald-600 uppercase tracking-widest">Active</span>
                            </div>
                          </div>
                          <ArrowUpRight className="w-6 h-6 text-app-text-sub/20 group-hover:text-app-accent transition-all group-hover:translate-x-1 group-hover:translate-y-[-4px]" />
                        </div>
                        {program.description && (
                          <p className="text-[15px] text-app-text-sub line-clamp-2 font-medium leading-relaxed mb-10 opacity-80 text-left">
                            {program.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="relative z-10 flex items-end justify-between pt-8 border-t border-app-border/50">
                        <div className="space-y-1 text-left">
                          <p className="font-mono text-[9px] font-black text-app-text-sub uppercase tracking-[0.3em]">Supply Statistics</p>
                          <p className="text-2xl font-black text-app-text-main tracking-tighter">
                            {program._count.candidates.toString().padStart(2, '0')} <span className="text-sm font-bold text-app-text-sub ml-1 tracking-normal uppercase">Identities</span>
                          </p>
                        </div>
                        
                        <div className="flex -space-x-3">
                          {[...Array(Math.min(3, program._count.candidates))].map((_, i) => (
                            <div key={i} className="w-10 h-10 rounded-xl border-4 border-white dark:border-slate-900 bg-app-mono-bg/10 flex items-center justify-center text-[10px] font-black text-app-text-sub uppercase">
                              ID
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="table"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="arch-card overflow-hidden shadow-sm bg-white dark:bg-app-card"
            >
              <Table>
                <TableHeader className="bg-app-mono-bg/5">
                  <TableRow className="hover:bg-transparent border-app-border h-20">
                    <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-app-text-sub px-10">Label // Context</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-app-text-sub px-4 text-center">Architecture</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-app-text-sub px-4 text-center">Supply</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-app-text-sub px-10 text-right">Sequence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPrograms.map((program) => (
                    <TableRow 
                      key={program.id}
                      className="group transition-all duration-500 border-app-border h-28 hover:bg-app-accent/[0.02]"
                    >
                      <TableCell className="px-10 text-left">
                        <Link href={`/programs/${program.id}`} className="block">
                          <p className="font-black text-app-text-main text-lg tracking-tighter group-hover:text-app-accent transition-colors leading-none">{program.name}</p>
                          {program.description && <p className="text-sm text-app-text-sub mt-2 line-clamp-1 max-w-sm font-medium opacity-70 uppercase tracking-tight text-left">{program.description}</p>}
                        </Link>
                      </TableCell>
                      <TableCell className="px-4 text-center">
                        <span className="arch-mono-label bg-app-text-main text-app-bg px-3 py-1">
                          {program.rounds.length} STAGES //
                        </span>
                      </TableCell>
                      <TableCell className="px-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-xl font-black text-app-text-main tracking-tighter">{program._count.candidates.toString().padStart(2, '0')}</span>
                          <span className="font-mono text-[9px] font-black text-app-text-sub uppercase tracking-widest mt-1">Identities</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-10 text-right">
                        <Button asChild variant="ghost" className="font-mono text-[11px] font-black text-app-text-sub/40 group-hover:text-app-accent transition-all uppercase tracking-widest hover:bg-transparent p-0">
                          <Link href={`/programs/${program.id}`}>
                            Open Portal <ArrowUpRight className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
