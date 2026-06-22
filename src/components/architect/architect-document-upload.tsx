"use client";

import { useRef, useState } from "react";
import { FileText, Loader2, Trash2, Upload } from "lucide-react";
import type { UseCase } from "@/types";
import type { ArchitectDocumentBrief } from "@/types";
import { useApp } from "@/context/app-context";
import { ContentRichnessPanel } from "@/components/architect/content-richness-panel";
import type { AiContentRichness } from "@/lib/content-richness";
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
  contentRichness?: AiContentRichness | null;
}

export function ArchitectDocumentUpload({
  useCase,
  wordCounts,
  contentRichness,
}: ArchitectDocumentUploadProps) {
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
      <div>
        <h3 className="font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Business submission &amp; architect brief
        </h3>
        <p className="text-sm text-muted mt-1">
          Depth analysis across all business fields. Upload an optional detailed brief (PDF, DOCX, TXT, MD) to enrich the assessment.
        </p>
      </div>

      <ContentRichnessPanel
        useCase={useCase}
        wordCounts={{
          titleWords: wordCounts.titleWords,
          descriptionWords: wordCounts.descriptionWords,
          documentWords: wordCounts.documentWords,
        }}
        aiRichness={contentRichness}
      />

      {brief ? (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium">{brief.fileName}</p>
            <Badge variant="secondary">{brief.wordCount.toLocaleString()} words</Badge>
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
    </section>
  );
}
