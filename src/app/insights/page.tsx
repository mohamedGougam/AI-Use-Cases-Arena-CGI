"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Bot, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { useApp } from "@/context/app-context";
import {
  ChartCard,
  InsightBarChart,
  InsightPieChart,
  InsightLineChart,
} from "@/components/insights/insight-chart";
import { ImpactEffortMatrix } from "@/components/insights/impact-effort-matrix";
import { Button } from "@/components/ui/button";
import {
  getTotalVotes,
  getDepartmentStats,
  getCategoryDistribution,
  getThemeCounts,
  getImpactEffortMatrix,
  getTopContributors,
  getQuickWins,
  getStrategicBets,
  generateExecutiveSummary,
} from "@/lib/analytics";
import { votingTrendData } from "@/data/mock-data";

export default function InsightsPage() {
  const { useCases, users } = useApp();
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const deptStats = getDepartmentStats(useCases);
  const topVoted = [...useCases].sort((a, b) => b.votes - a.votes).slice(0, 6);
  const categoryData = getCategoryDistribution(useCases);
  const themes = getThemeCounts(useCases);
  const matrix = getImpactEffortMatrix(useCases);
  const contributors = getTopContributors(users).slice(0, 6);
  const quickWins = getQuickWins(useCases);
  const strategicBets = getStrategicBets(useCases);

  const handleGenerateSummary = () => {
    setGenerating(true);
    setTimeout(() => {
      setAiSummary(generateExecutiveSummary(useCases));
      setGenerating(false);
    }, 1200);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Insights & Analytics"
        subtitle="Data-driven view of AI innovation across Invest-NL."
        icon={BarChart3}
        action={
          <Button onClick={handleGenerateSummary} disabled={generating} className="gap-2">
            <Bot className="h-4 w-4" />
            {generating ? "Generating..." : "Generate AI Executive Summary"}
          </Button>
        }
      />

      {aiSummary && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card border border-primary/30 p-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="font-bold">AI Executive Summary</h2>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-muted font-sans">{aiSummary}</pre>
        </motion.div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Use Cases", value: useCases.length },
          { label: "Total Votes", value: getTotalVotes(useCases) },
          { label: "Quick Wins", value: quickWins.length },
          { label: "Strategic Bets", value: strategicBets.length },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-5">
            <p className="text-sm text-muted">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold text-primary">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Top Voted Use Cases">
          <InsightBarChart
            data={topVoted.map((uc) => ({ name: uc.title.slice(0, 20) + "...", value: uc.votes }))}
          />
        </ChartCard>
        <ChartCard title="Category Distribution">
          <InsightPieChart data={categoryData} />
        </ChartCard>
        <ChartCard title="Department Leaderboard">
          <InsightBarChart
            data={deptStats.slice(0, 8).map((d) => ({ name: d.department.slice(0, 12), value: d.innovationScore }))}
          />
        </ChartCard>
        <ChartCard title="Voting Trends Over Time">
          <InsightLineChart data={votingTrendData} />
        </ChartCard>
        <ImpactEffortMatrix data={matrix} />
        <ChartCard title="Most Common Themes">
          <InsightBarChart data={themes.map((t) => ({ name: t.name, value: t.count }))} />
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card p-6">
          <h3 className="font-bold mb-4">Quick Wins Quadrant</h3>
          <ul className="space-y-2">
            {quickWins.map((uc) => (
              <li key={uc.id} className="flex justify-between text-sm rounded-lg bg-primary/5 p-3">
                <span>{uc.title}</span>
                <span className="text-primary font-bold">{uc.innovationScore}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="glass-card p-6">
          <h3 className="font-bold mb-4">Strategic Bets Quadrant</h3>
          <ul className="space-y-2">
            {strategicBets.map((uc) => (
              <li key={uc.id} className="flex justify-between text-sm rounded-lg bg-secondary/20 p-3">
                <span>{uc.title}</span>
                <span className="text-primary font-bold">{uc.innovationScore}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-bold mb-4">Most Active Contributors</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {contributors.map((u) => (
            <div key={u.id} className="flex items-center gap-3 rounded-lg bg-white/5 p-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold">
                {u.avatar}
              </span>
              <div>
                <p className="font-medium">{u.name}</p>
                <p className="text-xs text-muted">{u.department}</p>
              </div>
              <span className="ml-auto font-bold text-primary">{u.points} XP</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
