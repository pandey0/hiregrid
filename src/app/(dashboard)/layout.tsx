// app/(dashboard)/layout.tsx
'use client';

import { ReactNode, useState } from "react";
import Sidebar from "@/components/PageComponents/sidebar"
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: LayoutProps) {
  const [isMobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setMobileOpen(!isMobileOpen)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Sidebar */}
      <Sidebar isMobileOpen={false} setMobileOpen={function (open: boolean): void {
        throw new Error("Function not implemented.");
      } } />

      {/* Main content */}
      <div className="md:pl-64">
        <main className="min-h-screen">{children}</main>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-0 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </div>
  );
}
