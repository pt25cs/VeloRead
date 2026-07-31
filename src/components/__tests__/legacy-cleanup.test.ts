import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

/**
 * Static analysis tests verifying that legacy tab-panel and sidebar
 * CSS selectors and class references have been fully removed.
 *
 * Validates: Requirement 8.4
 */

const projectRoot = resolve(__dirname, "../../..");
const cssContent = readFileSync(resolve(projectRoot, "src/App.css"), "utf-8");

const componentFiles = [
  "src/components/Layout.tsx",
  "src/components/VeloRunDisplay.tsx",
  "src/components/DocumentTracker.tsx",
  "src/components/PlaybackControls.tsx",
  "src/components/SettingsPanel.tsx",
  "src/components/FileUpload.tsx",
  "src/components/ControlBar.tsx",
  "src/components/AdPlaceholder.tsx",
];

describe("Legacy CSS selector cleanup", () => {
  it("CSS does not contain .tab-panel selector", () => {
    expect(cssContent).not.toMatch(/\.tab-panel\b/);
  });

  it("CSS does not contain .tab-panel__tab selector", () => {
    expect(cssContent).not.toMatch(/\.tab-panel__tab\b/);
  });

  it("CSS does not contain .tab-panel__tab--active selector", () => {
    expect(cssContent).not.toMatch(/\.tab-panel__tab--active/);
  });

  it("CSS does not contain .tab-panel__content selector", () => {
    expect(cssContent).not.toMatch(/\.tab-panel__content/);
  });

  it("CSS does not contain .layout__sidebar selector", () => {
    expect(cssContent).not.toMatch(/\.layout__sidebar/);
  });
});

describe("Legacy class name references in components", () => {
  for (const filePath of componentFiles) {
    it(`${filePath} does not reference tab-panel__tab class names`, () => {
      const fullPath = resolve(projectRoot, filePath);
      const content = readFileSync(fullPath, "utf-8");
      expect(content).not.toMatch(/tab-panel__tab/);
    });
  }

  for (const filePath of componentFiles) {
    it(`${filePath} does not reference tab-panel class names`, () => {
      const fullPath = resolve(projectRoot, filePath);
      const content = readFileSync(fullPath, "utf-8");
      expect(content).not.toMatch(/tab-panel/);
    });
  }

  for (const filePath of componentFiles) {
    it(`${filePath} does not reference layout__sidebar class name`, () => {
      const fullPath = resolve(projectRoot, filePath);
      const content = readFileSync(fullPath, "utf-8");
      expect(content).not.toMatch(/layout__sidebar/);
    });
  }
});
