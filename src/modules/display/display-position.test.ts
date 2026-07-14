import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  getDisplayWords,
  computeNextPosition,
  skipConsecutiveSentinels,
} from "./display-utils";
import { PARAGRAPH_SENTINEL, WordArrayList } from "../types";

/**
 * Generator for WordArrayList items: either a random non-empty string or PARAGRAPH_SENTINEL.
 */
const wordArrayItemArb = fc.oneof(
  { weight: 3, arbitrary: fc.string({ minLength: 1 }).map((s) => s.trim() || "word") },
  { weight: 1, arbitrary: fc.constant(PARAGRAPH_SENTINEL as typeof PARAGRAPH_SENTINEL) }
);

/**
 * Generator for non-empty WordArrayLists containing a mix of strings and sentinels.
 */
const wordArrayListArb = fc.array(wordArrayItemArb, { minLength: 1, maxLength: 50 });

/**
 * Generator for WordArrayLists that contain at least one string (non-sentinel) entry.
 */
const wordArrayListWithWordsArb = wordArrayListArb.filter((list) =>
  list.some((item) => typeof item === "string")
);

describe("Feature: velo-read-speed-reader, Property 10: Display Words Never Contain Sentinels", () => {
  /**
   * **Validates: Requirements 7.4**
   *
   * For any Word_ArrayList and any valid positionIndex, `getDisplayWords`
   * SHALL return an array containing only strings (never a Paragraph_Sentinel value).
   */

  it("getDisplayWords returns only strings, never sentinels", () => {
    fc.assert(
      fc.property(
        wordArrayListArb,
        fc.integer({ min: 1, max: 5 }),
        (wordList, chunkSize) => {
          // Test for every valid positionIndex in the list
          for (let positionIndex = 0; positionIndex < wordList.length; positionIndex++) {
            const result = getDisplayWords(wordList, positionIndex, chunkSize);
            for (const item of result) {
              expect(typeof item).toBe("string");
              expect(item).not.toBe(PARAGRAPH_SENTINEL);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("getDisplayWords with random valid positionIndex returns only strings", () => {
    fc.assert(
      fc.property(
        wordArrayListArb.chain((list) =>
          fc.tuple(
            fc.constant(list),
            fc.integer({ min: 0, max: list.length - 1 }),
            fc.integer({ min: 1, max: 5 })
          )
        ),
        ([wordList, positionIndex, chunkSize]) => {
          const result = getDisplayWords(wordList, positionIndex, chunkSize);
          for (const item of result) {
            expect(typeof item).toBe("string");
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe("Feature: velo-read-speed-reader, Property 11: End-of-List Produces Completion", () => {
  /**
   * **Validates: Requirements 3.4**
   *
   * For any Word_ArrayList of length N and any positionIndex where
   * (N - positionIndex) is less than the chunkSize, `computeNextPosition`
   * SHALL indicate that the end has been reached (nextIndex >= wordList.length).
   */

  it("computeNextPosition returns nextIndex >= length when remaining items < chunkSize", () => {
    fc.assert(
      fc.property(
        wordArrayListWithWordsArb.chain((list) => {
          // Generate chunkSize and a positionIndex near the end so remaining < chunkSize
          return fc.tuple(
            fc.constant(list),
            fc.integer({ min: 1, max: 5 })
          ).chain(([list, chunkSize]) => {
            // positionIndex must be such that (N - positionIndex) < chunkSize
            // i.e., positionIndex > N - chunkSize
            const minPos = Math.max(0, list.length - chunkSize + 1);
            if (minPos >= list.length) {
              // list is shorter than chunkSize, any positionIndex works
              return fc.tuple(
                fc.constant(list),
                fc.constant(0),
                fc.constant(chunkSize)
              );
            }
            return fc.tuple(
              fc.constant(list),
              fc.integer({ min: minPos, max: list.length - 1 }),
              fc.constant(chunkSize)
            );
          });
        }),
        ([wordList, positionIndex, chunkSize]) => {
          // Pre-condition: remaining items from positionIndex are fewer than chunkSize
          const remaining = wordList.length - positionIndex;
          fc.pre(remaining < chunkSize);

          // Filter out cases where a sentinel is hit before end (sentinel takes priority)
          const result = computeNextPosition(wordList, positionIndex, chunkSize);
          if (!result.hitSentinel) {
            expect(result.nextIndex).toBeGreaterThanOrEqual(wordList.length);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("computeNextPosition reaches end for word-only lists near boundary", () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1 }).map((s) => s.trim() || "word"), {
          minLength: 1,
          maxLength: 30,
        }),
        fc.integer({ min: 1, max: 5 }),
        (words, chunkSize) => {
          const wordList: WordArrayList = words;
          // Position near the end where remaining < chunkSize
          const minPos = Math.max(0, wordList.length - chunkSize + 1);
          if (minPos >= wordList.length) return; // skip trivial cases

          for (let pos = minPos; pos < wordList.length; pos++) {
            const result = computeNextPosition(wordList, pos, chunkSize);
            // No sentinels in a word-only list, so must reach end
            expect(result.nextIndex).toBeGreaterThanOrEqual(wordList.length);
            expect(result.hitSentinel).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe("Feature: velo-read-speed-reader, Property 12: Sentinel Triggers Auto-Pause", () => {
  /**
   * **Validates: Requirements 7.1**
   *
   * For any Word_ArrayList containing a Paragraph_Sentinel at index I,
   * when `computeNextPosition` would advance to index I, the result SHALL
   * have hitSentinel: true with nextIndex equal to I.
   */

  it("computeNextPosition hits sentinel when advancing reaches a sentinel index", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }).chain((chunkSize) => {
          // Generate a list where we place a sentinel at a known position
          // preceded by enough words so we can set currentIndex to reach the sentinel
          return fc.tuple(
            fc.constant(chunkSize),
            fc.array(
              fc.string({ minLength: 1 }).map((s) => s.trim() || "word"),
              { minLength: chunkSize, maxLength: 20 }
            ),
            fc.array(wordArrayItemArb, { minLength: 0, maxLength: 10 })
          );
        }),
        ([chunkSize, prefix, suffix]) => {
          // Build list: prefix words + sentinel + suffix
          const wordList: WordArrayList = [...prefix, PARAGRAPH_SENTINEL, ...suffix];
          const sentinelIndex = prefix.length;

          // Set currentIndex so that advancing by chunkSize lands on the sentinel
          // currentIndex + step = sentinelIndex where step is in [1, chunkSize]
          // So currentIndex = sentinelIndex - step for some step in [1, chunkSize]
          for (let step = 1; step <= chunkSize; step++) {
            const currentIndex = sentinelIndex - step;
            if (currentIndex < 0) continue;

            // Also ensure no sentinel between currentIndex+1 and sentinelIndex-1
            const pathClear = wordList
              .slice(currentIndex + 1, sentinelIndex)
              .every((item) => item !== PARAGRAPH_SENTINEL);
            if (!pathClear) continue;

            const result = computeNextPosition(wordList, currentIndex, chunkSize);
            expect(result.hitSentinel).toBe(true);
            expect(result.nextIndex).toBe(sentinelIndex);
            return; // Found a valid configuration, test passes
          }
          // If no valid currentIndex found, skip this case
        }
      ),
      { numRuns: 100 }
    );
  });

  it("sentinel at exact chunkSize distance triggers auto-pause", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }),
        fc.array(
          fc.string({ minLength: 1 }).map((s) => s.trim() || "word"),
          { minLength: 1, maxLength: 10 }
        ),
        (chunkSize, suffixWords) => {
          // Build a list: chunkSize words + sentinel + suffix words
          const prefix: string[] = Array.from(
            { length: chunkSize },
            (_, i) => `word${i}`
          );
          const wordList: WordArrayList = [
            ...prefix,
            PARAGRAPH_SENTINEL,
            ...suffixWords,
          ];

          // Start at index 0, advancing by chunkSize should land on the sentinel
          const result = computeNextPosition(wordList, 0, chunkSize);
          expect(result.hitSentinel).toBe(true);
          expect(result.nextIndex).toBe(chunkSize);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe("Feature: velo-read-speed-reader, Property 13: Resume From Sentinel Skips All Consecutive Sentinels", () => {
  /**
   * **Validates: Requirements 7.3, 7.5**
   *
   * For any Word_ArrayList containing a group of one or more consecutive
   * Paragraph_Sentinels starting at index I, `skipConsecutiveSentinels(wordList, I)`
   * SHALL return the index of the first non-sentinel item after the group
   * (or the length of the array if no non-sentinel follows).
   */

  it("skipConsecutiveSentinels returns first non-sentinel index after a group", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.string({ minLength: 1 }).map((s) => s.trim() || "word"),
          { minLength: 0, maxLength: 10 }
        ),
        fc.integer({ min: 1, max: 10 }),
        fc.array(wordArrayItemArb, { minLength: 0, maxLength: 10 }),
        (prefixWords, sentinelCount, suffix) => {
          // Build list: prefix words + N consecutive sentinels + suffix
          const sentinels = Array.from({ length: sentinelCount }, () => PARAGRAPH_SENTINEL);
          const wordList: WordArrayList = [...prefixWords, ...sentinels, ...suffix] as WordArrayList;
          const sentinelStartIndex = prefixWords.length;

          const result = skipConsecutiveSentinels(wordList, sentinelStartIndex);

          // Result should be the index after all consecutive sentinels
          const expectedMinIndex = sentinelStartIndex + sentinelCount;

          // The result should be >= expectedMinIndex (skipped all sentinels we placed)
          expect(result).toBeGreaterThanOrEqual(expectedMinIndex);

          // If result < wordList.length, the item at result should NOT be a sentinel
          if (result < wordList.length) {
            expect(wordList[result]).not.toBe(PARAGRAPH_SENTINEL);
          }

          // All items from sentinelStartIndex to result-1 should be sentinels
          for (let i = sentinelStartIndex; i < result; i++) {
            expect(wordList[i]).toBe(PARAGRAPH_SENTINEL);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("skipConsecutiveSentinels returns array length when no non-sentinel follows", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.string({ minLength: 1 }).map((s) => s.trim() || "word"),
          { minLength: 0, maxLength: 10 }
        ),
        fc.integer({ min: 1, max: 10 }),
        (prefixWords, sentinelCount) => {
          // Build list: prefix words + sentinels at the end (no suffix)
          const sentinels = Array.from({ length: sentinelCount }, () => PARAGRAPH_SENTINEL);
          const wordList: WordArrayList = [...prefixWords, ...sentinels] as WordArrayList;
          const sentinelStartIndex = prefixWords.length;

          const result = skipConsecutiveSentinels(wordList, sentinelStartIndex);

          // Should return array length since no non-sentinel follows
          expect(result).toBe(wordList.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});
