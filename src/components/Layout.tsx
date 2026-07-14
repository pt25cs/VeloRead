import { useAppContext } from "../context/AppContext";
import { VeloRunDisplay } from "./VeloRunDisplay";
import { PlaybackControls } from "./PlaybackControls";
import { DocumentTracker } from "./DocumentTracker";
import { FileUpload } from "./FileUpload";
import { SettingsPanel } from "./SettingsPanel";

/**
 * Layout component — page structure with header, main content area (tabs), and sidebar.
 * Uses flexbox for responsive layout.
 */
export function Layout() {
  const { activeTab, setActiveTab } = useAppContext();

  return (
    <div className="layout">
      <header className="layout__header">
        <h1 className="layout__title">VeloRead</h1>
        <p className="layout__subtitle">Speed Reader</p>
      </header>

      <div className="layout__body">
        <main className="layout__main">
          <div className="tab-panel" role="tablist" aria-label="Content views">
            <button
              role="tab"
              aria-selected={activeTab === "display"}
              className={`tab-panel__tab ${activeTab === "display" ? "tab-panel__tab--active" : ""}`}
              onClick={() => setActiveTab("display")}
              id="tab-display"
              aria-controls="tabpanel-display"
            >
              Display
            </button>
            <button
              role="tab"
              aria-selected={activeTab === "tracker"}
              className={`tab-panel__tab ${activeTab === "tracker" ? "tab-panel__tab--active" : ""}`}
              onClick={() => setActiveTab("tracker")}
              id="tab-tracker"
              aria-controls="tabpanel-tracker"
            >
              Tracker
            </button>
          </div>

          {activeTab === "display" && (
            <div
              role="tabpanel"
              id="tabpanel-display"
              aria-labelledby="tab-display"
              className="tab-panel__content"
            >
              <VeloRunDisplay />
              <PlaybackControls />
            </div>
          )}

          {activeTab === "tracker" && (
            <div
              role="tabpanel"
              id="tabpanel-tracker"
              aria-labelledby="tab-tracker"
              className="tab-panel__content"
            >
              <DocumentTracker />
            </div>
          )}
        </main>

        <aside className="layout__sidebar">
          <FileUpload />
          <SettingsPanel />
        </aside>
      </div>
    </div>
  );
}
