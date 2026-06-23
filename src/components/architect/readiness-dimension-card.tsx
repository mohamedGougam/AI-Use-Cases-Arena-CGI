"use client";

import { CheckCircle2, Circle } from "lucide-react";
import type { ReadinessCriterion, ReadinessDimension } from "@/lib/architect-engine";
import { getCriterionMeta, getDimensionMeta } from "@/lib/architect-field-meta";
import { EditableArchitectField } from "@/components/architect/editable-architect-field";
import type { ArchitectOverrideContext } from "@/components/architect/use-architect-overrides";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { AiAssessmentSource } from "@/components/architect/use-openai-assessment";

function CriterionEvidenceBlock({ criterion }: { criterion: ReadinessCriterion }) {
  if (!criterion.evidence && !criterion.source && criterion.confidence == null) {
    return null;
  }

  return (
    <div className="rounded-md border border-border/10 bg-background/30 p-3 text-xs space-y-2">
      {criterion.evidence && (
        <div>
          <p className="font-medium text-foreground/80">Evidence</p>
          <p className="mt-0.5 text-muted whitespace-pre-wrap leading-relaxed">
            &ldquo;{criterion.evidence}&rdquo;
          </p>
        </div>
      )}
      <div className="flex flex-wrap gap-4">
        {criterion.source && (
          <div>
            <p className="font-medium text-foreground/80">Source</p>
            <p className="mt-0.5 text-muted">{criterion.source}</p>
          </div>
        )}
        {criterion.confidence != null && (
          <div>
            <p className="font-medium text-foreground/80">Confidence</p>
            <p className="mt-0.5 tabular-nums text-primary">{criterion.confidence}%</p>
          </div>
        )}
      </div>
    </div>
  );
}

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
              <CriterionEvidenceBlock criterion={c} />
              <EditableArchitectField
                fieldKey={explanationKey}
                label="Assessment"
                value={c.explanation ?? ""}
                displayValue={c.explanation || "No assessment yet — regenerate review."}
                meta={{
                  meaning: "Consultant summary of how this criterion was judged.",
                  calculation:
                    "Derived from master discovery context across all sources — not a single form field.",
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
