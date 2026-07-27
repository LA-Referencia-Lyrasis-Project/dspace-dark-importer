import type { ReactNode } from "react";
import { DatabaseZap } from "lucide-react";
import { Stepper } from "@/components/Stepper";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Select } from "@/components/ui/Select";
import { useI18n } from "@/state/I18nContext";
import type { Language } from "@/lib/i18n";

interface AppShellProps {
  children: ReactNode;
  currentStep: number;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export function AppShell({ children, currentStep, theme, onToggleTheme }: AppShellProps) {
  const { language, setLanguage, t } = useI18n();

  return (
    <div className="min-h-screen">
      <header className="border-b bg-card/95">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <DatabaseZap className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">{t.app.title}</h1>
              <p className="text-sm text-muted-foreground">{t.app.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <label className="sr-only" htmlFor="language">
              {t.app.languageLabel}
            </label>
            <Select id="language" className="h-9 w-32" value={language} onChange={(event) => setLanguage(event.target.value as Language)}>
              <option value="en">{t.app.english}</option>
              <option value="pt">{t.app.portuguese}</option>
            </Select>
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Stepper currentStep={currentStep} />
        <div className="mt-6">{children}</div>
      </main>
    </div>
  );
}
