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

      // Persist the architect's edit immediately so the UI reflects their change.
      setFieldOverrides({ [fieldKey]: entry });

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
          if (!data.fallback && !res.ok) {
            toast({
              title: "Saved your edit",
              description: data.error ?? "Related fields were not synced.",
              variant: "destructive",
            });
          }
          return;
        }

        const batch: Record<string, ArchitectOverrideEntry | null> = {
          [fieldKey]: entry,
        };

        for (const [key, val] of Object.entries(
          data.updates.fields as Record<string, string | number | boolean>
        )) {
          if (key === fieldKey) continue;
          batch[key] = { value: val };
        }

        if (data.updates.criterionExplanations) {
          const explanationFields = flattenCriterionExplanations(data.updates.criterionExplanations);
          for (const [key, text] of Object.entries(explanationFields)) {
            if (key === fieldKey) continue;
            batch[key] = { value: text };
          }
        }

        setFieldOverrides(batch);
        toast({
          title: "Assessment updated",
          description: "Related fields were aligned to your edit.",
        });
      } catch {
        toast({
          title: "Saved your edit",
          description: "Could not reach sync service. Your change was kept locally.",
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
