"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AppProvider } from "@/state/AppContext";
import { AppShell } from "@/components/AppShell";
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

export function NextAppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <AppProvider>
      <AppShell currentStep={stepForPath(pathname)} theme={theme} onToggleTheme={toggleTheme}>
        {children}
      </AppShell>
    </AppProvider>
  );
}
