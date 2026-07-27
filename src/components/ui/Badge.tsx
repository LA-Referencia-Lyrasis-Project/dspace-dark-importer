import React from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "default" | "success" | "warning" | "error" | "muted";

const toneClasses: Record<BadgeTone, string> = {
  default: "bg-primary/12 text-primary",
  success: "bg-secondary/15 text-secondary",
  warning: "bg-accent/20 text-foreground",
  error: "bg-destructive/15 text-destructive",
  muted: "bg-muted text-muted-foreground"
};

export function Badge({ className, tone = "default", ...props }: React.HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return <span className={cn("inline-flex rounded-sm px-2 py-1 text-xs font-medium", toneClasses[tone], className)} {...props} />;
}
