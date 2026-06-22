"use client";

import { Layers } from "lucide-react";
import type { ArchitectureRecommendation } from "@/lib/architect-engine";
import { Badge } from "@/components/ui/badge";

export function ArchitectureCard({ architecture }: { architecture: ArchitectureRecommendation }) {
  return (
    <div className="rounded-xl border border-primary/25 bg-gradient-to-br from-primary/5 to-card/80 p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Architecture Recommendation</h3>
        </div>
        <Badge variant="outline" className="shrink-0 border-primary/40 text-primary">
          {architecture.confidence}% confidence
        </Badge>
      </div>
      <p className="text-xl font-bold text-primary">{architecture.pattern}</p>
      <p className="mt-2 text-sm text-muted leading-relaxed">{architecture.rationale}</p>
      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Technology Stack</p>
        <div className="flex flex-wrap gap-2">
          {architecture.technologies.map((tech) => (
            <Badge key={tech} variant="secondary">
              {tech}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
