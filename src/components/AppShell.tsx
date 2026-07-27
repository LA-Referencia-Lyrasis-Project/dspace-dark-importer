import type { ReactNode } from "react";
import { DatabaseZap } from "lucide-react";
import { Stepper } from "@/components/Stepper";
import { ThemeToggle } from "@/components/ThemeToggle";

interface AppShellProps {
  children: ReactNode;
  currentStep: number;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export function AppShell({ children, currentStep, theme, onToggleTheme }: AppShellProps) {
  return (
    <div className="min-h-screen">
      <header className="border-b bg-card/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <DatabaseZap className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">DSpace Dark ID Import</h1>
              <p className="text-sm text-muted-foreground">Bulk append metadata to existing items</p>
            </div>
          </div>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Stepper currentStep={currentStep} />
        <div className="mt-6">{children}</div>
      </main>
    </div>
  );
}
