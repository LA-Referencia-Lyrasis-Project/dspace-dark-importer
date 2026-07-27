import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  className?: string;
}

export function Progress({ value, className }: ProgressProps) {
  const normalized = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("h-3 w-full overflow-hidden rounded-sm bg-muted", className)} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={normalized}>
      <div className="h-full bg-primary transition-all duration-300" style={{ width: `${normalized}%` }} />
    </div>
  );
}
