import { useState, useEffect, KeyboardEvent } from "react";
import { useAppContext } from "../context/AppContext";
import {
  validateDisplayRate,
  validateFontSize,
  validateChunkSize,
} from "../modules/display/display-utils";

export function SettingsPanel() {
  const { state, dispatch } = useAppContext();
  const { displayRate, fontSize, displayChunkSize } = state.config;

  const [rateInput, setRateInput] = useState(String(displayRate));
  const [fontSizeInput, setFontSizeInput] = useState(String(fontSize));
  const [chunkSizeInput, setChunkSizeInput] = useState(String(displayChunkSize));

  const [rateError, setRateError] = useState<string | null>(null);
  const [fontSizeError, setFontSizeError] = useState<string | null>(null);
  const [chunkSizeError, setChunkSizeError] = useState<string | null>(null);

  // Sync local inputs when config changes externally
  useEffect(() => {
    setRateInput(String(displayRate));
    setRateError(null);
  }, [displayRate]);

  useEffect(() => {
    setFontSizeInput(String(fontSize));
    setFontSizeError(null);
  }, [fontSize]);

  useEffect(() => {
    setChunkSizeInput(String(displayChunkSize));
    setChunkSizeError(null);
  }, [displayChunkSize]);

  function commitDisplayRate() {
    const parsed = Number(rateInput);
    const validated = validateDisplayRate(parsed);
    if (validated !== null) {
      dispatch({ type: "SET_DISPLAY_RATE", rate: validated });
      setRateError(null);
    } else {
      setRateError("Valid range: 1–1500 WPM");
    }
  }

  function commitFontSize() {
    const parsed = Number(fontSizeInput);
    const validated = validateFontSize(parsed);
    if (validated !== null) {
      dispatch({ type: "SET_FONT_SIZE", size: validated });
      setFontSizeError(null);
    } else {
      setFontSizeError("Valid range: 8–72 points");
    }
  }

  function commitChunkSize() {
    const parsed = Number(chunkSizeInput);
    const validated = validateChunkSize(parsed);
    if (validated !== null) {
      dispatch({ type: "SET_CHUNK_SIZE", size: validated });
      setChunkSizeError(null);
    } else {
      setChunkSizeError("Valid range: 1–5 words");
    }
  }

  function handleKeyDown(
    e: KeyboardEvent<HTMLInputElement>,
    commitFn: () => void
  ) {
    if (e.key === "Enter") {
      commitFn();
    }
  }

  return (
    <div className="settings-panel">
      <div className="settings-field">
        <label htmlFor="display-rate-input">
          Display Rate (WPM)
          <span className="helper-text"> — 1 to 1500</span>
        </label>
        <input
          id="display-rate-input"
          type="number"
          min={1}
          max={1500}
          step={1}
          value={rateInput}
          onChange={(e) => setRateInput(e.target.value)}
          onBlur={commitDisplayRate}
          onKeyDown={(e) => handleKeyDown(e, commitDisplayRate)}
          aria-invalid={rateError ? true : undefined}
          aria-describedby={rateError ? "display-rate-error" : undefined}
        />
        {rateError && (
          <span id="display-rate-error" className="field-error" role="alert">
            {rateError}
          </span>
        )}
      </div>

      <div className="settings-field">
        <label htmlFor="font-size-input">
          Font Size (pt)
          <span className="helper-text"> — 8 to 72</span>
        </label>
        <input
          id="font-size-input"
          type="number"
          min={8}
          max={72}
          step={1}
          value={fontSizeInput}
          onChange={(e) => setFontSizeInput(e.target.value)}
          onBlur={commitFontSize}
          onKeyDown={(e) => handleKeyDown(e, commitFontSize)}
          aria-invalid={fontSizeError ? true : undefined}
          aria-describedby={fontSizeError ? "font-size-error" : undefined}
        />
        {fontSizeError && (
          <span id="font-size-error" className="field-error" role="alert">
            {fontSizeError}
          </span>
        )}
      </div>

      <div className="settings-field">
        <label htmlFor="chunk-size-input">
          Chunk Size (words)
          <span className="helper-text"> — 1 to 5</span>
        </label>
        <input
          id="chunk-size-input"
          type="number"
          min={1}
          max={5}
          step={1}
          value={chunkSizeInput}
          onChange={(e) => setChunkSizeInput(e.target.value)}
          onBlur={commitChunkSize}
          onKeyDown={(e) => handleKeyDown(e, commitChunkSize)}
          aria-invalid={chunkSizeError ? true : undefined}
          aria-describedby={chunkSizeError ? "chunk-size-error" : undefined}
        />
        {chunkSizeError && (
          <span id="chunk-size-error" className="field-error" role="alert">
            {chunkSizeError}
          </span>
        )}
      </div>
    </div>
  );
}
