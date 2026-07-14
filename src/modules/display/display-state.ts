import { WordArrayList } from "../types";
import {
  computeNextPosition,
  skipConsecutiveSentinels,
  validateDisplayRate,
  validateFontSize,
  validateChunkSize,
} from "./display-utils";

export type DisplayState = "idle" | "running" | "paused" | "auto-paused" | "completed";

export interface DisplayConfig {
  displayRate: number;       // WPM, integer 1–1500, default 250
  fontSize: number;          // points, integer 8–72, default 36
  displayChunkSize: number;  // integer 1–5, default 1
}

export interface VeloRunState {
  wordList: WordArrayList | null;
  positionIndex: number;
  displayState: DisplayState;
  config: DisplayConfig;
}

export type VeloRunAction =
  | { type: "LOAD_DOCUMENT"; wordList: WordArrayList }
  | { type: "START" }
  | { type: "PAUSE" }
  | { type: "ADVANCE" }
  | { type: "SET_POSITION"; index: number }
  | { type: "SET_DISPLAY_RATE"; rate: number }
  | { type: "SET_FONT_SIZE"; size: number }
  | { type: "SET_CHUNK_SIZE"; size: number }
  | { type: "RESET" };

export const DEFAULT_CONFIG: DisplayConfig = {
  displayRate: 250,
  fontSize: 36,
  displayChunkSize: 1,
};

export const INITIAL_STATE: VeloRunState = {
  wordList: null,
  positionIndex: 0,
  displayState: "idle",
  config: DEFAULT_CONFIG,
};

/**
 * Pure reducer — all state transitions are deterministic.
 * Handles sentinel skipping, boundary checks, auto-pause detection.
 */
export function veloRunReducer(state: VeloRunState, action: VeloRunAction): VeloRunState {
  switch (action.type) {
    case "LOAD_DOCUMENT":
      return {
        ...state,
        wordList: action.wordList,
        positionIndex: 0,
        displayState: "idle",
      };

    case "START": {
      if (!state.wordList) {
        return state;
      }
      if (state.displayState === "completed") {
        return { ...state, positionIndex: 0, displayState: "running" };
      }
      if (state.displayState === "auto-paused") {
        const newIndex = skipConsecutiveSentinels(state.wordList, state.positionIndex);
        return { ...state, positionIndex: newIndex, displayState: "running" };
      }
      if (state.displayState === "idle" || state.displayState === "paused") {
        return { ...state, displayState: "running" };
      }
      return state;
    }

    case "PAUSE": {
      if (state.displayState === "running") {
        return { ...state, displayState: "paused" };
      }
      return state;
    }

    case "ADVANCE": {
      if (state.displayState !== "running" || !state.wordList) {
        return state;
      }
      const { nextIndex, hitSentinel } = computeNextPosition(
        state.wordList,
        state.positionIndex,
        state.config.displayChunkSize
      );
      if (hitSentinel) {
        return { ...state, positionIndex: nextIndex, displayState: "auto-paused" };
      }
      if (nextIndex >= state.wordList.length) {
        return { ...state, displayState: "completed" };
      }
      return { ...state, positionIndex: nextIndex };
    }

    case "SET_POSITION": {
      if (!state.wordList) {
        return state;
      }
      if (action.index < 0 || action.index >= state.wordList.length) {
        return state;
      }
      return { ...state, positionIndex: action.index, displayState: "paused" };
    }

    case "SET_DISPLAY_RATE": {
      const validated = validateDisplayRate(action.rate);
      if (validated === null) {
        return state;
      }
      return { ...state, config: { ...state.config, displayRate: validated } };
    }

    case "SET_FONT_SIZE": {
      const validated = validateFontSize(action.size);
      if (validated === null) {
        return state;
      }
      return { ...state, config: { ...state.config, fontSize: validated } };
    }

    case "SET_CHUNK_SIZE": {
      const validated = validateChunkSize(action.size);
      if (validated === null) {
        return state;
      }
      return { ...state, config: { ...state.config, displayChunkSize: validated } };
    }

    case "RESET":
      return { ...state, positionIndex: 0, displayState: "idle" };

    default:
      return state;
  }
}
