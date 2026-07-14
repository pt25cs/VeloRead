import { PARAGRAPH_SENTINEL, VALIDATION_BOUNDARIES, WordArrayList } from "../types";

/**
 * Validates that a value is a valid integer within a given range.
 * Returns the value as a number if valid, or null otherwise.
 */
function validateIntegerInRange(
  value: unknown,
  min: number,
  max: number
): number | null {
  if (typeof value !== "number") {
    return null;
  }
  if (!Number.isFinite(value)) {
    return null;
  }
  if (!Number.isInteger(value)) {
    return null;
  }
  if (value < min || value > max) {
    return null;
  }
  return value;
}

/**
 * Validates a display rate value.
 * @returns the validated integer in [1, 1500] or null if invalid.
 */
export function validateDisplayRate(value: unknown): number | null {
  const { min, max } = VALIDATION_BOUNDARIES.displayRate;
  return validateIntegerInRange(value, min, max);
}

/**
 * Validates a font size value.
 * @returns the validated integer in [8, 72] or null if invalid.
 */
export function validateFontSize(value: unknown): number | null {
  const { min, max } = VALIDATION_BOUNDARIES.fontSize;
  return validateIntegerInRange(value, min, max);
}

/**
 * Validates a display chunk size value.
 * @returns the validated integer in [1, 5] or null if invalid.
 */
export function validateChunkSize(value: unknown): number | null {
  const { min, max } = VALIDATION_BOUNDARIES.chunkSize;
  return validateIntegerInRange(value, min, max);
}

/**
 * Returns words to display starting at positionIndex, collecting up to chunkSize words.
 * If positionIndex points to a sentinel, returns empty array (auto-pause case).
 * Stops collecting if a sentinel or end of list is encountered.
 * Never includes sentinels in the returned array.
 */
export function getDisplayWords(
  wordList: WordArrayList,
  positionIndex: number,
  chunkSize: number
): string[] {
  // If position is at a sentinel, return empty (auto-pause case)
  if (
    positionIndex >= wordList.length ||
    wordList[positionIndex] === PARAGRAPH_SENTINEL
  ) {
    return [];
  }

  const result: string[] = [];
  for (let i = positionIndex; i < wordList.length && result.length < chunkSize; i++) {
    const item = wordList[i];
    if (item === PARAGRAPH_SENTINEL) {
      break;
    }
    result.push(item);
  }
  return result;
}

/**
 * Computes the next position index after an advance.
 * Starting from currentIndex, advances by chunkSize positions.
 * If a PARAGRAPH_SENTINEL is encountered during advancement, stops at that sentinel's index.
 * Returns { nextIndex, hitSentinel }.
 */
export function computeNextPosition(
  wordList: WordArrayList,
  currentIndex: number,
  chunkSize: number
): { nextIndex: number; hitSentinel: boolean } {
  for (let step = 1; step <= chunkSize; step++) {
    const nextIdx = currentIndex + step;
    if (nextIdx >= wordList.length) {
      return { nextIndex: wordList.length, hitSentinel: false };
    }
    if (wordList[nextIdx] === PARAGRAPH_SENTINEL) {
      return { nextIndex: nextIdx, hitSentinel: true };
    }
  }
  return { nextIndex: currentIndex + chunkSize, hitSentinel: false };
}

/**
 * Starting at startIndex, advances past all consecutive PARAGRAPH_SENTINEL values.
 * Returns the index of the first non-sentinel item after the group.
 * If no non-sentinel follows, returns wordList.length.
 */
export function skipConsecutiveSentinels(
  wordList: WordArrayList,
  startIndex: number
): number {
  let index = startIndex;
  while (index < wordList.length && wordList[index] === PARAGRAPH_SENTINEL) {
    index++;
  }
  return index;
}
