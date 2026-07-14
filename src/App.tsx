import { AppProvider, useAppContext } from "./context/AppContext";
import { useDisplayRunner } from "./hooks/useDisplayRunner";
import { Layout } from "./components/Layout";
import "./App.css";

/**
 * AppContent — wrapper component that integrates useDisplayRunner
 * within the AppProvider context. This is needed because useDisplayRunner
 * requires access to state/dispatch from context.
 */
function AppContent() {
  const { state, dispatch } = useAppContext();
  useDisplayRunner(state, dispatch);
  return <Layout />;
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
