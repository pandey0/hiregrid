"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  user: { name: string; email: string };
  isMobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Programs", href: "/programs" },
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
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-56 bg-white border-r border-zinc-200 flex flex-col transition-transform duration-200",
          "md:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-14 flex items-center px-5 border-b border-zinc-200">
          <Link href="/dashboard" className="text-sm font-semibold tracking-tight text-zinc-900">
            HireGrid
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <p className="px-2 pb-2 text-[11px] font-medium uppercase tracking-widest text-zinc-400">
            Navigation
          </p>
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block px-2 py-1.5 rounded text-sm transition-colors",
                  active
                    ? "text-zinc-900 font-medium bg-zinc-100"
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-zinc-200 space-y-3">
          <div className="flex items-center gap-2.5 px-2">
            <Avatar className="h-7 w-7 flex-shrink-0">
              <AvatarFallback className="text-[10px] font-semibold bg-zinc-900 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-xs font-medium text-zinc-900 truncate">{user.name}</p>
              <p className="text-[11px] text-zinc-400 truncate">{user.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="w-full justify-start text-zinc-400 hover:text-zinc-900 px-2"
          >
            Sign out
          </Button>
        </div>
      </aside>
    </>
  );
}
