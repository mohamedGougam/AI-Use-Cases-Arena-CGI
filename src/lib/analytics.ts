import type { DepartmentStats, UseCase, User } from "@/types";
import { getImpactScore, getEffortScore, isQuickWin, isStrategicBet } from "@/lib/scoring";

export function getTotalVotes(useCases: UseCase[]): number {
  return useCases.reduce((sum, uc) => sum + uc.votes, 0);
}

export function getTopUseCase(useCases: UseCase[]): UseCase | null {
  if (!useCases.length) return null;
  return [...useCases].sort((a, b) => b.votes - a.votes)[0];
}

export function getDepartmentStats(useCases: UseCase[]): DepartmentStats[] {
  const map = new Map<string, DepartmentStats>();

  useCases.forEach((uc) => {
    const existing = map.get(uc.department) ?? {
      department: uc.department,
      useCaseCount: 0,
      totalVotes: 0,
      innovationScore: 0,
      engagement: 0,
    };
    existing.useCaseCount += 1;
    existing.totalVotes += uc.votes;
    existing.innovationScore += uc.innovationScore;
    existing.engagement += uc.comments.length + uc.votes;
    map.set(uc.department, existing);
  });

  return Array.from(map.values()).sort((a, b) => b.innovationScore - a.innovationScore);
}

export function getMostActiveDepartment(stats: DepartmentStats[]): string {
  return stats[0]?.department ?? "N/A";
}

export function getTrendingUseCases(useCases: UseCase[], limit = 5): UseCase[] {
  return [...useCases]
    .filter((uc) => uc.badges.includes("Trending") || uc.votes >= 20)
    .sort((a, b) => b.innovationScore - a.innovationScore)
    .slice(0, limit);
}

export function getQuickWins(useCases: UseCase[]): UseCase[] {
  return useCases.filter(isQuickWin);
}

export function getStrategicBets(useCases: UseCase[]): UseCase[] {
  return useCases.filter(isStrategicBet);
}

export function getCategoryDistribution(useCases: UseCase[]) {
  const map = new Map<string, number>();
  useCases.forEach((uc) => {
    map.set(uc.category, (map.get(uc.category) ?? 0) + 1);
  });
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}

export function getThemeCounts(useCases: UseCase[]) {
  const tagMap = new Map<string, number>();
  useCases.forEach((uc) => {
    uc.tags.forEach((tag) => tagMap.set(tag, (tagMap.get(tag) ?? 0) + 1));
  });
  return Array.from(tagMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

export function getImpactEffortMatrix(useCases: UseCase[]) {
  return useCases.map((uc) => ({
    id: uc.id,
    title: uc.title,
    impact: getImpactScore(uc.impact),
    effort: getEffortScore(uc.effort),
    votes: uc.votes,
    score: uc.innovationScore,
  }));
}

export function getTopContributors(users: User[]) {
  return [...users].sort((a, b) => b.points - a.points);
}

export function generateExecutiveSummary(useCases: UseCase[]): string {
  const total = useCases.length;
  const votes = getTotalVotes(useCases);
  const top = getTopUseCase(useCases);
  const quickWins = getQuickWins(useCases).length;
  const depts = getDepartmentStats(useCases);
  const topDept = depts[0]?.department ?? "N/A";

  return `Executive Summary — AI Use Cases Arena

Portfolio Overview: ${total} AI use cases have been submitted across Invest-NL, generating ${votes} total votes and strong cross-department engagement.

Top Priority: "${top?.title ?? "N/A"}" leads the arena with ${top?.votes ?? 0} votes and an innovation score of ${top?.innovationScore ?? 0}, indicating strong organizational alignment.

Quick Wins: ${quickWins} high-impact, low-effort opportunities are ready for rapid pilot deployment.

Department Leadership: ${topDept} is currently leading innovation momentum with the highest combined innovation score.

Recommendation: Prioritize quick wins for Q2 pilots while advancing strategic bets through structured feasibility assessments. Continue voting and commentary to refine the portfolio.`;
}
