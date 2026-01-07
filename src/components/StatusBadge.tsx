import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusType = 
  | "active" 
  | "inactive" 
  | "trial" 
  | "suspended" 
  | "cancelled" 
  | "pending"
  | "success"
  | "warning"
  | "info";

interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
}

const statusStyles: Record<StatusType, string> = {
  active: "bg-success/10 text-success border-success/20",
  inactive: "bg-muted text-muted-foreground border-muted",
  trial: "bg-info/10 text-info border-info/20",
  suspended: "bg-destructive/10 text-destructive border-destructive/20",
  cancelled: "bg-muted text-muted-foreground border-muted",
  pending: "bg-warning/10 text-warning border-warning/20",
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  info: "bg-info/10 text-info border-info/20",
};

const statusLabels: Record<StatusType, string> = {
  active: "Active",
  inactive: "Inactive",
  trial: "Trial",
  suspended: "Suspended",
  cancelled: "Cancelled",
  pending: "Pending",
  success: "Success",
  warning: "Warning",
  info: "Info",
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase() as StatusType;
  const styles = statusStyles[normalizedStatus] || statusStyles.inactive;
  const displayLabel = label || statusLabels[normalizedStatus] || status;

  return (
    <Badge
      variant="outline"
      className={cn("font-medium capitalize", styles)}
    >
      {displayLabel}
    </Badge>
  );
}
