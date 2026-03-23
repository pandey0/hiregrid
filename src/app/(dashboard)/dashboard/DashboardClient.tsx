"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    { label: "Active Programs", value: programs.length, color: "text-app-accent" },
    { label: "Total Candidates", value: candidatesCount, color: "text-app-text-main" },
    { label: "Upcoming Interviews", value: bookingsCount, color: "text-indigo-600 dark:text-indigo-400" },
    { label: "Completed", value: completedBookings, color: "text-emerald-600 dark:text-emerald-400" },
  ];

  return (
    <div className="w-full px-8 lg:px-16 py-16 relative">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-app-accent/5 blur-[140px] rounded-full pointer-events-none transition-colors duration-500" />
      <div className="absolute bottom-0 left-0 -z-10 w-[600px] h-[600px] bg-app-accent/5 blur-[140px] rounded-full pointer-events-none transition-colors duration-500" />

      {/* Action Required Banner */}
      {failedBookingsCount > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 p-8 rounded-4xl bg-rose-500/10 border border-rose-500/20 flex flex-col md:flex-row items-center justify-between gap-8 max-w-[1600px] mx-auto"
        >
          <div className="flex items-center gap-6">
            <div className="relative">
              <span className="arch-mono-label bg-rose-600 text-white">
                [ ATTENTION ]
              </span>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-600 rounded-full animate-ping" />
            </div>
            <div>
              <p className="text-lg font-bold text-app-text-main tracking-tight">
                {failedBookingsCount} Calendar Invites Failed
              </p>
              <p className="text-[14px] text-app-text-sub font-medium">
                The automatic scheduler couldn&apos;t send some invites. You might need to send them manually.
              </p>
            </div>
          </div>
          <Button asChild variant="outline" className="h-12 px-8 rounded-2xl border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 font-bold text-[13px] uppercase tracking-widest transition-all active:scale-95 shadow-sm">
            <Link href="/bookings/failed">Fix Now //</Link>
          </Button>
        </motion.div>
      )}

      {/* Header Section */}
      <div className="max-w-[1600px] mx-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-[2px] bg-app-accent" />
              <span className="font-mono text-[11px] font-bold text-app-accent uppercase tracking-[0.3em]">
                System Overview // {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
              </span>
            </div>
            <h1 className="text-6xl font-bold text-app-text-main tracking-tighter leading-[1.1]">
              Hello, <span className="text-app-accent">{userName}</span>
            </h1>
            <p className="text-app-text-sub mt-4 font-medium text-xl max-w-xl leading-relaxed">
              You have <span className="text-app-text-main font-bold underline decoration-app-accent/30 decoration-4 underline-offset-8">{bookingsCount} interviews</span> scheduled.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button asChild className="h-14 px-10 rounded-2xl bg-app-text-main text-app-bg hover:bg-app-accent font-black transition-all duration-500 active:scale-95 shadow-2xl shadow-app-accent/10 uppercase tracking-[0.2em] text-[12px] group border-none">
              <Link href="/programs/create">
                New Program <span className="ml-2 group-hover:translate-x-1 transition-transform inline-block">//</span>
              </Link>
            </Button>
          </motion.div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 mb-24">
          {stats.map((stat, idx) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              className="group cursor-default p-8 rounded-4xl bg-app-card border border-app-border hover:border-app-accent/30 transition-all duration-500 shadow-sm"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-app-border group-hover:bg-app-accent transition-colors duration-500" />
                <span className="font-mono text-[11px] font-bold text-app-text-sub uppercase tracking-[0.2em]">
                  {stat.label}
                </span>
              </div>
              <p className={cn(
                "text-7xl font-bold tracking-tighter transition-all duration-500 group-hover:translate-x-2",
                stat.color
              )}>
                {stat.value.toString().padStart(2, '0')}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Program Section */}
        <section className="space-y-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-1">
            <div className="flex items-center gap-6 flex-1">
              <h2 className="text-[14px] font-bold text-app-text-main uppercase tracking-[0.4em] whitespace-nowrap">
                Active Programs
              </h2>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-app-border to-transparent" />
            </div>
            
            <div className="flex items-center gap-8">
              {/* View Switcher */}
              <div className="flex items-center bg-app-mono-bg p-1 rounded-xl">
                <button 
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                    viewMode === "grid" ? "bg-app-card text-app-accent shadow-sm" : "text-app-text-sub hover:text-app-text-main"
                  )}
                >
                  [ GRID ]
                </button>
                <button 
                  onClick={() => setViewMode("table")}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                    viewMode === "table" ? "bg-app-card text-app-accent shadow-sm" : "text-app-text-sub hover:text-app-text-main"
                  )}
                >
                  [ TABLE ]
                </button>
              </div>

              {/* Search Filter */}
              {programs.length > 0 && (
                <div className="w-full md:w-80">
                  <div className="relative">
                    <Input 
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Filter by name..." 
                      className="h-12 rounded-2xl border-app-border bg-app-card px-6 font-bold text-[13px] uppercase tracking-widest placeholder:text-app-text-sub/30 focus:ring-app-accent/10 focus:border-app-accent/30 transition-all shadow-sm"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[10px] font-bold text-app-text-sub/40">
                      [ FIND ]
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {programs.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="arch-card flex flex-col items-center justify-center py-32 text-center bg-app-card/20">
                  <div className="w-20 h-20 rounded-3xl bg-app-card shadow-sm flex items-center justify-center mb-8 border border-app-border">
                    <span className="font-mono text-2xl font-bold text-app-text-sub/20">[ 00 ]</span>
                  </div>
                  <h3 className="text-2xl font-bold text-app-text-main tracking-tight">No Programs Yet</h3>
                  <p className="text-[16px] text-app-text-sub mt-3 mb-10 max-w-[380px] leading-relaxed">
                    You haven&apos;t set up any hiring programs. Create one to start managing candidates.
                  </p>
                  <Button asChild className="rounded-2xl h-12 px-10 bg-app-accent hover:bg-app-accent/90 text-white font-black uppercase tracking-widest text-[11px] transition-all active:scale-95 shadow-xl shadow-app-accent/20 border-none">
                    <Link href="/programs/create">Create First Program //</Link>
                  </Button>
                </div>
              </motion.div>
            ) : filteredPrograms.length === 0 ? (
              <motion.div key="no-results" className="py-20 text-center">
                <span className="font-mono text-[12px] font-bold text-app-text-sub/40 uppercase tracking-widest">Zero matches for &quot;{search}&quot;</span>
              </motion.div>
            ) : viewMode === "grid" ? (
              <motion.div 
                key="grid"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 xl:grid-cols-2 gap-8"
              >
                {filteredPrograms.map((program, idx) => (
                  <motion.div
                    key={program.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link
                      href={`/programs/${program.id}`}
                      className="block group h-full"
                    >
                      <div className="arch-card h-full p-10 overflow-hidden flex flex-col justify-between group-hover:border-app-accent/50">
                        {/* Hover Accent */}
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-app-accent/5 blur-[100px] rounded-full -mr-48 -mt-48 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        
                        <div className="relative z-10">
                          <div className="flex flex-wrap items-center gap-4 mb-4">
                            <h4 className="text-2xl font-bold text-app-text-main group-hover:text-app-accent transition-colors tracking-tighter">
                              {program.name}
                            </h4>
                            <span className="arch-mono-label bg-app-text-main text-app-bg">
                              {program.rounds.length} {program.rounds.length === 1 ? 'STAGE' : 'STAGES'}
                            </span>
                          </div>
                          {program.description && (
                            <p className="text-[14px] text-app-text-sub line-clamp-2 font-medium leading-relaxed mb-8">
                              {program.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="relative z-10 flex items-center justify-between pt-6 border-t border-app-border group-hover:border-app-accent/10 transition-colors mt-auto">
                          <div className="flex flex-col">
                            <span className="font-mono text-[10px] font-bold text-app-text-sub uppercase tracking-widest mb-1">Supply</span>
                            <p className="text-[18px] font-bold text-app-text-main tracking-tight">
                              {program._count.candidates.toString().padStart(2, '0')} <span className="text-app-text-sub font-medium text-[13px] ml-1">Candidates</span>
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <span className="font-mono text-[12px] font-extrabold text-app-text-sub/40 group-hover:text-app-accent transition-all duration-500 group-hover:translate-x-2">
                              OPEN ->
                            </span>
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="arch-card overflow-hidden shadow-none"
              >
                <Table>
                  <TableHeader className="bg-app-mono-bg">
                    <TableRow className="hover:bg-transparent border-app-border h-16">
                      <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-app-text-sub px-10">Program // Context</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-app-text-sub px-4">Architecture</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-app-text-sub px-4">Supply</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-app-text-sub px-10 text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPrograms.map((program, idx) => (
                      <TableRow 
                        key={program.id}
                        className="group transition-all duration-500 border-app-border h-24 hover:bg-app-accent/5"
                      >
                        <TableCell className="px-10">
                          <Link href={`/programs/${program.id}`} className="block">
                            <p className="font-bold text-app-text-main text-[16px] tracking-tight group-hover:text-app-accent transition-colors leading-none">{program.name}</p>
                            {program.description && <p className="text-[12px] text-app-text-sub mt-2 line-clamp-1 max-w-xs">{program.description}</p>}
                          </Link>
                        </TableCell>
                        <TableCell className="px-4">
                          <span className="arch-mono-label bg-app-text-main text-app-bg">
                            {program.rounds.length} STAGES //
                          </span>
                        </TableCell>
                        <TableCell className="px-4">
                          <div className="flex flex-col">
                            <span className="text-[15px] font-bold text-app-text-main">{program._count.candidates.toString().padStart(2, '0')}</span>
                            <span className="font-mono text-[9px] font-bold text-app-text-sub uppercase">Candidates</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-10 text-right">
                          <Link 
                            href={`/programs/${program.id}`}
                            className="font-mono text-[11px] font-black text-app-text-sub/40 group-hover:text-app-accent transition-all uppercase tracking-widest"
                          >
                            OPEN PORTAL ->
                          </Link>
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
    </div>
  );
}
