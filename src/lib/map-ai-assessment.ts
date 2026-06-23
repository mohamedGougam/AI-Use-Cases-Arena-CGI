import type { ArchitectAssessment } from "@/lib/architect-engine";
import { getWordCountStats } from "@/lib/architect-engine";
import type { ParsedAiAssessment } from "@/lib/parse-ai-assessment";
import { EMPTY_MASTER_DISCOVERY_CONTEXT } from "@/lib/master-discovery-context";
import type { ArchitectDiscoveryQuestion, UseCase } from "@/types";

export function mapAiToArchitectAssessment(
  parsed: ParsedAiAssessment,
  discoveryQuestions: ArchitectDiscoveryQuestion[],
  useCase: UseCase
): ArchitectAssessment {
  const { estimation } = parsed;

  return {
    masterDiscoveryContext: parsed.masterDiscoveryContext,
    dimensions: parsed.dimensions,
    overallScore: parsed.overallScore,
    architectQuestions: discoveryQuestions.map((q) => q.question),
    discoveryQuestions,
    governance: parsed.governance,
    architectureUnlocked: parsed.architectureUnlocked,
    estimationUnlocked: parsed.estimationUnlocked,
    telecomImpactAreas: parsed.telecomImpactAreas,
    architecture: parsed.architecture,
    estimation,
    modelEstimates: estimation.modelEstimates,
    consensus: estimation.consensus,
    deliveryTeam: estimation.deliveryTeam,
    requiredSkills: estimation.requiredSkills,
    totalTeamDays: estimation.totalTeamDays,
    wordCounts: getWordCountStats(useCase),
  };
}

export function emptyArchitectAssessment(useCase: UseCase): ArchitectAssessment {
  return {
    masterDiscoveryContext: { ...EMPTY_MASTER_DISCOVERY_CONTEXT },
    dimensions: [],
    overallScore: 0,
    architectQuestions: [],
    discoveryQuestions: [],
    governance: {
      evidenceUsed: [],
      missingInformation: ["Awaiting OpenAI assessment."],
      assumptions: [],
      risks: [],
      executiveSummary: "Run the discovery assessment to begin the workshop.",
    },
    architectureUnlocked: false,
    estimationUnlocked: false,
    telecomImpactAreas: [],
    architecture: {
      pattern: "Pending discovery",
      technologies: [],
      confidence: 0,
      rationale: "Architecture will be generated after the discovery workshop captures sufficient information.",
    },
    estimation: {
      locked: true,
      lockReason: "Insufficient information available.",
      modelEstimates: [],
      consensus: { timelineMin: 0, timelineMax: 0, confidence: 0 },
      deliveryTeam: [],
      requiredSkills: [],
      totalTeamDays: 0,
    },
    modelEstimates: [],
    consensus: { timelineMin: 0, timelineMax: 0, confidence: 0 },
    deliveryTeam: [],
    requiredSkills: [],
    totalTeamDays: 0,
    wordCounts: getWordCountStats(useCase),
  };
}
