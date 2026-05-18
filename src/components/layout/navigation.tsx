"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  PlusCircle,
  Grid3X3,
  BarChart3,
  Trophy,
  Swords,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { useApp } from "@/context/app-context";
import { Progress } from "@/components/ui/progress";
import { getRankProgress } from "@/lib/scoring";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "layout-dashboard": LayoutDashboard,
  "plus-circle": PlusCircle,
  "grid-3x3": Grid3X3,
  "bar-chart-3": BarChart3,
  trophy: Trophy,
  swords: Swords,
};

export function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { currentUser } = useApp();
  const progress = getRankProgress(currentUser.points);

  const navContent = (
    <>
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 shadow-glow-sm">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight">AI Use Cases</p>
          <p className="text-xs text-primary">Arena</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon];
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "text-primary" : "text-muted hover:bg-white/5 hover:text-foreground"
              )}
            >
              {active && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-lg bg-primary/10 border border-primary/20"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              {Icon && <Icon className="relative h-4 w-4" />}
              <span className="relative">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-xl border border-white/10 bg-background/50 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs text-muted">Your rank</span>
          <span className="text-xs font-semibold text-primary">{currentUser.rank}</span>
        </div>
        <p className="mb-2 text-lg font-bold">{currentUser.points} XP</p>
        <Progress value={progress.percent} className="h-1.5" />
        <p className="mt-1 text-xs text-muted">
          {progress.next - currentUser.points} XP to next level
        </p>
      </div>
    </>
  );

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-white/10 bg-background/80 px-4 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="font-bold">AI Arena</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 hover:bg-white/5"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-white/10 bg-card/95 p-4 backdrop-blur-xl transition-transform lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="hidden lg:flex lg:justify-end">
          <ThemeToggle />
        </div>
        {navContent}
      </aside>
    </>
  );
}
