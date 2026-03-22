"use client";

import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

  const filteredPrograms = useMemo(() => {
    return programs.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
    );
  }, [programs, search]);

  const stats = [
    { label: "Active Programs", value: programs.length, color: "text-blue-600" },
    { label: "Total Candidates", value: candidatesCount, color: "text-slate-900" },
    { label: "Upcoming Interviews", value: bookingsCount, color: "text-indigo-600" },
    { label: "Completed", value: completedBookings, color: "text-emerald-600" },
  ];

  return (
    <div className="w-full px-8 lg:px-16 py-16 relative">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-blue-50/40 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 -z-10 w-[600px] h-[600px] bg-indigo-50/20 blur-[140px] rounded-full pointer-events-none" />

      {/* Action Required Banner */}
      {failedBookingsCount > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 p-8 rounded-[32px] bg-rose-50 border border-rose-100 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-rose-100/50 max-w-[1600px] mx-auto"
        >
          <div className="flex items-center gap-6">
            <div className="relative">
              <span className="font-mono text-[11px] font-bold bg-rose-600 text-white px-3 py-1.5 rounded-full uppercase tracking-tighter">
                [ ATTENTION ]
              </span>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-600 rounded-full animate-ping" />
            </div>
            <div>
              <p className="text-lg font-bold text-rose-950 tracking-tight">
                {failedBookingsCount} Calendar Invites Failed
              </p>
              <p className="text-[14px] text-rose-700/80 font-medium">
                The automatic scheduler couldn&apos;t send some invites. You might need to send them manually.
              </p>
            </div>
          </div>
          <Button asChild variant="outline" className="h-12 px-8 rounded-2xl border-rose-200 text-rose-700 hover:bg-rose-100 font-bold text-[13px] uppercase tracking-widest transition-all active:scale-95 shadow-sm">
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
              <span className="w-8 h-[2px] bg-blue-600" />
              <span className="font-mono text-[11px] font-bold text-blue-600 uppercase tracking-[0.3em]">
                System Overview // {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
              </span>
            </div>
            <h1 className="text-6xl font-bold text-slate-900 tracking-tighter leading-[1.1]">
              Hello, <span className="text-blue-600">{userName}</span>
            </h1>
            <p className="text-slate-500 mt-4 font-medium text-xl max-w-xl leading-relaxed">
              You have <span className="text-slate-900 font-bold underline decoration-blue-200 decoration-4 underline-offset-8">{bookingsCount} interviews</span> scheduled.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button asChild className="h-14 px-10 rounded-2xl bg-slate-900 hover:bg-blue-600 text-white font-bold transition-all duration-500 active:scale-95 shadow-2xl shadow-slate-200 uppercase tracking-[0.2em] text-[12px] group">
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
              className="group cursor-default p-8 rounded-[32px] bg-white border border-slate-50 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-50/50 transition-all duration-500"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-blue-600 transition-colors duration-500" />
                <span className="font-mono text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
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
              <h2 className="text-[14px] font-bold text-slate-900 uppercase tracking-[0.4em] whitespace-nowrap">
                Active Programs
              </h2>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-100 to-transparent" />
            </div>
            
            {/* Search Filter */}
            {programs.length > 0 && (
              <div className="w-full md:w-80">
                <div className="relative">
                  <Input 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Filter by name..." 
                    className="h-12 rounded-2xl border-slate-100 bg-white px-6 font-bold text-[13px] uppercase tracking-widest placeholder:text-slate-300 focus:ring-blue-500/10 focus:border-blue-200 transition-all"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[10px] font-bold text-slate-300">
                    [ FIND ]
                  </div>
                </div>
              </div>
            )}
          </div>

          {programs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="border-none bg-slate-50/50 rounded-[40px] overflow-hidden">
                <CardContent className="flex flex-col items-center justify-center py-32 text-center">
                  <div className="w-20 h-20 rounded-3xl bg-white shadow-sm flex items-center justify-center mb-8">
                    <span className="font-mono text-2xl font-bold text-slate-200">[ 00 ]</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">No Programs Yet</h3>
                  <p className="text-[16px] text-slate-500 mt-3 mb-10 max-w-[380px] leading-relaxed">
                    You haven&apos;t set up any hiring programs. Create one to start managing candidates.
                  </p>
                  <Button asChild className="rounded-2xl h-12 px-10 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-widest text-[11px] transition-all active:scale-95 shadow-xl shadow-blue-100">
                    <Link href="/programs/create">Create First Program //</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : filteredPrograms.length === 0 ? (
            <div className="py-20 text-center">
              <span className="font-mono text-[12px] font-bold text-slate-300 uppercase tracking-widest">No results found for &quot;{search}&quot;</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
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
                    <div className="relative h-full p-10 rounded-[40px] bg-white border border-slate-100 group-hover:border-blue-200 group-hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] transition-all duration-700 overflow-hidden flex flex-col justify-between">
                      {/* Hover Glow */}
                      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-50/20 blur-[100px] rounded-full -mr-48 -mt-48 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      
                      <div className="relative z-10">
                        <div className="flex flex-wrap items-center gap-4 mb-4">
                          <h4 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors tracking-tighter">
                            {program.name}
                          </h4>
                          <span className="font-mono text-[10px] font-bold bg-slate-900 text-white px-3 py-1 rounded-full uppercase tracking-widest">
                            {program.rounds.length} {program.rounds.length === 1 ? 'STAGE' : 'STAGES'}
                          </span>
                        </div>
                        {program.description && (
                          <p className="text-[14px] text-slate-500 line-clamp-2 font-medium leading-relaxed mb-8">
                            {program.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="relative z-10 flex items-center justify-between pt-6 border-t border-slate-50 group-hover:border-blue-50 transition-colors mt-auto">
                        <div className="flex flex-col">
                          <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Supply</span>
                          <p className="text-[18px] font-bold text-slate-900 tracking-tight">
                            {program._count.candidates.toString().padStart(2, '0')} <span className="text-slate-400 font-medium text-[13px] ml-1">Candidates</span>
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span className="font-mono text-[12px] font-extrabold text-slate-300 group-hover:text-blue-600 transition-all duration-500 group-hover:translate-x-2">
                            OPEN ->
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
