import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { buildParagraphs } from "./document-tracker";
import { PARAGRAPH_SENTINEL, WordArrayList } from "../types";

/**
 * Property 19: buildParagraphs Preserves All Words With Correct Indices
 *
 * For any Word_ArrayList, buildParagraphs SHALL return paragraph groups where
 * the concatenation of all words across all paragraphs (in order) equals the
 * non-sentinel entries of the Word_ArrayList, and each word's globalIndex
 * corresponds to its actual index in the original Word_ArrayList.
 *
 * **Validates: Requirements 8.1**
 */
describe("Feature: velo-read-speed-reader, Property 19: buildParagraphs Preserves All Words With Correct Indices", () => {
  // Generator: create random WordArrayLists with a mix of strings and PARAGRAPH_SENTINEL values
  const wordArrayListArb: fc.Arbitrary<WordArrayList> = fc.array(
    fc.oneof(
      { weight: 3, arbitrary: fc.string({ minLength: 1 }).map((s) => s.trim() || "word") },
      { weight: 1, arbitrary: fc.constant(PARAGRAPH_SENTINEL as typeof PARAGRAPH_SENTINEL) }
    ),
    { minLength: 0, maxLength: 50 }
  );

  it("flattened paragraphs equal all non-sentinel entries in order", () => {
    fc.assert(
      fc.property(wordArrayListArb, (wordList) => {
        const paragraphs = buildParagraphs(wordList);

        // Flatten all paragraphs' words into a single array
        const flattenedWords = paragraphs.flatMap((paragraph) =>
          paragraph.map((entry) => entry.word)
        );

        // Get expected: all non-sentinel entries from the original WordArrayList in order
        const expectedWords = wordList.filter(
          (item): item is string => item !== PARAGRAPH_SENTINEL
        );

        expect(flattenedWords).toEqual(expectedWords);
      }),
      { numRuns: 100 }
    );
  });

  it("each word's globalIndex corresponds to its actual index in the original WordArrayList", () => {
    fc.assert(
      fc.property(wordArrayListArb, (wordList) => {
        const paragraphs = buildParagraphs(wordList);

        // Verify each word's globalIndex points to the correct position in the original list
        for (const paragraph of paragraphs) {
          for (const entry of paragraph) {
            expect(wordList[entry.globalIndex]).toBe(entry.word);
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  it("no sentinel appears in any paragraph's word entries", () => {
    fc.assert(
      fc.property(wordArrayListArb, (wordList) => {
        const paragraphs = buildParagraphs(wordList);

        for (const paragraph of paragraphs) {
          for (const entry of paragraph) {
            expect(entry.word).not.toBe(PARAGRAPH_SENTINEL);
            expect(typeof entry.word).toBe("string");
          }
        }
      }),
      { numRuns: 100 }
    );
  });
});
