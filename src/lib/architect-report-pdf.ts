import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { ArchitectAssessment } from "@/lib/architect-engine";
import type { UseCase, ArchitectOverrides } from "@/types";
import { ARCHITECT_FIELD_META } from "@/lib/architect-field-meta";
import { isFieldOverridden } from "@/lib/apply-architect-overrides";
import { formatDate } from "@/lib/utils";

export interface ArchitectReportInput {
  useCase: UseCase;
  assessment: ArchitectAssessment;
  baseAssessment: ArchitectAssessment;
  overrides?: ArchitectOverrides;
  exportedByName: string;
}

function mark(overrides: ArchitectOverrides | undefined, key: string): string {
  return isFieldOverridden(overrides, key) ? " *" : "";
}

export function generateArchitectReportPdf(input: ArchitectReportInput): jsPDF {
  const { useCase, assessment, overrides, exportedByName } = input;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 14;
  let y = margin;

  const addTitle = (text: string, size = 14) => {
    if (y > 270) {
      doc.addPage();
      y = margin;
    }
    doc.setFontSize(size);
    doc.setFont("helvetica", "bold");
    doc.text(text, margin, y);
    y += size * 0.45 + 4;
  };

  const addBody = (text: string) => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(text, 182);
    if (y + lines.length * 5 > 285) {
      doc.addPage();
      y = margin;
    }
    doc.text(lines, margin, y);
    y += lines.length * 5 + 2;
  };

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("CGI AI Architect Assessment", margin, y);
  y += 10;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(useCase.title, margin, y);
  y += 6;
  addBody(
    `Exported ${formatDate(new Date().toISOString())} by ${exportedByName}. Fields marked * were adjusted by the architect.`
  );
  addBody(`Description: ${useCase.description}`);
  addBody(`Department: ${useCase.department} · Category: ${useCase.category} · Impact: ${useCase.impact} · Effort: ${useCase.effort}`);

  addTitle("Overall readiness");
  addBody(
    `Score: ${assessment.overallScore}%${mark(overrides, "overallScore")}. ${ARCHITECT_FIELD_META.overallScore.meaning} ${ARCHITECT_FIELD_META.overallScore.calculation}`
  );

  addTitle("Readiness dimensions");
  autoTable(doc, {
    startY: y,
    head: [["Dimension", "Score", "Meaning"]],
    body: assessment.dimensions.map((d) => [
      d.title,
      `${d.score}%${mark(overrides, `dimension.${d.key}.score`)}`,
      ARCHITECT_FIELD_META[`dimension.${d.key}.score`]?.meaning ?? "",
    ]),
    margin: { left: margin, right: margin },
    styles: { fontSize: 9 },
    headStyles: { fillColor: [227, 25, 55] },
  });
  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  addTitle("Effort consensus");
  addBody(
    `Timeline: ${assessment.consensus.timelineMin}–${assessment.consensus.timelineMax} weeks${mark(overrides, "consensus.timelineMin")}. Confidence: ${assessment.consensus.confidence}%${mark(overrides, "consensus.confidence")}.`
  );

  addTitle("Architecture");
  addBody(
    `${assessment.architecture.pattern}${mark(overrides, "architecture.pattern")} (${assessment.architecture.confidence}% confidence). ${assessment.architecture.rationale}`
  );
  addBody(`Technologies: ${assessment.architecture.technologies.join(", ")}`);

  addTitle("Delivery team");
  autoTable(doc, {
    startY: y,
    head: [["Role", "Days"]],
    body: [
      ...assessment.deliveryTeam.map((r) => [
        r.role,
        `${r.days}${mark(overrides, `delivery.${r.role}.days`)}`,
      ]),
      ["Total", `${assessment.totalTeamDays}${mark(overrides, "totalTeamDays")}`],
    ],
    margin: { left: margin, right: margin },
    styles: { fontSize: 9 },
    headStyles: { fillColor: [227, 25, 55] },
  });
  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  addTitle("Architect questions");
  assessment.architectQuestions.forEach((q, i) => {
    addBody(`${i + 1}. ${q}${mark(overrides, `question.${i}`)}`);
  });

  if (overrides?.fields && Object.keys(overrides.fields).length > 0) {
    addTitle("Architect adjustments");
    Object.entries(overrides.fields).forEach(([key, entry]) => {
      const note = entry.architectNote ? ` Note: ${entry.architectNote}` : "";
      addBody(`${key}: ${String(entry.value)}.${note}`);
    });
  }

  return doc;
}

export function downloadArchitectReportPdf(input: ArchitectReportInput, fileName?: string): void {
  const doc = generateArchitectReportPdf(input);
  const safeName =
    fileName ??
    `architect-assessment-${input.useCase.title.replace(/[^a-z0-9]+/gi, "-").slice(0, 40)}.pdf`;
  doc.save(safeName);
}

export function architectReportPdfBase64(input: ArchitectReportInput): string {
  const doc = generateArchitectReportPdf(input);
  return doc.output("datauristring").split(",")[1] ?? "";
}
