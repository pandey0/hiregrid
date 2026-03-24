"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signIn } from "@/lib/auth-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Mail, Lock, ShieldCheck, Zap, ArrowRight } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setIsLoading(true);
    try {
      await signIn.email(
        { email, password },
        {
          onError: (err: { error: { message?: string } }) => {
            toast.error(err?.error?.message || "Sign in failed");
          },
          onSuccess: () => {
            router.push("/dashboard");
          },
        }
      );
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center px-6 py-12 relative overflow-hidden selection:bg-app-accent/30">
      {/* Background Architecture */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-app-accent/5 blur-[140px] rounded-full opacity-50 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/5 blur-[120px] rounded-full opacity-30 -translate-x-1/3 translate-y-1/3" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--app-border)_1px,_transparent_1px)] bg-[size:32px_32px] opacity-[0.1]" />
      </div>

      <div className="w-full max-w-lg relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-12 text-center">
          <Link href="/" className="inline-flex items-center justify-center w-16 h-16 rounded-[24px] bg-app-text-main text-app-bg shadow-2xl shadow-app-accent/10 mb-8 hover:scale-105 transition-transform group">
            <span className="font-black text-2xl tracking-tighter group-hover:rotate-[-5deg] transition-transform">H</span>
          </Link>
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-3">
              <span className="bg-app-accent/10 text-app-accent font-mono text-[9px] font-black px-2 py-0.5 rounded tracking-widest uppercase">Secure Access</span>
              <div className="h-px w-8 bg-app-border" />
              <span className="font-mono text-[9px] font-black text-app-text-sub uppercase tracking-[0.3em]">Hiring Hub // Protocol</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-app-text-main uppercase">Welcome <span className="text-app-accent">Back</span>.</h1>
            <p className="text-[15px] text-app-text-sub font-medium italic opacity-60">Sign in to manage your hiring programs and candidates.</p>
          </div>
        </div>

        <div className="arch-card p-0 overflow-hidden border-app-border shadow-[0_0_80px_-15px_rgba(0,0,0,0.3)] bg-app-card">
          {/* Tactical Header */}
          <div className="p-8 bg-app-text-main text-app-bg relative overflow-hidden border-b border-app-accent/20">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-app-accent/20 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-app-accent" />
                </div>
                <div className="text-left">
                  <p className="font-black uppercase tracking-widest text-[10px]">Authorization Gate</p>
                  <p className="text-[9px] font-mono font-bold text-app-bg/40 uppercase mt-0.5">Primary Session Initialization</p>
                </div>
              </div>
              <div className="w-2 h-2 rounded-full bg-app-accent animate-pulse" />
            </div>
          </div>

          <div className="p-10 md:p-12 space-y-10 bg-white dark:bg-app-card relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--app-border)_1px,_transparent_1px)] bg-[size:24px_24px] opacity-[0.15] pointer-events-none" />
            
            <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
              <div className="space-y-8">
                <div className="space-y-3 group/field">
                  <div className="flex items-center justify-between mb-1 px-1">
                    <Label htmlFor="email" className="font-mono text-[9px] font-black text-app-text-sub uppercase tracking-widest group-focus-within/field:text-app-accent transition-colors">Email Address *</Label>
                    <Mail className="w-3.5 h-3.5 text-app-text-sub/20 group-focus-within/field:text-app-accent transition-colors" />
                  </div>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="YOU@COMPANY.COM"
                      className="h-14 rounded-2xl border-app-border bg-app-mono-bg/5 focus:bg-white focus:ring-4 focus:ring-app-accent/5 transition-all font-black uppercase tracking-tight text-[13px] shadow-inner placeholder:text-app-text-sub/20"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-app-border group-focus-within/field:bg-app-accent transition-colors" />
                  </div>
                </div>

                <div className="space-y-3 group/field">
                  <div className="flex items-center justify-between mb-1 px-1">
                    <Label htmlFor="password" className="font-mono text-[9px] font-black text-app-text-sub uppercase tracking-widest group-focus-within/field:text-app-accent transition-colors">Password *</Label>
                    <Lock className="w-3.5 h-3.5 text-app-text-sub/20 group-focus-within/field:text-app-accent transition-colors" />
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="h-14 rounded-2xl border-app-border bg-app-mono-bg/5 focus:bg-white focus:ring-4 focus:ring-app-accent/5 transition-all font-black uppercase tracking-tight text-[13px] shadow-inner placeholder:text-app-text-sub/20"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-app-border group-focus-within/field:bg-app-accent transition-colors" />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="w-full h-16 bg-app-text-main text-app-bg hover:bg-app-accent font-black uppercase tracking-[0.2em] text-[12px] shadow-2xl shadow-app-accent/20 rounded-2xl transition-all active:scale-95 border-none group"
                >
                  {isLoading ? "Signing in..." : "Sign In //"}
                  {!isLoading && <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />}
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-6">
          <p className="text-center text-[11px] font-black text-app-text-sub/40 uppercase tracking-[0.3em]">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-app-accent hover:underline ml-2 transition-all">
              Sign up free //
            </Link>
          </p>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20" />
            <span className="font-mono text-[8px] font-bold text-app-text-sub/30 uppercase tracking-widest">Security Protocol Operational</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
