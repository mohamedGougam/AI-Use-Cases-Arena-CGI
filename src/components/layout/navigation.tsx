"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogoCgi } from "@/components/shared/logo-cgi";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  PlusCircle,
  Grid3X3,
  BarChart3,
  Trophy,
  Swords,
  Menu,
  X,
  Briefcase,
} from "lucide-react";
import { useState } from "react";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { useApp } from "@/context/app-context";
import { useAuth } from "@/context/auth-context";
import { LeaderScoreLabel } from "@/components/gamification/leader-score-label";
import { AboutThisTool } from "@/components/shared/about-this-tool";
import { isParticipantScoreLeader } from "@/lib/participants";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "layout-dashboard": LayoutDashboard,
  "plus-circle": PlusCircle,
  "grid-3x3": Grid3X3,
  "bar-chart-3": BarChart3,
  trophy: Trophy,
  swords: Swords,
  briefcase: Briefcase,
};

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { myScore, participantScores } = useApp();
  const { email, isAdmin, isArchitect, isBusiness, canAccessArchitectTools, logout } = useAuth();
  const isLeader = isParticipantScoreLeader(email, participantScores);

  const navContent = (
    <>
      <div className="mb-6 flex shrink-0 items-center gap-3 px-1 lg:mb-8 lg:px-2 xl:gap-4">
        <div className="flex h-10 min-w-[3.25rem] shrink-0 items-center justify-center rounded-xl border border-border/60 bg-white px-2 shadow-sm dark:border-white/20 dark:bg-white xl:h-12 xl:min-w-[3.75rem]">
          <LogoCgi className="scale-[0.85] origin-center xl:scale-100" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold leading-tight xl:text-base 2xl:text-lg">AI Use Cases</p>
          <p className="text-xs text-primary xl:text-sm">Arena</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.filter((item) => {
          if ("adminOnly" in item && item.adminOnly && !isAdmin) return false;
          if ("hideForAdmin" in item && item.hideForAdmin && isAdmin) return false;
          if ("hideForArchitect" in item && item.hideForArchitect && isArchitect) return false;
          if ("executiveOnly" in item && item.executiveOnly && !canAccessArchitectTools) return false;
          return true;
        }).map((item) => {
          const Icon = iconMap[item.icon];
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors xl:px-4 xl:py-3 xl:text-base",
                active
                  ? "text-primary"
                  : "text-muted surface-hover hover:text-foreground"
              )}
            >
              {active && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-lg border border-primary/25 bg-primary/10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              {Icon && <Icon className="relative h-4 w-4 shrink-0 xl:h-5 xl:w-5" />}
              <span className="relative truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 shrink-0 rounded-xl border border-border/15 bg-background/60 p-3 sm:p-4 lg:mt-auto xl:p-5">
        {isAdmin ? (
          <p className="type-caption text-muted">
            Facilitator mode: browse, vote, review architect tooling, and admin leaderboard. No
            submissions or personal scoring.
          </p>
        ) : isArchitect ? (
          <p className="type-caption text-muted">
            AI Architect mode: assess readiness, estimate delivery, and analyse the portfolio. No
            submissions or personal scoring.
          </p>
        ) : (
          <>
            <p className="type-caption text-muted">Your score</p>
            {isLeader && <LeaderScoreLabel />}
            <p className="type-stat text-primary">{myScore?.score ?? 0} pts</p>
            {myScore && (
              <p className="mt-2 type-caption text-muted">
                <span className="block sm:inline">{myScore.submissions} submitted</span>
                <span className="hidden sm:inline"> · </span>
                <span className="block sm:inline">{myScore.votesReceived} votes on your ideas</span>
                <span className="hidden sm:inline"> · </span>
                <span className="block sm:inline">{myScore.votesCast} votes cast</span>
              </p>
            )}
          </>
        )}
        {email && (
          <div className="mt-3 space-y-1">
            {isAdmin && (
              <span className="inline-block rounded-md bg-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary xl:text-xs">
                Facilitator
              </span>
            )}
            {isArchitect && (
              <span className="inline-block rounded-md bg-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary xl:text-xs">
                AI Architect
              </span>
            )}
            {isBusiness && (
              <span className="inline-block rounded-md bg-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary xl:text-xs">
                Business User
              </span>
            )}
            <p className="truncate type-caption text-muted" title={email ?? undefined}>
              {isAdmin
                ? "Facilitator"
                : isArchitect
                  ? "AI Architect"
                  : isBusiness
                    ? "Business User"
                    : email}
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={() => {
            logout();
            router.replace("/");
          }}
          className="mt-2 type-caption text-muted underline-offset-2 hover:text-foreground hover:underline"
        >
          Sign out
        </button>
      </div>

      <AboutThisTool compact className="mt-4 shrink-0" />
    </>
  );

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between border-b border-border/15 bg-background/90 px-3 backdrop-blur-xl sm:h-16 sm:px-4 lg:hidden">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 min-w-[2.75rem] shrink-0 items-center justify-center rounded-lg border border-border/60 bg-white px-1.5 dark:border-white/20 dark:bg-white">
            <LogoCgi className="scale-[0.62] origin-center" />
          </div>
          <span className="truncate font-bold">AI Arena</span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 surface-hover"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] dark:bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-[100dvh] w-[min(100vw,18rem)] flex-col border-r border-border/15 bg-card/95 p-3 shadow-xl backdrop-blur-xl transition-transform duration-200 ease-out sm:w-72 sm:p-4 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="mb-3 flex shrink-0 items-center justify-between">
          <span className="text-xs font-medium text-muted">Menu</span>
          <ThemeToggle />
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain pb-4 scrollbar-thin">
          {navContent}
        </div>
      </aside>

      <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-72 lg:shrink-0 lg:flex-col lg:border-r lg:border-border/15 lg:bg-card/95 lg:p-4 xl:w-80 2xl:w-[22rem] 2xl:p-6">
        <div className="mb-4 flex shrink-0 justify-end">
          <ThemeToggle />
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain pb-4 scrollbar-thin">
          {navContent}
        </div>
      </aside>
    </>
  );
}
