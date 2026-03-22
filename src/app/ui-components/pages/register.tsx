"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signUp } from "@/lib/auth-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, ArrowRight, User, Mail, Lock } from "lucide-react";

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
          onError: (err: any) => {
            toast.error(err?.error?.message || "Registration failed");
          },
          onSuccess: () => {
            router.push("/onboarding");
          },
        }
      );
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-10 text-center">
          <Link href="/" className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 mb-6 hover:scale-105 transition-transform">
            <Sparkles className="w-6 h-6 text-blue-600" />
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create account</h1>
          <p className="text-[15px] text-slate-500 mt-2 font-medium leading-relaxed">Join HireGrid to streamline your recruitment</p>
        </div>

        <Card className="border-slate-200/60 bg-white shadow-xl shadow-slate-200/40 rounded-[32px] overflow-hidden">
          <CardContent className="p-8 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-1 px-1">
                    <Label htmlFor="name" className="text-[13px] font-bold text-slate-700">Full Name</Label>
                    <User className="w-3.5 h-3.5 text-slate-300" />
                  </div>
                  <Input
                    id="name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Jane Smith"
                    className="h-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all text-[15px] font-medium placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-1 px-1">
                    <Label htmlFor="email" className="text-[13px] font-bold text-slate-700">Email Address</Label>
                    <Mail className="w-3.5 h-3.5 text-slate-300" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@company.com"
                    className="h-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all text-[15px] font-medium placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-1 px-1">
                    <Label htmlFor="password" className="text-[13px] font-bold text-slate-700">Password</Label>
                    <Lock className="w-3.5 h-3.5 text-slate-300" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="8+ characters"
                    className="h-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all text-[15px] font-medium placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-1 px-1">
                    <Label htmlFor="confirm" className="text-[13px] font-bold text-slate-700">Confirm Password</Label>
                    <Lock className="w-3.5 h-3.5 text-slate-300" />
                  </div>
                  <Input
                    id="confirm"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="h-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all text-[15px] font-medium placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200/50 rounded-xl font-bold transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoading ? "Creating account..." : "Create account"}
                  {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-[14px] text-slate-500 mt-8 font-medium">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-blue-600 hover:text-blue-700 font-bold ml-1">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
