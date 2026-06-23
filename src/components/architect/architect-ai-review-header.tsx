"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { AiAssessmentSource } from "@/components/architect/use-openai-assessment";

export function ArchitectAiReviewHeader({
  source,
  loading,
  error,
  missingApiKey,
  stale,
  needsCitationRefresh = false,
  generatedAt,
  onRegenerate,
}: {
  source: AiAssessmentSource;
  loading: boolean;
  error: string | null;
  missingApiKey: boolean;
  stale: boolean;
  needsCitationRefresh?: boolean;
  generatedAt?: string;
  onRegenerate: () => void;
}) {
  return (
    <div className="rounded-xl border border-border/20 bg-card/40 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">AI Architect Review</span>
          {source === "openai" && !loading && (
            <Badge variant="outline" className="border-primary/40">
              OpenAI governance mode
            </Badge>
          )}
          {source === "none" && !loading && !missingApiKey && (
            <Badge variant="outline">Awaiting assessment</Badge>
          )}
          {stale && (
            <Badge variant="outline" className="border-amber-500/40 text-amber-600">
              Content changed — regenerate
            </Badge>
          )}
          {needsCitationRefresh && !loading && (
            <Badge variant="outline" className="border-sky-500/40 text-sky-400">
              Regenerate for source quotes in assessment details
            </Badge>
          )}
        </div>
        <Button type="button" variant="outline" size="sm" disabled={loading} onClick={onRegenerate}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          {loading ? "Analyzing…" : "Regenerate review"}
        </Button>
      </div>

      {source === "openai" && generatedAt && !loading && (
        <p className="text-xs text-muted">Generated {formatDate(generatedAt)}</p>
      )}

      {loading && (
        <p className="flex items-center gap-2 text-sm text-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          Running OpenAI discovery assessment…
        </p>
      )}

      {missingApiKey && !loading && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          OpenAI is required for architect governance. Add OPENAI_API_KEY to .env.local (local) or Vercel
          Environment Variables (production), then restart or redeploy.
        </p>
      )}

      {error && (
        <p className="text-sm text-destructive">
          {error}. No fallback assessment is shown — fix the OpenAI configuration and regenerate.
        </p>
      )}
    </div>
  );
}
