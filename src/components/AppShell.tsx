import type { ReactNode } from "react";
import Link from "next/link";
import { CirclePlay, DatabaseZap, ExternalLink, Github, MessageSquare, ShieldCheck, Workflow } from "lucide-react";
import { Stepper } from "@/components/Stepper";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Select } from "@/components/ui/Select";
import { useI18n } from "@/state/I18nContext";
import type { Language } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
  currentStep: number | null;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

const githubUrl = "https://github.com/LA-Referencia-Lyrasis-Project/dspace-darkid-importer";
const feedbackUrl = "https://github.com/LA-Referencia-Lyrasis-Project/dspace-darkid-importer/issues";
const laReferenciaUrl = "https://www.lareferencia.info/";

export function AppShell({ children, currentStep, theme, onToggleTheme }: AppShellProps) {
  const { language, setLanguage, t } = useI18n();
  const isHome = currentStep === 1;

  return (
    <div className="flex min-h-dvh w-full flex-col overflow-x-clip">
      <header className="border-b bg-card/95">
        <div className={cn("mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between", isHome ? "py-3" : "py-4")}>
          <Link className="flex min-w-0 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href="/">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <DatabaseZap className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold leading-tight">{t.app.title}</h1>
              <p className="text-sm text-muted-foreground">{t.app.subtitle}</p>
            </div>
          </Link>
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

      <main className={cn("mx-auto w-full max-w-6xl flex-1 px-4", isHome ? "py-4" : "py-6")}>
        {currentStep ? <Stepper currentStep={currentStep} /> : null}
        <div className={cn(isHome ? "mt-4" : "mt-6")}>{children}</div>
      </main>

      <footer className="overflow-x-hidden border-t bg-card/80">
        <div className={cn("mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between", isHome ? "py-3" : "py-5")}>
          <p className="min-w-0">
            © 2026{" "}
            <a className="font-medium text-foreground hover:underline" href={laReferenciaUrl} rel="noreferrer" target="_blank">
              LA Referencia
            </a>
            . {t.footer.rightsReserved}
          </p>
          <nav aria-label={t.footer.ariaLabel} className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 md:justify-end">
            <Link className="inline-flex min-w-0 max-w-full items-center gap-1.5 hover:text-foreground" href="/how-it-works">
              <Workflow className="h-4 w-4 shrink-0" />
              <span className="min-w-0 break-words">{t.footer.howItWorks}</span>
            </Link>
            <Link className="inline-flex min-w-0 max-w-full items-center gap-1.5 hover:text-foreground" href="/tutorial">
              <CirclePlay className="h-4 w-4 shrink-0" />
              <span className="min-w-0 break-words">{t.footer.tutorial}</span>
            </Link>
            <Link className="inline-flex min-w-0 max-w-full items-center gap-1.5 hover:text-foreground" href="/privacy-policy">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span className="min-w-0 break-words">{t.footer.privacyPolicy}</span>
            </Link>
            <a className="inline-flex min-w-0 max-w-full items-center gap-1.5 hover:text-foreground" href={githubUrl} rel="noreferrer" target="_blank">
              <Github className="h-4 w-4 shrink-0" />
              <span className="min-w-0 break-words">{t.footer.github}</span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </a>
            <a className="inline-flex min-w-0 max-w-full items-center gap-1.5 hover:text-foreground" href={feedbackUrl} rel="noreferrer" target="_blank">
              <MessageSquare className="h-4 w-4 shrink-0" />
              <span className="min-w-0 break-words">{t.footer.feedback}</span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
