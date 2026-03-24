"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signUp } from "@/lib/auth-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { User, Mail, Lock, ShieldCheck, Zap, ArrowRight, Cpu } from "lucide-react";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setIsLoading(true);
    try {
      await signUp.email(
        { name, email, password },
        {
          onError: (err: { error: { message?: string } }) => {
            toast.error(err?.error?.message || "Registration failed");
          },
          onSuccess: () => {
            router.push("/onboarding");
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

      <div className="w-full max-w-xl relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-12 text-center">
          <Link href="/" className="inline-flex items-center justify-center w-16 h-16 rounded-[24px] bg-app-text-main text-app-bg shadow-2xl shadow-app-accent/10 mb-8 hover:scale-105 transition-transform group">
            <span className="font-black text-2xl tracking-tighter group-hover:rotate-[-5deg] transition-transform">H</span>
          </Link>
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-3">
              <span className="bg-app-accent/10 text-app-accent font-mono text-[9px] font-black px-2 py-0.5 rounded tracking-widest uppercase">Registry</span>
              <div className="h-px w-8 bg-app-border" />
              <span className="font-mono text-[9px] font-black text-app-text-sub uppercase tracking-[0.3em]">System // Initialization</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-app-text-main uppercase">Create <span className="text-app-accent">Account</span>.</h1>
            <p className="text-[15px] text-app-text-sub font-medium italic opacity-60 text-center mx-auto max-w-sm">Join HireGrid to manage and scale your hiring supply chain.</p>
          </div>
        </div>

        <div className="arch-card p-0 overflow-hidden border-app-border shadow-[0_0_80px_-15px_rgba(0,0,0,0.3)] bg-app-card">
          {/* Tactical Header */}
          <div className="p-8 bg-app-text-main text-app-bg relative overflow-hidden border-b border-app-accent/20">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4 text-left">
                <div className="w-10 h-10 rounded-xl bg-app-accent/20 flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-app-accent" />
                </div>
                <div>
                  <p className="font-black uppercase tracking-widest text-[10px]">Onboarding Protocol</p>
                  <p className="text-[9px] font-mono font-bold text-app-bg/40 uppercase mt-0.5">Primary Administrative Access</p>
                </div>
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-app-accent shadow-[0_0_15px_rgba(var(--app-accent),0.6)]" />
            </div>
          </div>

          <div className="p-10 md:p-12 bg-white dark:bg-app-card relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--app-border)_1px,_transparent_1px)] bg-[size:24px_24px] opacity-[0.15] pointer-events-none" />
            
            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3 group/field">
                  <div className="flex items-center justify-between mb-1 px-1">
                    <Label htmlFor="name" className="font-mono text-[9px] font-black text-app-text-sub uppercase tracking-widest group-focus-within/field:text-app-accent transition-colors">Full Name *</Label>
                    <User className="w-3.5 h-3.5 text-app-text-sub/20 group-focus-within/field:text-app-accent transition-colors" />
                  </div>
                  <div className="relative">
                    <Input
                      id="name"
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="E.G. JANE SMITH"
                      className="h-12 rounded-2xl border-app-border bg-app-mono-bg/5 focus:bg-white focus:ring-4 focus:ring-app-accent/5 transition-all font-black uppercase tracking-tight text-[13px] shadow-inner placeholder:text-app-text-sub/20"
                    />
                  </div>
                </div>

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
                      className="h-12 rounded-2xl border-app-border bg-app-mono-bg/5 focus:bg-white focus:ring-4 focus:ring-app-accent/5 transition-all font-black uppercase tracking-tight text-[13px] shadow-inner placeholder:text-app-text-sub/20"
                    />
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
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="8+ CHARACTERS"
                      className="h-12 rounded-2xl border-app-border bg-app-mono-bg/5 focus:bg-white focus:ring-4 focus:ring-app-accent/5 transition-all font-black uppercase tracking-tight text-[13px] shadow-inner placeholder:text-app-text-sub/20"
                    />
                  </div>
                </div>

                <div className="space-y-3 group/field">
                  <div className="flex items-center justify-between mb-1 px-1">
                    <Label htmlFor="confirm" className="font-mono text-[9px] font-black text-app-text-sub uppercase tracking-widest group-focus-within/field:text-app-accent transition-colors">Confirm Password *</Label>
                    <Lock className="w-3.5 h-3.5 text-app-text-sub/20 group-focus-within/field:text-app-accent transition-colors" />
                  </div>
                  <div className="relative">
                    <Input
                      id="confirm"
                      type="password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="h-12 rounded-2xl border-app-border bg-app-mono-bg/5 focus:bg-white focus:ring-4 focus:ring-app-accent/5 transition-all font-black uppercase tracking-tight text-[13px] shadow-inner placeholder:text-app-text-sub/20"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="w-full h-16 bg-app-text-main text-app-bg hover:bg-app-accent font-black uppercase tracking-[0.2em] text-[12px] shadow-2xl shadow-app-accent/20 rounded-2xl transition-all active:scale-95 border-none group"
                >
                  {isLoading ? "PROVISIONING..." : "Create Account //"}
                  {!isLoading && <Zap className="w-4 h-4 ml-3 group-hover:scale-110 transition-transform" />}
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-6">
          <p className="text-center text-[11px] font-black text-app-text-sub/40 uppercase tracking-[0.3em]">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-app-accent hover:underline ml-2 transition-all">
              Sign in //
            </Link>
          </p>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20" />
            <span className="font-mono text-[8px] font-bold text-app-text-sub/30 uppercase tracking-widest">Protocol Registry Operational</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
