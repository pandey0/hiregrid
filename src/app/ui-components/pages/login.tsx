"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signIn } from "@/lib/auth-client";
import Link from "next/link";

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
          onError: (err: any) => {
            toast.error(err?.error?.message || "Sign in failed");
          },
          onSuccess: () => {
            router.push("/dashboard");
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
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">HireGrid</h1>
          <p className="text-sm text-zinc-400 mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-zinc-600 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-md placeholder:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-zinc-600 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-300 rounded-md placeholder:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-zinc-900 text-white text-sm font-medium rounded-md hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-400 mt-5">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="text-zinc-700 hover:text-zinc-900 underline underline-offset-2">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
