"use client";

import { useEffect, useState } from "react";
import { Pencil, RotateCcw, Info } from "lucide-react";
import type { ArchitectFieldMeta } from "@/lib/architect-field-meta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type EditableFieldType = "number" | "text" | "textarea" | "boolean";

interface EditableArchitectFieldProps {
  fieldKey: string;
  label: string;
  value: string | number | boolean;
  displayValue?: string;
  meta: ArchitectFieldMeta;
  type?: EditableFieldType;
  isOverridden?: boolean;
  overrideNote?: string;
  explanation?: string;
  hideCalculation?: boolean;
  multiline?: boolean;
  className?: string;
  onSave: (value: string | number | boolean, architectNote?: string) => void | Promise<void>;
  onReset?: () => void;
}

export function EditableArchitectField({
  label,
  value,
  displayValue,
  meta,
  type = "text",
  isOverridden,
  overrideNote,
  explanation,
  hideCalculation = false,
  multiline = false,
  className,
  onSave,
  onReset,
}: EditableArchitectFieldProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const [note, setNote] = useState(overrideNote ?? "");

  useEffect(() => {
    if (!editing) {
      setDraft(type === "boolean" ? String(value) : String(value));
      setNote(overrideNote ?? "");
    }
  }, [value, overrideNote, editing, type]);

  const shown = displayValue ?? (type === "boolean" ? (value ? "Yes" : "No") : String(value));

  const handleSave = async () => {
    let parsed: string | number | boolean = draft;
    if (type === "number") parsed = Number(draft) || 0;
    if (type === "boolean") parsed = draft === "true" || draft === "yes" || draft === "1";
    setSaving(true);
    try {
      await Promise.resolve(onSave(parsed, note));
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={cn("rounded-lg border border-border/15 bg-background/40 p-3", className)}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted">{label}</p>
          {!editing ? (
            <p
              className={cn(
                "mt-0.5 font-semibold",
                multiline || type === "textarea"
                  ? "whitespace-pre-wrap text-sm font-normal leading-relaxed"
                  : "tabular-nums",
                !String(value).trim() && displayValue ? "text-muted font-normal italic" : ""
              )}
            >
              {shown}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {isOverridden && (
            <Badge variant="outline" className="border-amber-500/40 text-amber-600 text-[10px]">
              Architect adjusted
            </Badge>
          )}
          {!editing ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => {
                  setDraft(type === "boolean" ? String(value) : String(value));
                  setNote(overrideNote ?? "");
                  setEditing(true);
                }}
                aria-label={`Edit ${label}`}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              {isOverridden && onReset && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={onReset}
                  aria-label={`Reset ${label}`}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              )}
            </>
          ) : null}
        </div>
      </div>

      {(explanation || !hideCalculation) && (
        <div className="mt-2 flex gap-2 text-xs text-muted">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/70" />
          <div>
            {explanation ? (
              <p>{explanation}</p>
            ) : (
              <>
                <p>{meta.meaning}</p>
                <p className="mt-1 italic opacity-90">How calculated: {meta.calculation}</p>
              </>
            )}
          </div>
        </div>
      )}

      {overrideNote && !editing && (
        <p className="mt-2 text-xs text-amber-600/90">Architect note: {overrideNote}</p>
      )}

      {editing && (
        <div className="mt-3 space-y-2 border-t border-border/10 pt-3">
          {type === "textarea" ? (
            <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={multiline ? 5 : 3} />
          ) : type === "boolean" ? (
            <select
              className="flex h-10 w-full rounded-lg border border-border/20 bg-background/50 px-3 text-sm"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            >
              <option value="true">Yes / Met</option>
              <option value="false">No / Not met</option>
            </select>
          ) : (
            <Input
              type={type === "number" ? "number" : "text"}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
          )}
          <Textarea
            aria-label="Architect experience note"
            placeholder={
              type === "boolean"
                ? "Optional: why you changed this status based on workshop discussion."
                : "Optional: professional context for this change."
            }
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="text-sm"
          />
          <p className="text-[11px] text-muted">
            {type === "boolean"
              ? "Edit the assessment detail below to change the visible explanation text."
              : "Optional note — related fields will align automatically when possible."}
          </p>
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={() => void handleSave()} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setEditing(false)} disabled={saving}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
