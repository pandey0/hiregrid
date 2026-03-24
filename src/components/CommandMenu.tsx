"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { globalSearch } from "@/actions/programs";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ programs: any[]; candidates: any[] }>({ programs: [], candidates: [] });
  const router = useRouter();
  const { setTheme, theme } = useTheme();

  // Toggle open/close on Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Handle Search
  useEffect(() => {
    if (query.length < 2) {
      setResults({ programs: [], candidates: [] });
      return;
    }
    const timer = setTimeout(async () => {
      const data = await globalSearch(query);
      setResults(data);
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <AnimatePresence>
      {open && (
        <Command.Dialog
          open={open}
          onOpenChange={setOpen}
          label="Global Command Palette"
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 pointer-events-none"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm pointer-events-auto"
            onClick={() => setOpen(false)}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            className="w-full max-w-[640px] bg-white dark:bg-slate-900 rounded-3xl border border-app-border shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden pointer-events-auto relative z-10"
          >
            <div className="flex items-center border-b border-app-border px-6">
              <span className="font-mono text-[10px] font-black text-app-accent mr-4 uppercase tracking-[0.3em]">FIND //</span>
              <Command.Input
                value={query}
                onValueChange={setQuery}
                placeholder="Search programs, candidates, or commands..."
                className="flex-1 h-16 bg-transparent outline-none text-[14px] font-bold text-app-text-main placeholder:text-app-text-sub/30 uppercase tracking-widest"
              />
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded bg-app-mono-bg text-[9px] font-black text-app-text-sub/40 font-mono">ESC</span>
              </div>
            </div>

            <Command.List className="max-h-[400px] overflow-y-auto p-4 space-y-2 custom-scrollbar">
              <Command.Empty className="py-12 text-center">
                <span className="font-mono text-[11px] font-bold text-app-text-sub/40 uppercase tracking-widest">Zero matches found //</span>
              </Command.Empty>

              {/* Dynamic Results */}
              {results.programs.length > 0 && (
                <Command.Group heading={<span className="px-4 py-2 block text-[9px] font-black text-app-accent uppercase tracking-[0.3em]">Programs //</span>}>
                  {results.programs.map((p) => (
                    <CommandItem key={p.id} onSelect={() => runCommand(() => router.push(`/programs/${p.id}`))}>
                      <span className="flex-1">{p.name}</span>
                      <span className="font-mono text-[10px] opacity-20 uppercase">Open Program</span>
                    </CommandItem>
                  ))}
                </Command.Group>
              )}

              {results.candidates.length > 0 && (
                <Command.Group heading={<span className="px-4 py-2 block text-[9px] font-black text-app-accent uppercase tracking-[0.3em]">Candidates //</span>}>
                  {results.candidates.map((c) => (
                    <CommandItem key={c.id} onSelect={() => runCommand(() => router.push(`/programs/${c.programId}/candidates/${c.id}`))}>
                      <span className="flex-1">{c.name}</span>
                      <span className="font-mono text-[10px] opacity-20 uppercase text-xs">{c.email}</span>
                    </CommandItem>
                  ))}
                </Command.Group>
              )}

              {/* Navigation Commands */}
              <Command.Group heading={<span className="px-4 py-2 block text-[9px] font-black text-app-text-sub/40 uppercase tracking-[0.3em]">Navigation //</span>}>
                <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
                  <span className="flex-1">Go to Dashboard</span>
                  <kbd className="font-mono text-[10px] opacity-40 group-hover:opacity-100 transition-opacity">G D</kbd>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => router.push("/settings/team"))}>
                  <span className="flex-1">Manage Team</span>
                  <kbd className="font-mono text-[10px] opacity-40 group-hover:opacity-100 transition-opacity">G T</kbd>
                </CommandItem>
              </Command.Group>

              {/* Theme Commands */}
              <Command.Group heading={<span className="px-4 py-2 block text-[9px] font-black text-app-text-sub/40 uppercase tracking-[0.3em]">System //</span>}>
                <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
                  <span className="flex-1 text-app-text-main">Switch to Light Mode</span>
                  <div className="w-2 h-2 rounded-full bg-slate-200" />
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
                  <span className="flex-1 text-app-text-main">Switch to Dark Mode</span>
                  <div className="w-2 h-2 rounded-full bg-slate-800" />
                </CommandItem>
              </Command.Group>
            </Command.List>
          </motion.div>
        </Command.Dialog>
      )}
    </AnimatePresence>
  );
}

function CommandItem({ children, onSelect }: { children: React.ReactNode; onSelect: () => void }) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="group flex items-center gap-4 px-4 py-4 rounded-xl cursor-pointer transition-all data-[selected=true]:bg-app-accent/5 data-[selected=true]:text-app-accent text-[13px] font-bold text-app-text-main uppercase tracking-widest"
    >
      {children}
    </Command.Item>
  );
}
