import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AppProvider } from "../../context/AppContext";
import { ControlBar } from "../ControlBar";

/**
 * Unit tests for ControlBar component.
 *
 * Validates: Requirements 3.1, 3.5
 */

function renderControlBar() {
  return render(
    <AppProvider>
      <ControlBar />
    </AppProvider>
  );
}

describe("ControlBar", () => {
  it("renders with role='group' on the container", () => {
    renderControlBar();
    const group = screen.getByRole("group", {
      name: "Playback and settings controls",
    });
    expect(group).toBeInTheDocument();
  });

  it("has aria-label='Playback and settings controls'", () => {
    renderControlBar();
    const group = screen.getByRole("group", {
      name: "Playback and settings controls",
    });
    expect(group).toHaveAttribute(
      "aria-label",
      "Playback and settings controls"
    );
  });

  it("renders a file input from FileUpload", () => {
    renderControlBar();
    const fileInput = screen.getByLabelText("Upload Document");
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute("type", "file");
  });

  it("renders display rate input from SettingsPanel", () => {
    renderControlBar();
    const rateInput = screen.getByLabelText(/Display Rate/);
    expect(rateInput).toBeInTheDocument();
  });

  it("renders font size input from SettingsPanel", () => {
    renderControlBar();
    const fontSizeInput = screen.getByLabelText(/Font Size/);
    expect(fontSizeInput).toBeInTheDocument();
  });

  it("renders chunk size input from SettingsPanel", () => {
    renderControlBar();
    const chunkSizeInput = screen.getByLabelText(/Chunk Size/);
    expect(chunkSizeInput).toBeInTheDocument();
  });

  it("renders playback Start button from PlaybackControls", () => {
    renderControlBar();
    const startButton = screen.getByRole("button", { name: "Start" });
    expect(startButton).toBeInTheDocument();
  });
});
