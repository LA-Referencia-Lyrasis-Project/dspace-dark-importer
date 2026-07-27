import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = ["Configuration", "CSV Validation", "Processing", "Results"];

interface StepperProps {
  currentStep: number;
}

export function Stepper({ currentStep }: StepperProps) {
  return (
    <nav aria-label="Import steps" className="grid gap-2 sm:grid-cols-4">
      {steps.map((step, index) => {
        const position = index + 1;
        const isComplete = position < currentStep;
        const isActive = position === currentStep;

        return (
          <div
            key={step}
            className={cn(
              "flex items-center gap-3 rounded-md border bg-card px-3 py-2 text-sm",
              isActive && "border-primary ring-1 ring-primary",
              isComplete && "border-secondary"
            )}
          >
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                isActive && "border-primary bg-primary text-primary-foreground",
                isComplete && "border-secondary bg-secondary text-secondary-foreground"
              )}
            >
              {isComplete ? <Check className="h-4 w-4" /> : position}
            </span>
            <span className="truncate font-medium">{step}</span>
          </div>
        );
      })}
    </nav>
  );
}
