"use client";

import { useCallback, useState } from "react";
import type { ArchitectAssessment } from "@/lib/architect-engine";
import { flattenCriterionExplanations } from "@/lib/parse-architect-sync";
import type { ArchitectOverrideEntry, UseCase } from "@/types";
import { toast } from "@/hooks/use-toast";

export function useArchitectSync(
  useCase: UseCase,
  assessment: ArchitectAssessment,
  setFieldOverrides: (updates: Record<string, ArchitectOverrideEntry | null>) => void
) {
  const [syncing, setSyncing] = useState(false);

  const syncField = useCallback(
    async (fieldKey: string, value: string | number | boolean, architectNote?: string) => {
      const entry: ArchitectOverrideEntry = {
        value,
        ...(architectNote?.trim() ? { architectNote: architectNote.trim() } : {}),
      };

      setSyncing(true);
      try {
        const res = await fetch("/api/architect/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            useCase,
            assessment,
            changedFieldKey: fieldKey,
            changedValue: value,
            architectNote: architectNote ?? "",
          }),
        });
        const data = await res.json();

        if (data.fallback || !res.ok || !data.updates) {
          setFieldOverrides({ [fieldKey]: entry });
          if (!data.fallback && !res.ok) {
            toast({
              title: "Saved locally",
              description: data.error ?? "Related fields were not synced.",
              variant: "destructive",
            });
          }
          return;
        }

        const batch: Record<string, ArchitectOverrideEntry | null> = {};
        for (const [key, val] of Object.entries(data.updates.fields as Record<string, string | number | boolean>)) {
          batch[key] = {
            value: val,
            ...(key === fieldKey && architectNote?.trim()
              ? { architectNote: architectNote.trim() }
              : {}),
          };
        }

        if (data.updates.criterionExplanations) {
          const explanationFields = flattenCriterionExplanations(data.updates.criterionExplanations);
          for (const [key, text] of Object.entries(explanationFields)) {
            batch[key] = { value: text };
          }
        }

        setFieldOverrides(batch);
        toast({
          title: "Assessment updated",
          description: "Related architecture and readiness fields were aligned to your edit.",
        });
      } catch {
        setFieldOverrides({ [fieldKey]: entry });
        toast({
          title: "Saved locally",
          description: "Could not reach sync service. Only this field was updated.",
          variant: "destructive",
        });
      } finally {
        setSyncing(false);
      }
    },
    [useCase, assessment, setFieldOverrides]
  );

  return { syncField, syncing };
}
