"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion } from "framer-motion";

interface TopNavProps {
  user: { name: string; email: string };
}

export default function TopNav({ user }: TopNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const navLinks = [
    { label: "OVERVIEW //", href: "/dashboard" },
    { label: "TEAM //", href: "/settings/team" },
  ];

  return (
    <div className="fixed top-0 left-0 w-full z-50 px-6 lg:px-12 pt-6 pointer-events-none">
      <header className="w-full max-w-[1800px] mx-auto pointer-events-auto">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="h-20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl border border-app-border rounded-[28px] px-8 flex items-center justify-between shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-none transition-all duration-500"
        >
          <div className="flex items-center gap-12">
            {/* Logo Section */}
            <Link href="/dashboard" className="flex items-center gap-4 group">
              <div className="w-11 h-11 bg-app-text-main text-app-bg rounded-2xl flex items-center justify-center group-hover:rotate-[-5deg] transition-all duration-500 shadow-xl shadow-app-accent/5">
                <span className="font-black text-xl tracking-tighter">H</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter text-app-text-main leading-none">
                  HireGrid
                </span>
                <span className="text-[9px] font-black text-app-accent uppercase tracking-[0.4em] mt-1 leading-none">
                  V.02 // ALPHA
                </span>
              </div>
            </Link>

            <div className="h-8 w-px bg-app-border hidden md:block" />

            {/* Main Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all relative group/link",
                    pathname === link.href ? "text-app-accent bg-app-accent/5" : "text-app-text-sub/50 hover:text-app-text-main hover:bg-app-bg"
                  )}
                >
                  {link.label}
                  {pathname === link.href && (
                    <motion.div 
                      layoutId="nav-glow"
                      className="absolute inset-0 border border-app-accent/20 rounded-xl -z-10" 
                    />
                  )}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-6">
            {/* Mode & Identity */}
            <div className="flex items-center gap-2 pr-6 border-r border-app-border hidden sm:flex">
              <ThemeToggle />
            </div>

            <div className="flex items-center gap-5">
              <div className="hidden lg:flex flex-col items-end">
                <p className="text-[12px] font-black text-app-text-main leading-none uppercase tracking-tight">{user.name}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[9px] text-app-text-sub font-black uppercase tracking-[0.2em]">OPERATIONAL // SECURED</p>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none">
                  <div className="relative p-1 rounded-[20px] border-2 border-transparent hover:border-app-accent/20 transition-all bg-app-card/10 group">
                    <Avatar className="h-11 w-11 rounded-[16px] shadow-sm transition-transform duration-500 group-hover:scale-105">
                      <AvatarFallback className="text-[13px] font-black bg-app-mono-bg text-app-text-main rounded-[16px]">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-app-bg rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 rounded-[32px] p-5 border-app-border bg-white/95 dark:bg-slate-950/95 backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] mt-4">
                  <div className="px-5 py-5 mb-4 bg-app-bg rounded-[24px] border border-app-border/50">
                    <span className="font-mono text-[9px] font-black text-app-accent uppercase tracking-widest block mb-2">Authenticated Identity //</span>
                    <p className="text-[15px] font-black text-app-text-main truncate">{user.name}</p>
                    <p className="text-[11px] text-app-text-sub truncate font-bold uppercase tracking-tighter mt-1">{user.email}</p>
                  </div>
                  <DropdownMenuItem asChild className="text-[11px] font-black text-app-text-main hover:text-app-accent hover:bg-app-accent/5 rounded-xl cursor-pointer transition-all py-4 px-5 uppercase tracking-[0.2em] focus:bg-app-accent/5 focus:text-app-accent">
                    <Link href="/settings/team">Manage Profile Configuration //</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-app-border my-2" />
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="text-[11px] font-black text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl cursor-pointer transition-all py-4 px-5 uppercase tracking-[0.2em] focus:bg-rose-50 focus:text-rose-700"
                  >
                    Terminate Current Session //
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </motion.div>
      </header>
    </div>
  );
}
