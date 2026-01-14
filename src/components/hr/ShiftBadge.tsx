import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShiftBadgeProps {
  shift: {
    name: string;
    code?: string | null;
    start_time: string;
    end_time: string;
    color?: string | null;
  };
  showTime?: boolean;
  size?: "sm" | "md";
}

export function ShiftBadge({ shift, showTime = false, size = "md" }: ShiftBadgeProps) {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-normal gap-1",
        size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-2.5 py-1"
      )}
      style={{
        backgroundColor: shift.color ? `${shift.color}15` : undefined,
        borderColor: shift.color || undefined,
        color: shift.color || undefined,
      }}
    >
      <Clock className={cn("shrink-0", size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />
      <span>{shift.code || shift.name}</span>
      {showTime && (
        <span className="text-muted-foreground ml-1">
          ({formatTime(shift.start_time)} - {formatTime(shift.end_time)})
        </span>
      )}
    </Badge>
  );
}
