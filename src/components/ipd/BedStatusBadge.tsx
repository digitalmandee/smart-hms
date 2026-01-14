import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type BedStatus = "available" | "occupied" | "reserved" | "maintenance" | "cleaning";

interface BedStatusBadgeProps {
  status: BedStatus | string;
  size?: "sm" | "md";
}

const statusConfig: Record<BedStatus, { label: string; className: string }> = {
  available: {
    label: "Available",
    className: "bg-success/10 text-success border-success/20",
  },
  occupied: {
    label: "Occupied",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  reserved: {
    label: "Reserved",
    className: "bg-warning/10 text-warning border-warning/20",
  },
  maintenance: {
    label: "Maintenance",
    className: "bg-muted text-muted-foreground border-muted",
  },
  cleaning: {
    label: "Cleaning",
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
};

export const BedStatusBadge = ({ status, size = "md" }: BedStatusBadgeProps) => {
  const config = statusConfig[status as BedStatus] || {
    label: status,
    className: "bg-muted text-muted-foreground",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        config.className,
        size === "sm" && "text-xs px-1.5 py-0"
      )}
    >
      {config.label}
    </Badge>
  );
};
