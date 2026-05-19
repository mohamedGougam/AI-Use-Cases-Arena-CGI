"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Shield, ThumbsUp, Trophy, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { ScoreGuide } from "@/components/gamification/score-guide";
import { AdminLeaderboardTable } from "@/components/gamification/admin-leaderboard-table";
import { useApp } from "@/context/app-context";
import { useAuth } from "@/context/auth-context";
import { buildAdminContributorRows, getAdminTotals } from "@/lib/admin-leaderboard";
import { getKnownUsers, type KnownUser } from "@/lib/login-registry";

export default function LeaderboardPage() {
  const router = useRouter();
  const { useCases } = useApp();
  const { isAdmin, isReady } = useAuth();
  const [knownUsers, setKnownUsers] = useState<KnownUser[]>([]);

  useEffect(() => {
    if (!isReady) return;
    if (!isAdmin) {
      router.replace("/");
    }
  }, [isReady, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      setKnownUsers(getKnownUsers());
    }
  }, [isAdmin, useCases]);

  const totals = useMemo(() => getAdminTotals(useCases), [useCases]);
  const contributors = useMemo(
    () => buildAdminContributorRows(useCases, knownUsers),
    [useCases, knownUsers]
  );

  if (!isReady || !isAdmin) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-8">
      <PageHeader
        title="Admin Leaderboard"
        subtitle="Overview of signed-in users and arena activity. Users are ranked by score, highest first."
        icon={Trophy}
      />

      <div className="flex items-start gap-2 rounded-lg border border-primary/25 bg-primary/10 px-4 py-3 text-sm">
        <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-muted">
          <span className="font-medium text-foreground">Admin only.</span> This page lists
          users who have signed in on this arena instance, merged with their submissions,
          votes, and scores.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total use cases"
          value={totals.totalUseCases}
          icon={FileText}
        />
        <StatCard label="Total votes" value={totals.totalVotes} icon={ThumbsUp} />
        <StatCard
          label="Users (signed in / active)"
          value={contributors.length}
          icon={Users}
          className="sm:col-span-2 lg:col-span-1"
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="glass-card min-w-0 p-4 sm:p-6 xl:col-span-2">
          <h2 className="mb-4 text-lg font-bold">All users by score</h2>
          <AdminLeaderboardTable rows={contributors} />
        </div>
        <div className="min-w-0">
          <ScoreGuide />
        </div>
      </div>
    </div>
  );
}
