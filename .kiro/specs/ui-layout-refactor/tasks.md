# Implementation Plan: UI Layout Refactor

## Overview

Refactor VeloRead from a tab-based sidebar layout to a single-column vertical layout with dark purple theme, consolidated ControlBar, and ad placeholder containers. Implementation proceeds bottom-up: CSS custom properties first, then new components, then layout rewrite, context cleanup, and finally legacy code removal.

## Tasks

- [x] 1. Define CSS custom properties and base theme styles
  - [x] 1.1 Create CSS custom properties on :root for colors, spacing, and layout values
    - Define all variables from the design: `--color-bg-primary`, `--color-bg-surface`, `--color-bg-elevated`, `--color-text-heading`, `--color-text-body`, `--color-text-muted`, `--color-accent-primary`, `--color-accent-secondary`, `--color-border`, spacing variables, layout max-width, breakpoint, and ad-height
    - Apply `--color-bg-primary` (#1A1625) to the `body` element
    - Apply `--color-text-body` (#E0E0E0) as default body text color
    - _Requirements: 2.1, 2.2, 2.5_

  - [x] 1.2 Create the app-shell layout styles
    - Add `.app-shell` with max-width `var(--layout-max-width)`, centered with auto margins, and `var(--spacing-shell-padding)` padding
    - Add `.app-shell__content` with flexbox column layout and `var(--spacing-section)` gap between children
    - Add responsive rule: when viewport < max-width, shell spans 100% minus horizontal padding
    - _Requirements: 1.4, 1.5, 7.1, 7.2_

- [x] 2. Create AdPlaceholder component
  - [x] 2.1 Implement AdPlaceholder component
    - Create `src/components/AdPlaceholder.tsx`
    - Accept a `position` prop of type `"top" | "bottom"`
    - Render a `<div>` with class `ad-placeholder`, `data-slot={position}`, and `aria-hidden="true"`
    - Style: full width, fixed height 90px, no visible borders or background when empty, `overflow: hidden`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [x] 2.2 Write unit tests for AdPlaceholder
    - Verify renders with correct `data-slot` attribute for "top" and "bottom"
    - Verify `aria-hidden="true"` is present
    - Verify height is 90px via applied CSS class
    - Verify overflow hidden clips content
    - _Requirements: 6.3, 6.4, 6.6_

- [x] 3. Create ControlBar component and update child components
  - [x] 3.1 Create ControlBar component
    - Create `src/components/ControlBar.tsx`
    - Render a `<div>` with class `control-bar`, `role="group"`, and `aria-label="Playback and settings controls"`
    - Compose `FileUpload`, `SettingsPanel`, and `PlaybackControls` as children
    - _Requirements: 3.1, 3.5_

  - [x] 3.2 Add ControlBar CSS styles
    - Style `.control-bar` as horizontal flexbox row with `var(--spacing-control-internal)` padding and `var(--spacing-control-gap)` gap
    - Add responsive rule at ≤768px: flex-wrap with logical row grouping (upload | settings | playback)
    - Position constraint: directly below Reading Display with no more than 16px gap (handled by parent flex gap)
    - _Requirements: 3.2, 3.3, 3.4, 7.3_

  - [x] 3.3 Update SettingsPanel for inline layout within ControlBar
    - Remove the `<h2>Settings</h2>` heading
    - Change layout from vertical column to horizontal flex row
    - Make inputs compact to fit inline in the control bar
    - _Requirements: 3.1, 3.2_

  - [x] 3.4 Update PlaybackControls button styling
    - Replace indigo (#6366f1) button color with emerald green accent `var(--color-accent-primary)`
    - Use dark text (#1A1625) on buttons for WCAG AA compliance
    - _Requirements: 2.3, 2.6_

  - [x] 3.5 Write unit tests for ControlBar
    - Verify ControlBar renders FileUpload, settings inputs, and playback buttons
    - Verify accessible `role="group"` and `aria-label` are present
    - Verify all required controls are present: file upload, display rate, font size, chunk size, playback buttons
    - _Requirements: 3.1, 3.5_

- [x] 4. Update VeloRunDisplay and DocumentTracker styling
  - [x] 4.1 Update VeloRunDisplay to use CSS classes and theme variables
    - Remove inline `style` object from the container div
    - Apply CSS class `reading-display` with: background `#3D3556`, min-height 200px, padding `var(--spacing-display-padding)`, border using `var(--color-border)`, centered flex layout, full width of container
    - Apply text color `var(--color-text-body)` and dynamic font-size from state
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 7.4_

  - [x] 4.2 Update DocumentTracker to use CSS classes and theme variables
    - Remove inline style objects (`containerStyle`, `highlightStyle`, `wordStyle`, `paragraphStyle`)
    - Apply CSS class `document-tracker` with: max-height 400px, overflow-y auto, appropriate padding and border using theme variables
    - Apply highlight class using `var(--color-accent-secondary)` for current word background
    - When no document loaded, render collapsed (min-height: 0, no text content)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 4.3 Write unit tests for updated display and tracker components
    - Verify VeloRunDisplay renders with `reading-display` class
    - Verify VeloRunDisplay shows placeholder when no document loaded
    - Verify DocumentTracker renders below ControlBar in DOM order
    - Verify DocumentTracker highlight uses secondary accent color class
    - Verify DocumentTracker renders collapsed when no document loaded
    - _Requirements: 4.3, 4.6, 5.4, 5.5_

- [x] 5. Checkpoint - Verify new components work in isolation
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Rewrite Layout component and clean up AppContext
  - [x] 6.1 Rewrite Layout.tsx as single-column vertical layout
    - Remove all tab panel markup, tablist role, tab buttons, conditional rendering based on `activeTab`
    - Remove sidebar `<aside>` element
    - Restructure as: `app-shell` → `app-shell__header` + `app-shell__content` containing `AdPlaceholder(top)` → `VeloRunDisplay` → `ControlBar` → `DocumentTracker` → `AdPlaceholder(bottom)`
    - Remove imports of `activeTab` and `setActiveTab` from context
    - _Requirements: 1.1, 1.2, 1.3, 8.1, 8.2_

  - [x] 6.2 Remove activeTab state from AppContext
    - Remove `activeTab` and `setActiveTab` from `AppContextValue` interface
    - Remove `useState` for `activeTab` in `AppProvider`
    - Remove from the `value` object passed to provider
    - _Requirements: 8.3_

  - [x] 6.3 Write integration tests for new layout structure
    - Verify DOM order: ad-placeholder[top] → reading-display → control-bar → document-tracker → ad-placeholder[bottom]
    - Verify no elements with `role="tablist"`, `role="tab"`, or `role="tabpanel"` exist
    - Verify no sidebar element exists
    - Verify AppContext no longer exposes `activeTab` or `setActiveTab`
    - _Requirements: 1.1, 1.2, 1.3, 8.1, 8.2, 8.3_

- [x] 7. Remove legacy CSS and update remaining styles
  - [x] 7.1 Remove legacy CSS selectors and add remaining theme styles
    - Delete `.tab-panel`, `.tab-panel__tab`, `.tab-panel__tab--active`, `.tab-panel__content` selectors
    - Delete `.layout__sidebar` selector
    - Delete `.layout__body` flex layout (replaced by single-column)
    - Update `.playback-controls button` to use theme accent variables
    - Update `.settings-field input` to use theme background and border variables
    - Add `.reading-display`, `.document-tracker`, `.ad-placeholder`, `.control-bar` class styles
    - _Requirements: 8.4, 2.3, 2.4_

  - [x] 7.2 Write tests verifying no legacy selectors remain
    - Verify CSS file does not contain `tab-panel` or `layout__sidebar` class selectors
    - Verify no component references `tab-panel__tab` class names
    - _Requirements: 8.4_

- [x] 8. Update existing tests and verify build
  - [x] 8.1 Update existing test files for removed tab/sidebar constructs
    - Update `src/App.test.tsx` to remove any references to tabs, sidebar, or activeTab
    - Update `src/components/__tests__/integration.test.tsx` to remove assertions about tab panels or sidebar
    - Ensure tests validate the new layout structure instead
    - _Requirements: 8.5_

  - [x] 8.2 Run full build and test suite
    - Run `tsc -b` to verify no TypeScript errors from removed `activeTab` references
    - Run `vitest --run` to verify all tests pass
    - Confirm existing display-state, parser, and tracker module tests still pass unchanged
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 9. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- No property-based tests are included as the design confirmed PBT is not applicable for this UI refactor
- The existing pure-logic modules (display-state, display-utils, parser, document-tracker) remain unchanged
- Button text on emerald green uses dark text (#1A1625) for WCAG AA compliance per design decision

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "2.1"] },
    { "id": 2, "tasks": ["2.2", "3.1", "4.1", "4.2"] },
    { "id": 3, "tasks": ["3.2", "3.3", "3.4"] },
    { "id": 4, "tasks": ["3.5", "4.3"] },
    { "id": 5, "tasks": ["6.1", "6.2"] },
    { "id": 6, "tasks": ["6.3", "7.1"] },
    { "id": 7, "tasks": ["7.2", "8.1"] },
    { "id": 8, "tasks": ["8.2"] }
  ]
}
```
