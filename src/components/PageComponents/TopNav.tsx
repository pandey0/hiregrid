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
    { label: "Dashboard", href: "/dashboard" },
    { label: "Settings", href: "/settings/team" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-100">
      <div className="flex h-20 items-center justify-between px-8 lg:px-16 w-full max-w-[1800px] mx-auto">
        <div className="flex items-center gap-12">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-500">
              <span className="text-white font-black text-xl tracking-tighter">H</span>
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900">
              HireGrid
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href}
                className={cn(
                  "text-[14px] font-bold transition-all hover:text-blue-600 tracking-tight",
                  pathname === link.href ? "text-blue-600" : "text-slate-400"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex flex-col items-end mr-2">
            <p className="text-[13px] font-bold text-slate-900 leading-none">{user.name}</p>
            <p className="text-[11px] text-slate-400 font-medium mt-1 uppercase tracking-widest">Recruiter</p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <div className="p-1 rounded-2xl border-2 border-transparent hover:border-blue-100 transition-all">
                <Avatar className="h-11 w-11 rounded-xl shadow-sm transition-transform hover:scale-105">
                  <AvatarFallback className="text-[13px] font-black bg-slate-100 text-slate-900 rounded-xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-3xl p-3 border-slate-100 shadow-2xl shadow-slate-200 mt-2">
              <div className="px-3 py-3 mb-2 bg-slate-50 rounded-2xl">
                <p className="text-[14px] font-bold text-slate-900 truncate">{user.name}</p>
                <p className="text-[12px] text-slate-500 truncate font-medium">{user.email}</p>
              </div>
              <DropdownMenuItem asChild className="text-[13px] font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl cursor-pointer transition-all py-3 px-4">
                <Link href="/settings/team">Account Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-50 my-2" />
              <DropdownMenuItem 
                onClick={handleSignOut}
                className="text-[13px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl cursor-pointer transition-all py-3 px-4"
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
