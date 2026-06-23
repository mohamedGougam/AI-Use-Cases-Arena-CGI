"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ArchitectAssessment } from "@/lib/architect-engine";
import { workshopFingerprint, migrateLegacyQuestions } from "@/lib/discovery-questions";
import { mapAiToArchitectAssessment } from "@/lib/map-ai-assessment";
import type { ArchitectAiAssessment, ArchitectDiscoveryQuestion, UseCase } from "@/types";

export type AiAssessmentSource = "openai" | "rules" | "none";

interface OpenAiAssessmentState {
  source: AiAssessmentSource;
  loading: boolean;
  error: string | null;
  missingApiKey: boolean;
  model?: string;
  generatedAt?: string;
  stale: boolean;
  assessment: ArchitectAssessment | null;
}

function fromCachedAssessment(
  cached: ArchitectAiAssessment,
  useCase: UseCase
): ArchitectAssessment {
  const discoveryQuestions =
    cached.discoveryQuestions?.length
      ? cached.discoveryQuestions
      : migrateLegacyQuestions(cached.architectQuestions ?? [], useCase.architectDiscoveryQuestions);

  return mapAiToArchitectAssessment(
    {
      dimensions: cached.dimensions as ArchitectAssessment["dimensions"],
      overallScore: cached.overallScore,
      discoveryQuestions,
      telecomImpactAreas: cached.telecomImpactAreas as ArchitectAssessment["telecomImpactAreas"],
      architecture: {
        pattern: cached.pattern,
        technologies: cached.technologies,
        confidence: cached.confidence,
        rationale: cached.rationale,
      },
      architectureUnlocked: cached.architectureUnlocked ?? false,
      estimationUnlocked: cached.estimationUnlocked ?? false,
      governance: cached.governance ?? {
        evidenceUsed: [],
        missingInformation: [],
        assumptions: [],
        risks: [],
        executiveSummary: "",
      },
      estimation: cached.estimation ?? {
        locked: true,
        lockReason: "Insufficient information available.",
        modelEstimates: [],
        consensus: { timelineMin: 0, timelineMax: 0, confidence: 0 },
        deliveryTeam: [],
        requiredSkills: [],
        totalTeamDays: 0,
      },
      contentRichness: cached.contentRichness,
    },
    discoveryQuestions,
    useCase
  );
}

export function useOpenAiAssessment(
  useCase: UseCase,
  onAssessment: (assessment: ArchitectAiAssessment, discoveryQuestions: ArchitectDiscoveryQuestion[]) => void
): OpenAiAssessmentState & {
  regenerate: () => void;
  contentRichness: ArchitectAiAssessment["contentRichness"] | null;
} {
  const fingerprint = workshopFingerprint(useCase);
  const cached = useCase.architectAiAssessment;
  const cacheValid = Boolean(
    cached?.inputFingerprint === fingerprint &&
      (cached.discoveryQuestions?.length || cached.dimensions?.length)
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [missingApiKey, setMissingApiKey] = useState(false);
  const [assessment, setAssessment] = useState<ArchitectAssessment | null>(
    cacheValid && cached ? fromCachedAssessment(cached, useCase) : null
  );
  const [meta, setMeta] = useState({ model: cached?.model, generatedAt: cached?.generatedAt });
  const [contentRichness, setContentRichness] = useState(cached?.contentRichness ?? null);
  const fetchedRef = useRef<string | null>(cacheValid ? fingerprint : null);

  const applyResponse = useCallback(
    (data: {
      architectAiAssessment: ArchitectAiAssessment;
      discoveryQuestions: ArchitectDiscoveryQuestion[];
      model: string;
      generatedAt: string;
      assessment: {
        contentRichness?: ArchitectAiAssessment["contentRichness"];
      };
    }) => {
      const mapped = mapAiToArchitectAssessment(
        {
          ...data.assessment,
          discoveryQuestions: data.discoveryQuestions,
          architecture: {
            pattern: data.architectAiAssessment.pattern,
            technologies: data.architectAiAssessment.technologies,
            confidence: data.architectAiAssessment.confidence,
            rationale: data.architectAiAssessment.rationale,
          },
          architectureUnlocked: data.architectAiAssessment.architectureUnlocked,
          estimationUnlocked: data.architectAiAssessment.estimationUnlocked,
          governance: data.architectAiAssessment.governance,
          estimation: data.architectAiAssessment.estimation,
          dimensions: data.architectAiAssessment.dimensions as ArchitectAssessment["dimensions"],
          overallScore: data.architectAiAssessment.overallScore,
          telecomImpactAreas:
            data.architectAiAssessment.telecomImpactAreas as ArchitectAssessment["telecomImpactAreas"],
        },
        data.discoveryQuestions,
        useCase
      );
      setAssessment(mapped);
      setContentRichness(data.assessment.contentRichness ?? null);
      setMeta({ model: data.model, generatedAt: data.generatedAt });
      onAssessment(data.architectAiAssessment, data.discoveryQuestions);
    },
    [onAssessment, useCase]
  );

  const fetchAssessment = useCallback(async () => {
    setLoading(true);
    setError(null);
    setMissingApiKey(false);
    fetchedRef.current = null;
    try {
      const res = await fetch("/api/architect/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          useCase,
          discoveryQuestions: useCase.architectDiscoveryQuestions,
        }),
      });
      const data = await res.json();

      if (res.status === 503) {
        setMissingApiKey(true);
        setAssessment(null);
        fetchedRef.current = fingerprint;
        return;
      }

      if (!res.ok) throw new Error(data.error ?? "Assessment failed");

      applyResponse(data);
      fetchedRef.current = fingerprint;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate assessment");
    } finally {
      setLoading(false);
    }
  }, [useCase, fingerprint, applyResponse]);

  useEffect(() => {
    const cached = useCase.architectAiAssessment;
    if (cached?.inputFingerprint === fingerprint) {
      setAssessment(fromCachedAssessment(cached, useCase));
      setMeta({ model: cached.model, generatedAt: cached.generatedAt });
      setContentRichness(cached.contentRichness ?? null);
      fetchedRef.current = fingerprint;
    }
  }, [useCase, useCase.architectAiAssessment, useCase.architectDiscoveryQuestions, fingerprint]);

  useEffect(() => {
    if (cacheValid && cached) {
      setAssessment(fromCachedAssessment(cached, useCase));
      setMeta({ model: cached.model, generatedAt: cached.generatedAt });
      setContentRichness(cached.contentRichness ?? null);
      fetchedRef.current = fingerprint;
      return;
    }

    if (fetchedRef.current === fingerprint) return;
    void fetchAssessment();
  }, [fingerprint, cacheValid, cached, fetchAssessment, useCase]);

  const stale = Boolean(cached && !cacheValid);

  return {
    source: assessment ? "openai" : "none",
    loading,
    error,
    missingApiKey,
    model: meta.model,
    generatedAt: meta.generatedAt,
    stale,
    assessment,
    contentRichness,
    regenerate: () => void fetchAssessment(),
  };
}

export async function reassessAfterAnswer(
  useCase: UseCase,
  questionId: string,
  answer: string,
  answeredBy: string
) {
  const res = await fetch("/api/architect/reassess", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      useCase,
      questionId,
      answer,
      answeredBy,
      discoveryQuestions: useCase.architectDiscoveryQuestions,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    return { ok: false as const, error: data.error ?? "Reassessment failed" };
  }
  return { ok: true as const, data };
}
