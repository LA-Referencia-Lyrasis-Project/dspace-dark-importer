import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppProvider } from "@/app/AppContext";
import { AppShell } from "@/components/AppShell";
import { ConfigurationPage } from "@/pages/ConfigurationPage";
import { ProcessingPage } from "@/pages/ProcessingPage";
import { ResultsPage } from "@/pages/ResultsPage";
import { ValidationPage } from "@/pages/ValidationPage";
import { useTheme } from "@/hooks/useTheme";

function stepForPath(pathname: string): number {
  if (pathname.startsWith("/validation")) {
    return 2;
  }

  if (pathname.startsWith("/processing")) {
    return 3;
  }

  if (pathname.startsWith("/results")) {
    return 4;
  }

  return 1;
}

function AppRoutes() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <AppShell currentStep={stepForPath(location.pathname)} theme={theme} onToggleTheme={toggleTheme}>
      <Routes>
        <Route path="/" element={<ConfigurationPage />} />
        <Route path="/validation" element={<ValidationPage />} />
        <Route path="/processing" element={<ProcessingPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}
