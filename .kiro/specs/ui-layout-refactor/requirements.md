# Requirements Document

## Introduction

Refactor the VeloRead Speed Reader web application layout, UI color theme, and component structure. The goal is to replace the current two-tab sidebar layout with a streamlined single-column vertical layout, apply a dark purple color scheme with emerald green and navy blue accents, and reserve placeholder containers for future advertisement integration. The refactor improves visual clarity, simplifies navigation, and prepares the application for monetization without disrupting the reading experience.

## Glossary

- **Application_Shell**: The root layout container that wraps all visual content of the VeloRead web application, including header, main content area, and ad placeholders.
- **Reading_Display**: The primary speed-reading viewport that renders the current word or word chunk to the user at the configured display rate.
- **Control_Bar**: A horizontal bar positioned directly below the Reading_Display, containing playback buttons (Start, Pause, Resume, Restart), file upload input, and configuration settings (display rate, font size, chunk size).
- **Document_Tracker**: A scrollable panel below the Control_Bar that renders the full document text with the current reading position highlighted.
- **Ad_Placeholder**: A reserved container element with defined dimensions that occupies space for future advertisement content without affecting surrounding layout when populated or empty.
- **Color_Theme**: The set of CSS custom properties and color values applied globally across the application, defining background, text, accent, and interactive element colors.
- **Single_Column_Layout**: A layout structure where all major content sections stack vertically in one column with no side-by-side arrangement of primary content areas.

## Requirements

### Requirement 1: Single-Column Vertical Layout Structure

**User Story:** As a user, I want all content arranged in a single vertical column, so that I can focus on reading without navigating between tabs or side panels.

#### Acceptance Criteria

1. THE Application_Shell SHALL render all primary content sections in a Single_Column_Layout stacking vertically from top to bottom.
2. THE Application_Shell SHALL present content sections in the following order: Reading_Display, Control_Bar, Document_Tracker.
3. THE Application_Shell SHALL NOT render any tab navigation elements or sidebar panels at any time during the application lifecycle.
4. THE Single_Column_Layout SHALL constrain its maximum width to a value between 800px and 1000px and center horizontally within the viewport.
5. WHEN the viewport width is less than the Single_Column_Layout maximum width, THE Single_Column_Layout SHALL span 100% of the viewport width minus the horizontal padding defined by the Application_Shell.

### Requirement 2: Dark Purple Color Theme

**User Story:** As a user, I want a dark purple-themed interface, so that I can read comfortably with reduced eye strain in low-light environments.

#### Acceptance Criteria

1. THE Color_Theme SHALL apply a dark purple background color (#1A1625) to the Application_Shell body.
2. THE Color_Theme SHALL render all header text and titles in white (#FFFFFF) and all body text and labels in light gray (#E0E0E0).
3. THE Color_Theme SHALL apply emerald green (#50C878) as the primary accent color for action buttons and interactive elements.
4. THE Color_Theme SHALL apply navy blue (#1E3A5F) as the secondary accent color for progress indicators, active states, and secondary highlights.
5. THE Color_Theme SHALL define all color values as CSS custom properties on the document root element.
6. THE Color_Theme SHALL ensure that all text rendered over the dark purple background meets a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text (18px or above).

### Requirement 3: Control Bar Consolidation

**User Story:** As a user, I want all playback and configuration controls in one horizontal bar below the reading display, so that I can adjust settings without leaving the reading context.

#### Acceptance Criteria

1. THE Control_Bar SHALL contain the file upload input, display rate setting, font size setting, chunk size setting, and playback action buttons (Start, Pause, Resume, Restart).
2. WHILE the viewport width is greater than 768px, THE Control_Bar SHALL arrange its child elements horizontally in a single row.
3. WHILE the viewport width is 768px or narrower, THE Control_Bar SHALL wrap its child elements into multiple rows grouped as: file upload in one row, configuration settings (display rate, font size, chunk size) in one row, and playback action buttons in one row.
4. THE Control_Bar SHALL position itself directly below the Reading_Display with no intervening content or spacing greater than 16px.
5. THE Control_Bar SHALL be rendered as an accessible group with a descriptive accessible label identifying it as the playback and settings control bar.

### Requirement 4: Reading Display Presentation

**User Story:** As a user, I want a prominent, visually distinct reading display area, so that the current word chunk is always easy to locate and read.

#### Acceptance Criteria

1. THE Reading_Display SHALL occupy the full width of the Single_Column_Layout container.
2. THE Reading_Display SHALL maintain a minimum height of 200px to provide a stable visual anchor.
3. THE Reading_Display SHALL center the displayed word chunk both horizontally and vertically within its bounds.
4. THE Reading_Display SHALL apply a background color that achieves a minimum contrast ratio of 3:1 against the Application_Shell background color defined in the Color_Theme.
5. THE Reading_Display SHALL render the word chunk text in a color that achieves a minimum contrast ratio of 4.5:1 against the Reading_Display background color.
6. WHILE no document is loaded, THE Reading_Display SHALL display a placeholder message indicating that no document is available, centered within its bounds.

### Requirement 5: Document Tracker Scrollable Panel

**User Story:** As a user, I want the document tracker visible below the controls without switching tabs, so that I can see my reading progress while adjusting settings.

#### Acceptance Criteria

1. THE Document_Tracker SHALL render below the Control_Bar as a scrollable panel within the Single_Column_Layout.
2. THE Document_Tracker SHALL constrain its maximum height to 400px and enable vertical scrolling when content exceeds that height.
3. WHEN the reading position changes, THE Document_Tracker SHALL auto-scroll to keep the highlighted word visible within the panel viewport.
4. THE Document_Tracker SHALL highlight the current reading position word by applying the secondary accent color from the Color_Theme as a background color on the highlighted word element.
5. IF no document is loaded, THEN THE Document_Tracker SHALL render as an empty panel displaying no text content and occupying no more than its minimum collapsed height of 0px.

### Requirement 6: Ad Placeholder Containers

**User Story:** As a product owner, I want reserved ad placement areas in the layout, so that advertisements can be integrated later without requiring further layout changes.

#### Acceptance Criteria

1. THE Application_Shell SHALL include an Ad_Placeholder container above the Reading_Display (top banner slot).
2. THE Application_Shell SHALL include an Ad_Placeholder container below the Document_Tracker (bottom banner slot).
3. THE Ad_Placeholder SHALL occupy the full width of the Single_Column_Layout and define a fixed height of 90px for banner-style ads.
4. WHILE an Ad_Placeholder contains no advertisement content, THE Ad_Placeholder SHALL render as an invisible container that preserves its reserved 90px height without displaying visual borders or background.
5. WHEN advertisement content is injected into an Ad_Placeholder, THE Application_Shell SHALL NOT alter the position or dimensions of surrounding content sections.
6. WHEN advertisement content is injected into an Ad_Placeholder, THE Ad_Placeholder SHALL constrain the rendered advertisement to the fixed 90px height and clip any content exceeding that height.

### Requirement 7: Spacing and Visual Density

**User Story:** As a user, I want a spacious and uncluttered interface, so that the reading experience feels calm and focused.

#### Acceptance Criteria

1. THE Application_Shell SHALL apply a minimum padding of 24px between the viewport edges and the Single_Column_Layout container.
2. THE Application_Shell SHALL apply vertical spacing of at least 16px between each major content section (Ad_Placeholder, Reading_Display, Control_Bar, Document_Tracker).
3. THE Control_Bar SHALL apply internal padding of at least 12px and spacing of at least 8px between individual control elements.
4. THE Reading_Display SHALL apply internal padding of at least 32px to provide visual breathing room around the displayed text.

### Requirement 8: Removal of Legacy Layout Components

**User Story:** As a developer, I want legacy tab and sidebar code removed, so that the codebase remains maintainable and free of dead code.

#### Acceptance Criteria

1. WHEN the refactor is complete, THE Application_Shell SHALL NOT contain any tab panel markup or tab navigation elements.
2. WHEN the refactor is complete, THE Application_Shell SHALL NOT render a sidebar layout region.
3. WHEN the refactor is complete, THE Application_Shell SHALL NOT reference the activeTab state variable in any component.
4. WHEN the refactor is complete, THE Application_Shell SHALL NOT include CSS class selectors for tab-panel or layout__sidebar styling.
5. WHEN the refactor is complete, THE Application_Shell SHALL NOT contain test assertions or test setup code that references removed tab panel, sidebar, or activeTab constructs.
