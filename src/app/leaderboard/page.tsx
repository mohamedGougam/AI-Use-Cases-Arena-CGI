"use client";

import { Trophy } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { LeaderboardCard } from "@/components/gamification/leaderboard-card";
import { ScoreGuide } from "@/components/gamification/score-guide";
import { LeaderScoreLabel } from "@/components/gamification/leader-score-label";
import { AboutThisTool } from "@/components/shared/about-this-tool";
import { useApp } from "@/context/app-context";
import { useAuth } from "@/context/auth-context";
import { isParticipantScoreLeader } from "@/lib/participants";

export default function LeaderboardPage() {
  const { participantScores, myScore, useCases } = useApp();
  const { email } = useAuth();
  const isLeader = isParticipantScoreLeader(email, participantScores);

  const topPeople = participantScores.slice(0, 10).map((p, i) => ({
    rank: i + 1,
    name: p.name,
    subtitle: p.email,
    score: p.score,
    avatar: p.avatar,
  }));

  const topIdeas = [...useCases]
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 5)
    .map((uc, i) => ({
      rank: i + 1,
      name: uc.title,
      subtitle: uc.submitterEmail || uc.submitter,
      score: uc.votes,
    }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Leaderboard"
        subtitle="Everyone is ranked by email. Points come from submissions and engagement."
        icon={Trophy}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="glass-card p-6 lg:col-span-1">
          <p className="text-sm text-muted">Signed in as</p>
          <p className="mt-1 truncate font-medium" title={email ?? ""}>
            {email}
          </p>
          {myScore && (
            <div className="mt-6 space-y-3 border-t border-border/15 pt-6">
              <div>
                <p className="text-sm text-muted">Your total score</p>
                {isLeader && <LeaderScoreLabel className="mt-2" />}
                <p className="text-4xl font-bold text-primary">{myScore.score}</p>
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-muted">Submitted</dt>
                  <dd className="font-bold">{myScore.submissions}</dd>
                </div>
                <div>
                  <dt className="text-muted">Votes on your ideas</dt>
                  <dd className="font-bold">{myScore.votesReceived}</dd>
                </div>
                <div>
                  <dt className="text-muted">Votes you cast</dt>
                  <dd className="font-bold">{myScore.votesCast}</dd>
                </div>
                <div>
                  <dt className="text-muted">Comments</dt>
                  <dd className="font-bold">{myScore.comments}</dd>
                </div>
              </dl>
            </div>
          )}
        </div>
        <div className="lg:col-span-2">
          <ScoreGuide />
        </div>
      </div>

      <LeaderboardCard
        title="Top contributors (by email)"
        entries={topPeople}
        valueLabel="pts"
      />

      <LeaderboardCard
        title="Most voted use cases"
        entries={topIdeas}
        valueLabel="votes"
      />

      <AboutThisTool />
    </div>
  );
}
