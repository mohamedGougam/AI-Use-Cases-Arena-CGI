"use client";

import { Layers, Loader2 } from "lucide-react";
import type { ArchitectureRecommendation } from "@/lib/architect-engine";
import { ARCHITECT_FIELD_META } from "@/lib/architect-field-meta";
import { EditableArchitectField } from "@/components/architect/editable-architect-field";
import type { ArchitectOverrideContext } from "@/components/architect/use-architect-overrides";

const AI_DATA_ARCH_META = {
  meaning:
    "AI and data architecture narrative — how data flows, models, integrations, and delivery align to this use case.",
  calculation: "Refined from the submission and harmonized when the architect adjusts related fields.",
};

const AI_ARCH_META = {
  pattern: {
    meaning: ARCHITECT_FIELD_META["architecture.pattern"].meaning,
    calculation: "Aligned with the AI & data architecture narrative and technology stack.",
  },
  confidence: {
    meaning: ARCHITECT_FIELD_META["architecture.confidence"].meaning,
    calculation: "Reflects fit between the use case, readiness gaps, and proposed architecture.",
  },
  technologies: {
    meaning: ARCHITECT_FIELD_META["architecture.technologies"].meaning,
    calculation: "Microsoft-centric stack aligned to the architecture narrative.",
  },
};

export function ArchitectureCard({
  architecture,
  overrides,
  syncing = false,
  onSyncSave,
}: {
  architecture: ArchitectureRecommendation;
  overrides: ArchitectOverrideContext;
  syncing?: boolean;
  onSyncSave: (fieldKey: string, value: string | number | boolean, architectNote?: string) => void;
}) {
  const save = (fieldKey: string) => (value: string | number | boolean, note?: string) => {
    onSyncSave(fieldKey, value, note);
  };

  return (
    <div className="rounded-xl border border-primary/25 bg-gradient-to-br from-primary/5 to-card/80 p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Architecture Recommendation</h3>
        </div>
        {syncing && (
          <span className="flex items-center gap-2 text-xs text-muted">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Aligning related fields…
          </span>
        )}
      </div>

      <p className="text-xs text-muted">
        Edit any field — your workshop judgment will harmonize pattern, stack, confidence, and readiness
        signals where relevant.
      </p>

      <EditableArchitectField
        fieldKey="architecture.rationale"
        label="AI and Data architecture for the use case"
        value={architecture.rationale}
        meta={AI_DATA_ARCH_META}
        type="textarea"
        multiline
        hideCalculation
        isOverridden={overrides.isOverridden("architecture.rationale")}
        overrideNote={overrides.getNote("architecture.rationale")}
        onSave={save("architecture.rationale")}
        onReset={() => overrides.onReset("architecture.rationale")}
      />

      <EditableArchitectField
        fieldKey="architecture.technologies"
        label="Technology stack"
        value={architecture.technologies.join(", ")}
        meta={AI_ARCH_META.technologies}
        type="textarea"
        hideCalculation
        isOverridden={overrides.isOverridden("architecture.technologies")}
        overrideNote={overrides.getNote("architecture.technologies")}
        onSave={save("architecture.technologies")}
        onReset={() => overrides.onReset("architecture.technologies")}
      />

      <EditableArchitectField
        fieldKey="architecture.pattern"
        label="Pattern"
        value={architecture.pattern}
        meta={AI_ARCH_META.pattern}
        type="text"
        hideCalculation
        isOverridden={overrides.isOverridden("architecture.pattern")}
        overrideNote={overrides.getNote("architecture.pattern")}
        onSave={save("architecture.pattern")}
        onReset={() => overrides.onReset("architecture.pattern")}
      />

      <EditableArchitectField
        fieldKey="architecture.confidence"
        label="Confidence"
        value={architecture.confidence}
        displayValue={`${architecture.confidence}%`}
        meta={AI_ARCH_META.confidence}
        type="number"
        hideCalculation
        isOverridden={overrides.isOverridden("architecture.confidence")}
        overrideNote={overrides.getNote("architecture.confidence")}
        onSave={save("architecture.confidence")}
        onReset={() => overrides.onReset("architecture.confidence")}
      />
    </div>
  );
}
