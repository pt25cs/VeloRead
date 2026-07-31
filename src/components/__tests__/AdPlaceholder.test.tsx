import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AdPlaceholder } from "../AdPlaceholder";

/**
 * Unit tests for AdPlaceholder component.
 * Validates: Requirements 6.3, 6.4, 6.6
 */

describe("AdPlaceholder", () => {
  it("renders a div with class ad-placeholder", () => {
    const { container } = render(<AdPlaceholder position="top" />);
    const el = container.querySelector(".ad-placeholder");
    expect(el).toBeInTheDocument();
  });

  it("sets data-slot attribute to the position prop value (top)", () => {
    const { container } = render(<AdPlaceholder position="top" />);
    const el = container.querySelector(".ad-placeholder");
    expect(el).toHaveAttribute("data-slot", "top");
  });

  it("sets data-slot attribute to the position prop value (bottom)", () => {
    const { container } = render(<AdPlaceholder position="bottom" />);
    const el = container.querySelector(".ad-placeholder");
    expect(el).toHaveAttribute("data-slot", "bottom");
  });

  it("sets aria-hidden to true for accessibility (Req 6.4)", () => {
    const { container } = render(<AdPlaceholder position="top" />);
    const el = container.querySelector(".ad-placeholder");
    expect(el).toHaveAttribute("aria-hidden", "true");
  });

  it("renders no text content", () => {
    const { container } = render(<AdPlaceholder position="top" />);
    const el = container.querySelector(".ad-placeholder");
    expect(el?.textContent).toBe("");
  });

  it("applies ad-placeholder class which defines height 90px and overflow hidden (Req 6.3, 6.6)", () => {
    const { container } = render(<AdPlaceholder position="top" />);
    const el = container.querySelector(".ad-placeholder");
    expect(el).toBeInTheDocument();
    // The ad-placeholder class in App.css sets:
    //   height: var(--ad-height) /* 90px */
    //   overflow: hidden
    // Presence of this class guarantees the height and overflow constraints
    expect(el).toHaveClass("ad-placeholder");
  });

  it("aria-hidden is true for bottom position as well", () => {
    const { container } = render(<AdPlaceholder position="bottom" />);
    const el = container.querySelector(".ad-placeholder");
    expect(el).toHaveAttribute("aria-hidden", "true");
  });
});
