"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800/50 animate-pulse shrink-0" />;
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      type="button"
      className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 transition-all duration-200 shadow-sm border border-slate-200/50 dark:border-slate-700/50 shrink-0"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun size={17} className="text-amber-500 fill-amber-500/10" />
      ) : (
        <Moon size={17} className="text-slate-700 fill-slate-700/10" />
      )}
    </button>
  );
}
