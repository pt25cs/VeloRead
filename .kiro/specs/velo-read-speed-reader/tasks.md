# Implementation Plan: VeloRead Speed Reader

## Overview

Implement a client-side speed reading SPA using React, TypeScript, and Vite. The plan builds incrementally from core parsing logic, through the display state engine, to the interactive UI components. Property-based tests use fast-check with Vitest.

## Tasks

- [x] 1. Set up project structure and core types
  - [x] 1.1 Initialize Vite + React + TypeScript project and install dependencies
    - Initialize project with `npm create vite@latest` using the React + TypeScript template
    - Install dependencies: `fast-check`, `vitest`, `@testing-library/react`, `@testing-library/jest-dom`
    - Configure Vitest in `vite.config.ts`
    - Create directory structure: `src/modules/parser/`, `src/modules/display/`, `src/modules/tracker/`, `src/components/__tests__/`
    - _Requirements: All_

  - [x] 1.2 Define core types and constants
    - Create `src/modules/types.ts` with `PARAGRAPH_SENTINEL` Symbol, `WordEntry`, `WordArrayItem`, `WordArrayList`, `ParagraphSentinel` types
    - Create `src/modules/display/display-state.ts` types: `DisplayState`, `DisplayConfig`, `VeloRunState`, `VeloRunAction`
    - Define `ALLOWED_EXTENSIONS`, validation boundaries, and default config constants
    - _Requirements: 1.1, 3.5, 4.1, 5.2_

- [x] 2. Implement VeloRead_Parser module
  - [x] 2.1 Implement file validation functions
    - Create `src/modules/parser/parser.ts`
    - Implement `validateFileExtension(fileName: string): string | null` — returns null for .txt, .md, .rtf (case-insensitive), error message otherwise
    - Implement `validateFileSize(fileSize: number): string | null` — returns null for sizes ≤ 10,485,760 bytes, error message otherwise
    - _Requirements: 1.1, 1.3, 1.4_

  - [x] 2.2 Write property tests for file validation
    - **Property 1: File Extension Validation Partitions Correctly**
    - **Property 2: File Size Validation Boundary**
    - **Validates: Requirements 1.1, 1.3, 1.4**

  - [x] 2.3 Implement text parsing logic
    - Implement `parseText(content: string): ParseOutcome` in `src/modules/parser/parser.ts`
    - Split on whitespace runs, insert exactly one `PARAGRAPH_SENTINEL` per group of consecutive blank lines
    - Return `ParseError` for whitespace-only content
    - Preserve original word order
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 2.4 Write property tests for text parsing
    - **Property 3: Whitespace-Only Content Rejection**
    - **Property 4: Parse Round-Trip Reconstruction**
    - **Property 5: No Consecutive Sentinels in Parse Output**
    - **Validates: Requirements 1.2, 2.1, 2.2, 2.3, 2.4, 2.5**

  - [x] 2.5 Implement processFile orchestration
    - Implement `processFile(file: File): Promise<ParseOutcome>` — reads file via FileReader API, validates extension and size, then calls `parseText`
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 3. Checkpoint - Parser verification
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement VeloRun_Display state engine
  - [x] 4.1 Implement validation utility functions
    - Create `src/modules/display/display-utils.ts`
    - Implement `validateDisplayRate(value: unknown): number | null` — returns integer in [1, 1500] or null
    - Implement `validateFontSize(value: unknown): number | null` — returns integer in [8, 72] or null
    - Implement `validateChunkSize(value: unknown): number | null` — returns integer in [1, 5] or null
    - _Requirements: 3.5, 3.6, 4.2, 4.4, 5.1, 5.4_

  - [x] 4.2 Write property tests for validation utilities
    - **Property 6: Chunk Size Validation**
    - **Property 7: Display Rate Validation**
    - **Property 8: Font Size Validation**
    - **Validates: Requirements 3.5, 3.6, 4.2, 4.4, 5.1, 5.4**

  - [x] 4.3 Implement display position computation functions
    - Implement `getDisplayWords(wordList, positionIndex, chunkSize): string[]` — returns words to display, never sentinels
    - Implement `computeNextPosition(wordList, currentIndex, chunkSize): { nextIndex, hitSentinel }` — advances position, detects sentinels and end-of-list
    - Implement `skipConsecutiveSentinels(wordList, startIndex): number` — advances past all consecutive sentinels
    - _Requirements: 3.1, 3.2, 3.4, 7.1, 7.3, 7.4, 7.5_

  - [x] 4.4 Write property tests for position computation
    - **Property 10: Display Words Never Contain Sentinels**
    - **Property 11: End-of-List Produces Completion**
    - **Property 12: Sentinel Triggers Auto-Pause**
    - **Property 13: Resume From Sentinel Skips All Consecutive Sentinels**
    - **Validates: Requirements 3.4, 7.1, 7.3, 7.4, 7.5**

  - [x] 4.5 Implement veloRunReducer
    - Implement `veloRunReducer(state: VeloRunState, action: VeloRunAction): VeloRunState` in `src/modules/display/display-state.ts`
    - Handle all actions: LOAD_DOCUMENT, START, PAUSE, ADVANCE, SET_POSITION, SET_DISPLAY_RATE, SET_FONT_SIZE, SET_CHUNK_SIZE, RESET
    - Implement state transitions: idle→running, running→paused, running→auto-paused, running→completed, completed→running (reset to 0)
    - Handle sentinel skipping on resume from auto-paused, boundary checks on SET_POSITION, config validation
    - _Requirements: 3.1, 3.2, 3.4, 4.2, 4.3, 5.3, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 7.1, 7.3, 7.5, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [x] 4.6 Write property tests for the reducer
    - **Property 9: Configuration Changes Preserve Position**
    - **Property 14: Valid Position Reset Updates Index and Preserves WordList**
    - **Property 15: Invalid Position Reset Is Rejected**
    - **Property 16: Load Document Resets State**
    - **Property 17: Start From Completed Resets to Zero**
    - **Property 18: Pause Preserves Position**
    - **Validates: Requirements 4.3, 5.3, 6.2, 6.5, 8.4, 8.6, 9.2, 9.3, 9.5, 9.6**

- [x] 5. Checkpoint - Display engine verification
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement Document_Tracker module
  - [x] 6.1 Implement buildParagraphs utility
    - Create `src/modules/tracker/document-tracker.ts`
    - Implement `buildParagraphs(wordList: WordArrayList): Array<Array<{ word: string; globalIndex: number }>>` — reconstructs paragraphs from WordArrayList, maps each word to its global index
    - _Requirements: 8.1_

  - [x] 6.2 Write property test for buildParagraphs
    - **Property 19: buildParagraphs Preserves All Words With Correct Indices**
    - **Validates: Requirements 8.1**

- [x] 7. Implement React state management
  - [x] 7.1 Create AppContext and provider
    - Create `src/context/AppContext.tsx`
    - Implement React Context with `useReducer` using `veloRunReducer`
    - Expose state and dispatch via context
    - Include error state and active tab state management
    - _Requirements: 9.1, 9.4, 9.6_

  - [x] 7.2 Implement useDisplayRunner hook
    - Create `src/hooks/useDisplayRunner.ts`
    - Implement `setInterval`-based timer that dispatches ADVANCE when displayState is "running"
    - Recalculate interval as `60000 / displayRate` when rate changes
    - Clear and recreate interval on displayRate change
    - Clean up interval on unmount or when state leaves "running"
    - _Requirements: 3.2, 4.2, 4.3_

- [x] 8. Implement UI components
  - [x] 8.1 Implement FileUpload component
    - Create `src/components/FileUpload.tsx`
    - Implement file input with accept filter for .txt, .md, .rtf
    - Call `processFile` on selection, dispatch LOAD_DOCUMENT on success
    - Display inline error messages for validation failures
    - Clear errors when a new file is selected
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 8.2 Implement VeloRunDisplay component
    - Create `src/components/VeloRunDisplay.tsx`
    - Render current word(s) centered horizontally and vertically in a visually distinct Display_Container
    - Show paragraph break indicator (¶) during auto-pause state
    - Show completion indicator when display state is "completed"
    - Show "No document loaded" message when idle with no wordList
    - Apply dynamic font size from config
    - _Requirements: 3.1, 3.3, 3.4, 5.1, 5.2, 6.6, 7.2, 7.4_

  - [x] 8.3 Implement PlaybackControls component
    - Create `src/components/PlaybackControls.tsx`
    - Start button: dispatches START action
    - Pause button: dispatches PAUSE action
    - Toggle start/pause based on current displayState
    - Handle start from completed state (auto-resets to beginning)
    - Disable start when no document is loaded, show appropriate message
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 7.3_

  - [x] 8.4 Implement SettingsPanel component
    - Create `src/components/SettingsPanel.tsx`
    - Display Rate input: validate via `validateDisplayRate`, dispatch SET_DISPLAY_RATE, show inline error for invalid values
    - Font Size input: validate via `validateFontSize`, dispatch SET_FONT_SIZE, show inline error for invalid values
    - Chunk Size input: validate via `validateChunkSize`, dispatch SET_CHUNK_SIZE, show inline error for invalid values
    - Show current values as defaults
    - _Requirements: 3.5, 3.6, 4.1, 4.2, 4.4, 5.1, 5.4_

  - [x] 8.5 Implement DocumentTracker component
    - Create `src/components/DocumentTracker.tsx`
    - Render full text using `buildParagraphs` output with visual paragraph breaks
    - Highlight the word at current positionIndex
    - Auto-scroll to keep highlighted word visible in viewport
    - Handle word click: dispatch SET_POSITION with the clicked word's globalIndex, which pauses display
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 9.2_

- [x] 9. Implement App shell and wiring
  - [x] 9.1 Create Layout and App component
    - Create `src/components/Layout.tsx` with responsive layout structure
    - Create tab panel with "Display" and "Tracker" tabs
    - Wire all components together in `src/App.tsx`
    - Wrap with `AppProvider`
    - Integrate `useDisplayRunner` hook at the provider level
    - _Requirements: All_

  - [x] 9.2 Write integration tests
    - Test full upload → parse → display → complete workflow
    - Test click-to-seek in Document_Tracker updates display position
    - Test rate change mid-run does not reset position
    - Test auto-pause at paragraph boundary then resume
    - Test tab switching between display and tracker
    - _Requirements: 1.1, 2.1, 3.1, 6.1, 7.1, 8.4_

- [x] 10. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document using fast-check
- Unit tests validate specific examples and edge cases
- All state is ephemeral (in-memory only) — no persistence layer needed
- The `PARAGRAPH_SENTINEL` is a Symbol to prevent collision with actual word content

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["2.1", "4.1"] },
    { "id": 3, "tasks": ["2.2", "2.3", "4.2"] },
    { "id": 4, "tasks": ["2.4", "2.5", "4.3"] },
    { "id": 5, "tasks": ["4.4", "4.5", "6.1"] },
    { "id": 6, "tasks": ["4.6", "6.2", "7.1"] },
    { "id": 7, "tasks": ["7.2", "8.1"] },
    { "id": 8, "tasks": ["8.2", "8.3", "8.4", "8.5"] },
    { "id": 9, "tasks": ["9.1"] },
    { "id": 10, "tasks": ["9.2"] }
  ]
}
```
