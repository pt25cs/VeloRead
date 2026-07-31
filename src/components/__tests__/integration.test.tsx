import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import App from "../../App";
import * as parserModule from "../../modules/parser/parser";
import { parseText } from "../../modules/parser/parser";
import { AppProvider, useAppContext } from "../../context/AppContext";

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

    // After load, display should show the first word in the reading display
    const displayElement = document.querySelector(".velo-display__words");
    expect(displayElement).toHaveTextContent("Hello");

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

    // In the new single-column layout, both display and tracker are always visible.
    // Click on "gamma" in the document tracker
    const trackerWords = screen.getAllByText("gamma");
    // The tracker word has the document-tracker__word class
    const gammaInTracker = trackerWords.find(el => el.classList.contains("document-tracker__word"));
    expect(gammaInTracker).toBeDefined();
    act(() => {
      fireEvent.click(gammaInTracker!);
    });

    // After SET_POSITION, state is "paused" with positionIndex at gamma (index 2)
    // The display should show "gamma" in the reading display
    const displayWord = document.querySelector(".velo-display__words");
    expect(displayWord).toHaveTextContent("gamma");
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

    // Position should be at index 2 ("three") — shown in both display and tracker
    const displayElement = document.querySelector(".velo-display__words");
    expect(displayElement).toHaveTextContent("three");

    // Change the display rate via settings input
    const rateInput = screen.getByLabelText(/Display Rate/);
    act(() => {
      fireEvent.change(rateInput, { target: { value: "300" } });
      fireEvent.blur(rateInput);
    });

    // Position should NOT have reset — "three" should still be displayed
    expect(displayElement).toHaveTextContent("three");
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

    // After resume, sentinel is skipped, and display should show "word3" in reading display
    const displayElement = document.querySelector(".velo-display__words");
    expect(displayElement).toHaveTextContent("word3");
  });
});

describe("Integration: Single-column layout structure", () => {
  /**
   * Validates: Requirements 1.1, 1.2, 1.3, 8.1
   */
  it("renders all sections in the correct vertical order without tabs", () => {
    render(<App />);

    // No tab elements should exist
    expect(screen.queryByRole("tab")).toBeNull();
    expect(screen.queryByRole("tablist")).toBeNull();
    expect(screen.queryByRole("tabpanel")).toBeNull();

    // All sections should be visible simultaneously
    const adPlaceholders = document.querySelectorAll(".ad-placeholder");
    expect(adPlaceholders).toHaveLength(2);
    expect(adPlaceholders[0]).toHaveAttribute("data-slot", "top");
    expect(adPlaceholders[1]).toHaveAttribute("data-slot", "bottom");

    // Reading display, control bar, and document tracker should all be present
    expect(document.querySelector(".reading-display")).toBeInTheDocument();
    expect(document.querySelector(".control-bar")).toBeInTheDocument();
    expect(document.querySelector(".document-tracker")).toBeInTheDocument();

    // Verify correct DOM order within app-shell__content
    const content = document.querySelector(".app-shell__content");
    const children = Array.from(content!.children);
    expect(children[0]).toHaveClass("ad-placeholder");
    expect(children[1]).toHaveClass("reading-display");
    expect(children[2]).toHaveClass("control-bar");
    expect(children[3]).toHaveClass("document-tracker");
    expect(children[4]).toHaveClass("ad-placeholder");
  });

  /**
   * Validates: Requirement 8.2
   */
  it("does not render any sidebar (aside) element", () => {
    render(<App />);

    const asideElements = document.querySelectorAll("aside");
    expect(asideElements).toHaveLength(0);
  });

  /**
   * Validates: Requirements 8.1, 8.2, 8.3
   */
  it("AppContext does not expose activeTab or setActiveTab", () => {
    // Verify at runtime that the context value doesn't contain tab-related properties
    let contextValue: Record<string, unknown> | undefined;

    function ContextInspector() {
      const ctx = useAppContext();
      contextValue = ctx as unknown as Record<string, unknown>;
      return null;
    }

    render(
      <AppProvider>
        <ContextInspector />
      </AppProvider>
    );

    expect(contextValue).toBeDefined();
    expect(contextValue).not.toHaveProperty("activeTab");
    expect(contextValue).not.toHaveProperty("setActiveTab");
  });
});
