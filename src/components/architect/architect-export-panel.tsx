"use client";

import { useState } from "react";
import { Download, Mail, Loader2, FileText } from "lucide-react";
import type { UseCase } from "@/types";
import type { ArchitectAssessment } from "@/lib/architect-engine";
import { downloadArchitectReportPdf } from "@/lib/architect-report-pdf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface ArchitectExportPanelProps {
  useCase: UseCase;
  assessment: ArchitectAssessment;
  baseAssessment: ArchitectAssessment;
  exportedByName: string;
}

export function ArchitectExportPanel({
  useCase,
  assessment,
  baseAssessment,
  exportedByName,
}: ArchitectExportPanelProps) {
  const [email, setEmail] = useState(useCase.submitterEmail || "");
  const [sending, setSending] = useState(false);

  const reportInput = {
    useCase,
    assessment,
    baseAssessment,
    overrides: useCase.architectOverrides,
    exportedByName,
  };

  const handleDownload = () => {
    downloadArchitectReportPdf(reportInput);
    toast({ title: "PDF downloaded", description: "Architect assessment saved to your device." });
  };

  const handleEmail = async () => {
    if (!email.trim()) {
      toast({ title: "Enter a recipient email", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/architect-report/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email.trim(),
          useCaseId: useCase.id,
          useCaseTitle: useCase.title,
          report: reportInput,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Send failed");

      if (data.fallback) {
        downloadArchitectReportPdf(reportInput);
        const subject = encodeURIComponent(`AI Architect Assessment: ${useCase.title}`);
        const body = encodeURIComponent(
          `Please find the CGI AI Architect assessment for "${useCase.title}".\n\nA PDF has been downloaded to your browser — attach it to this email, or configure RESEND_API_KEY on the server for automatic delivery.\n\nExported by ${exportedByName}.`
        );
        window.location.href = `mailto:${email.trim()}?subject=${subject}&body=${body}`;
        toast({
          title: "PDF downloaded + email draft opened",
          description: data.message,
        });
      } else {
        toast({ title: "Report sent", description: `PDF emailed to ${email.trim()}.` });
      }
    } catch (err) {
      toast({
        title: "Could not send email",
        description: err instanceof Error ? err.message : "Try downloading the PDF instead.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="rounded-xl border border-border/20 bg-card/60 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Export assessment</h3>
      </div>
      <p className="text-sm text-muted">
        Download a PDF of the current assessment (including architect adjustments) or email it to stakeholders.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="default" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end max-w-xl">
        <div className="space-y-2">
          <Label htmlFor="report-email">Send PDF by email</Label>
          <Input
            id="report-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <Button type="button" variant="outline" disabled={sending} onClick={() => void handleEmail()}>
          {sending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Mail className="mr-2 h-4 w-4" />
          )}
          {sending ? "Sending…" : "Send PDF"}
        </Button>
      </div>
    </section>
  );
}
