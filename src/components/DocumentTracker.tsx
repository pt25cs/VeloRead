import { useEffect, useMemo, useRef } from "react";
import { useAppContext } from "../context/AppContext";
import { buildParagraphs } from "../modules/tracker/document-tracker";

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
    return <div className="document-tracker document-tracker--empty" />;
  }

  return (
    <div className="document-tracker">
      {paragraphs.map((paragraph, pIdx) => (
        <p key={pIdx} className="document-tracker__paragraph">
          {paragraph.map((entry) => {
            const isHighlighted = entry.globalIndex === state.positionIndex;
            return (
              <span
                key={entry.globalIndex}
                ref={isHighlighted ? highlightedRef : undefined}
                className={
                  isHighlighted
                    ? "document-tracker__word document-tracker__word--highlighted"
                    : "document-tracker__word"
                }
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
