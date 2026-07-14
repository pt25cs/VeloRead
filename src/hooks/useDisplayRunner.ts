import { useEffect, useRef } from "react";
import { VeloRunState, VeloRunAction } from "../modules/display/display-state";

/**
 * Custom hook that manages the setInterval lifecycle for the display runner.
 * - Starts/stops interval based on displayState === "running"
 * - Dispatches ADVANCE action on each tick
 * - Recalculates interval when displayRate changes
 * - Cleans up interval on unmount
 */
export function useDisplayRunner(
  state: VeloRunState,
  dispatch: React.Dispatch<VeloRunAction>
): void {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (state.displayState === "running") {
      const intervalMs = 60000 / state.config.displayRate;

      intervalRef.current = setInterval(() => {
        dispatch({ type: "ADVANCE" });
      }, intervalMs);
    } else {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state.displayState, state.config.displayRate, dispatch]);
}
