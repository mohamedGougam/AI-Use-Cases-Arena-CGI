"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ARCHITECT_FIELD_META } from "@/lib/architect-field-meta";
import { EditableArchitectField } from "@/components/architect/editable-architect-field";
import type { ArchitectOverrideContext } from "@/components/architect/use-architect-overrides";

interface ReadinessGaugeProps {
  label: string;
  score: number;
  size?: "sm" | "lg";
  className?: string;
  fieldKey?: string;
  meta?: { meaning: string; calculation: string };
  overrides?: ArchitectOverrideContext;
}

function scoreColor(score: number): string {
  if (score >= 75) return "text-emerald-500";
  if (score >= 50) return "text-amber-500";
  return "text-primary";
}

function scoreStroke(score: number): string {
  if (score >= 75) return "stroke-emerald-500";
  if (score >= 50) return "stroke-amber-500";
  return "stroke-primary";
}

export function ReadinessGauge({
  label,
  score,
  size = "sm",
  className,
  fieldKey,
  meta,
  overrides,
}: ReadinessGaugeProps) {
  const radius = size === "lg" ? 52 : 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const dim = size === "lg" ? 128 : 88;

  const gauge = (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="-rotate-90">
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={size === "lg" ? 8 : 6}
            className="text-muted/20"
          />
          <motion.circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            strokeWidth={size === "lg" ? 8 : 6}
            strokeLinecap="round"
            className={scoreStroke(score)}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{ strokeDasharray: circumference }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn(
              "font-bold tabular-nums",
              size === "lg" ? "text-2xl" : "text-lg",
              scoreColor(score)
            )}
          >
            {score}%
          </span>
        </div>
      </div>
      {label ? (
        <p className={cn("text-center font-medium", size === "lg" ? "text-sm" : "text-xs text-muted")}>
          {label}
        </p>
      ) : null}
    </div>
  );

  if (!fieldKey || !meta || !overrides) return gauge;

  return (
    <div className="space-y-2">
      {gauge}
      <EditableArchitectField
        fieldKey={fieldKey}
        label={`${label} score`}
        value={score}
        displayValue={`${score}%`}
        meta={meta}
        type="number"
        isOverridden={overrides.isOverridden(fieldKey)}
        overrideNote={overrides.getNote(fieldKey)}
        onSave={(v, note) => overrides.onSave(fieldKey, v, note)}
        onReset={() => overrides.onReset(fieldKey)}
      />
    </div>
  );
}

export function OverallReadinessBanner({
  score,
  overrides,
  source = "rules",
}: {
  score: number;
  overrides?: ArchitectOverrideContext;
  source?: "openai" | "rules";
}) {
  const meta =
    source === "openai"
      ? {
          meaning: ARCHITECT_FIELD_META.overallScore.meaning,
          calculation:
            "Average of Business, Data, AI, Security, and Delivery scores — each scored by OpenAI from the business submission.",
        }
      : ARCHITECT_FIELD_META.overallScore;

  return (
    <div className="rounded-xl border border-primary/25 bg-gradient-to-br from-primary/10 via-background to-background p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1 space-y-3">
          {overrides ? (
            <EditableArchitectField
              fieldKey="overallScore"
              label="Overall AI Readiness"
              value={score}
              displayValue={`${score}%`}
              meta={meta}
              type="number"
              isOverridden={overrides.isOverridden("overallScore")}
              overrideNote={overrides.getNote("overallScore")}
              onSave={(v, note) => overrides.onSave("overallScore", v, note)}
              onReset={() => overrides.onReset("overallScore")}
            />
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                Overall AI Readiness
              </p>
              <p className="text-2xl font-bold">{score}%</p>
              <p className="text-sm text-muted">{meta.meaning}</p>
              <p className="text-xs italic text-muted">How calculated: {meta.calculation}</p>
            </>
          )}
        </div>
        <ReadinessGauge label="" score={score} size="lg" />
      </div>
    </div>
  );
}
