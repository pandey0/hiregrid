"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  LogOut,
  Sparkles
} from "lucide-react";

interface SidebarProps {
  user: { name: string; email: string };
  isMobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
];

export default function Sidebar({ user, isMobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
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
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/10 backdrop-blur-[2px] z-40 md:hidden transition-all duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/60 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          "md:translate-x-0",
          isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center px-6">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-blue-200/50 shadow-lg group-hover:scale-105 transition-all">
              <Sparkles className="w-4 h-4 fill-current" />
            </div>
            <span className="text-[17px] font-bold tracking-tight text-slate-900">
              HireGrid
            </span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-xl text-[14px] font-medium transition-all duration-200",
                    active
                      ? "text-blue-600 bg-blue-50/50"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <item.icon className={cn(
                    "w-[18px] h-[18px]",
                    active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                  )} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 mt-auto">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100/50 space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 rounded-lg ring-2 ring-white shadow-sm flex-shrink-0">
                <AvatarFallback className="text-[10px] font-bold bg-slate-900 text-white rounded-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-slate-900 truncate leading-none mb-1">{user.name}</p>
                <p className="text-[11px] text-slate-500 truncate leading-none font-medium">{user.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="w-full h-8 justify-start text-slate-500 hover:text-slate-900 hover:bg-white hover:shadow-sm rounded-lg px-2 text-[12px] transition-all group"
            >
              <LogOut className="w-3.5 h-3.5 mr-2 text-slate-400 group-hover:text-slate-600" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
