import type { UseCase } from "@/types";
import {
  getDepartmentStats,
  getQuickWins,
  getStrategicBets,
  getTotalVotes,
} from "@/lib/analytics";

/** Data sent to the LLM — no emails, voter lists, or comment bodies. */
export interface ExecutiveSummaryPayload {
  programmeName: string;
  totals: { useCaseCount: number; voteCount: number };
  departments: Array<{
    department: string;
    useCaseCount: number;
    totalVotes: number;
    innovationScore: number;
  }>;
  quickWinTitles: string[];
  strategicBetTitles: string[];
  useCases: Array<{
    title: string;
    category: string;
    department: string;
    impact: string;
    effort: string;
    votes: number;
    innovationScore: number;
    status: string;
    tags: string[];
    badges: string[];
    commentCount: number;
    descriptionPreview: string;
    businessProblemPreview: string;
  }>;
}

const clip = (s: string, max: number) =>
  (s ?? "").replace(/\s+/g, " ").trim().slice(0, max);

export function buildExecutiveSummaryPayload(
  useCases: UseCase[]
): ExecutiveSummaryPayload {
  const depts = getDepartmentStats(useCases);
  return {
    programmeName: "AI Use Cases Arena (CGI client programme)",
    totals: {
      useCaseCount: useCases.length,
      voteCount: getTotalVotes(useCases),
    },
    departments: depts.map((d) => ({
      department: d.department,
      useCaseCount: d.useCaseCount,
      totalVotes: d.totalVotes,
      innovationScore: d.innovationScore,
    })),
    quickWinTitles: getQuickWins(useCases).map((uc) => uc.title),
    strategicBetTitles: getStrategicBets(useCases).map((uc) => uc.title),
    useCases: useCases.map((uc) => ({
      title: uc.title,
      category: uc.category,
      department: uc.department,
      impact: uc.impact,
      effort: uc.effort,
      votes: uc.votes,
      innovationScore: uc.innovationScore,
      status: uc.status,
      tags: uc.tags,
      badges: uc.badges,
      commentCount: uc.comments.length,
      descriptionPreview: clip(uc.description, 450),
      businessProblemPreview: clip(uc.businessProblem, 350),
    })),
  };
}
