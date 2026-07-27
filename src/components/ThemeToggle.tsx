import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/state/I18nContext";

interface ThemeToggleProps {
  theme: "light" | "dark";
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const Icon = theme === "dark" ? Sun : Moon;
  const { t } = useI18n();

  return (
    <Button variant="ghost" size="icon" onClick={onToggle} aria-label={t.app.toggleTheme} title={t.app.toggleTheme}>
      <Icon className="h-5 w-5" />
    </Button>
  );
}
