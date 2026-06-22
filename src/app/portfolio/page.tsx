"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Briefcase,
  Building2,
  Gauge,
  Layers,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { useApp } from "@/context/app-context";
import { useAuth } from "@/context/auth-context";
import { buildPortfolioSummary, formatEur } from "@/lib/portfolio-analytics";
import { PortfolioValueEffortMatrix } from "@/components/portfolio/portfolio-value-effort-matrix";
import { PortfolioHistorySection } from "@/components/architect/arena-database-status";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/shared/empty-state";

const QUADRANT_STYLES: Record<string, string> = {
  "Quick Wins": "border-emerald-500/30 bg-emerald-500/5",
  "Strategic Investments": "border-indigo-500/30 bg-indigo-500/5",
  "Long-Term Opportunities": "border-amber-500/30 bg-amber-500/5",
  Moonshots: "border-border/30 bg-muted/10",
};

export default function PortfolioPage() {
  const router = useRouter();
  const { useCases } = useApp();
  const { isAdmin, isReady, canAccessArchitectTools } = useAuth();

  useEffect(() => {
    if (!isReady) return;
    if (!canAccessArchitectTools) {
      router.replace("/");
    }
  }, [isReady, canAccessArchitectTools, router]);

  if (!isReady || !canAccessArchitectTools) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const portfolio = buildPortfolioSummary(useCases);

  const quadrantGroups = {
    "Quick Wins": portfolio.useCases.filter((p) => p.quadrant === "Quick Wins"),
    "Strategic Investments": portfolio.useCases.filter(
      (p) => p.quadrant === "Strategic Investments"
    ),
    "Long-Term Opportunities": portfolio.useCases.filter(
      (p) => p.quadrant === "Long-Term Opportunities"
    ),
    Moonshots: portfolio.useCases.filter((p) => p.quadrant === "Moonshots"),
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Portfolio Analysis"
        subtitle="Executive view of AI opportunity value, readiness, and prioritization across the telecom portfolio."
        icon={Briefcase}
      />

      {portfolio.totalUseCases === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No use cases in portfolio"
          description="Submit use cases during the workshop to build the executive portfolio view."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              label="Total Use Cases"
              value={portfolio.totalUseCases}
              icon={Layers}
            />
            <StatCard
              label="Est. Portfolio Value"
              value={formatEur(portfolio.estimatedPortfolioValue)}
              icon={TrendingUp}
            />
            <StatCard
              label="Avg. Readiness Score"
              value={`${portfolio.averageReadinessScore}%`}
              icon={Gauge}
            />
          </div>

          <div className="glass-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">Department Participation</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {portfolio.departmentParticipation.map((d) => (
                <div
                  key={d.department}
                  className="flex items-center justify-between rounded-lg border border-border/15 bg-background/50 px-4 py-3"
                >
                  <span className="text-sm font-medium truncate pr-2">{d.department}</span>
                  <Badge variant="secondary">{d.count}</Badge>
                </div>
              ))}
            </div>
          </div>

          <PortfolioValueEffortMatrix data={portfolio.useCases} />

          <div className="grid gap-4 lg:grid-cols-2">
            {(Object.keys(quadrantGroups) as Array<keyof typeof quadrantGroups>).map(
              (quadrant, i) => (
                <motion.div
                  key={quadrant}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`rounded-xl border p-5 ${QUADRANT_STYLES[quadrant]}`}
                >
                  <h3 className="mb-3 font-bold">{quadrant}</h3>
                  {quadrantGroups[quadrant].length === 0 ? (
                    <p className="text-sm text-muted">No use cases in this quadrant yet.</p>
                  ) : (
                    <ul className="space-y-3">
                      {quadrantGroups[quadrant].map((uc) => (
                        <li
                          key={uc.id}
                          className="rounded-lg border border-border/10 bg-background/60 p-3"
                        >
                          <p className="font-medium text-sm">{uc.title}</p>
                          <div className="mt-2 flex items-center gap-3">
                            <span className="text-xs text-muted">
                              Readiness {uc.readinessScore}%
                            </span>
                            <Progress value={uc.readinessScore} className="h-1 flex-1" />
                          </div>
                          <p className="mt-1 text-xs text-muted">
                            Est. {uc.estimatedTimelineMin}–{uc.estimatedTimelineMax} weeks · {uc.department}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              )
            )}
          </div>
        </>
      )}

      {portfolio.totalUseCases > 0 && <PortfolioHistorySection />}

      <p className="text-xs text-muted text-center">
        {isAdmin ? "Facilitator" : "AI Architect"} executive view · Telecom Edition 2.0
      </p>
    </div>
  );
}
