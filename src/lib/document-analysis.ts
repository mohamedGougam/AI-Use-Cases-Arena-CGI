import mammoth from "mammoth";
import { CHOSEN_DOCUMENT_MODEL, HF_TEXT_ANALYSIS_MODEL } from "@/lib/document-models";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const SUPPORTED_EXTENSIONS = [".txt", ".md", ".pdf", ".docx"] as const;

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function extensionOf(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot >= 0 ? fileName.slice(dot).toLowerCase() : "";
}

export function isSupportedDocument(fileName: string): boolean {
  return SUPPORTED_EXTENSIONS.includes(extensionOf(fileName) as (typeof SUPPORTED_EXTENSIONS)[number]);
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text ?? "";
  } finally {
    await parser.destroy();
  }
}

async function extractDocxText(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value ?? "";
}

export async function extractTextFromBuffer(
  buffer: Buffer,
  fileName: string
): Promise<{ text: string; method: "local" }> {
  const ext = extensionOf(fileName);

  if (ext === ".txt" || ext === ".md") {
    return { text: buffer.toString("utf-8"), method: "local" };
  }
  if (ext === ".pdf") {
    return { text: await extractPdfText(buffer), method: "local" };
  }
  if (ext === ".docx") {
    return { text: await extractDocxText(buffer), method: "local" };
  }

  throw new Error(`Unsupported file type. Use ${SUPPORTED_EXTENSIONS.join(", ")}.`);
}

async function optionalHfSummary(text: string, apiKey: string): Promise<string | undefined> {
  if (!text.trim()) return undefined;

  try {
    const { HfInference } = await import("@huggingface/inference");
    const hf = new HfInference(apiKey);
    const input = text.slice(0, 3500);
    const result = await hf.summarization({
      model: HF_TEXT_ANALYSIS_MODEL,
      inputs: input,
      parameters: { max_length: 180, min_length: 40 },
    });
    const summary = typeof result === "string" ? result : result.summary_text;
    return summary?.trim() || undefined;
  } catch {
    return undefined;
  }
}

export interface DocumentAnalysisResult {
  extractedText: string;
  wordCount: number;
  charCount: number;
  fileName: string;
  mimeType: string;
  modelId: string;
  modelName: string;
  extractionMethod: "local" | "hf-enhanced";
  analysisSummary?: string;
}

export async function analyzeUploadedDocument(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<DocumentAnalysisResult> {
  if (buffer.byteLength > MAX_FILE_BYTES) {
    throw new Error("File exceeds 10 MB limit.");
  }
  if (!isSupportedDocument(fileName)) {
    throw new Error(`Unsupported file type. Use ${SUPPORTED_EXTENSIONS.join(", ")}.`);
  }

  const { text } = await extractTextFromBuffer(buffer, fileName);
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) {
    throw new Error("No readable text found in the document.");
  }

  const apiKey = process.env.HUGGINGFACE_API_KEY?.trim();
  const analysisSummary = apiKey ? await optionalHfSummary(normalized, apiKey) : undefined;

  return {
    extractedText: normalized,
    wordCount: countWords(normalized),
    charCount: normalized.length,
    fileName,
    mimeType,
    modelId: CHOSEN_DOCUMENT_MODEL.id,
    modelName: CHOSEN_DOCUMENT_MODEL.name,
    extractionMethod: analysisSummary ? "hf-enhanced" : "local",
    analysisSummary,
  };
}
