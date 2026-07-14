import React, { useEffect, useMemo, useRef } from "react";
import { useAppContext } from "../context/AppContext";
import { buildParagraphs } from "../modules/tracker/document-tracker";

const containerStyle: React.CSSProperties = {
  overflowY: "auto",
  height: "400px",
  padding: "1rem",
  border: "1px solid #ccc",
  borderRadius: "4px",
  lineHeight: 1.8,
};

const paragraphStyle: React.CSSProperties = {
  marginBottom: "1rem",
};

const wordStyle: React.CSSProperties = {
  cursor: "pointer",
  padding: "2px 4px",
  borderRadius: "2px",
};

const highlightStyle: React.CSSProperties = {
  ...wordStyle,
  backgroundColor: "#fde047",
};

export function DocumentTracker() {
  const { state, dispatch } = useAppContext();
  const highlightedRef = useRef<HTMLSpanElement | null>(null);

  const paragraphs = useMemo(() => {
    if (!state.wordList) return null;
    return buildParagraphs(state.wordList);
  }, [state.wordList]);

  useEffect(() => {
    if (highlightedRef.current) {
      highlightedRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [state.positionIndex]);

  if (!state.wordList || !paragraphs) {
    return <div style={containerStyle}>No document loaded</div>;
  }

  return (
    <div style={containerStyle}>
      {paragraphs.map((paragraph, pIdx) => (
        <p key={pIdx} style={paragraphStyle}>
          {paragraph.map((entry) => {
            const isHighlighted = entry.globalIndex === state.positionIndex;
            return (
              <span
                key={entry.globalIndex}
                ref={isHighlighted ? highlightedRef : undefined}
                style={isHighlighted ? highlightStyle : wordStyle}
                onClick={() =>
                  dispatch({ type: "SET_POSITION", index: entry.globalIndex })
                }
              >
                {entry.word}{" "}
              </span>
            );
          })}
        </p>
      ))}
    </div>
  );
}
