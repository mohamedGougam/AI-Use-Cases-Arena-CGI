"use client";

import { useEffect, useState } from "react";
import { History, Database } from "lucide-react";
import type { EvaluationSnapshot } from "@/lib/arena-db/types";
import { fetchEvaluationHistory } from "@/lib/arena-db/client-sync";
import { formatDate, formatRelativeDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const EVENT_LABELS: Record<string, string> = {
  use_case_submitted: "Use case submitted",
  use_case_updated: "Use case updated",
  vote_cast: "Vote recorded",
  comment_added: "Comment added",
  creator_message: "Private message sent",
  document_uploaded: "Architect brief uploaded",
  document_removed: "Architect brief removed",
  overrides_updated: "Architect assessment adjusted",
  overrides_cleared: "Architect overrides cleared",
  state_sync: "Workshop sync",
};

export function EvaluationHistoryPanel({ useCaseId }: { useCaseId?: string }) {
  const [history, setHistory] = useState<EvaluationSnapshot[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const result = await fetchEvaluationHistory(useCaseId);
      if (cancelled) return;
      setHistory(result?.history ?? []);
      setStatusMessage(result?.status?.message ?? "");
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [useCaseId]);

  return (
    <section className="rounded-xl border border-border/20 bg-card/60 p-5 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <History className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Evaluation history</h3>
        {useCaseId && <Badge variant="outline">This use case</Badge>}
      </div>
      {statusMessage && (
        <p className="flex items-center gap-2 text-xs text-muted">
          <Database className="h-3.5 w-3.5" />
          {statusMessage}
        </p>
      )}
      <p className="text-sm text-muted">
        Persistent audit trail of submissions, architect assessments, document uploads, and adjustments for future reference.
      </p>
      {loading ? (
        <p className="text-sm text-muted">Loading history…</p>
      ) : history.length === 0 ? (
        <p className="text-sm text-muted">No history recorded yet. Events appear here as the workshop progresses.</p>
      ) : (
        <ul className="max-h-80 space-y-3 overflow-y-auto pr-1">
          {history.map((entry) => (
            <li
              key={entry.id}
              className="rounded-lg border border-border/15 bg-background/50 p-3 text-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">{entry.useCaseTitle}</span>
                <span className="text-xs text-muted" title={formatDate(entry.createdAt)}>
                  {formatRelativeDate(entry.createdAt)}
                </span>
              </div>
              <p className="mt-1 text-xs text-primary">
                {EVENT_LABELS[entry.eventType] ?? entry.eventType}
              </p>
              {entry.payload.assessmentSummary && (
                <p className="mt-2 text-xs text-muted">
                  Readiness {entry.payload.assessmentSummary.overallScore}% ·{" "}
                  {entry.payload.assessmentSummary.timelineMin}–
                  {entry.payload.assessmentSummary.timelineMax} weeks ·{" "}
                  {entry.payload.assessmentSummary.architecturePattern}
                </p>
              )}
              {entry.actorName && (
                <p className="mt-1 text-xs text-muted">By {entry.actorName}</p>
              )}
              {entry.payload.detail && (
                <p className="mt-1 text-xs text-muted">{entry.payload.detail}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
