"use client";

import { CheckCircle2, Circle, HelpCircle } from "lucide-react";
import type { ReadinessDimension } from "@/lib/architect-engine";
import { getCriterionMeta, getDimensionMeta, getQuestionMeta } from "@/lib/architect-field-meta";
import { EditableArchitectField } from "@/components/architect/editable-architect-field";
import type { ArchitectOverrideContext } from "@/components/architect/use-architect-overrides";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

import type { AiAssessmentSource } from "@/components/architect/use-openai-assessment";

export function ReadinessDimensionCard({
  dimension,
  overrides,
  source = "rules",
  onSyncSave,
}: {
  dimension: ReadinessDimension;
  overrides: ArchitectOverrideContext;
  source?: AiAssessmentSource;
  onSyncSave?: (fieldKey: string, value: string | number | boolean, architectNote?: string) => void;
}) {
  const scoreKey = `dimension.${dimension.key}.score`;
  const dimMeta = getDimensionMeta(dimension.key, source === "openai" ? "openai" : "rules");

  const saveField = (fieldKey: string) => (value: string | number | boolean, note?: string) => {
    if (onSyncSave) onSyncSave(fieldKey, value, note);
    else overrides.onSave(fieldKey, value, note);
  };

  return (
    <div className="rounded-xl border border-border/20 bg-card/60 p-5 space-y-4">
      <EditableArchitectField
        fieldKey={scoreKey}
        label={dimension.title}
        value={dimension.score}
        displayValue={`${dimension.score}%`}
        meta={dimMeta}
        type="number"
        hideCalculation={source === "openai"}
        isOverridden={overrides.isOverridden(scoreKey)}
        overrideNote={overrides.getNote(scoreKey)}
        onSave={saveField(scoreKey)}
        onReset={() => overrides.onReset(scoreKey)}
      />
      <Progress value={dimension.score} className="h-2" />
      <ul className="space-y-3">
        {dimension.criteria.map((c, i) => {
          const criterionKey = `dimension.${dimension.key}.criteria.${i}`;
          const explanationKey = `${criterionKey}.explanation`;
          const meta = getCriterionMeta(dimension.key, i, c.label, source === "openai" ? "openai" : "rules");
          return (
            <li key={criterionKey} className="space-y-2">
              <EditableArchitectField
                fieldKey={criterionKey}
                label={c.label}
                value={c.met}
                displayValue={c.met ? "Met" : "Not met"}
                meta={meta}
                type="boolean"
                hideCalculation
                isOverridden={overrides.isOverridden(criterionKey)}
                overrideNote={overrides.getNote(criterionKey)}
                onSave={saveField(criterionKey)}
                onReset={() => overrides.onReset(criterionKey)}
                className="!p-2"
              />
              <EditableArchitectField
                fieldKey={explanationKey}
                label="Assessment detail"
                value={c.explanation ?? ""}
                displayValue={c.explanation || "No detail yet — click edit to add."}
                meta={{
                  meaning: "Evidence for this criterion — where it was found and the exact wording.",
                  calculation:
                    "Met: In [source field]: \"quoted sentence\". Not met: lists fields checked and what is missing.",
                }}
                type="textarea"
                multiline
                hideCalculation
                isOverridden={overrides.isOverridden(explanationKey)}
                overrideNote={overrides.getNote(explanationKey)}
                onSave={saveField(explanationKey)}
                onReset={() => overrides.onReset(explanationKey)}
                className="!p-2"
              />
              <div className="flex items-center gap-2 pl-1 text-xs">
                {c.met ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Circle className="h-3.5 w-3.5 text-muted/50" />
                )}
                <span className={cn(c.met ? "text-foreground" : "text-muted")}>
                  {c.met ? "Criterion satisfied" : "Gap identified"}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ArchitectQuestions({
  questions,
  overrides,
  source = "rules",
}: {
  questions: string[];
  overrides: ArchitectOverrideContext;
  source?: AiAssessmentSource;
}) {
  return (
    <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-5">
      <div className="mb-4 flex items-center gap-2">
        <HelpCircle className="h-5 w-5 text-amber-500" />
        <h3 className="font-semibold">Architect Questions</h3>
      </div>
      <p className="mb-4 text-sm text-muted">
        Follow-up questions until sufficient information exists for estimation. Edit to reflect your workshop discussion.
      </p>
      <ol className="space-y-3">
        {questions.map((q, i) => {
          const key = `question.${i}`;
          return (
            <li key={key} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary mt-2">
                {i + 1}
              </span>
              <div className="flex-1">
                <EditableArchitectField
                  fieldKey={key}
                  label={`Question ${i + 1}`}
                  value={q}
                  meta={getQuestionMeta(i, source === "openai" ? "openai" : "rules")}
                  type="textarea"
                  isOverridden={overrides.isOverridden(key)}
                  overrideNote={overrides.getNote(key)}
                  onSave={(v, note) => overrides.onSave(key, v, note)}
                  onReset={() => overrides.onReset(key)}
                />
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
