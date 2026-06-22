"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ArchitectAssessment, ArchitectureRecommendation } from "@/lib/architect-engine";
import { recommendationInputFingerprint } from "@/lib/architect-recommendation-payload";
import type { ArchitectAiRecommendation, UseCase } from "@/types";

interface OpenAiRecommendationState {
  architecture: ArchitectureRecommendation;
  source: "openai" | "rules";
  loading: boolean;
  error: string | null;
  missingApiKey: boolean;
  model?: string;
  generatedAt?: string;
  stale: boolean;
}

export function useOpenAiArchitecture(
  useCase: UseCase,
  ruleAssessment: ArchitectAssessment,
  onAiRecommendation: (rec: ArchitectAiRecommendation) => void
): OpenAiRecommendationState & { regenerate: () => void } {
  const fingerprint = recommendationInputFingerprint(useCase);
  const cached = useCase.architectAiRecommendation;
  const cacheValid = cached?.inputFingerprint === fingerprint;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [missingApiKey, setMissingApiKey] = useState(false);
  const [aiArch, setAiArch] = useState<ArchitectureRecommendation | null>(
    cacheValid ? cached : null
  );
  const [meta, setMeta] = useState({ model: cached?.model, generatedAt: cached?.generatedAt });
  const fetchedRef = useRef<string | null>(cacheValid ? fingerprint : null);

  const applyRecommendation = useCallback(
    (rec: ArchitectureRecommendation, model: string, generatedAt: string) => {
      setAiArch(rec);
      setMeta({ model, generatedAt });
      onAiRecommendation({
        pattern: rec.pattern,
        technologies: rec.technologies,
        confidence: rec.confidence,
        rationale: rec.rationale,
        model,
        generatedAt,
        inputFingerprint: fingerprint,
      });
    },
    [fingerprint, onAiRecommendation]
  );

  const fetchRecommendation = useCallback(async () => {
    setLoading(true);
    setError(null);
    setMissingApiKey(false);
    try {
      const res = await fetch("/api/architect/recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ useCase, assessment: ruleAssessment }),
      });
      const data = await res.json();

      if (data.fallback) {
        setAiArch(null);
        setError(null);
        setMissingApiKey(data.reason === "missing_api_key");
        fetchedRef.current = fingerprint;
        return;
      }

      if (!res.ok) throw new Error(data.error ?? "Recommendation failed");

      applyRecommendation(data.recommendation, data.model, data.generatedAt);
      fetchedRef.current = fingerprint;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate recommendation");
    } finally {
      setLoading(false);
    }
  }, [useCase, ruleAssessment, fingerprint, applyRecommendation]);

  useEffect(() => {
    if (cacheValid && cached) {
      setAiArch({
        pattern: cached.pattern,
        technologies: cached.technologies,
        confidence: cached.confidence,
        rationale: cached.rationale,
      });
      setMeta({ model: cached.model, generatedAt: cached.generatedAt });
      fetchedRef.current = fingerprint;
      return;
    }

    if (fetchedRef.current === fingerprint) return;
    void fetchRecommendation();
  }, [fingerprint, cacheValid, cached, fetchRecommendation]);

  const architecture = aiArch ?? ruleAssessment.architecture;
  const stale = Boolean(aiArch && !cacheValid);

  return {
    architecture,
    source: aiArch ? "openai" : "rules",
    loading,
    error,
    missingApiKey,
    model: meta.model,
    generatedAt: meta.generatedAt,
    stale,
    regenerate: () => void fetchRecommendation(),
  };
}
