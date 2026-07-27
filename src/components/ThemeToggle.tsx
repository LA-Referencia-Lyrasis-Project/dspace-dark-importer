import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ThemeToggleProps {
  theme: "light" | "dark";
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const Icon = theme === "dark" ? Sun : Moon;

  return (
    <Button variant="ghost" size="icon" onClick={onToggle} aria-label="Toggle theme" title="Toggle theme">
      <Icon className="h-5 w-5" />
    </Button>
  );
}
