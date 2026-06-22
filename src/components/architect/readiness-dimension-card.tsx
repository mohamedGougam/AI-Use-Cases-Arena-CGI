"use client";

import { CheckCircle2, Circle, HelpCircle } from "lucide-react";
import type { ReadinessDimension } from "@/lib/architect-engine";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function ReadinessDimensionCard({ dimension }: { dimension: ReadinessDimension }) {
  return (
    <div className="rounded-xl border border-border/20 bg-card/60 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-semibold">{dimension.title}</h3>
        <span
          className={cn(
            "text-lg font-bold tabular-nums",
            dimension.score >= 75
              ? "text-emerald-500"
              : dimension.score >= 50
                ? "text-amber-500"
                : "text-primary"
          )}
        >
          {dimension.score}%
        </span>
      </div>
      <Progress value={dimension.score} className="mb-4 h-2" />
      <ul className="space-y-2">
        {dimension.criteria.map((c) => (
          <li key={c.label} className="flex items-start gap-2 text-sm">
            {c.met ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            ) : (
              <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted/50" />
            )}
            <span className={c.met ? "text-foreground" : "text-muted"}>{c.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ArchitectQuestions({ questions }: { questions: string[] }) {
  return (
    <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-5">
      <div className="mb-4 flex items-center gap-2">
        <HelpCircle className="h-5 w-5 text-amber-500" />
        <h3 className="font-semibold">Architect Questions</h3>
      </div>
      <p className="mb-4 text-sm text-muted">
        The AI Architect continuously challenges this use case until sufficient information exists for estimation.
      </p>
      <ol className="space-y-3">
        {questions.map((q, i) => (
          <li key={q} className="flex gap-3 text-sm">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
              {i + 1}
            </span>
            <span>{q}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
