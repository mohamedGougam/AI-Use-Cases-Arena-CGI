import { NextResponse } from "next/server";
import { analyzeUploadedDocument } from "@/lib/document-analysis";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file upload" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await analyzeUploadedDocument(buffer, file.name, file.type || "application/octet-stream");
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Document analysis failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
