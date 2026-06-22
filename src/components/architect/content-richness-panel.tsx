"use client";

import { cn } from "@/lib/utils";
import {
  analyzeContentRichness,
  densityLabel,
  mergeAiContentRichness,
  type AiContentRichness,
  type ContentDensity,
} from "@/lib/content-richness";
import type { UseCase } from "@/types";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const DENSITY_STYLES: Record<ContentDensity, string> = {
  empty: "border-border/30 text-muted bg-muted/10",
  sparse: "border-amber-500/40 text-amber-600 bg-amber-500/10",
  adequate: "border-emerald-500/30 text-emerald-600 bg-emerald-500/10",
  rich: "border-primary/40 text-primary bg-primary/10",
};

interface ContentRichnessPanelProps {
  useCase: UseCase;
  wordCounts: {
    titleWords: number;
    descriptionWords: number;
    documentWords: number;
  };
  aiRichness?: AiContentRichness | null;
}

export function ContentRichnessPanel({
  useCase,
  wordCounts,
  aiRichness,
}: ContentRichnessPanelProps) {
  const analysis = mergeAiContentRichness(
    analyzeContentRichness(useCase, {
      titleWords: wordCounts.titleWords,
      descriptionWords: wordCounts.descriptionWords,
      documentWords: wordCounts.documentWords,
    }),
    aiRichness
  );

  return (
    <div className="rounded-xl border border-border/20 bg-card/50 p-4 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Submission depth
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{analysis.score}%</p>
        </div>
        <p className="max-w-md text-sm text-muted">{analysis.summary}</p>
      </div>
      <Progress value={analysis.score} className="h-2" />
      <ul className="space-y-2">
        {analysis.fields.map((field) => (
          <li
            key={field.key}
            className="rounded-lg border border-border/15 bg-background/40 px-3 py-2.5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-medium">{field.label}</span>
                <span className="text-xs text-muted tabular-nums">
                  {field.words > 0 ? `${field.words} words` : "—"}
                </span>
              </div>
              <Badge variant="outline" className={cn("text-[10px]", DENSITY_STYLES[field.density])}>
                {densityLabel(field.density)}
              </Badge>
            </div>
            <p className="mt-1.5 text-xs text-muted leading-relaxed">{field.hint}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
