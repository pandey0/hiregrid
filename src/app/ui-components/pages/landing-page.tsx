"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  ChevronRight, 
  Layers, 
  Users, 
  Zap, 
  Calendar, 
  BarChart3, 
  Globe, 
  ArrowUpRight,
  Activity,
  Sparkles,
  Terminal,
  Cpu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useRef } from "react";

const capabilitiesManifest = [
  {
    id: "MOD_01",
    title: "Program Architecture",
    spec: "MULTI_ROUND // CUSTOM_LOGIC",
    desc: "Provision complex hiring sequences with custom specialist assignments and temporal constraints.",
    icon: Layers,
    status: "SYSTEM_OPTIMAL"
  },
  {
    id: "MOD_02",
    title: "Headless Scheduling",
    spec: "ZERO_LOGIN // MAGIC_LINK",
    desc: "Proprietary protocol for frictionless availability collection from panelists without account overhead.",
    icon: Calendar,
    status: "LINK_ACTIVE"
  },
  {
    id: "MOD_03",
    title: "AI Ingestion Port",
    spec: "GEMINI_2.0 // ATS_SCORE",
    desc: "Autonomous identity scoring and rubric generation based on program architectural requirements.",
    icon: Zap,
    status: "NEURAL_SYNC"
  },
  {
    id: "MOD_04",
    title: "Self-Service Booking",
    spec: "CANDIDATE_DRIVEN // SYNC",
    desc: "Unified supply aggregation allowing candidates to secure sessions within the defined grid.",
    icon: Users,
    status: "AUTO_FULFILL"
  },
  {
    id: "MOD_05",
    title: "Control Tower",
    spec: "REAL_TIME // DIAGNOSTICS",
    desc: "High-density monitoring of supply vs. demand vitals to eliminate recruitment bottlenecks.",
    icon: BarChart3,
    status: "MONITOR_LIVE"
  },
  {
    id: "MOD_06",
    title: "Partner Gateways",
    spec: "EXTERNAL_API // INFLOW",
    desc: "Secure portals for agency partners to deploy candidates directly into your active sequence.",
    icon: Globe,
    status: "UPLINK_READY"
  },
];

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="min-h-screen bg-app-bg text-app-text-main selection:bg-app-accent/30 overflow-x-hidden">
      
      {/* Background Architecture - Unified seamless background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[1200px] h-[1200px] bg-app-accent/5 blur-[160px] rounded-full opacity-50 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-indigo-500/5 blur-[140px] rounded-full opacity-30 -translate-x-1/3 translate-y-1/3" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--app-border)_1px,_transparent_1px)] bg-[size:64px_48px] opacity-[0.1]" />
      </div>

      {/* Navigation Protocol */}
      <header className="fixed top-0 left-0 right-0 z-50 pt-8 px-6 lg:px-12 pointer-events-none">
        <div className="max-w-[1800px] mx-auto pointer-events-auto">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="h-20 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-app-border rounded-[32px] px-10 flex items-center justify-between shadow-2xl shadow-slate-200/20 dark:shadow-none"
          >
            <Link href="/" className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-app-text-main text-app-bg rounded-2xl flex items-center justify-center group-hover:rotate-[-5deg] transition-all duration-500 shadow-xl shadow-app-accent/10">
                <span className="font-black text-2xl tracking-tighter">H</span>
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-xl font-black tracking-tighter text-app-text-main leading-none uppercase">HireGrid</span>
                <span className="text-[9px] font-black text-app-accent uppercase tracking-[0.4em] mt-1 leading-none">OS // ALPHA</span>
              </div>
            </Link>
            
            <nav className="flex items-center gap-10">
              <div className="hidden md:flex items-center gap-8">
                {["Capabilities", "Architecture", "Registry"].map((item) => (
                  <Link key={item} href={`#${item.toLowerCase()}`} className="text-[11px] font-black text-app-text-sub/60 hover:text-app-text-main uppercase tracking-[0.2em] transition-colors">{item}</Link>
                ))}
              </div>
              <div className="h-8 w-px bg-app-border mx-2 hidden sm:block" />
              <div className="flex items-center gap-4">
                <Link href="/sign-in" className="text-[11px] font-black text-app-text-sub/60 hover:text-app-text-main uppercase tracking-[0.2em] transition-colors px-4">Login</Link>
                <Button asChild className="h-12 px-8 bg-app-text-main text-app-bg hover:bg-app-accent rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-app-accent/10 transition-all border-none active:scale-95">
                  <Link href="/sign-up">Deploy Grid</Link>
                </Button>
              </div>
            </nav>
          </motion.div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="page-container pt-64 pb-48 relative">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-left"
            >
              <div className="flex items-center gap-3 mb-10">
                <span className="arch-mono-label px-3 py-1 flex items-center gap-2 bg-app-accent text-white rounded-md text-xs font-bold">
                  <Sparkles className="w-3 h-3 fill-current" /> v.02 PROTOCOL
                </span>
                <span className="text-[10px] font-mono font-bold text-app-text-sub uppercase tracking-widest opacity-40">Hiring Supply Chain Infrastructure</span>
              </div>
              
              <h1 className="text-6xl md:text-[100px] lg:text-[110px] font-black tracking-tighter leading-[0.8] text-app-text-main mb-12">
                Hiring Without <br />
                <span className="text-app-accent">The Friction</span>.
              </h1>
              
              <p className="text-xl md:text-2xl text-app-text-sub font-medium leading-relaxed mb-16 max-w-xl italic">
                HireGrid is a high-density orchestration engine for multi-round programs. 
                Synchronize <span className="text-app-text-main font-black border-b-4 border-app-accent/30">interviewer supply</span> with candidate demand.
              </p>
              
              <div className="flex items-center justify-start gap-8 md:gap-12 flex-wrap">
                <Button asChild className="h-20 px-12 bg-app-text-main text-app-bg hover:bg-app-accent rounded-[32px] font-black text-[14px] uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 group border-none">
                  <Link href="/sign-up" className="flex items-center gap-4">
                    Get Started Free <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  </Link>
                </Button>
                <Link href="/sign-in" className="flex items-center gap-3 text-[13px] font-black text-app-text-sub/40 hover:text-app-text-main uppercase tracking-[0.3em] transition-all group">
                  Dashboard Login <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:translate-y-[-4px] transition-transform opacity-20 group-hover:opacity-100" />
                </Link>
              </div>
            </motion.div>

            {/* Visual Hero Mockup - Fixed space issue by making it flexible height */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative hidden lg:flex w-full h-[500px] xl:h-[600px]"
            >
              <div className="arch-card w-full h-full bg-white/50 backdrop-blur-xl dark:bg-app-card/50 p-6 relative overflow-hidden shadow-[0_0_100px_-20px_rgba(var(--app-accent),0.2)] flex flex-col rounded-[32px] border border-app-border">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--app-accent)_0.1,_transparent_0.5)] opacity-20" />
                
                <div className="h-full w-full rounded-[24px] border border-app-border bg-app-bg/80 p-8 space-y-8 flex flex-col relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-rose-500" />
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    </div>
                    <span className="font-mono text-[10px] px-3 py-1 bg-app-text-main text-app-bg rounded uppercase tracking-widest font-black">CONTROL_TOWER_LIVE</span>
                  </div>
                  
                  <div className="flex-1 grid grid-cols-2 gap-6">
                    <div className="arch-card bg-app-card p-6 border-app-accent/20 flex flex-col justify-between rounded-2xl">
                      <span className="text-[10px] font-black text-app-text-sub uppercase tracking-widest text-left">Supply Pool</span>
                      <p className="text-5xl font-black text-app-text-main text-left">48</p>
                    </div>
                    <div className="arch-card bg-app-card p-6 border-emerald-500/20 flex flex-col justify-between rounded-2xl">
                      <span className="text-[10px] font-black text-app-text-sub uppercase tracking-widest text-left">Secured Nodes</span>
                      <p className="text-5xl font-black text-emerald-600 text-left">32</p>
                    </div>
                    <div className="col-span-2 arch-card bg-app-card p-6 border-app-border/50 rounded-2xl flex flex-col justify-center">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black text-app-text-sub uppercase tracking-widest">Optimization Health</span>
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-emerald-500" />
                          <span className="text-[10px] font-black text-emerald-600 uppercase">System Optimal</span>
                        </div>
                      </div>
                      <div className="h-3 w-full bg-app-mono-bg/10 dark:bg-black/40 rounded-full overflow-hidden border border-app-border relative">
                        <div className="h-full w-[85%] bg-app-accent" />
                      </div>
                    </div>
                  </div>
                </div>

                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-16 -left-6 arch-card p-6 bg-app-text-main text-app-bg shadow-2xl border-none rounded-2xl z-20"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-app-accent flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-xs uppercase tracking-widest">Auto-Booked //</p>
                      <p className="text-[10px] font-mono opacity-60 uppercase tracking-tighter">Candidate_ID: #8821</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* System Transmission // Video Brief */}
        <section id="demo" className="page-container pb-32">
          <div className="flex items-center gap-6 mb-16 text-left">
            <div className="w-12 h-[1px] bg-app-accent" />
            <h2 className="text-[14px] font-black text-app-text-main uppercase tracking-[0.5em]">Visual Protocol // System Demo</h2>
          </div>

          <div className="relative group">
            <div className="absolute -top-4 -left-4 w-12 h-12 border-t-2 border-l-2 border-app-accent/30 group-hover:border-app-accent transition-colors duration-500 z-20" />
            <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-2 border-r-2 border-app-accent/30 group-hover:border-app-accent transition-colors duration-500 z-20" />

            <div className="arch-card overflow-hidden aspect-video bg-black shadow-[0_0_100px_-20px_rgba(var(--app-accent),0.2)] group-hover:border-app-accent/40 transition-all duration-700 rounded-3xl">
              <iframe
                className="w-full h-full opacity-90 group-hover:opacity-100 transition-opacity border-none"
                src={`https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&mute=1&loop=1`}
                title="HireGrid Promotional Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              
              <div className="absolute top-6 right-6 flex items-center gap-3 pointer-events-none">
                <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  <span className="font-mono text-[9px] font-black text-white uppercase tracking-widest">LIVE_TRANSMISSION</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* System Capabilities Manifest - Redesigned to Bento Grid */}
        <section id="capabilities" className="page-container py-32 relative">
          <div className="mb-24 text-left">
            <div className="flex items-center gap-4 mb-6">
              <Cpu className="w-6 h-6 text-app-accent" />
              <h2 className="text-[14px] font-black text-app-text-main uppercase tracking-[0.5em]">System Capabilities</h2>
            </div>
            <p className="text-5xl md:text-7xl font-black tracking-tighter text-app-text-main leading-[0.9]">
              Infrastructure <br/> <span className="text-app-accent">Specification</span>.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilitiesManifest.map((item, idx) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group flex flex-col justify-between gap-8 p-8 bg-white/40 dark:bg-app-card/40 border border-app-border rounded-[32px] hover:border-app-accent/40 transition-all duration-500 hover:shadow-2xl shadow-app-accent/5 backdrop-blur-sm"
              >
                <div className="space-y-8">
                  <div className="w-16 h-16 rounded-2xl bg-app-text-main text-app-bg flex items-center justify-center shrink-0 shadow-xl transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                    <item.icon className="w-7 h-7" />
                  </div>
                  <div className="space-y-3 text-left">
                    <div className="inline-flex items-center gap-2 font-mono text-[10px] font-black text-app-accent bg-app-accent/10 px-2 py-0.5 rounded uppercase">
                      {item.id}
                    </div>
                    <h3 className="text-2xl font-black text-app-text-main uppercase tracking-tight leading-none">{item.title}</h3>
                    <p className="text-[15px] text-app-text-sub font-medium leading-relaxed italic pt-2">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-app-border/50 mt-auto">
                  <div className="text-left space-y-1">
                    <p className="font-mono text-[9px] font-black text-app-text-sub uppercase tracking-[0.3em]">Protocol Spec</p>
                    <p className="text-[12px] font-black text-app-text-main uppercase tracking-widest">{item.spec}</p>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* The Orchestration Loop */}
        <section id="architecture" className="page-container py-32 text-left">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-20">
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-[1px] bg-app-accent" />
                  <h2 className="text-[14px] font-black text-app-text-main uppercase tracking-[0.5em]">The Orchestration Loop</h2>
                </div>
                <h3 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] text-app-text-main">
                  A Perfectly Tuned <br/> <span className="text-app-accent">Supply Chain</span>.
                </h3>
                <p className="text-xl text-app-text-sub font-medium max-w-lg italic leading-relaxed">
                  Every stage of your hiring sequence is powered by an autonomous fulfillment engine that eliminates manual coordination.
                </p>
              </div>

              <div className="space-y-12">
                {[
                  { step: "01", label: "Architecture", desc: "Design the sequence. Define rounds, specialist assignments, and evaluation focus areas." },
                  { step: "02", label: "Synchronization", desc: "Magic links deploy to specialists. Availability flows instantly into your hiring grid." },
                  { step: "03", label: "Intelligence", desc: "Gemini 2.0 Flash architecture scores identities and generates custom round rubrics." },
                  { step: "04", label: "Fulfillment", desc: "Autonomous AI dispatches calendar invites, meeting links, and candidate trail logs." }
                ].map((item, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex gap-8 group"
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-xl font-black text-app-accent font-mono bg-app-accent/10 w-12 h-12 rounded-xl flex items-center justify-center shadow-xl shadow-app-accent/5 transition-colors group-hover:bg-app-accent group-hover:text-white">
                        {item.step}
                      </span>
                      {idx < 3 && <div className="w-px h-full bg-app-border mt-4" />}
                    </div>
                    <div className="space-y-2 pb-6">
                      <p className="text-2xl font-black text-app-text-main uppercase tracking-tight group-hover:text-app-accent transition-colors">{item.label}</p>
                      <p className="text-[16px] text-app-text-sub font-medium max-w-md opacity-70 italic leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="arch-card p-12 md:p-16 bg-app-text-main text-app-bg relative overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] border-none lg:scale-105 rounded-[40px]">
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--app-accent)_0.2,_transparent_0.7)] opacity-40" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
                
                <div className="relative z-10 space-y-12">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Terminal className="w-5 h-5 text-app-accent" />
                      <span className="font-mono text-[10px] font-black text-app-accent uppercase tracking-[0.5em]">Fulfillment Protocol //</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse" />
                      <span className="font-mono text-[9px] font-black text-emerald-500 uppercase">LIVE_MONITOR</span>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6 backdrop-blur-md shadow-2xl text-left">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-app-accent/20 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-app-accent" />
                        </div>
                        <span className="font-black text-sm uppercase tracking-widest text-white">Identity Synced</span>
                      </div>
                      <p className="font-mono text-[12px] text-white/40 leading-loose uppercase tracking-tighter">
                        AUTH_DISPATCH: JANE_SMITH // LEAD <br/>
                        NODE: GOOGLE_CALENDAR_V.04 <br/>
                        STATUS: SUCCESS // NOTIFIED
                      </p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6 backdrop-blur-md translate-x-12 opacity-40 grayscale group hover:grayscale-0 hover:opacity-100 transition-all duration-700 text-left">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-app-accent/20 flex items-center justify-center">
                          <Zap className="w-5 h-5 text-app-accent" />
                        </div>
                        <span className="font-black text-sm uppercase tracking-widest text-white">Rubric Generated</span>
                      </div>
                      <p className="font-mono text-[12px] text-white/40 uppercase">GEMINI_PARSE: 92% OPTIMIZATION SCORE</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Global Sequence Deployment */}
        <section className="page-container py-32">
          <div className="arch-card bg-app-text-main text-app-bg p-12 md:p-20 flex flex-col lg:flex-row lg:items-center justify-between gap-12 relative overflow-hidden border-none shadow-[0_0_100px_-20px_rgba(var(--app-accent),0.3)] rounded-[48px]">
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--app-accent)_0.2,_transparent_0.7)] opacity-20" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
            
            <div className="relative z-10 max-w-2xl text-left">
              <div className="flex items-center gap-4 mb-8">
                <Terminal className="w-6 h-6 text-app-accent" />
                <span className="font-mono text-[11px] font-black text-app-accent uppercase tracking-[0.5em]">System Ready //</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-app-bg mb-8 leading-[0.85]">
                Deploy Your <br />
                <span className="text-app-accent">Hiring Grid</span>.
              </h2>
              <p className="text-xl text-app-bg/60 font-medium leading-relaxed italic border-l-2 border-app-accent pl-8">
                Stabilize your recruitment logistics. Built for technical teams that prioritize precision over process.
              </p>
            </div>
            
            <div className="relative z-10">
              <Button asChild className="h-20 px-12 bg-white text-app-text-main hover:bg-app-accent hover:text-white rounded-[32px] font-black text-lg transition-all active:scale-95 uppercase tracking-[0.2em] shadow-2xl border-none">
                <Link href="/sign-up" className="flex items-center gap-4">
                  Initialize Now <ChevronRight className="w-6 h-6" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-app-bg border-t border-app-border py-24 relative overflow-hidden">
        <div className="page-container grid grid-cols-1 md:grid-cols-4 gap-16 relative z-10 text-left">
          <div className="col-span-2 space-y-8">
            <Link href="/" className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-xl bg-app-text-main text-app-bg flex items-center justify-center font-black transition-transform group-hover:rotate-[-5deg]">H</div>
              <span className="text-2xl font-black tracking-tighter text-app-text-main uppercase">HireGrid</span>
            </Link>
            <p className="text-app-text-sub font-medium italic opacity-60 max-w-sm">
              The high-density orchestration engine for modern engineering teams. Synchronize your hiring supply chain with precision.
            </p>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="font-mono text-[9px] font-black text-app-text-sub/40 uppercase tracking-widest leading-none">Global Infrastructure Operational</p>
            </div>
          </div>
          
          <div className="space-y-8">
            <span className="font-mono text-[10px] font-black text-app-accent uppercase tracking-[0.4em]">Protocol //</span>
            <div className="flex flex-col gap-4">
              {["Dashboard", "Security", "Terms", "Privacy"].map((link) => (
                <a key={link} href="#" className="text-[12px] font-black text-app-text-sub/40 hover:text-app-text-main transition-colors uppercase tracking-widest">{link}</a>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <span className="font-mono text-[10px] font-black text-app-accent uppercase tracking-[0.4em]">Uplinks //</span>
            <div className="flex flex-col gap-4">
              {["LinkedIn", "Twitter", "GitHub", "System Status"].map((link) => (
                <a key={link} href="#" className="text-[12px] font-black text-app-text-sub/40 hover:text-app-text-main transition-colors uppercase tracking-widest">{link}</a>
              ))}
            </div>
          </div>
        </div>
        <div className="page-container mt-24 pt-8 border-t border-app-border/50 text-left">
          <p className="font-mono text-[9px] font-black text-app-text-sub/20 uppercase tracking-[0.2em]">© 2026 HIREGRID INFRASTRUCTURE. ALL SECTORS PROTECTED.</p>
        </div>
      </footer>
    </div>
  );
}