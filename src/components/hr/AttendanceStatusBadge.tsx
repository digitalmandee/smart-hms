import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type AttendanceStatus = 
  | "present" 
  | "absent" 
  | "half_day" 
  | "late" 
  | "on_leave" 
  | "weekend" 
  | "holiday"
  | "work_from_home";

interface AttendanceStatusBadgeProps {
  status: AttendanceStatus | string | null;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const statusConfig: Record<string, { label: string; short: string; className: string }> = {
  present: {
    label: "Present",
    short: "P",
    className: "bg-green-500/10 text-green-700 border-green-200 hover:bg-green-500/20",
  },
  absent: {
    label: "Absent",
    short: "A",
    className: "bg-red-500/10 text-red-700 border-red-200 hover:bg-red-500/20",
  },
  half_day: {
    label: "Half Day",
    short: "H",
    className: "bg-orange-500/10 text-orange-700 border-orange-200 hover:bg-orange-500/20",
  },
  late: {
    label: "Late",
    short: "L",
    className: "bg-yellow-500/10 text-yellow-700 border-yellow-200 hover:bg-yellow-500/20",
  },
  on_leave: {
    label: "On Leave",
    short: "OL",
    className: "bg-blue-500/10 text-blue-700 border-blue-200 hover:bg-blue-500/20",
  },
  weekend: {
    label: "Weekend",
    short: "WO",
    className: "bg-gray-500/10 text-gray-500 border-gray-200 hover:bg-gray-500/20",
  },
  holiday: {
    label: "Holiday",
    short: "HD",
    className: "bg-purple-500/10 text-purple-700 border-purple-200 hover:bg-purple-500/20",
  },
  work_from_home: {
    label: "WFH",
    short: "WFH",
    className: "bg-cyan-500/10 text-cyan-700 border-cyan-200 hover:bg-cyan-500/20",
  },
};

export function AttendanceStatusBadge({
  status,
  size = "md",
  showLabel = false,
}: AttendanceStatusBadgeProps) {
  const config = status ? statusConfig[status] : null;

  if (!config) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        -
      </Badge>
    );
  }

  const sizeClasses = {
    sm: "h-5 min-w-5 text-[10px] px-1",
    md: "h-6 min-w-6 text-xs px-1.5",
    lg: "h-7 min-w-7 text-sm px-2",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium",
        config.className,
        sizeClasses[size],
        !showLabel && "justify-center"
      )}
    >
      {showLabel ? config.label : config.short}
    </Badge>
  );
}
