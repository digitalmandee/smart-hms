import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

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

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const { t } = useTranslation();
  const normalizedStatus = status.toLowerCase() as StatusType;
  const styles = statusStyles[normalizedStatus] || statusStyles.inactive;

  const getDefaultLabel = (): string => {
    switch (normalizedStatus) {
      case "active": return t("status.active");
      case "inactive": return t("status.inactive");
      case "trial": return t("status.trial");
      case "suspended": return t("status.suspended");
      case "cancelled": return t("common.cancelled");
      case "pending": return t("common.pending");
      case "success": return t("status.success");
      case "warning": return t("status.warning");
      case "info": return t("status.info");
      default: return status;
    }
  };

  const displayLabel = label || getDefaultLabel();

  return (
    <Badge
      variant="outline"
      className={cn("font-medium capitalize", styles)}
    >
      {displayLabel}
    </Badge>
  );
}
