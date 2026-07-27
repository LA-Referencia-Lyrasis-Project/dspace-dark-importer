import React from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertTone = "info" | "success" | "warning" | "error";

const iconMap = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  error: AlertCircle
} satisfies Record<AlertTone, typeof Info>;

const toneClasses: Record<AlertTone, string> = {
  info: "border-primary/30 bg-primary/10",
  success: "border-secondary/30 bg-secondary/10",
  warning: "border-accent/40 bg-accent/10",
  error: "border-destructive/30 bg-destructive/10"
};

export function Alert({ tone = "info", className, children }: React.PropsWithChildren<{ tone?: AlertTone; className?: string }>) {
  const Icon = iconMap[tone];

  return (
    <div className={cn("flex gap-3 rounded-md border p-4 text-sm", toneClasses[tone], className)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
