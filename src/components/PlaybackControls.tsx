import { useAppContext } from "../context/AppContext";

/**
 * PlaybackControls provides start/pause/resume/restart buttons
 * for the VeloRun display engine.
 *
 * Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 7.3
 */
export function PlaybackControls() {
  const { state, dispatch } = useAppContext();
  const { displayState, wordList } = state;

  const isDocumentLoaded = wordList !== null && wordList.length > 0;
  const isRunning = displayState === "running";

  function getButtonLabel(): string {
    if (isRunning) return "Pause";
    if (displayState === "paused" || displayState === "auto-paused") return "Resume";
    if (displayState === "completed") return "Restart";
    return "Start";
  }

  function handleStartResume() {
    dispatch({ type: "START" });
  }

  function handlePause() {
    dispatch({ type: "PAUSE" });
  }

  const label = getButtonLabel();
  const showNoDocMessage = !isDocumentLoaded && !isRunning;

  return (
    <div className="playback-controls" role="group" aria-label="Playback controls">
      {isRunning ? (
        <button
          type="button"
          onClick={handlePause}
          aria-label="Pause"
        >
          {label}
        </button>
      ) : (
        <button
          type="button"
          onClick={handleStartResume}
          disabled={!isDocumentLoaded}
          aria-label={label}
        >
          {label}
        </button>
      )}
      {showNoDocMessage && !isDocumentLoaded && (
        <p className="playback-message" role="status">
          No document loaded
        </p>
      )}
    </div>
  );
}
