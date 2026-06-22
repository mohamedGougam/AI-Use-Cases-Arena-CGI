import type { UseCase } from "@/types";
import { analyzeUseCase, formatEur } from "@/lib/architect-engine";
import { getDepartmentStats } from "@/lib/analytics";
import { normalizeDepartment } from "@/lib/constants";

export type PortfolioQuadrant =
  | "Quick Wins"
  | "Strategic Investments"
  | "Long-Term Opportunities"
  | "Moonshots";

export interface PortfolioUseCase {
  id: string;
  title: string;
  department: string;
  valueScore: number;
  effortScore: number;
  readinessScore: number;
  estimatedTimelineMin: number;
  estimatedTimelineMax: number;
  quadrant: PortfolioQuadrant;
}

export interface PortfolioSummary {
  totalUseCases: number;
  estimatedPortfolioValue: number;
  averageReadinessScore: number;
  departmentParticipation: { department: string; count: number }[];
  useCases: PortfolioUseCase[];
}

function impactToNum(impact: UseCase["impact"]): number {
  return { Low: 1, Medium: 2, High: 3 }[impact];
}

function effortToNum(effort: UseCase["effort"]): number {
  return { Low: 1, Medium: 2, High: 3 }[effort];
}

function classifyQuadrant(value: number, effort: number): PortfolioQuadrant {
  const highValue = value >= 2;
  const lowEffort = effort <= 1.5;
  const highEffort = effort >= 2.5;
  if (highValue && lowEffort) return "Quick Wins";
  if (highValue && highEffort) return "Strategic Investments";
  if (!highValue && lowEffort) return "Long-Term Opportunities";
  return "Moonshots";
}

export function buildPortfolioSummary(useCases: UseCase[]): PortfolioSummary {
  const portfolioUseCases: PortfolioUseCase[] = useCases.map((uc) => {
    const assessment = analyzeUseCase(uc);
    const valueScore = impactToNum(uc.impact) * 20 + uc.votes * 2 + assessment.overallScore * 0.3;
    const effortScore = effortToNum(uc.effort);
    return {
      id: uc.id,
      title: uc.title,
      department: normalizeDepartment(uc.department),
      valueScore: Math.round(valueScore),
      effortScore,
      readinessScore: assessment.overallScore,
      estimatedTimelineMin: assessment.consensus.timelineMin,
      estimatedTimelineMax: assessment.consensus.timelineMax,
      quadrant: classifyQuadrant(impactToNum(uc.impact), effortScore),
    };
  });

  const totalUseCases = useCases.length;
  const estimatedPortfolioValue = portfolioUseCases.reduce((s, p) => s + p.valueScore * 1000, 0);
  const averageReadinessScore =
    totalUseCases > 0
      ? Math.round(
          portfolioUseCases.reduce((s, p) => s + p.readinessScore, 0) / totalUseCases
        )
      : 0;

  const deptStats = getDepartmentStats(useCases);
  const departmentParticipation = deptStats
    .filter((d) => d.useCaseCount > 0)
    .map((d) => ({ department: d.department, count: d.useCaseCount }));

  return {
    totalUseCases,
    estimatedPortfolioValue,
    averageReadinessScore,
    departmentParticipation,
    useCases: portfolioUseCases,
  };
}

export { formatEur };
