import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SurgeryStatus } from "@/hooks/useOT";

interface OTStatusBadgeProps {
  status: SurgeryStatus;
  className?: string;
}

const statusConfig: Record<SurgeryStatus, { label: string; variant: string }> = {
  scheduled: { label: "Scheduled", variant: "bg-blue-100 text-blue-700 border-blue-200" },
  pre_op: { label: "Pre-Op", variant: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  in_progress: { label: "In Progress", variant: "bg-purple-100 text-purple-700 border-purple-200" },
  completed: { label: "Completed", variant: "bg-green-100 text-green-700 border-green-200" },
  cancelled: { label: "Cancelled", variant: "bg-red-100 text-red-700 border-red-200" },
  postponed: { label: "Postponed", variant: "bg-orange-100 text-orange-700 border-orange-200" },
};

export function OTStatusBadge({ status, className }: OTStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.scheduled;

  return (
    <Badge 
      variant="outline" 
      className={cn(config.variant, "font-medium", className)}
    >
      {config.label}
    </Badge>
  );
}
