import type { ImpactLevel, EffortLevel, UseCase, UseCaseBadge } from "@/types";

const impactScoreMap: Record<ImpactLevel, number> = {
  Low: 1,
  Medium: 2,
  High: 3,
};

const effortScoreMap: Record<EffortLevel, number> = {
  Low: 1,
  Medium: 2,
  High: 3,
};

export function getImpactScore(impact: ImpactLevel): number {
  return impactScoreMap[impact];
}

export function getEffortScore(effort: EffortLevel): number {
  return effortScoreMap[effort];
}

export function calculateInnovationScore(
  votes: number,
  impact: ImpactLevel,
  effort: EffortLevel,
  commentCount: number,
  daysSinceCreated = 0
): number {
  const impactScore = getImpactScore(impact);
  const effortScore = getEffortScore(effort);
  const trendiness = daysSinceCreated <= 7 ? 15 : daysSinceCreated <= 30 ? 8 : 0;
  const engagement = commentCount * 5;

  return Math.round(
    votes * 3 +
      impactScore * 20 -
      effortScore * 10 +
      engagement +
      trendiness
  );
}

export function getDaysSinceCreated(createdAt: string): number {
  return Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );
}

export function recalculateUseCaseScore(useCase: UseCase): number {
  return calculateInnovationScore(
    useCase.votes,
    useCase.impact,
    useCase.effort,
    useCase.comments.length,
    getDaysSinceCreated(useCase.createdAt)
  );
}

export function deriveUseCaseBadges(useCase: UseCase): UseCaseBadge[] {
  const badges: UseCaseBadge[] = [];
  const days = getDaysSinceCreated(useCase.createdAt);

  if (useCase.votes >= 15) badges.push("Crowd Favorite");
  if (useCase.votes >= 8 && days <= 14) badges.push("Trending");
  if (useCase.impact === "High") badges.push("High Impact");
  if (useCase.impact === "High" && useCase.effort === "Low") badges.push("Quick Win");
  if (useCase.impact === "High" && useCase.effort === "High") badges.push("Strategic Bet");

  return badges;
}

export function getRankFromPoints(points: number): import("@/types").RankLevel {
  if (points >= 500) return "Arena Champion";
  if (points >= 300) return "Visionary";
  if (points >= 150) return "Strategist";
  if (points >= 50) return "Challenger";
  return "Explorer";
}

export function getRankProgress(points: number): { current: number; next: number; percent: number } {
  const thresholds = [0, 50, 150, 300, 500, 750];
  let current = 0;
  let next = 50;

  for (let i = 0; i < thresholds.length - 1; i++) {
    if (points >= thresholds[i] && points < thresholds[i + 1]) {
      current = thresholds[i];
      next = thresholds[i + 1];
      break;
    }
    if (points >= thresholds[thresholds.length - 1]) {
      current = 500;
      next = 750;
      break;
    }
  }

  const percent = Math.min(100, ((points - current) / (next - current)) * 100);
  return { current, next, percent };
}

export function isQuickWin(useCase: UseCase): boolean {
  return useCase.impact === "High" && useCase.effort === "Low";
}

export function isStrategicBet(useCase: UseCase): boolean {
  return useCase.impact === "High" && useCase.effort === "High";
}
