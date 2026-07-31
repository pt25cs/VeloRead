import { VeloRunDisplay } from "./VeloRunDisplay";
import { ControlBar } from "./ControlBar";
import { DocumentTracker } from "./DocumentTracker";
import { AdPlaceholder } from "./AdPlaceholder";

/**
 * Layout component — single-column vertical layout with header and content sections.
 * All content stacks vertically: Ad(top) → Display → ControlBar → Tracker → Ad(bottom).
 */
export function Layout() {
  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <h1 className="layout__title">VeloRead</h1>
        <p className="layout__subtitle">Speed Reader</p>
      </header>
      <div className="app-shell__content">
        <AdPlaceholder position="top" />
        <VeloRunDisplay />
        <ControlBar />
        <DocumentTracker />
        <AdPlaceholder position="bottom" />
      </div>
    </div>
  );
}
