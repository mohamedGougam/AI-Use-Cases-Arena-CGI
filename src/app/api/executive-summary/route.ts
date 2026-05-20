import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { ExecutiveSummaryPayload } from "@/lib/executive-summary-payload";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are a senior advisor at CGI writing a concise executive summary for client stakeholders and CGI delivery leads.

Rules:
- Write in clear professional English; tone is confident and practical, not hype.
- Ground every claim in the JSON data provided; do not invent use cases, numbers, or departments.
- If the portfolio is very small (e.g. one idea), say so and focus on early signals and next steps.
- Structure with short titled sections (e.g. Portfolio overview, Highlights, Risks or gaps, Recommended next steps).
- Do not mention missing data as "JSON" or "payload". Do not ask for more data.
- Do not include email addresses or personal identifiers (there should be none in the input).
- Keep total length roughly under 450 words unless the dataset is large enough to justify more.`;

function isPayload(value: unknown): value is ExecutiveSummaryPayload {
  if (!value || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  if (typeof o.programmeName !== "string") return false;
  if (!o.totals || typeof o.totals !== "object") return false;
  const t = o.totals as Record<string, unknown>;
  if (typeof t.useCaseCount !== "number" || typeof t.voteCount !== "number") return false;
  if (!Array.isArray(o.departments)) return false;
  if (!Array.isArray(o.quickWinTitles)) return false;
  if (!Array.isArray(o.strategicBetTitles)) return false;
  if (!Array.isArray(o.useCases)) return false;
  return true;
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { summary: null as string | null, fallback: true },
      { status: 200 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isPayload(body)) {
    return NextResponse.json({ error: "Invalid summary payload shape" }, { status: 400 });
  }

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  const baseURL = process.env.OPENAI_BASE_URL?.trim();

  const client = new OpenAI({
    apiKey,
    ...(baseURL ? { baseURL } : {}),
  });

  try {
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.35,
      max_tokens: 1400,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Programme: ${body.programmeName}\n\nAnonymized arena metrics and use case summaries (no personal data):\n${JSON.stringify(body, null, 2)}`,
        },
      ],
    });

    const summary = completion.choices[0]?.message?.content?.trim();
    if (!summary) {
      return NextResponse.json(
        { error: "The model returned an empty summary." },
        { status: 502 }
      );
    }

    return NextResponse.json({ summary, fallback: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : "OpenAI request failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
