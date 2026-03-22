"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopNavProps {
  user: { name: string; email: string };
}

export default function TopNav({ user }: TopNavProps) {
  const router = useRouter();

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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-6 lg:px-10 max-w-7xl mx-auto">
        <Link href="/dashboard" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <span className="text-[17px] font-bold tracking-tight text-slate-900">
            HireGrid
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <Avatar className="h-8 w-8 rounded-lg ring-1 ring-slate-200 shadow-sm transition-transform hover:scale-105">
                <AvatarFallback className="text-[11px] font-bold bg-slate-900 text-white rounded-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 border-slate-200 shadow-xl shadow-slate-900/5">
              <div className="px-2 py-1.5 mb-2">
                <p className="text-[13px] font-semibold text-slate-900 truncate">{user.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
              </div>
              <DropdownMenuSeparator className="bg-slate-100 mb-2" />
              <DropdownMenuItem asChild className="text-[13px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                <Link href="/settings/team">Team Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleSignOut}
                className="text-[13px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
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
