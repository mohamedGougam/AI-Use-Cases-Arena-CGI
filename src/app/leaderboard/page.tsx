"use client";

import { motion } from "framer-motion";
import { Trophy, Crown, Flame } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { LeaderboardCard } from "@/components/gamification/leaderboard-card";
import { useApp } from "@/context/app-context";
import { GAMIFICATION_BADGES } from "@/lib/constants";
import { getTopContributors } from "@/lib/analytics";
import { Progress } from "@/components/ui/progress";
import { getRankProgress } from "@/lib/scoring";

export default function LeaderboardPage() {
  const { useCases, users, currentUser } = useApp();
  const progress = getRankProgress(currentUser.points);

  const topContributors = getTopContributors(users).slice(0, 5).map((u, i) => ({
    rank: i + 1,
    name: u.name,
    subtitle: `${u.department} · ${u.rank}`,
    score: u.points,
    avatar: u.avatar,
  }));

  const topVoted = [...useCases]
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 5)
    .map((uc, i) => ({
      rank: i + 1,
      name: uc.title,
      subtitle: uc.department,
      score: uc.votes,
    }));

  const topDepts = [...new Map(
    useCases.reduce((acc, uc) => {
      const cur = acc.get(uc.department) ?? 0;
      acc.set(uc.department, cur + uc.votes);
      return acc;
    }, new Map<string, number>())
  )]
    .map(([dept, votes]) => ({ dept, votes }))
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 5)
    .map((d, i) => ({
      rank: i + 1,
      name: d.dept,
      subtitle: "Department",
      score: d.votes,
    }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Leaderboard"
        subtitle="Celebrate top innovators driving AI transformation at Invest-NL."
        icon={Trophy}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card border border-primary/30 p-8 text-center glow-border"
      >
        <Crown className="mx-auto h-12 w-12 text-primary mb-4" />
        <p className="text-sm text-muted uppercase tracking-widest">Your Arena Status</p>
        <p className="mt-2 text-4xl font-bold text-gradient">{currentUser.rank}</p>
        <p className="mt-1 text-2xl font-bold">{currentUser.points} XP</p>
        <div className="mx-auto mt-4 max-w-md">
          <Progress value={progress.percent} className="h-3" />
          <p className="mt-2 text-xs text-muted">
            {progress.next - currentUser.points} XP to next rank
          </p>
        </div>
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-orange-400">
          <Flame className="h-4 w-4" />
          {currentUser.votingStreak} day voting streak
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <LeaderboardCard title="Top Contributors" entries={topContributors} />
        <LeaderboardCard title="Most Voted Use Cases" entries={topVoted} valueLabel="votes" />
        <LeaderboardCard title="Most Active Departments" entries={topDepts} valueLabel="votes" />
      </div>

      <section>
        <h2 className="text-xl font-bold mb-4">Arena Champions — Monthly Ranking</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {topContributors.slice(0, 3).map((entry, i) => (
            <motion.div
              key={entry.name}
              whileHover={{ y: -4 }}
              className="glass-card p-6 text-center"
              style={{
                borderColor: i === 0 ? "rgba(141,198,63,0.4)" : undefined,
              }}
            >
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-xl font-bold text-primary">
                {entry.avatar}
              </div>
              <p className="font-bold">{entry.name}</p>
              <p className="text-sm text-muted">{entry.subtitle}</p>
              <p className="mt-2 text-2xl font-bold text-primary">{entry.score} XP</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Achievement Badges</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {GAMIFICATION_BADGES.map((badge) => {
            const earned = currentUser.badges.includes(badge.id);
            return (
              <motion.div
                key={badge.id}
                whileHover={{ scale: 1.03 }}
                className={`glass-card p-4 ${earned ? "glow-border border-primary/30" : "opacity-50"}`}
              >
                <Trophy className={`h-6 w-6 mb-2 ${earned ? "text-primary" : "text-muted"}`} />
                <p className="font-semibold text-sm">{badge.name}</p>
                <p className="text-xs text-muted mt-1">{badge.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="glass-card p-6">
        <h2 className="text-lg font-bold mb-2">Rank Levels</h2>
        <div className="flex flex-wrap gap-3">
          {["Explorer", "Challenger", "Strategist", "Visionary", "Arena Champion"].map((rank) => (
            <span
              key={rank}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                currentUser.rank === rank
                  ? "bg-primary text-primary-foreground"
                  : "bg-white/5 text-muted"
              }`}
            >
              {rank}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
