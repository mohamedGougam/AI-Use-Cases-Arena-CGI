import type { UseCase } from "@/types";
import { READINESS_DIMENSION_DEFS } from "@/lib/readiness-criteria";
import { TELECOM_IMPACT_AREAS } from "@/lib/constants";

export interface ArchitectAssessmentInputPayload {
  businessSubmission: {
    title: string;
    description: string;
    businessProblem: string;
    proposedSolution: string;
    department: string;
    category: string;
    impact: string;
    effort: string;
    tags: string[];
  };
  architectBrief?: {
    fileName: string;
    wordCount: number;
    extractedText: string;
    analysisSummary?: string;
  };
  readinessChecklist: typeof READINESS_DIMENSION_DEFS;
  telecomDomains: readonly string[];
}

export function buildAssessmentInputPayload(useCase: UseCase): ArchitectAssessmentInputPayload {
  return {
    businessSubmission: {
      title: useCase.title,
      description: useCase.description,
      businessProblem: useCase.businessProblem,
      proposedSolution: useCase.proposedSolution,
      department: useCase.department,
      category: useCase.category,
      impact: useCase.impact,
      effort: useCase.effort,
      tags: useCase.tags,
    },
    architectBrief: useCase.architectBrief
      ? {
          fileName: useCase.architectBrief.fileName,
          wordCount: useCase.architectBrief.wordCount,
          extractedText: useCase.architectBrief.extractedText.slice(0, 12000),
          analysisSummary: useCase.architectBrief.analysisSummary,
        }
      : undefined,
    readinessChecklist: READINESS_DIMENSION_DEFS,
    telecomDomains: TELECOM_IMPACT_AREAS,
  };
}

export function assessmentInputFingerprint(useCase: UseCase): string {
  return [
    useCase.title,
    useCase.description,
    useCase.businessProblem,
    useCase.proposedSolution,
    useCase.category,
    useCase.department,
    useCase.impact,
    useCase.effort,
    useCase.tags.join(","),
    useCase.architectBrief?.wordCount ?? 0,
    useCase.architectBrief?.analyzedAt ?? "",
  ].join("|");
}
