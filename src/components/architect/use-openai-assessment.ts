"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ArchitectAssessment,
  ArchitectureRecommendation,
  ReadinessDimension,
  TelecomImpactArea,
} from "@/lib/architect-engine";
import { assessmentInputFingerprint } from "@/lib/architect-assessment-payload";
import type { ArchitectAiAssessment, UseCase } from "@/types";

export type AiAssessmentSource = "openai" | "rules";

interface OpenAiAssessmentState {
  source: AiAssessmentSource;
  loading: boolean;
  error: string | null;
  missingApiKey: boolean;
  model?: string;
  generatedAt?: string;
  stale: boolean;
  dimensions: ReadinessDimension[] | null;
  overallScore: number | null;
  architectQuestions: string[] | null;
  telecomImpactAreas: TelecomImpactArea[] | null;
  contentRichness: ArchitectAiAssessment["contentRichness"] | null;
  architecture: ArchitectureRecommendation;
}

function fromCache(cached: ArchitectAiAssessment) {
  return {
    dimensions: cached.dimensions as ReadinessDimension[],
    overallScore: cached.overallScore,
    architectQuestions: cached.architectQuestions,
    telecomImpactAreas: cached.telecomImpactAreas as TelecomImpactArea[],
    contentRichness: cached.contentRichness ?? null,
    architecture: {
      pattern: cached.pattern,
      technologies: cached.technologies,
      confidence: cached.confidence,
      rationale: cached.rationale,
    },
  };
}

function legacyCache(useCase: UseCase): ArchitectAiAssessment | null {
  if (useCase.architectAiAssessment) return useCase.architectAiAssessment;
  const legacy = useCase.architectAiRecommendation;
  if (!legacy) return null;
  return {
    dimensions: [],
    overallScore: 0,
    architectQuestions: [],
    telecomImpactAreas: [],
    pattern: legacy.pattern,
    technologies: legacy.technologies,
    confidence: legacy.confidence,
    rationale: legacy.rationale,
    model: legacy.model,
    generatedAt: legacy.generatedAt,
    inputFingerprint: legacy.inputFingerprint,
  };
}

export function useOpenAiAssessment(
  useCase: UseCase,
  ruleAssessment: ArchitectAssessment,
  onAiAssessment: (assessment: ArchitectAiAssessment) => void
): OpenAiAssessmentState & { regenerate: () => void } {
  const fingerprint = assessmentInputFingerprint(useCase);
  const cached = legacyCache(useCase);
  const cacheValid = Boolean(cached?.inputFingerprint === fingerprint && cached.dimensions.length > 0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [missingApiKey, setMissingApiKey] = useState(false);
  const [aiData, setAiData] = useState<ReturnType<typeof fromCache> | null>(
    cacheValid && cached ? fromCache(cached) : null
  );
  const [meta, setMeta] = useState({ model: cached?.model, generatedAt: cached?.generatedAt });
  const fetchedRef = useRef<string | null>(cacheValid ? fingerprint : null);

  const applyAssessment = useCallback(
    (
      assessment: ReturnType<typeof fromCache>,
      model: string,
      generatedAt: string
    ) => {
      setAiData(assessment);
      setMeta({ model, generatedAt });
      onAiAssessment({
        dimensions: assessment.dimensions,
        overallScore: assessment.overallScore,
        architectQuestions: assessment.architectQuestions,
        telecomImpactAreas: assessment.telecomImpactAreas,
        contentRichness: assessment.contentRichness ?? undefined,
        pattern: assessment.architecture.pattern,
        technologies: assessment.architecture.technologies,
        confidence: assessment.architecture.confidence,
        rationale: assessment.architecture.rationale,
        model,
        generatedAt,
        inputFingerprint: fingerprint,
      });
    },
    [fingerprint, onAiAssessment]
  );

  const fetchAssessment = useCallback(async () => {
    setLoading(true);
    setError(null);
    setMissingApiKey(false);
    try {
      const res = await fetch("/api/architect/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ useCase }),
      });
      const data = await res.json();

      if (data.fallback) {
        setAiData(null);
        setMissingApiKey(data.reason === "missing_api_key");
        fetchedRef.current = fingerprint;
        return;
      }

      if (!res.ok) throw new Error(data.error ?? "Assessment failed");

      const a = data.assessment;
      applyAssessment(
        {
          dimensions: a.dimensions,
          overallScore: a.overallScore,
          architectQuestions: a.architectQuestions,
          telecomImpactAreas: a.telecomImpactAreas,
          contentRichness: a.contentRichness ?? null,
          architecture: a.architecture,
        },
        data.model,
        data.generatedAt
      );
      fetchedRef.current = fingerprint;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate assessment");
    } finally {
      setLoading(false);
    }
  }, [useCase, fingerprint, applyAssessment]);

  useEffect(() => {
    if (cacheValid && cached) {
      setAiData(fromCache(cached));
      setMeta({ model: cached.model, generatedAt: cached.generatedAt });
      fetchedRef.current = fingerprint;
      return;
    }

    if (fetchedRef.current === fingerprint) return;
    void fetchAssessment();
  }, [fingerprint, cacheValid, cached, fetchAssessment]);

  const hasAiReadiness = Boolean(aiData?.dimensions.length);
  const stale = Boolean(aiData && !cacheValid);

  return {
    source: hasAiReadiness ? "openai" : "rules",
    loading,
    error,
    missingApiKey,
    model: meta.model,
    generatedAt: meta.generatedAt,
    stale,
    dimensions: aiData?.dimensions ?? null,
    overallScore: aiData?.overallScore ?? null,
    architectQuestions: aiData?.architectQuestions ?? null,
    telecomImpactAreas: aiData?.telecomImpactAreas ?? null,
    contentRichness: aiData?.contentRichness ?? null,
    architecture: aiData?.architecture ?? ruleAssessment.architecture,
    regenerate: () => void fetchAssessment(),
  };
}
