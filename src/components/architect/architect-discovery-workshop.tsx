"use client";

import { useCallback, useState } from "react";
import { HelpCircle, Loader2, Lock, Unlock } from "lucide-react";
import type { ArchitectAssessment } from "@/lib/architect-engine";
import { discoveryProgress } from "@/lib/discovery-questions";
import type { ArchitectDiscoveryQuestion } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { formatRelativeDate } from "@/lib/utils";

function statusBadge(status: ArchitectDiscoveryQuestion["status"], hasAnswer: boolean) {
  if (hasAnswer && status === "used") {
    return (
      <Badge variant="outline" className="border-emerald-500/40 text-emerald-500">
        Used in assessment
      </Badge>
    );
  }
  if (hasAnswer) {
    return (
      <Badge variant="outline" className="border-sky-500/40 text-sky-400">
        Answered
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="border-amber-500/40 text-amber-500">
      Missing answer
    </Badge>
  );
}

export function ArchitectDiscoveryWorkshop({
  useCaseId,
  questions,
  assessment,
  architectName,
  loading,
  onReassess,
}: {
  useCaseId: string;
  questions: ArchitectDiscoveryQuestion[];
  assessment: ArchitectAssessment;
  architectName: string;
  loading?: boolean;
  onReassess: (
    questionId: string,
    answer: string
  ) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const { total, answered, progress } = discoveryProgress(questions);
  const confidence = assessment.architecture.confidence;

  const getDraft = useCallback(
    (q: ArchitectDiscoveryQuestion) => drafts[q.id] ?? q.answer ?? "",
    [drafts]
  );

  const handleSave = async (questionId: string) => {
    const answer = (drafts[questionId] ?? "").trim();
    if (!answer) {
      toast({ title: "Answer required", description: "Enter the stakeholder response before saving.", variant: "destructive" });
      return;
    }
    setSavingId(questionId);
    try {
      const result = await onReassess(questionId, answer);
      if (!result.ok) {
        toast({ title: "Reassessment failed", description: result.error ?? "Could not update assessment.", variant: "destructive" });
        return;
      }
      toast({ title: "Answer saved", description: "Assessment, architecture, and readiness were updated." });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-5 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-amber-500" />
          <div>
            <h3 className="font-semibold">Architect Discovery Workshop</h3>
            <p className="text-sm text-muted">
              Capture stakeholder answers, reassess readiness, and unlock architecture and estimation progressively.
            </p>
          </div>
        </div>
        {loading && (
          <span className="flex items-center gap-2 text-xs text-muted">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Running OpenAI reassessment…
          </span>
        )}
      </div>

      <div className="rounded-lg border border-border/20 bg-background/40 p-4 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">
          Architect Interview Progress
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted">Answered</p>
            <p className="text-lg font-bold tabular-nums">
              {answered} of {total || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">Progress</p>
            <p className="text-lg font-bold tabular-nums">{progress}%</p>
            <Progress value={progress} className="mt-1 h-1.5" />
          </div>
          <div>
            <p className="text-xs text-muted">Architecture Confidence</p>
            <p className="text-lg font-bold tabular-nums text-primary">{confidence}%</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {assessment.architectureUnlocked ? (
            <Badge className="gap-1 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/20">
              <Unlock className="h-3 w-3" /> Architecture unlocked
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 border-amber-500/40 text-amber-500">
              <Lock className="h-3 w-3" /> Architecture locked
            </Badge>
          )}
          {assessment.estimationUnlocked ? (
            <Badge className="gap-1 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/20">
              <Unlock className="h-3 w-3" /> Estimation unlocked
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 border-amber-500/40 text-amber-500">
              <Lock className="h-3 w-3" /> Estimation locked
            </Badge>
          )}
        </div>
      </div>

      {questions.length === 0 ? (
        <p className="text-sm text-muted">
          Discovery questions will appear after the initial OpenAI assessment runs.
        </p>
      ) : (
        <ol className="space-y-4">
          {questions.map((q, index) => {
            const draft = getDraft(q);
            const hasAnswer = Boolean(q.answer?.trim());
            const isSaving = savingId === q.id;

            return (
              <li
                key={`${useCaseId}-${q.id}`}
                className="rounded-lg border border-border/20 bg-card/60 p-4 space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/80">
                      Question {index + 1}
                    </p>
                    <p className="mt-1 font-semibold leading-snug">{q.question}</p>
                  </div>
                  {statusBadge(q.status, hasAnswer)}
                </div>

                <div className="rounded-md border border-border/10 bg-background/30 p-3 text-xs text-muted">
                  <p className="font-medium text-foreground/80">Reason</p>
                  <p className="mt-1">{q.rationale}</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor={`answer-${q.id}`} className="text-xs font-medium text-muted">
                    Business answer
                  </label>
                  <Textarea
                    id={`answer-${q.id}`}
                    value={draft}
                    onChange={(e) => setDrafts((prev) => ({ ...prev, [q.id]: e.target.value }))}
                    placeholder="Capture the stakeholder answer from the workshop…"
                    rows={4}
                    disabled={isSaving || loading}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={isSaving || loading || !draft.trim()}
                    onClick={() => void handleSave(q.id)}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      "Save answer"
                    )}
                  </Button>
                  {q.answeredAt && (
                    <p className="text-[11px] text-muted">
                      Last updated {formatRelativeDate(q.answeredAt)}
                      {q.answeredBy ? ` by ${q.answeredBy}` : ""}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <p className="text-[11px] text-muted">
        Workshop facilitator: {architectName}. Each saved answer triggers OpenAI reassessment — no local heuristics.
      </p>
    </div>
  );
}
