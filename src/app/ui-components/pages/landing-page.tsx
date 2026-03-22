import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, ChevronRight, Layers, Users, Zap, Calendar, BarChart3, Globe, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Multi-round programs",
    description: "Define structured hiring pipelines with any number of custom rounds — screening, technical, culture fit.",
    icon: Layers,
    color: "text-blue-600",
    bg: "bg-blue-50"
  },
  {
    title: "Panelist scheduling",
    description: "Panelists receive a private link to submit their availability. No account required.",
    icon: Calendar,
    color: "text-purple-600",
    bg: "bg-purple-50"
  },
  {
    title: "AI resume scoring",
    description: "Automatically score uploaded resumes against your criteria so you can shortlist in seconds.",
    icon: Zap,
    color: "text-amber-600",
    bg: "bg-amber-50"
  },
  {
    title: "Candidate self-booking",
    description: "Shortlisted candidates pick from available panelist slots. No email tag required.",
    icon: Users,
    color: "text-emerald-600",
    bg: "bg-emerald-50"
  },
  {
    title: "Control Tower",
    description: "See supply vs. demand for every round at a glance. Spot gaps before they become blockers.",
    icon: BarChart3,
    color: "text-indigo-600",
    bg: "bg-indigo-50"
  },
  {
    title: "Zero friction",
    description: "Headless flows for panelists and candidates — they never need to create an account.",
    icon: Globe,
    color: "text-slate-600",
    bg: "bg-slate-50"
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200 transition-transform group-hover:scale-105">
              <Sparkles className="w-4 h-4 fill-current" />
            </div>
            <span className="text-[18px] font-bold tracking-tight text-slate-900">HireGrid</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/sign-in" className="text-[14px] font-bold text-slate-500 hover:text-slate-900 transition-colors">Sign in</Link>
            <Button size="sm" asChild className="h-9 px-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold shadow-md shadow-blue-200 transition-all active:scale-[0.98]">
              <Link href="/sign-up">Get started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-24 pb-32 md:pt-32 md:pb-48">
          <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[12px] font-bold uppercase tracking-wider mb-8">
              <Zap className="w-3 h-3 fill-current" />
              Next-gen hiring infrastructure
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] text-slate-900 mb-8">
              Orchestrate hiring 
              <br />
              <span className="text-blue-600">without the friction.</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 font-medium leading-relaxed mb-12 max-w-2xl">
              HireGrid coordinates multi-round programs — scheduling panelists, AI-scoring resumes, and letting candidates self-book from a single control tower.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Button asChild className="h-14 px-8 bg-slate-900 hover:bg-slate-800 rounded-2xl font-bold text-lg shadow-xl shadow-slate-200 transition-all active:scale-[0.98] w-full sm:w-auto">
                <Link href="/sign-up">
                  Start for free
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-14 px-8 rounded-2xl font-bold text-lg border-slate-200 hover:bg-slate-50 transition-all w-full sm:w-auto">
                <Link href="/sign-in">Sign in</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white border-y border-slate-200/60 py-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-20">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600 mb-4">Core Capabilities</h2>
              <p className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Built for speed, designed for focus.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {features.map((f) => (
                <div key={f.title} className="group">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110", f.bg, f.color)}>
                    <f.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-[17px] font-bold text-slate-900 mb-3">{f.title}</h3>
                  <p className="text-[15px] text-slate-500 font-medium leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-6 py-32 md:py-48">
          <div className="bg-slate-900 rounded-[48px] p-8 md:p-20 flex flex-col md:flex-row md:items-center md:justify-between gap-12 relative overflow-hidden shadow-2xl shadow-slate-200">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 max-w-xl">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
                Ready to transform your hiring workflow?
              </h2>
              <p className="text-lg text-slate-400 font-medium">
                Join high-growth teams using HireGrid to scale their recruitment infrastructure.
              </p>
            </div>
            <div className="relative z-10">
              <Button asChild className="h-16 px-10 bg-white text-slate-900 hover:bg-slate-50 rounded-[20px] font-bold text-xl transition-all active:scale-[0.98]">
                <Link href="/sign-up">
                  Get Started Now
                  <ArrowRight className="ml-2 w-6 h-6" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-slate-200/60 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white">
              <Sparkles className="w-3 h-3 fill-current" />
            </div>
            <span className="text-sm font-bold tracking-tight text-slate-900">HireGrid</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="text-[13px] font-bold text-slate-400 hover:text-slate-900 transition-colors">Twitter</a>
            <a href="#" className="text-[13px] font-bold text-slate-400 hover:text-slate-900 transition-colors">LinkedIn</a>
            <a href="#" className="text-[13px] font-bold text-slate-400 hover:text-slate-900 transition-colors">Privacy</a>
          </div>
          <p className="text-[13px] font-medium text-slate-400">© 2026 HireGrid. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
