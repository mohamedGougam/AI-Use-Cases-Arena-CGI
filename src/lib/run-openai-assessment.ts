import OpenAI from "openai";
import { buildAssessmentInputPayload } from "@/lib/architect-assessment-payload";
import {
  ARCHITECT_GOVERNANCE_SYSTEM_PROMPT,
  ASSESSMENT_JSON_SCHEMA,
  CRITERION_EXPLANATION_RULES,
} from "@/lib/architect-governance-prompt";
import { mergeDiscoveryQuestions } from "@/lib/discovery-questions";
import { parseAiAssessmentResponse } from "@/lib/parse-ai-assessment";
import type { ArchitectDiscoveryQuestion, UseCase } from "@/types";

export interface RunAssessmentResult {
  assessment: NonNullable<ReturnType<typeof parseAiAssessmentResponse>>;
  discoveryQuestions: ArchitectDiscoveryQuestion[];
  model: string;
  generatedAt: string;
}

export async function runOpenAiAssessment(
  useCase: UseCase,
  opts?: {
    discoveryQuestions?: ArchitectDiscoveryQuestion[];
    reassess?: boolean;
  }
): Promise<RunAssessmentResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const payload = buildAssessmentInputPayload(useCase);
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  const baseURL = process.env.OPENAI_BASE_URL?.trim();

  const client = new OpenAI({
    apiKey,
    ...(baseURL ? { baseURL } : {}),
  });

  const workshopQuestions =
    opts?.discoveryQuestions ??
    useCase.architectDiscoveryQuestions ??
    [];

  const answered = workshopQuestions.filter((q) => q.answer?.trim());

  const userContent = opts?.reassess
    ? `Reassess this telecom AI use case after a new workshop answer was captured.

Merge prior discovery context with the new answer. Update readiness, architecture, telecom impact, governance, and estimation.
Generate follow-up discovery questions based on answers already captured.

JSON schema:
${ASSESSMENT_JSON_SCHEMA}

${CRITERION_EXPLANATION_RULES}

Allowed telecom domains: ${payload.telecomDomains.join(", ")}

Use case input:
${JSON.stringify(payload, null, 2)}

Discovery workshop (questions + captured answers):
${JSON.stringify(workshopQuestions, null, 2)}

Answered count: ${answered.length} of ${workshopQuestions.length}`
    : `Conduct initial discovery assessment for this telecom AI use case.

Generate discovery questions for the workshop. Do not invent missing facts.

JSON schema:
${ASSESSMENT_JSON_SCHEMA}

${CRITERION_EXPLANATION_RULES}

Allowed telecom domains: ${payload.telecomDomains.join(", ")}

Use case input:
${JSON.stringify(payload, null, 2)}`;

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.3,
    max_tokens: 4500,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: ARCHITECT_GOVERNANCE_SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ],
  });

  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) throw new Error("Empty model response");

  const parsed = parseAiAssessmentResponse(content);
  if (!parsed) throw new Error("Could not parse model response");

  const discoveryQuestions = mergeDiscoveryQuestions(
    workshopQuestions,
    parsed.discoveryQuestions,
    Boolean(opts?.reassess && answered.length > 0)
  );

  return {
    assessment: parsed,
    discoveryQuestions,
    model,
    generatedAt: new Date().toISOString(),
  };
}

export function toArchitectAiAssessment(
  result: RunAssessmentResult,
  fingerprint: string
) {
  const { assessment, discoveryQuestions, model, generatedAt } = result;
  return {
    dimensions: assessment.dimensions,
    overallScore: assessment.overallScore,
    discoveryQuestions,
    architectQuestions: discoveryQuestions.map((q) => q.question),
    telecomImpactAreas: assessment.telecomImpactAreas,
    pattern: assessment.architecture.pattern,
    technologies: assessment.architecture.technologies,
    confidence: assessment.architecture.confidence,
    rationale: assessment.architecture.rationale,
    architectureUnlocked: assessment.architectureUnlocked,
    estimationUnlocked: assessment.estimationUnlocked,
    governance: assessment.governance,
    estimation: assessment.estimation,
    contentRichness: assessment.contentRichness,
    model,
    generatedAt,
    inputFingerprint: fingerprint,
  };
}
