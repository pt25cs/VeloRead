import {
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE,
  PARAGRAPH_SENTINEL,
  WordArrayList,
} from "../types";

export interface ParseResult {
  success: true;
  wordList: WordArrayList;
}

export interface ParseError {
  success: false;
  error: string;
}

export type ParseOutcome = ParseResult | ParseError;

/**
 * Validates file extension against allowed set.
 * @returns error message or null if valid.
 */
export function validateFileExtension(fileName: string): string | null {
  const lowerName = fileName.toLowerCase();
  const isValid = ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
  if (isValid) {
    return null;
  }
  return "Unsupported format. Please upload a .txt, .md, or .rtf file.";
}

/**
 * Validates file size does not exceed 10 MB.
 * @returns error message or null if valid.
 */
export function validateFileSize(fileSize: number): string | null {
  if (fileSize <= MAX_FILE_SIZE) {
    return null;
  }
  return "File too large. Maximum size is 10 MB.";
}

/**
 * Reads a File object as text using the FileReader API.
 */
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.readAsText(file);
  });
}

/**
 * Orchestrates file validation + parsing.
 * Reads File via FileReader, validates, then parses.
 */
export async function processFile(file: File): Promise<ParseOutcome> {
  const extensionError = validateFileExtension(file.name);
  if (extensionError) {
    return { success: false, error: extensionError };
  }

  const sizeError = validateFileSize(file.size);
  if (sizeError) {
    return { success: false, error: sizeError };
  }

  let content: string;
  try {
    content = await readFileAsText(file);
  } catch {
    return { success: false, error: "Could not read file. Please try again." };
  }

  return parseText(content);
}

/**
 * Parses raw text content into a WordArrayList.
 * - Splits on whitespace runs
 * - Inserts exactly one PARAGRAPH_SENTINEL per group of consecutive blank lines
 * - Preserves original word order
 * - Returns ParseError if no readable words are found
 */
export function parseText(content: string): ParseOutcome {
  // Check if content is whitespace-only
  if (/^\s*$/.test(content)) {
    return { success: false, error: "This file contains no readable content." };
  }

  // Split by paragraph breaks: two or more consecutive newlines (with optional whitespace between)
  const paragraphs = content.split(/\n\s*\n/);

  const wordList: WordArrayList = [];
  let isFirstParagraph = true;

  for (const paragraph of paragraphs) {
    // Split the paragraph by whitespace runs and filter out empty tokens
    const words = paragraph.split(/\s+/).filter((w) => w.length > 0);

    // Skip empty paragraphs (leading/trailing blank lines produce these)
    if (words.length === 0) {
      continue;
    }

    // Insert sentinel between paragraphs (not before the first one)
    if (!isFirstParagraph) {
      wordList.push(PARAGRAPH_SENTINEL);
    }

    wordList.push(...words);
    isFirstParagraph = false;
  }

  return { success: true, wordList };
}
