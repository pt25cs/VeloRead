# Requirements Document

## Introduction

VeloRead is an educational speed reading tool that displays text one word at a time at a configurable rate. Users upload documents, and the system parses them into a word-level structure (ArrayList) preserving paragraph boundaries as sentinels. A display runner shows words sequentially, auto-pausing between paragraphs to reduce cognitive overload. An interactive document tracker tab allows users to follow along in the original text and click back to any missed word to reset the display position.

## Glossary

- **VeloRead_Parser**: The component responsible for reading uploaded files, splitting text into individual words, and storing them in an ArrayList with paragraph sentinel markers.
- **VeloRun_Display**: The component responsible for rendering one or more words at a time at a user-configured rate (words per minute). The display unit size is configurable to support future multi-word (phrase) reading modes.
- **Display_Chunk_Size**: The number of words shown per display cycle. Defaults to 1 (single-word mode) but is designed to support higher values for phrase-reading in future iterations.
- **Position_Index**: An integer pointer into the Word_ArrayList representing the current display position. Advancing, pausing, and resetting the display all operate on this index without recreating the Word_ArrayList.
- **Paragraph_Sentinel**: A special marker value stored in the word ArrayList that indicates a paragraph boundary (originating from blank lines in the source text).
- **Word_ArrayList**: The ArrayList data structure holding parsed words and paragraph sentinels in sequential order.
- **Document_Tracker**: An interactive view showing the full original text with a highlighted word indicator that follows the current display position.
- **Display_Rate**: The speed at which words are shown, measured in words per minute (WPM).
- **Display_Container**: The UI region where the current word is rendered one at a time.

## Requirements

### Requirement 1: File Upload

**User Story:** As a user, I want to upload a text document so that I can speed-read its contents.

#### Acceptance Criteria

1. WHEN a user selects a file for upload, THE VeloRead_Parser SHALL accept files with the extensions .txt, .md, or .rtf and begin processing.
2. WHEN an uploaded file contains zero non-whitespace characters, THE VeloRead_Parser SHALL display an error message indicating the file contains no readable content.
3. IF a file has an extension other than .txt, .md, or .rtf, THEN THE VeloRead_Parser SHALL reject the file and display an error message stating the supported formats.
4. IF an uploaded file exceeds 10 MB in size, THEN THE VeloRead_Parser SHALL reject the file and display an error message indicating the maximum allowed file size.

### Requirement 2: Text Parsing

**User Story:** As a user, I want my uploaded document parsed into individual words so that the speed reader can display them sequentially.

#### Acceptance Criteria

1. WHEN a valid file is uploaded, THE VeloRead_Parser SHALL split the file content into individual words by separating on one or more contiguous whitespace characters (spaces, tabs, carriage returns, or newlines) and store them in the Word_ArrayList in sequential order, discarding empty tokens.
2. WHEN the VeloRead_Parser encounters one or more consecutive blank lines in the source text, THE VeloRead_Parser SHALL insert exactly one Paragraph_Sentinel into the Word_ArrayList at that position.
3. THE VeloRead_Parser SHALL preserve the original word order from the source document in the Word_ArrayList.
4. THE VeloRead_Parser SHALL produce a Word_ArrayList such that concatenating all non-sentinel entries with single-space separators, and replacing each Paragraph_Sentinel with a double-newline, yields text that matches the original document after normalizing all whitespace runs to a single space and all paragraph breaks to a single blank line.
5. IF the uploaded file contains only whitespace and blank lines with no readable words, THEN THE VeloRead_Parser SHALL treat the file as empty and display an error message indicating the file contains no readable content.

### Requirement 3: Word-at-a-Time Display

**User Story:** As a user, I want to see one word at a time displayed prominently so that I can focus on reading at speed without distraction.

#### Acceptance Criteria

1. WHEN the display is started, THE VeloRun_Display SHALL show words from the Word_ArrayList beginning at the current Position_Index using the current Display_Chunk_Size (defaulting to 1) in the Display_Container.
2. WHILE the display is running, THE VeloRun_Display SHALL advance the Position_Index by the current Display_Chunk_Size at an interval of (60,000 / Display_Rate) milliseconds.
3. THE VeloRun_Display SHALL render the current word or phrase centered horizontally and vertically within the Display_Container with a visually distinct background that contrasts with the surrounding UI.
4. WHEN the Position_Index reaches a point where fewer words remain in the Word_ArrayList than the current Display_Chunk_Size, THE VeloRun_Display SHALL display the remaining words, stop advancing, and display a textual completion indicator in the Display_Container.
5. THE VeloRun_Display SHALL accept a configurable Display_Chunk_Size as an integer value in the range 1 to 5 inclusive, defaulting to 1.
6. IF the user provides a Display_Chunk_Size value outside the range 1 to 5, THEN THE VeloRun_Display SHALL reject the value and retain the current Display_Chunk_Size.

### Requirement 4: Display Rate Configuration

**User Story:** As a user, I want to set and adjust the words-per-minute speed so that I can train at my own pace.

#### Acceptance Criteria

1. THE VeloRun_Display SHALL use a default Display_Rate of 250 words per minute when the user has not provided a custom value.
2. WHEN the user provides a valid custom Display_Rate value, THE VeloRun_Display SHALL update the word display interval to (60,000 / Display_Rate) milliseconds, applied starting from the next word advance cycle.
3. WHILE the display is running, THE VeloRun_Display SHALL allow the user to change the Display_Rate without resetting the Position_Index.
4. IF the user provides a Display_Rate value that is not an integer or is outside the valid range (1–1500 WPM), THEN THE VeloRun_Display SHALL reject the value, retain the current Display_Rate, and display an inline error message indicating the valid range.

### Requirement 5: Font Size Configuration

**User Story:** As a user, I want to change the font size of the displayed word so that I can optimize readability for my preferences.

#### Acceptance Criteria

1. WHEN the user selects a new font size within the valid range (8–72 points), THE VeloRun_Display SHALL update the Display_Container to render words at the selected size.
2. THE VeloRun_Display SHALL use a default font size of 36 points when the user has not specified a preference.
3. WHILE the display is running, THE VeloRun_Display SHALL apply font size changes immediately without resetting the Position_Index.
4. IF the user provides a font size value outside the valid range (8–72 points), THEN THE VeloRun_Display SHALL reject the value and retain the current font size.

### Requirement 6: Start and Pause Controls

**User Story:** As a user, I want start and pause buttons so that I can control when the speed reading begins and take breaks as needed.

#### Acceptance Criteria

1. WHEN the user activates the start control and a Word_ArrayList is loaded, THE VeloRun_Display SHALL begin advancing the Position_Index through words at the current Display_Rate.
2. WHEN the user activates the pause control, THE VeloRun_Display SHALL stop advancing within 50 milliseconds and hold the current word in the Display_Container.
3. WHEN the user activates the start control after a pause, THE VeloRun_Display SHALL resume from the Position_Index where it was paused.
4. WHILE the display is paused, THE VeloRun_Display SHALL continue to show the last displayed word in the Display_Container.
5. IF the user activates the start control when the Position_Index has reached the end of the Word_ArrayList, THEN THE VeloRun_Display SHALL reset the Position_Index to 0 and begin advancing from the first word.
6. IF the user activates the start control when no Word_ArrayList is loaded, THEN THE VeloRun_Display SHALL not advance and SHALL indicate that no document is available.

### Requirement 7: Auto-Pause Between Paragraphs

**User Story:** As a user, I want the display to automatically pause between paragraphs so that I can gather my thoughts before the next section.

#### Acceptance Criteria

1. WHEN the VeloRun_Display encounters a Paragraph_Sentinel in the Word_ArrayList, THE VeloRun_Display SHALL pause the display automatically and set the display state to auto-paused.
2. WHILE the display is auto-paused at a Paragraph_Sentinel, THE VeloRun_Display SHALL display a visual paragraph break indicator (e.g., a horizontal rule or "¶" symbol) in the Display_Container instead of a word.
3. WHEN the user activates the start control during an auto-pause, THE VeloRun_Display SHALL advance the Position_Index past the Paragraph_Sentinel and resume displaying words from the next word in the Word_ArrayList.
4. THE VeloRun_Display SHALL never render a Paragraph_Sentinel as readable text in the Display_Container.
5. WHEN multiple consecutive Paragraph_Sentinels exist in the Word_ArrayList, THE VeloRun_Display SHALL skip all consecutive sentinels and pause only once, with the Position_Index advancing past all consecutive sentinels upon resume.

### Requirement 8: Interactive Document Tracker

**User Story:** As a user, I want to see the full original text with a highlight tracking the current word so that I can follow along and jump back to any word I missed.

#### Acceptance Criteria

1. THE Document_Tracker SHALL display the full original document text in a separate tab or panel, rendering Paragraph_Sentinels as visual paragraph breaks rather than as selectable words.
2. WHILE the display is running or paused, THE Document_Tracker SHALL visually distinguish the word that corresponds to the current Position_Index from all other words in the text.
3. WHEN the VeloRun_Display advances the Position_Index, THE Document_Tracker SHALL move the highlight to the corresponding word in the original text and scroll the view so that the highlighted word is visible within the panel viewport.
4. WHEN the user clicks on a word in the Document_Tracker, THE VeloRun_Display SHALL update the Position_Index to the selected word's index in the existing Word_ArrayList and pause, without creating a new Word_ArrayList.
5. WHEN the user clicks on a word in the Document_Tracker, THE Document_Tracker SHALL update the highlight to the newly selected word.
6. THE VeloRun_Display SHALL reuse the same Word_ArrayList instance for all position resets to minimize memory allocation.

### Requirement 9: Memory-Efficient Position Management

**User Story:** As a developer, I want the system to reuse a single Word_ArrayList per document so that memory consumption stays predictable regardless of how often the user resets position.

#### Acceptance Criteria

1. THE VeloRead_Parser SHALL create exactly one Word_ArrayList instance per uploaded document.
2. WHEN the user resets the display position to a valid index (0 to Word_ArrayList size minus 1), THE VeloRun_Display SHALL update the Position_Index to the target location within the existing Word_ArrayList without allocating a new list.
3. IF the user attempts to reset the display position to an index outside the valid range (less than 0 or greater than or equal to the Word_ArrayList size), THEN THE VeloRun_Display SHALL retain the current Position_Index unchanged.
4. THE VeloRun_Display SHALL navigate forward and backward in the Word_ArrayList using the Position_Index only, without copying or recreating the underlying data structure.
5. WHEN the Position_Index is at 0, THE VeloRun_Display SHALL not navigate backward and SHALL retain the Position_Index at 0.
6. WHEN a new document is uploaded, THE VeloRead_Parser SHALL replace the previous Word_ArrayList with a new instance for the new document and THE VeloRun_Display SHALL reset the Position_Index to 0.
