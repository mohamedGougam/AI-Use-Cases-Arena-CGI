"use client";

import { Swords, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { DepartmentBattleCard } from "@/components/battle/department-battle-card";
import { useApp } from "@/context/app-context";
import { getDepartmentStats } from "@/lib/analytics";

export default function BattlePage() {
  const { useCases } = useApp();
  const stats = getDepartmentStats(useCases);
  const maxScore = stats[0]?.innovationScore ?? 1;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Department Battle Mode"
        subtitle="Which team will lead the AI transformation?"
        icon={Swords}
      />

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-card to-background p-8 md:p-12 text-center"
      >
        <div className="absolute inset-0 bg-hero-glow" aria-hidden />
        <div className="relative z-10">
          <Swords className="mx-auto h-16 w-16 text-primary mb-4" />
          <h2 className="text-3xl font-bold md:text-4xl">
            Which team will lead the{" "}
            <span className="text-gradient">AI transformation?</span>
          </h2>
          <p className="mt-4 text-muted max-w-xl mx-auto">
            Departments compete on use cases submitted, votes received, innovation score, and engagement.
          </p>
        </div>
      </motion.section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="glass-card p-6 text-center">
          <p className="text-3xl font-bold text-primary">{stats[0]?.department ?? "—"}</p>
          <p className="text-sm text-muted mt-1">Current Leader</p>
        </div>
        <div className="glass-card p-6 text-center">
          <p className="text-3xl font-bold">{stats.reduce((s, d) => s + d.useCaseCount, 0)}</p>
          <p className="text-sm text-muted mt-1">Total Submissions</p>
        </div>
        <div className="glass-card p-6 text-center">
          <p className="text-3xl font-bold">{stats.reduce((s, d) => s + d.totalVotes, 0)}</p>
          <p className="text-sm text-muted mt-1">Total Votes</p>
        </div>
      </div>

      <section>
        <div className="mb-6 flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Live Department Rankings</h2>
        </div>
        <DepartmentBattleCard stats={stats} maxScore={maxScore} />
      </section>
    </div>
  );
}
