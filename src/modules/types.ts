export const PARAGRAPH_SENTINEL = Symbol("PARAGRAPH_SENTINEL");
export type ParagraphSentinel = typeof PARAGRAPH_SENTINEL;
export type WordEntry = string;
export type WordArrayItem = WordEntry | ParagraphSentinel;
export type WordArrayList = WordArrayItem[];

export const ALLOWED_EXTENSIONS = [".txt", ".md", ".rtf"] as const;
export const MAX_FILE_SIZE = 10_485_760; // 10 MB in bytes

export const VALIDATION_BOUNDARIES = {
  displayRate: { min: 1, max: 1500, default: 250 },
  fontSize: { min: 8, max: 72, default: 36 },
  chunkSize: { min: 1, max: 5, default: 1 },
} as const;
