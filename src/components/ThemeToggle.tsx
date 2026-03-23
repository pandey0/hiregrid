"use client";

import * as React from "react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <span className="font-mono text-[10px] font-black text-slate-200 uppercase tracking-widest px-2 py-1">
        [ MODE ]
      </span>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="font-mono text-[10px] font-black text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 uppercase tracking-widest transition-colors px-2 py-1"
    >
      {theme === "dark" ? "[ LIGHT MODE ]" : "[ DARK MODE ]"}
    </button>
  );
}
