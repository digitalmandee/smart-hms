import { cn } from "@/lib/utils";
import { TriageLevel, TRIAGE_LEVELS } from "@/hooks/useEmergency";

interface TriageBadgeProps {
  level: TriageLevel | null;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
}

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  red: { bg: "bg-red-500", text: "text-white", border: "border-red-600" },
  orange: { bg: "bg-orange-500", text: "text-white", border: "border-orange-600" },
  yellow: { bg: "bg-yellow-400", text: "text-yellow-900", border: "border-yellow-500" },
  green: { bg: "bg-green-500", text: "text-white", border: "border-green-600" },
  blue: { bg: "bg-blue-500", text: "text-white", border: "border-blue-600" },
};

const sizeClasses = {
  sm: "h-6 px-2 text-xs",
  md: "h-8 px-3 text-sm",
  lg: "h-10 px-4 text-base font-semibold",
};

export const TriageBadge = ({ level, showLabel = true, size = "md", animate = false }: TriageBadgeProps) => {
  if (!level) {
    return (
      <span className={cn(
        "inline-flex items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/40 bg-muted",
        sizeClasses[size]
      )}>
        {showLabel ? "Not Triaged" : "?"}
      </span>
    );
  }

  const triageInfo = TRIAGE_LEVELS.find(t => t.level === level);
  if (!triageInfo) return null;

  const colors = colorClasses[triageInfo.color];
  const shouldAnimate = animate && (level === "1" || level === "2");

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium border-2 transition-all",
        colors.bg,
        colors.text,
        colors.border,
        sizeClasses[size],
        shouldAnimate && "animate-pulse shadow-lg"
      )}
    >
      {showLabel ? `L${level} - ${triageInfo.name}` : `L${level}`}
    </span>
  );
};
