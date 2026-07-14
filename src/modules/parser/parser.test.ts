import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { validateFileExtension, validateFileSize, parseText } from "./parser";
import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE, PARAGRAPH_SENTINEL } from "../types";

describe("Feature: velo-read-speed-reader, Property 1: File Extension Validation Partitions Correctly", () => {
  /**
   * Validates: Requirements 1.1, 1.3
   *
   * For any file name string, validateFileExtension SHALL return null (valid)
   * if and only if the file name ends with .txt, .md, or .rtf (case-insensitive),
   * and SHALL return an error message for all other extensions.
   */

  it("returns null for any file name ending with a valid extension (case-insensitive)", () => {
    const validExtensionArb = fc.oneof(
      ...ALLOWED_EXTENSIONS.map((ext) =>
        fc.tuple(
          fc.stringOf(fc.char().filter((c) => c !== "." && c !== "/" && c !== "\\"), { minLength: 1, maxLength: 20 }),
          fc.constant(ext)
        ).chain(([baseName, ext]) => {
          // Randomly apply case variations to the extension
          return fc.mixedCase(fc.constant(ext)).map((casedExt) => baseName + casedExt);
        })
      )
    );

    fc.assert(
      fc.property(validExtensionArb, (fileName) => {
        const result = validateFileExtension(fileName);
        expect(result).toBeNull();
      }),
      { numRuns: 100 }
    );
  });

  it("returns an error message for any file name NOT ending with a valid extension", () => {
    const invalidExtensions = [".pdf", ".doc", ".html", ".js", ".ts", ".json", ".csv", ".xml", ".png", ".jpg", ""];

    const invalidFileNameArb = fc.oneof(
      // File names with known invalid extensions
      fc.tuple(
        fc.stringOf(fc.char().filter((c) => c !== "/" && c !== "\\"), { minLength: 1, maxLength: 20 }),
        fc.constantFrom(...invalidExtensions)
      ).map(([baseName, ext]) => baseName + ext),
      // File names that are random strings not ending in valid extensions
      fc.string({ minLength: 1, maxLength: 30 }).filter((name) => {
        const lower = name.toLowerCase();
        return !ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
      })
    );

    fc.assert(
      fc.property(invalidFileNameArb, (fileName) => {
        const result = validateFileExtension(fileName);
        expect(result).not.toBeNull();
        expect(typeof result).toBe("string");
      }),
      { numRuns: 100 }
    );
  });
});

describe("Feature: velo-read-speed-reader, Property 2: File Size Validation Boundary", () => {
  /**
   * Validates: Requirements 1.4
   *
   * For any non-negative integer file size, validateFileSize SHALL return null (valid)
   * if and only if the size is less than or equal to 10,485,760 bytes,
   * and SHALL return an error message otherwise.
   */

  it("returns null for any file size <= MAX_FILE_SIZE", () => {
    const validSizeArb = fc.nat(MAX_FILE_SIZE);

    fc.assert(
      fc.property(validSizeArb, (fileSize) => {
        const result = validateFileSize(fileSize);
        expect(result).toBeNull();
      }),
      { numRuns: 100 }
    );
  });

  it("returns an error message for any file size > MAX_FILE_SIZE", () => {
    const invalidSizeArb = fc.integer({ min: MAX_FILE_SIZE + 1, max: Number.MAX_SAFE_INTEGER });

    fc.assert(
      fc.property(invalidSizeArb, (fileSize) => {
        const result = validateFileSize(fileSize);
        expect(result).not.toBeNull();
        expect(typeof result).toBe("string");
      }),
      { numRuns: 100 }
    );
  });

  it("validates the exact boundary: MAX_FILE_SIZE is valid, MAX_FILE_SIZE + 1 is invalid", () => {
    expect(validateFileSize(MAX_FILE_SIZE)).toBeNull();
    expect(validateFileSize(MAX_FILE_SIZE + 1)).not.toBeNull();
  });
});

describe("Feature: velo-read-speed-reader, Property 3: Whitespace-Only Content Rejection", () => {
  /**
   * Validates: Requirements 1.2, 2.5
   *
   * For any string composed entirely of whitespace characters (spaces, tabs,
   * newlines, carriage returns), parseText SHALL return a ParseError indicating
   * no readable content.
   */

  it("returns ParseError for any whitespace-only string", () => {
    const whitespaceOnlyArb = fc.stringOf(
      fc.constantFrom(" ", "\t", "\n", "\r"),
      { minLength: 1, maxLength: 200 }
    );

    fc.assert(
      fc.property(whitespaceOnlyArb, (input) => {
        const result = parseText(input);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(typeof result.error).toBe("string");
          expect(result.error.length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 }
    );
  });

  it("returns ParseError for the empty string", () => {
    const result = parseText("");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(typeof result.error).toBe("string");
    }
  });
});

describe("Feature: velo-read-speed-reader, Property 4: Parse Round-Trip Reconstruction", () => {
  /**
   * Validates: Requirements 2.1, 2.2, 2.3, 2.4
   *
   * For any string containing at least one non-whitespace character, parsing
   * with parseText and then reconstructing (joining non-sentinel entries with
   * single spaces, replacing each sentinel with double-newline) SHALL produce
   * text equal to the original after normalizing all whitespace runs to single
   * spaces and all paragraph breaks (blank-line groups) to a single double-newline.
   */

  it("reconstructed output equals normalized original for any non-whitespace-only input", () => {
    // Generate strings that contain at least one non-whitespace character
    const nonWhitespaceOnlyArb = fc.string({ minLength: 1, maxLength: 300 }).filter(
      (s) => /\S/.test(s)
    );

    /**
     * Normalizes text by:
     * 1. Trimming leading/trailing whitespace
     * 2. Collapsing blank-line groups (paragraph breaks) to "\n\n"
     * 3. Collapsing remaining whitespace runs within paragraphs to single spaces
     */
    function normalize(text: string): string {
      // Trim the entire string
      let normalized = text.trim();
      // Split by paragraph breaks (two or more newlines with optional whitespace)
      const paragraphs = normalized.split(/\n\s*\n/);
      // For each paragraph, collapse whitespace runs to single space and trim
      const cleanParagraphs = paragraphs
        .map((p) => p.replace(/\s+/g, " ").trim())
        .filter((p) => p.length > 0);
      // Join paragraphs back with double-newline
      return cleanParagraphs.join("\n\n");
    }

    /**
     * Reconstructs text from a parsed WordArrayList:
     * - Non-sentinel items joined with " "
     * - Sentinels replaced with "\n\n"
     */
    function reconstruct(wordList: (string | typeof PARAGRAPH_SENTINEL)[]): string {
      const parts: string[] = [];
      let currentParagraph: string[] = [];

      for (const item of wordList) {
        if (item === PARAGRAPH_SENTINEL) {
          if (currentParagraph.length > 0) {
            parts.push(currentParagraph.join(" "));
            currentParagraph = [];
          }
        } else {
          currentParagraph.push(item as string);
        }
      }
      if (currentParagraph.length > 0) {
        parts.push(currentParagraph.join(" "));
      }

      return parts.join("\n\n");
    }

    fc.assert(
      fc.property(nonWhitespaceOnlyArb, (input) => {
        const result = parseText(input);
        expect(result.success).toBe(true);
        if (result.success) {
          const reconstructed = reconstruct(result.wordList);
          const normalized = normalize(input);
          expect(reconstructed).toBe(normalized);
        }
      }),
      { numRuns: 100 }
    );
  });
});

describe("Feature: velo-read-speed-reader, Property 5: No Consecutive Sentinels in Parse Output", () => {
  /**
   * Validates: Requirements 2.2
   *
   * For any input text, the resulting Word_ArrayList from parseText SHALL never
   * contain two or more consecutive Paragraph_Sentinel values adjacent to each other.
   */

  it("never produces consecutive sentinels for any arbitrary input", () => {
    const arbitraryTextArb = fc.string({ minLength: 0, maxLength: 300 });

    fc.assert(
      fc.property(arbitraryTextArb, (input) => {
        const result = parseText(input);
        if (result.success) {
          for (let i = 0; i < result.wordList.length - 1; i++) {
            const current = result.wordList[i];
            const next = result.wordList[i + 1];
            expect(
              current === PARAGRAPH_SENTINEL && next === PARAGRAPH_SENTINEL
            ).toBe(false);
          }
        }
        // If not success, no wordList to check — property trivially holds
      }),
      { numRuns: 100 }
    );
  });

  it("never produces consecutive sentinels for inputs with multiple blank lines", () => {
    // Specifically generate text with varied blank-line groups
    const textWithBlankLinesArb = fc.array(
      fc.oneof(
        fc.stringOf(fc.char().filter((c) => c !== "\n" && c !== "\r"), { minLength: 1, maxLength: 20 }),
        fc.stringOf(fc.constantFrom("\n", "\r\n", "\n\n", "\n\n\n", "\n  \n", "\n\t\n"), { minLength: 1, maxLength: 3 })
      ),
      { minLength: 1, maxLength: 10 }
    ).map((parts) => parts.join(""));

    fc.assert(
      fc.property(textWithBlankLinesArb, (input) => {
        const result = parseText(input);
        if (result.success) {
          for (let i = 0; i < result.wordList.length - 1; i++) {
            const current = result.wordList[i];
            const next = result.wordList[i + 1];
            expect(
              current === PARAGRAPH_SENTINEL && next === PARAGRAPH_SENTINEL
            ).toBe(false);
          }
        }
      }),
      { numRuns: 100 }
    );
  });
});
