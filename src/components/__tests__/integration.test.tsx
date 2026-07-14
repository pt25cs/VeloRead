import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import App from "../../App";
import * as parserModule from "../../modules/parser/parser";
import { parseText } from "../../modules/parser/parser";

// jsdom does not implement scrollIntoView
beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

/**
 * Integration tests for VeloRead Speed Reader.
 * Tests full workflows exercising multiple components together.
 *
 * Validates: Requirements 1.1, 2.1, 3.1, 6.1, 7.1, 8.4
 */

function createMockFile(content: string, name = "test.txt"): File {
  return new File([content], name, { type: "text/plain" });
}

/**
 * Mock processFile to bypass FileReader which doesn't work well with fake timers in jsdom.
 * Uses the real parseText logic so the integration behavior is authentic.
 */
function mockProcessFileForContent(content: string) {
  vi.spyOn(parserModule, "processFile").mockResolvedValue(
    parseText(content)
  );
}

async function uploadFileWithContent(content: string, fileName = "test.txt") {
  mockProcessFileForContent(content);
  const file = createMockFile(content, fileName);
  const input = screen.getByLabelText("Upload Document") as HTMLInputElement;
  await act(async () => {
    fireEvent.change(input, { target: { files: [file] } });
  });
}

describe("Integration: Full upload → parse → display → complete workflow", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("processes a file upload and advances through all words to completion", async () => {
    render(<App />);

    await uploadFileWithContent("Hello world foo bar");

    // After load, display should show the first word
    expect(screen.getByText("Hello")).toBeInTheDocument();

    // Click Start
    const startBtn = screen.getByRole("button", { name: "Start" });
    act(() => {
      fireEvent.click(startBtn);
    });

    // The word list has 4 words at 250 WPM: interval = 60000/250 = 240ms
    // Advance through all 4 words (need 4 ticks to reach end)
    for (let i = 0; i < 4; i++) {
      act(() => {
        vi.advanceTimersByTime(240);
      });
    }

    // Should show completed indicator
    expect(screen.getByText("✓ Complete")).toBeInTheDocument();
  });
});

describe("Integration: Click-to-seek in Document_Tracker updates display position", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("clicking a word in the tracker updates the display to that word", async () => {
    render(<App />);

    await uploadFileWithContent("alpha beta gamma delta epsilon");

    // Switch to Tracker tab
    const trackerTab = screen.getByRole("tab", { name: "Tracker" });
    act(() => {
      fireEvent.click(trackerTab);
    });

    // Click on "gamma" in the document tracker
    const gammaWord = screen.getByText("gamma");
    act(() => {
      fireEvent.click(gammaWord);
    });

    // Switch back to Display tab to verify the word displayed
    const displayTab = screen.getByRole("tab", { name: "Display" });
    act(() => {
      fireEvent.click(displayTab);
    });

    // After SET_POSITION, state is "paused" with positionIndex at gamma (index 2)
    // The display should show "gamma"
    expect(screen.getByText("gamma")).toBeInTheDocument();
  });
});

describe("Integration: Rate change mid-run does not reset position", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("changing display rate while running preserves position", async () => {
    render(<App />);

    await uploadFileWithContent("one two three four five six seven");

    // Start playback
    const startBtn = screen.getByRole("button", { name: "Start" });
    act(() => {
      fireEvent.click(startBtn);
    });

    // Advance 2 ticks (250 WPM → 240ms interval)
    act(() => {
      vi.advanceTimersByTime(240);
    });
    act(() => {
      vi.advanceTimersByTime(240);
    });

    // Position should be at index 2 ("three")
    expect(screen.getByText("three")).toBeInTheDocument();

    // Change the display rate via settings input
    const rateInput = screen.getByLabelText(/Display Rate/);
    act(() => {
      fireEvent.change(rateInput, { target: { value: "300" } });
      fireEvent.blur(rateInput);
    });

    // Position should NOT have reset — "three" should still be displayed
    expect(screen.getByText("three")).toBeInTheDocument();
  });
});

describe("Integration: Auto-pause at paragraph boundary then resume", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("auto-pauses at paragraph sentinel showing ¶, then resumes", async () => {
    render(<App />);

    // Two paragraphs separated by a blank line
    // Parsed wordList: ["word1", "word2", SENTINEL, "word3", "word4"]
    await uploadFileWithContent("word1 word2\n\nword3 word4");

    // Start playback
    const startBtn = screen.getByRole("button", { name: "Start" });
    act(() => {
      fireEvent.click(startBtn);
    });

    // Tick 1: position moves from 0 to 1 (showing "word2")
    act(() => {
      vi.advanceTimersByTime(240);
    });

    // Tick 2: computeNextPosition sees sentinel at index 2, transitions to auto-paused
    act(() => {
      vi.advanceTimersByTime(240);
    });

    // Should show the paragraph sentinel indicator (auto-paused)
    expect(screen.getByText("¶")).toBeInTheDocument();

    // Click Resume
    const resumeBtn = screen.getByRole("button", { name: "Resume" });
    act(() => {
      fireEvent.click(resumeBtn);
    });

    // After resume, sentinel is skipped, and display should show "word3"
    expect(screen.getByText("word3")).toBeInTheDocument();
  });
});

describe("Integration: Tab switching between display and tracker", () => {
  it("switches between Display and Tracker tabs correctly", () => {
    render(<App />);

    // Display tab should be active by default
    const displayTab = screen.getByRole("tab", { name: "Display" });
    const trackerTab = screen.getByRole("tab", { name: "Tracker" });

    expect(displayTab).toHaveAttribute("aria-selected", "true");
    expect(trackerTab).toHaveAttribute("aria-selected", "false");

    // The display tabpanel should be visible
    expect(screen.getByRole("tabpanel")).toBeInTheDocument();

    // Click Tracker tab
    fireEvent.click(trackerTab);

    expect(trackerTab).toHaveAttribute("aria-selected", "true");
    expect(displayTab).toHaveAttribute("aria-selected", "false");

    // Document Tracker content should be visible
    const trackerPanel = screen.getByRole("tabpanel");
    expect(trackerPanel).toHaveAttribute("id", "tabpanel-tracker");

    // Click Display tab back
    fireEvent.click(displayTab);

    expect(displayTab).toHaveAttribute("aria-selected", "true");
    // VeloRunDisplay should be visible again — check tabpanel id
    const displayPanel = screen.getByRole("tabpanel");
    expect(displayPanel).toHaveAttribute("id", "tabpanel-display");
  });
});
