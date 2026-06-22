import { NextResponse } from "next/server";
import { Resend } from "resend";
import { generateArchitectReportPdf } from "@/lib/architect-report-pdf";
import type { ArchitectReportInput } from "@/lib/architect-report-pdf";

export const runtime = "nodejs";
export const maxDuration = 60;

function isReportInput(value: unknown): value is ArchitectReportInput {
  if (!value || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return Boolean(o.useCase && o.assessment && o.baseAssessment && typeof o.exportedByName === "string");
}

export async function POST(request: Request) {
  let body: { to?: string; useCaseTitle?: string; report?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const to = body.to?.trim();
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json({ error: "Valid recipient email required" }, { status: 400 });
  }
  if (!isReportInput(body.report)) {
    return NextResponse.json({ error: "Invalid report payload" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim() || "AI Use Cases Arena <onboarding@resend.dev>";

  if (!apiKey) {
    return NextResponse.json({
      fallback: true,
      message:
        "Server email is not configured. PDF downloaded locally — attach it manually, or set RESEND_API_KEY and RESEND_FROM_EMAIL.",
    });
  }

  const doc = generateArchitectReportPdf(body.report);
  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  const title = body.useCaseTitle ?? body.report.useCase.title;
  const safeFile = `architect-assessment-${title.replace(/[^a-z0-9]+/gi, "-").slice(0, 50)}.pdf`;

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from,
      to,
      subject: `CGI AI Architect Assessment: ${title}`,
      html: `<p>Please find attached the AI Architect assessment for <strong>${title}</strong>.</p><p>Exported by ${body.report.exportedByName}.</p>`,
      attachments: [
        {
          filename: safeFile,
          content: pdfBuffer,
        },
      ],
    });

    return NextResponse.json({ fallback: false, message: "Email sent." });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Email delivery failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
