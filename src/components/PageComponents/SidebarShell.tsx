"use client";

import { useState } from "react";
import Sidebar from "./sidebar";
import { Menu, X } from "lucide-react";

interface SidebarShellProps {
  user: { name: string; email: string };
}

export default function SidebarShell({ user }: SidebarShellProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-zinc-200 text-zinc-600 shadow-sm active:scale-95 transition-transform"
        aria-label="Toggle menu"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>
      <Sidebar user={user} isMobileOpen={open} setMobileOpen={setOpen} />
    </>
  );
}
