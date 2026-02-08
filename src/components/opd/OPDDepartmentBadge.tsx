import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface OPDDepartmentBadgeProps {
  code: string;
  name?: string;
  color?: string | null;
  showName?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function OPDDepartmentBadge({
  code,
  name,
  color,
  showName = false,
  size = "md",
  className,
}: OPDDepartmentBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-xs px-2 py-0.5",
    lg: "text-sm px-2.5 py-1",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-mono font-semibold border-2",
        sizeClasses[size],
        className
      )}
      style={{
        borderColor: color || "#3b82f6",
        color: color || "#3b82f6",
        backgroundColor: `${color || "#3b82f6"}15`,
      }}
    >
      {showName && name ? `${name} (${code})` : code}
    </Badge>
  );
}

interface OPDTokenBadgeProps {
  tokenNumber: number | null;
  departmentCode?: string | null;
  departmentColor?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function OPDTokenBadge({
  tokenNumber,
  departmentCode,
  departmentColor,
  size = "md",
  className,
}: OPDTokenBadgeProps) {
  const sizeClasses = {
    sm: "text-sm px-2 py-0.5",
    md: "text-base px-2.5 py-1",
    lg: "text-lg px-3 py-1.5 font-bold",
    xl: "text-2xl px-4 py-2 font-bold",
  };

  const token = tokenNumber ? String(tokenNumber).padStart(3, "0") : "-";
  const display = departmentCode ? `${departmentCode}-${token}` : token;

  return (
    <Badge
      variant="secondary"
      className={cn(
        "font-mono tabular-nums",
        sizeClasses[size],
        className
      )}
      style={
        departmentColor
          ? {
              borderColor: departmentColor,
              backgroundColor: `${departmentColor}20`,
              color: departmentColor,
            }
          : undefined
      }
    >
      {display}
    </Badge>
  );
}
