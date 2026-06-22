import type { ArchitectAssessment } from "@/lib/architect-engine";
import type { UseCase } from "@/types";
import { assessmentInputFingerprint } from "@/lib/architect-assessment-payload";

export interface ArchitectRecommendationPayload {
  useCase: {
    id: string;
    title: string;
    description: string;
    businessProblem: string;
    proposedSolution: string;
    department: string;
    category: string;
    impact: string;
    effort: string;
    tags: string[];
    votes: number;
    commentCount: number;
    status: string;
    innovationScore: number;
  };
  architectBrief?: {
    fileName: string;
    wordCount: number;
    extractedText: string;
    analysisSummary?: string;
  };
  architectOverrides?: UseCase["architectOverrides"];
  readiness: {
    overallScore: number;
    dimensions: { key: string; title: string; score: number; criteriaMet: string[]; criteriaGaps: string[] }[];
    wordCounts: ArchitectAssessment["wordCounts"];
    telecomImpactAreas: ArchitectAssessment["telecomImpactAreas"];
    architectQuestions: string[];
    ruleBasedArchitecture: ArchitectAssessment["architecture"];
    consensusTimelineWeeks: { min: number; max: number };
  };
}

export function buildRecommendationPayload(
  useCase: UseCase,
  assessment: ArchitectAssessment
): ArchitectRecommendationPayload {
  return {
    useCase: {
      id: useCase.id,
      title: useCase.title,
      description: useCase.description,
      businessProblem: useCase.businessProblem,
      proposedSolution: useCase.proposedSolution,
      department: useCase.department,
      category: useCase.category,
      impact: useCase.impact,
      effort: useCase.effort,
      tags: useCase.tags,
      votes: useCase.votes,
      commentCount: useCase.comments.length,
      status: useCase.status,
      innovationScore: useCase.innovationScore,
    },
    architectBrief: useCase.architectBrief
      ? {
          fileName: useCase.architectBrief.fileName,
          wordCount: useCase.architectBrief.wordCount,
          extractedText: useCase.architectBrief.extractedText.slice(0, 12000),
          analysisSummary: useCase.architectBrief.analysisSummary,
        }
      : undefined,
    architectOverrides: useCase.architectOverrides,
    readiness: {
      overallScore: assessment.overallScore,
      dimensions: assessment.dimensions.map((d) => ({
        key: d.key,
        title: d.title,
        score: d.score,
        criteriaMet: d.criteria.filter((c) => c.met).map((c) => c.label),
        criteriaGaps: d.criteria.filter((c) => !c.met).map((c) => c.label),
      })),
      wordCounts: assessment.wordCounts,
      telecomImpactAreas: assessment.telecomImpactAreas,
      architectQuestions: assessment.architectQuestions,
      ruleBasedArchitecture: assessment.architecture,
      consensusTimelineWeeks: {
        min: assessment.consensus.timelineMin,
        max: assessment.consensus.timelineMax,
      },
    },
  };
}

export function recommendationInputFingerprint(useCase: UseCase): string {
  return assessmentInputFingerprint(useCase);
}
