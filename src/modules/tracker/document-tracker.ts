import { PARAGRAPH_SENTINEL, WordArrayList } from "../types";

/**
 * Reconstructs display-friendly paragraphs from WordArrayList.
 * Each paragraph is an array of { word, globalIndex } objects.
 * Sentinels are used as paragraph delimiters and are not included in the output.
 * Empty paragraphs (e.g., from leading/trailing sentinels) are excluded.
 */
export function buildParagraphs(
  wordList: WordArrayList
): Array<Array<{ word: string; globalIndex: number }>> {
  const paragraphs: Array<Array<{ word: string; globalIndex: number }>> = [];
  let currentParagraph: Array<{ word: string; globalIndex: number }> = [];

  for (let i = 0; i < wordList.length; i++) {
    const item = wordList[i];

    if (item === PARAGRAPH_SENTINEL) {
      if (currentParagraph.length > 0) {
        paragraphs.push(currentParagraph);
        currentParagraph = [];
      }
    } else {
      currentParagraph.push({ word: item, globalIndex: i });
    }
  }

  // Push the last paragraph if it has content
  if (currentParagraph.length > 0) {
    paragraphs.push(currentParagraph);
  }

  return paragraphs;
}
