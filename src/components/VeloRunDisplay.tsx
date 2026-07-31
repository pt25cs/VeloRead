import { useAppContext } from "../context/AppContext";
import { getDisplayWords } from "../modules/display/display-utils";

/**
 * VeloRunDisplay — the centered word display area for the speed reader.
 * Renders current word(s) based on display state, with dynamic font sizing.
 */
export function VeloRunDisplay() {
  const { state } = useAppContext();

  const displayWords = state.wordList
    ? getDisplayWords(state.wordList, state.positionIndex, state.config.displayChunkSize)
    : [];

  function renderContent() {
    switch (state.displayState) {
      case "idle":
        if (!state.wordList) {
          return <span className="velo-display__message">No document loaded</span>;
        }
        return (
          <span className="velo-display__words">
            {displayWords.length > 0 ? displayWords.join(" ") : "Ready"}
          </span>
        );

      case "running":
      case "paused":
        return (
          <span className="velo-display__words">
            {displayWords.join(" ")}
          </span>
        );

      case "auto-paused":
        return <span className="velo-display__indicator">¶</span>;

      case "completed":
        return <span className="velo-display__indicator">✓ Complete</span>;

      default:
        return null;
    }
  }

  return (
    <div
      className="reading-display"
      style={{ fontSize: `${state.config.fontSize}pt` }}
    >
      {renderContent()}
    </div>
  );
}
