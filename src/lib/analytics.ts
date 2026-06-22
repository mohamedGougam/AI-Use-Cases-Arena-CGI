import type { DepartmentStats, UseCase, User } from "@/types";
import { isKnownDepartment, normalizeDepartment } from "@/lib/constants";
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
    const department = normalizeDepartment(uc.department);
    if (!isKnownDepartment(department)) return;
    const existing = map.get(department) ?? {
      department,
      useCaseCount: 0,
      totalVotes: 0,
      innovationScore: 0,
      engagement: 0,
    };
    existing.useCaseCount += 1;
    existing.totalVotes += uc.votes;
    existing.innovationScore += uc.innovationScore;
    existing.engagement += uc.comments.length + uc.votes;
    map.set(department, existing);
  });

  return Array.from(map.values()).sort((a, b) => b.innovationScore - a.innovationScore);
}

export function getMostActiveDepartment(stats: DepartmentStats[]): string {
  return stats[0]?.department ?? "N/A";
}

export function getTrendingUseCases(useCases: UseCase[], limit = 5): UseCase[] {
  if (!useCases.length) return [];
  const hot = [...useCases]
    .filter((uc) => uc.badges.includes("Trending") || uc.votes >= 5)
    .sort((a, b) => b.innovationScore - a.innovationScore);
  if (hot.length) return hot.slice(0, limit);
  return [...useCases]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, limit);
}

export function getVotingTrendData(useCases: UseCase[]) {
  if (!useCases.length) return [];
  const monthMap = new Map<string, number>();
  useCases.forEach((uc) => {
    const month = new Date(uc.createdAt).toLocaleString("en-US", {
      month: "short",
    });
    monthMap.set(month, (monthMap.get(month) ?? 0) + uc.votes);
  });
  return Array.from(monthMap.entries()).map(([month, votes]) => ({
    month,
    votes,
  }));
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
  if (!useCases.length) {
    return `Executive Summary — AI Use Cases Arena

Portfolio size: 0 use cases.
Total votes: 0.
Quick wins: 0.
Strategic bets: 0.`;
  }

  const total = useCases.length;
  const votes = getTotalVotes(useCases);
  const top = getTopUseCase(useCases);
  const quickWins = getQuickWins(useCases).length;
  const strategicBets = getStrategicBets(useCases).length;
  const depts = getDepartmentStats(useCases);
  const topDept = depts[0];

  const lines = [
    "Executive Summary — AI Use Cases Arena",
    "",
    `Portfolio size: ${total} use case${total === 1 ? "" : "s"}.`,
    `Total votes: ${votes}.`,
    `Quick wins (high impact, low effort): ${quickWins}.`,
    `Strategic bets (high impact, high effort): ${strategicBets}.`,
  ];

  if (top) {
    lines.push(
      `Highest-voted use case: "${top.title}" (${top.votes} votes, innovation score ${top.innovationScore}).`
    );
  }

  if (topDept) {
    lines.push(
      `Leading department by innovation score: ${topDept.department} (${topDept.useCaseCount} use case${topDept.useCaseCount === 1 ? "" : "s"}, score ${topDept.innovationScore}).`
    );
  }

  const categories = getCategoryDistribution(useCases)
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);
  if (categories.length) {
    lines.push(
      `Top categories: ${categories.map((c) => `${c.name} (${c.value})`).join(", ")}.`
    );
  }

  return lines.join("\n");
}
