"use client";

import { useState } from "react";
import Sidebar from "./sidebar";

interface SidebarShellProps {
  user: { name: string; email: string };
}

export default function SidebarShell({ user }: SidebarShellProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-4 left-4 z-50 w-8 h-8 flex items-center justify-center rounded bg-white border border-zinc-200 text-zinc-600"
        aria-label="Toggle menu"
      >
        <span className="text-xs font-mono">☰</span>
      </button>
      <Sidebar user={user} isMobileOpen={open} setMobileOpen={setOpen} />
    </>
  );
}
