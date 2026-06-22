"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  ThumbsUp,
  Trophy,
  Building2,
  TrendingUp,
  Zap,
  Flame,
  ArrowRight,
  Inbox,
} from "lucide-react";
import { useApp } from "@/context/app-context";
import { useAuth } from "@/context/auth-context";
import { StatCard } from "@/components/shared/stat-card";
import { UseCaseCard } from "@/components/use-case/use-case-card";
import { Button } from "@/components/ui/button";
import {
  getTotalVotes,
  getTopUseCase,
  getDepartmentStats,
  getTrendingUseCases,
  getQuickWins,
} from "@/lib/analytics";
import { EmptyState } from "@/components/shared/empty-state";

export function DashboardHome() {
  const { useCases } = useApp();
  const { email, isAdmin, isArchitect, isBusiness, canAccessArchitectTools } = useAuth();
  const totalVotes = getTotalVotes(useCases);
  const topCase = getTopUseCase(useCases);
  const deptStats = getDepartmentStats(useCases);
  const trending = getTrendingUseCases(useCases, 3);
  const quickWins = getQuickWins(useCases);

  return (
    <motion.div className="min-w-0 space-y-8 sm:space-y-10 xl:space-y-12">
      <section className="glass-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6 md:p-8 xl:p-10">
        <motion.div>
          <p className="type-caption text-muted">
            {isAdmin ? "Facilitator" : isArchitect ? "AI Architect" : isBusiness ? "Business User" : "Welcome back"}
          </p>
          <h1 className="type-page-title mt-1">
            {isAdmin
              ? "Arena overview"
              : isArchitect
                ? "Telecom AI Solutioning"
                : "Your AI Use Cases Arena"}
          </h1>
          <p className="type-body mt-2 max-w-2xl text-muted">
            {isAdmin
              ? "Monitor submissions, assess readiness, and guide portfolio prioritization."
              : isArchitect
                ? "Review use cases, score readiness, estimate delivery, and analyse the portfolio."
                : "Track your ideas, votes, and impact in the arena."}
          </p>
          {email && !canAccessArchitectTools && (
            <p className="type-body mt-1 truncate max-w-md text-muted">
              {isBusiness ? "Workshop participant" : email}
            </p>
          )}
        </motion.div>
        <motion.div className="flex w-full flex-col gap-2 xs:flex-row xs:flex-wrap xs:gap-3 sm:w-auto">
          {!canAccessArchitectTools && (
            <Button asChild size="lg" className="w-full xs:w-auto">
              <Link href="/submit">
                Submit Use Case <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
          <Button asChild variant="outline" size="lg" className="w-full xs:w-auto">
            <Link
              href={
                isAdmin ? "/leaderboard" : isArchitect ? "/portfolio" : "/gallery"
              }
            >
              {isAdmin
                ? "Admin Leaderboard"
                : isArchitect
                  ? "Portfolio Analysis"
                  : "Browse Gallery"}
            </Link>
          </Button>
        </motion.div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:gap-6">
        <StatCard label="Total Use Cases" value={useCases.length} icon={FileText} />
        <StatCard label="Total Votes" value={totalVotes} icon={ThumbsUp} />
        <StatCard
          label="Top-Ranked Use Case"
          value={topCase?.votes ?? 0}
          icon={Trophy}
          animate={false}
          trend={topCase ? `${topCase.title.slice(0, 30)}...` : undefined}
        />
        <StatCard
          label="Most Active Department"
          value={deptStats[0]?.useCaseCount ?? 0}
          icon={Building2}
          animate={false}
          trend={deptStats[0]?.department}
        />
      </section>

      <section className="grid min-w-0 gap-6 lg:grid-cols-3 xl:gap-8">
        <div className="glass-card min-w-0 p-4 sm:p-6 lg:col-span-2 xl:p-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="type-section-title flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary xl:h-6 xl:w-6" />
              Trending Use Cases
            </h2>
            <Link href="/gallery" className="type-body text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {trending.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="No use cases yet"
                description={
                  canAccessArchitectTools
                    ? "Open the Gallery to review participant submissions."
                    : "Submit the first AI use case for your team."
                }
                action={
                  !canAccessArchitectTools ? (
                    <Button asChild>
                      <Link href="/submit">Submit Use Case</Link>
                    </Button>
                  ) : isArchitect ? (
                    <Button asChild variant="outline">
                      <Link href="/gallery">Browse Gallery</Link>
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              trending.map((uc, i) => (
                <UseCaseCard key={uc.id} useCase={uc} index={i} />
              ))
            )}
          </div>
        </div>

        <div className="space-y-6 xl:space-y-8">
          <motion.div className="glass-card p-6 xl:p-8">
            <h2 className="type-section-title mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary xl:h-6 xl:w-6" />
              Quick Wins
            </h2>
            <p className="type-body mb-4 text-muted">
              High impact, low effort opportunities
            </p>
            {quickWins.length === 0 ? (
              <p className="type-body text-muted">No quick wins identified yet.</p>
            ) : (
              <ul className="space-y-3">
                {quickWins.slice(0, 4).map((uc) => (
                  <li key={uc.id}>
                    <Link
                      href={`/use-cases/${uc.id}`}
                      className="block rounded-lg p-3 surface-hover"
                    >
                      <p className="font-medium text-sm">{uc.title}</p>
                      <p className="text-xs text-primary mt-1">
                        Score {uc.innovationScore}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>

          <motion.div className="glass-card p-6 xl:p-8">
            <h2 className="type-section-title mb-4 flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-400 xl:h-6 xl:w-6" />
              Hottest Departments
            </h2>
            <div className="space-y-3">
              {deptStats.length === 0 ? (
                <p className="type-body text-muted">No department activity yet.</p>
              ) : (
                deptStats.slice(0, 5).map((d, i) => (
                  <div key={d.department} className="flex items-center justify-between">
                    <span className="type-body">
                      {i + 1}. {d.department}
                    </span>
                    <span className="type-body font-bold text-primary">{d.innovationScore}</span>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          <motion.div className="glass-card p-6 xl:p-8">
            <h2 className="type-section-title mb-2">Innovation Momentum</h2>
            <p className="type-stat text-gradient">
              {useCases.length > 0 ? totalVotes : "—"}
            </p>
            <p className="type-body mt-1 text-muted">total votes cast</p>
          </motion.div>
        </div>
      </section>

      <section className="glass-card p-6 xl:p-8">
        <h2 className="type-section-title mb-4">AI Opportunity Heatmap</h2>
        {deptStats.length === 0 ? (
          <p className="type-body text-muted">
            Department activity is shown after the first use case is submitted.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-5 xl:gap-3">
            {deptStats.map((d) => (
              <div
                key={d.department}
                className="rounded-lg p-4 text-center transition-transform hover:scale-105 xl:p-5"
                style={{
                  background: `rgba(227, 25, 55, ${Math.min(0.38, d.innovationScore / 500)})`,
                  border: "1px solid rgb(var(--border) / 0.15)",
                }}
              >
                <p className="type-caption truncate font-medium">{d.department}</p>
                <p className="type-stat mt-1">{d.useCaseCount}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
}
