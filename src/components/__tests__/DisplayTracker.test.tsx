import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { VeloRunDisplay } from "../VeloRunDisplay";
import { DocumentTracker } from "../DocumentTracker";
import { INITIAL_STATE, VeloRunState } from "../../modules/display/display-state";
import { WordArrayList } from "../../modules/types";

// jsdom does not implement scrollIntoView
beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

// Mock useAppContext at module level so we can control state per test
vi.mock("../../context/AppContext", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../context/AppContext")>();
  return {
    ...actual,
    useAppContext: vi.fn(),
  };
});

import { useAppContext } from "../../context/AppContext";
const mockUseAppContext = vi.mocked(useAppContext);

function setupContext(stateOverrides: Partial<VeloRunState> = {}) {
  const state: VeloRunState = { ...INITIAL_STATE, ...stateOverrides };
  mockUseAppContext.mockReturnValue({
    state,
    dispatch: vi.fn(),
    error: null,
    setError: vi.fn(),
  });
}

/**
 * Unit tests for VeloRunDisplay and DocumentTracker components.
 * Validates: Requirements 4.3, 4.6, 5.4, 5.5
 */

describe("VeloRunDisplay", () => {
  it('renders with className containing "reading-display"', () => {
    setupContext();
    const { container } = render(<VeloRunDisplay />);
    const displayEl = container.querySelector(".reading-display");
    expect(displayEl).toBeInTheDocument();
  });

  it('shows "No document loaded" when state has no wordList (idle, no document)', () => {
    setupContext({ wordList: null, displayState: "idle" });
    render(<VeloRunDisplay />);
    expect(screen.getByText("No document loaded")).toBeInTheDocument();
  });
});

describe("DocumentTracker", () => {
  it('renders with "document-tracker" class', () => {
    const wordList: WordArrayList = ["hello", "world"];
    setupContext({ wordList, positionIndex: 0 });
    const { container } = render(<DocumentTracker />);
    const trackerEl = container.querySelector(".document-tracker");
    expect(trackerEl).toBeInTheDocument();
  });

  it('renders with "document-tracker--empty" class when no document loaded', () => {
    setupContext({ wordList: null });
    const { container } = render(<DocumentTracker />);
    const trackerEl = container.querySelector(".document-tracker--empty");
    expect(trackerEl).toBeInTheDocument();
  });

  it("renders no text content when no document loaded (empty/collapsed)", () => {
    setupContext({ wordList: null });
    const { container } = render(<DocumentTracker />);
    const trackerEl = container.querySelector(".document-tracker--empty");
    expect(trackerEl).toBeInTheDocument();
    expect(trackerEl!.textContent).toBe("");
  });

  it('highlighted word has "document-tracker__word--highlighted" class when document is loaded', () => {
    const wordList: WordArrayList = ["alpha", "beta", "gamma"];
    setupContext({ wordList, positionIndex: 1 });
    const { container } = render(<DocumentTracker />);
    const highlighted = container.querySelector(".document-tracker__word--highlighted");
    expect(highlighted).toBeInTheDocument();
    expect(highlighted!.textContent?.trim()).toBe("beta");
  });
});
