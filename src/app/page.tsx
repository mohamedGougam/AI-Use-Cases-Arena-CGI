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
} from "lucide-react";
import { useApp } from "@/context/app-context";
import { StatCard } from "@/components/shared/stat-card";
import { ParticlesBackground } from "@/components/shared/particles-background";
import { UseCaseCard } from "@/components/use-case/use-case-card";
import { Button } from "@/components/ui/button";
import {
  getTotalVotes,
  getTopUseCase,
  getDepartmentStats,
  getMostActiveDepartment,
  getTrendingUseCases,
  getQuickWins,
} from "@/lib/analytics";

export default function DashboardPage() {
  const { useCases } = useApp();
  const totalVotes = getTotalVotes(useCases);
  const topCase = getTopUseCase(useCases);
  const deptStats = getDepartmentStats(useCases);
  const trending = getTrendingUseCases(useCases, 3);
  const quickWins = getQuickWins(useCases);

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-card/50 p-8 md:p-12">
        <ParticlesBackground />
        <div
          className="absolute inset-0 bg-hero-glow"
          aria-hidden
        />
        <div className="relative z-10 max-w-3xl">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-3 text-sm font-medium uppercase tracking-widest text-primary"
          >
            Invest-NL Innovation Arena
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl"
          >
            Shape the Future of{" "}
            <span className="text-gradient">AI at Invest-NL</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-muted md:text-xl"
          >
            Submit, explore, vote, and prioritize the AI use cases that can
            transform our organization.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 flex flex-wrap gap-4"
          >
            <Button asChild size="lg">
              <Link href="/submit">
                Submit Use Case <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/gallery">Browse Gallery</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Use Cases" value={useCases.length} icon={FileText} trend="+12% this month" />
        <StatCard label="Total Votes" value={totalVotes} icon={ThumbsUp} trend="Growing engagement" />
        <StatCard
          label="Top-Ranked Use Case"
          value={topCase?.votes ?? 0}
          icon={Trophy}
          animate={false}
          trend={topCase?.title?.slice(0, 30) + "..."}
        />
        <StatCard
          label="Most Active Department"
          value={deptStats[0]?.useCaseCount ?? 0}
          icon={Building2}
          animate={false}
          trend={getMostActiveDepartment(deptStats)}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="glass-card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Trending Use Cases
            </h2>
            <Link href="/gallery" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {trending.map((uc, i) => (
              <UseCaseCard key={uc.id} useCase={uc} index={i} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="mb-4 text-xl font-bold flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Quick Wins
            </h2>
            <p className="mb-4 text-sm text-muted">
              High impact, low effort opportunities
            </p>
            <ul className="space-y-3">
              {quickWins.slice(0, 4).map((uc) => (
                <li key={uc.id}>
                  <Link
                    href={`/use-cases/${uc.id}`}
                    className="block rounded-lg p-3 hover:bg-white/5 transition-colors"
                  >
                    <p className="font-medium text-sm">{uc.title}</p>
                    <p className="text-xs text-primary mt-1">
                      Score {uc.innovationScore}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card p-6">
            <h2 className="mb-4 text-xl font-bold flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-400" />
              Hottest Departments
            </h2>
            <div className="space-y-3">
              {deptStats.slice(0, 5).map((d, i) => (
                <div key={d.department} className="flex items-center justify-between">
                  <span className="text-sm">
                    {i + 1}. {d.department}
                  </span>
                  <span className="text-sm font-bold text-primary">{d.innovationScore}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="mb-2 text-lg font-bold">Innovation Momentum</h2>
            <p className="text-3xl font-bold text-gradient">+24%</p>
            <p className="text-sm text-muted mt-1">vs last month</p>
          </div>
        </div>
      </section>

      <section className="glass-card p-6">
        <h2 className="mb-4 text-xl font-bold">AI Opportunity Heatmap</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {deptStats.map((d) => (
            <div
              key={d.department}
              className="rounded-lg p-4 text-center transition-transform hover:scale-105"
              style={{
                background: `rgba(141, 198, 63, ${Math.min(0.4, d.innovationScore / 500)})`,
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <p className="text-xs font-medium truncate">{d.department}</p>
              <p className="mt-1 text-lg font-bold">{d.useCaseCount}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
