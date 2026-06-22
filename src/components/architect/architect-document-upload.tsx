"use client";

import { useRef, useState } from "react";
import { FileText, Loader2, Trash2, Upload } from "lucide-react";
import type { UseCase } from "@/types";
import type { ArchitectDocumentBrief } from "@/types";
import { useApp } from "@/context/app-context";
import { DOCUMENT_MODEL_OPTIONS, CHOSEN_DOCUMENT_MODEL } from "@/lib/document-models";
import { ARCHITECT_FIELD_META } from "@/lib/architect-field-meta";
import { EditableArchitectField } from "@/components/architect/editable-architect-field";
import type { ArchitectOverrideContext } from "@/components/architect/use-architect-overrides";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

interface ArchitectDocumentUploadProps {
  useCase: UseCase;
  wordCounts: {
    titleWords: number;
    descriptionWords: number;
    businessUserTotal: number;
    documentWords: number;
    hasDocument: boolean;
  };
  overrides?: ArchitectOverrideContext;
}

export function ArchitectDocumentUpload({ useCase, wordCounts, overrides }: ArchitectDocumentUploadProps) {
  const { setArchitectBrief, clearArchitectBrief } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const brief = useCase.architectBrief;

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/analyze-document", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");

      const briefPayload: ArchitectDocumentBrief = {
        fileName: data.fileName,
        mimeType: data.mimeType,
        extractedText: data.extractedText,
        wordCount: data.wordCount,
        charCount: data.charCount,
        analyzedAt: new Date().toISOString(),
        modelId: data.modelId,
        modelName: data.modelName,
        extractionMethod: data.extractionMethod,
        analysisSummary: data.analysisSummary,
      };
      setArchitectBrief(useCase.id, briefPayload);
      toast({
        title: "Document analyzed",
        description: `${data.wordCount.toLocaleString()} words extracted from ${file.name}.`,
      });
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Could not analyze document",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <section className="rounded-lg border border-border/20 bg-background/30 p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Architect Brief Document
          </h3>
          <p className="text-sm text-muted mt-1">
            Upload a detailed brief (PDF, DOCX, TXT, MD). Word counts for business users use title and description only;
            the document enriches OpenAI readiness assessment and architect review.
          </p>
        </div>
        <Badge variant="outline" className="border-primary/40">
          Model: {CHOSEN_DOCUMENT_MODEL.name}
        </Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {(
          [
            ["wordCount.title", "Title words", wordCounts.titleWords],
            ["wordCount.description", "Description words", wordCounts.descriptionWords],
            ["wordCount.businessTotal", "Business user total", wordCounts.businessUserTotal],
            ["wordCount.document", "Document words", wordCounts.documentWords || 0],
          ] as const
        ).map(([key, label, value]) =>
          overrides ? (
            <EditableArchitectField
              key={key}
              fieldKey={key}
              label={label}
              value={value}
              meta={ARCHITECT_FIELD_META[key]}
              type="number"
              isOverridden={overrides.isOverridden(key)}
              overrideNote={overrides.getNote(key)}
              onSave={(v, note) => overrides.onSave(key, v, note)}
              onReset={() => overrides.onReset(key)}
            />
          ) : (
            <div key={key} className="rounded-lg bg-white/5 p-3 text-center">
              <p className="text-2xl font-bold text-primary">{value}</p>
              <p className="text-xs text-muted">{label}</p>
            </div>
          )
        )}
      </div>

      {brief ? (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium">{brief.fileName}</p>
            <div className="flex gap-2">
              <Badge variant="secondary">{brief.wordCount.toLocaleString()} words</Badge>
              <Badge variant="outline">{brief.extractionMethod}</Badge>
            </div>
          </div>
          {brief.analysisSummary && (
            <p className="text-sm text-muted">{brief.analysisSummary}</p>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              clearArchitectBrief(useCase.id);
              toast({ title: "Document removed" });
            }}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Remove document
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.txt,.md"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
          <Button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {uploading ? "Analyzing…" : "Upload architect brief"}
          </Button>
        </div>
      )}

      <details className="text-sm">
        <summary className="cursor-pointer text-muted hover:text-foreground">
          Hugging Face document models evaluated (3 options)
        </summary>
        <ul className="mt-3 space-y-3">
          {DOCUMENT_MODEL_OPTIONS.map((model) => (
            <li
              key={model.id}
              className={`rounded-lg border p-3 ${
                model.id === CHOSEN_DOCUMENT_MODEL.id
                  ? "border-primary/50 bg-primary/5"
                  : "border-border/20"
              }`}
            >
              <p className="font-medium">
                {model.name}
                {model.id === CHOSEN_DOCUMENT_MODEL.id && (
                  <Badge className="ml-2" variant="default">Selected</Badge>
                )}
              </p>
              <p className="text-xs text-muted">{model.id} · {model.parameters} · {model.license}</p>
              <p className="text-xs mt-1">{model.strength}</p>
              <p className="text-xs text-muted mt-1">{model.tradeoff}</p>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
