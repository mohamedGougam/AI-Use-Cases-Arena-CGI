/** Open-source document intelligence models evaluated on Hugging Face (OmniDocBench 2026). */
export const DOCUMENT_MODEL_OPTIONS = [
  {
    id: "opendatalab/MinerU2.5-Pro-2604-1.2B",
    name: "MinerU 2.5 Pro",
    parameters: "1.2B",
    license: "AGPL-3.0 (MinerU ecosystem)",
    strength: "Highest parsing accuracy on OmniDocBench v1.6 (~95.7). Best for PDF→Markdown, tables, formulas, and telecom workshop briefs.",
    tradeoff: "Full model needs GPU/Python MinerU runtime; we mirror its pipeline with local extraction + HF text analysis.",
  },
  {
    id: "zai-org/GLM-OCR",
    name: "GLM-OCR",
    parameters: "0.9B",
    license: "MIT (model)",
    strength: "Very fast (~1.86 pages/sec), strong layout OCR, low cost at scale.",
    tradeoff: "Slightly below MinerU on complex multi-page tables; less chart parsing.",
  },
  {
    id: "baidu/Qianfan-OCR",
    name: "Qianfan-OCR",
    parameters: "4B",
    license: "Apache 2.0",
    strength: "End-to-end document QA, KIE, 192 languages, Layout-as-Thought.",
    tradeoff: "Larger footprint; slower than sub-1B specialists for bulk PDF conversion.",
  },
] as const;

/** Selected reference model for the arena document pipeline. */
export const CHOSEN_DOCUMENT_MODEL = DOCUMENT_MODEL_OPTIONS[0];

/** HF Inference model for optional narrative analysis of extracted plain text. */
export const HF_TEXT_ANALYSIS_MODEL =
  process.env.HF_TEXT_ANALYSIS_MODEL ?? "facebook/bart-large-cnn";
