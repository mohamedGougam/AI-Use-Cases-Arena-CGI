"use client";

import type { ArchitectOverrideEntry, ArchitectOverrides } from "@/types";
import {
  getOverrideNote,
  isFieldOverridden,
} from "@/lib/apply-architect-overrides";

export interface ArchitectOverrideContext {
  isOverridden: (fieldKey: string) => boolean;
  getNote: (fieldKey: string) => string | undefined;
  onSave: (fieldKey: string, value: string | number | boolean, architectNote?: string) => void;
  onReset: (fieldKey: string) => void;
}

export function useArchitectOverrideHandlers(
  overrides: ArchitectOverrides | undefined,
  setField: (fieldKey: string, entry: ArchitectOverrideEntry | null) => void
): ArchitectOverrideContext {
  return {
    isOverridden: (fieldKey) => isFieldOverridden(overrides, fieldKey),
    getNote: (fieldKey) => getOverrideNote(overrides, fieldKey),
    onSave: (fieldKey, value, architectNote) => {
      setField(fieldKey, {
        value,
        ...(architectNote?.trim() ? { architectNote: architectNote.trim() } : {}),
      });
    },
    onReset: (fieldKey) => setField(fieldKey, null),
  };
}
