import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  veloRunReducer,
  VeloRunState,
  INITIAL_STATE,
  DisplayState,
} from "./display-state";
import { PARAGRAPH_SENTINEL, WordArrayList } from "../types";

// --- Generators ---

/**
 * Generates a random WordArrayList with a mix of strings and sentinels, minLength 1.
 */
function arbWordArrayList(
  constraints: { minLength?: number; maxLength?: number } = {}
): fc.Arbitrary<WordArrayList> {
  const minLen = constraints.minLength ?? 1;
  const maxLen = constraints.maxLength ?? 50;
  return fc
    .array(
      fc.oneof(
        { weight: 5, arbitrary: fc.string({ minLength: 1, maxLength: 20 }) },
        { weight: 1, arbitrary: fc.constant(PARAGRAPH_SENTINEL as typeof PARAGRAPH_SENTINEL) }
      ),
      { minLength: minLen, maxLength: maxLen }
    )
    .filter((arr) => arr.length >= minLen);
}

/**
 * Generates a random VeloRunState in a specific displayState with a loaded wordList.
 */
function arbStateWithWordList(
  displayState: DisplayState
): fc.Arbitrary<VeloRunState> {
  return arbWordArrayList({ minLength: 1 }).chain((wordList) => {
    const maxIndex = wordList.length - 1;
    return fc
      .record({
        positionIndex: fc.integer({ min: 0, max: maxIndex }),
        displayRate: fc.integer({ min: 1, max: 1500 }),
        fontSize: fc.integer({ min: 8, max: 72 }),
        displayChunkSize: fc.integer({ min: 1, max: 5 }),
      })
      .map(({ positionIndex, displayRate, fontSize, displayChunkSize }) => ({
        wordList,
        positionIndex,
        displayState,
        config: { displayRate, fontSize, displayChunkSize },
      }));
  });
}

/**
 * Generates a VeloRunState in either "running" or "paused" state with a loaded wordList.
 */
function arbRunningOrPausedState(): fc.Arbitrary<VeloRunState> {
  return fc
    .oneof(
      arbStateWithWordList("running"),
      arbStateWithWordList("paused")
    );
}

// --- Property Tests ---

describe("Property 9: Configuration Changes Preserve Position", () => {
  /**
   * Validates: Requirements 4.3, 5.3
   *
   * For any VeloRunState in "running" or "paused" state with a loaded wordList,
   * dispatching SET_DISPLAY_RATE, SET_FONT_SIZE, or SET_CHUNK_SIZE with a valid value
   * SHALL produce a new state where positionIndex is unchanged.
   */
  it("SET_DISPLAY_RATE preserves positionIndex", () => {
    fc.assert(
      fc.property(
        arbRunningOrPausedState(),
        fc.integer({ min: 1, max: 1500 }),
        (state, rate) => {
          const next = veloRunReducer(state, { type: "SET_DISPLAY_RATE", rate });
          expect(next.positionIndex).toBe(state.positionIndex);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("SET_FONT_SIZE preserves positionIndex", () => {
    fc.assert(
      fc.property(
        arbRunningOrPausedState(),
        fc.integer({ min: 8, max: 72 }),
        (state, size) => {
          const next = veloRunReducer(state, { type: "SET_FONT_SIZE", size });
          expect(next.positionIndex).toBe(state.positionIndex);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("SET_CHUNK_SIZE preserves positionIndex", () => {
    fc.assert(
      fc.property(
        arbRunningOrPausedState(),
        fc.integer({ min: 1, max: 5 }),
        (state, size) => {
          const next = veloRunReducer(state, { type: "SET_CHUNK_SIZE", size });
          expect(next.positionIndex).toBe(state.positionIndex);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe("Property 14: Valid Position Reset Updates Index and Preserves WordList", () => {
  /**
   * Validates: Requirements 8.4, 8.6, 9.2
   *
   * For any VeloRunState with a loaded wordList of length N,
   * dispatching SET_POSITION with an index in range [0, N-1] SHALL produce a state
   * where positionIndex equals the target index, wordList is referentially identical,
   * and displayState is "paused".
   */
  it("SET_POSITION with valid index updates position, preserves wordList, sets paused", () => {
    fc.assert(
      fc.property(
        fc.oneof(
          arbStateWithWordList("running"),
          arbStateWithWordList("paused"),
          arbStateWithWordList("auto-paused"),
          arbStateWithWordList("idle"),
          arbStateWithWordList("completed")
        ),
        (state) => {
          const wordList = state.wordList!;
          const targetIndex = Math.floor(Math.random() * wordList.length);
          const next = veloRunReducer(state, { type: "SET_POSITION", index: targetIndex });
          expect(next.positionIndex).toBe(targetIndex);
          expect(next.wordList).toBe(wordList); // referentially identical
          expect(next.displayState).toBe("paused");
        }
      ),
      { numRuns: 100 }
    );
  });

  it("SET_POSITION with valid index (generated target)", () => {
    fc.assert(
      fc.property(
        arbWordArrayList({ minLength: 1 }).chain((wordList) =>
          fc
            .record({
              state: fc.oneof(
                ...([
                  "running",
                  "paused",
                  "auto-paused",
                  "idle",
                  "completed",
                ] as const).map((ds) =>
                  fc
                    .record({
                      positionIndex: fc.integer({ min: 0, max: wordList.length - 1 }),
                      displayRate: fc.integer({ min: 1, max: 1500 }),
                      fontSize: fc.integer({ min: 8, max: 72 }),
                      displayChunkSize: fc.integer({ min: 1, max: 5 }),
                    })
                    .map(({ positionIndex, displayRate, fontSize, displayChunkSize }) => ({
                      wordList,
                      positionIndex,
                      displayState: ds,
                      config: { displayRate, fontSize, displayChunkSize },
                    }))
                )
              ),
              targetIndex: fc.integer({ min: 0, max: wordList.length - 1 }),
            })
        ),
        ({ state, targetIndex }) => {
          const next = veloRunReducer(state, { type: "SET_POSITION", index: targetIndex });
          expect(next.positionIndex).toBe(targetIndex);
          expect(next.wordList).toBe(state.wordList);
          expect(next.displayState).toBe("paused");
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe("Property 15: Invalid Position Reset Is Rejected", () => {
  /**
   * Validates: Requirements 9.3, 9.5
   *
   * For any VeloRunState with a loaded wordList of length N,
   * dispatching SET_POSITION with an index less than 0 or >= N
   * SHALL produce a state where positionIndex is unchanged.
   */
  it("SET_POSITION with negative index is rejected", () => {
    fc.assert(
      fc.property(
        arbStateWithWordList("running"),
        fc.integer({ min: -1000, max: -1 }),
        (state, badIndex) => {
          const next = veloRunReducer(state, { type: "SET_POSITION", index: badIndex });
          expect(next.positionIndex).toBe(state.positionIndex);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("SET_POSITION with index >= wordList.length is rejected", () => {
    fc.assert(
      fc.property(
        arbStateWithWordList("paused"),
        (state) => {
          const wordList = state.wordList!;
          const badIndex = wordList.length + Math.floor(Math.random() * 100);
          const next = veloRunReducer(state, { type: "SET_POSITION", index: badIndex });
          expect(next.positionIndex).toBe(state.positionIndex);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("SET_POSITION with index exactly at wordList.length is rejected", () => {
    fc.assert(
      fc.property(
        arbStateWithWordList("running"),
        (state) => {
          const wordList = state.wordList!;
          const next = veloRunReducer(state, { type: "SET_POSITION", index: wordList.length });
          expect(next.positionIndex).toBe(state.positionIndex);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe("Property 16: Load Document Resets State", () => {
  /**
   * Validates: Requirements 9.6
   *
   * For any VeloRunState and any new WordArrayList,
   * dispatching LOAD_DOCUMENT SHALL produce a state where positionIndex is 0,
   * wordList is the new list, and displayState is "idle".
   */
  it("LOAD_DOCUMENT resets positionIndex to 0, sets wordList, sets idle", () => {
    fc.assert(
      fc.property(
        fc.oneof(
          arbStateWithWordList("running"),
          arbStateWithWordList("paused"),
          arbStateWithWordList("auto-paused"),
          arbStateWithWordList("completed"),
          arbStateWithWordList("idle")
        ),
        arbWordArrayList({ minLength: 1 }),
        (state, newWordList) => {
          const next = veloRunReducer(state, { type: "LOAD_DOCUMENT", wordList: newWordList });
          expect(next.positionIndex).toBe(0);
          expect(next.wordList).toBe(newWordList);
          expect(next.displayState).toBe("idle");
        }
      ),
      { numRuns: 100 }
    );
  });

  it("LOAD_DOCUMENT from initial state with no wordList also resets correctly", () => {
    fc.assert(
      fc.property(
        arbWordArrayList({ minLength: 1 }),
        (newWordList) => {
          const next = veloRunReducer(INITIAL_STATE, { type: "LOAD_DOCUMENT", wordList: newWordList });
          expect(next.positionIndex).toBe(0);
          expect(next.wordList).toBe(newWordList);
          expect(next.displayState).toBe("idle");
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe("Property 17: Start From Completed Resets to Zero", () => {
  /**
   * Validates: Requirements 6.5
   *
   * For any VeloRunState in "completed" state,
   * dispatching START SHALL produce a state where positionIndex is 0
   * and displayState is "running".
   */
  it("START from completed resets positionIndex to 0 and sets running", () => {
    fc.assert(
      fc.property(
        arbStateWithWordList("completed"),
        (state) => {
          const next = veloRunReducer(state, { type: "START" });
          expect(next.positionIndex).toBe(0);
          expect(next.displayState).toBe("running");
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe("Property 18: Pause Preserves Position", () => {
  /**
   * Validates: Requirements 6.2
   *
   * For any VeloRunState in "running" state,
   * dispatching PAUSE SHALL produce a state where positionIndex is unchanged
   * and displayState is "paused".
   */
  it("PAUSE from running preserves positionIndex and sets paused", () => {
    fc.assert(
      fc.property(
        arbStateWithWordList("running"),
        (state) => {
          const next = veloRunReducer(state, { type: "PAUSE" });
          expect(next.positionIndex).toBe(state.positionIndex);
          expect(next.displayState).toBe("paused");
        }
      ),
      { numRuns: 100 }
    );
  });
});
