import React, { createContext, useContext, useReducer, useState } from "react";
import {
  veloRunReducer,
  INITIAL_STATE,
  VeloRunState,
  VeloRunAction,
} from "../modules/display/display-state";

export interface AppContextValue {
  state: VeloRunState;
  dispatch: React.Dispatch<VeloRunAction>;
  error: string | null;
  setError: (error: string | null) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(veloRunReducer, INITIAL_STATE);
  const [error, setError] = useState<string | null>(null);

  const value: AppContextValue = {
    state,
    dispatch,
    error,
    setError,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
