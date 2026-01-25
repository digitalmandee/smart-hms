import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SurgeryStatus } from "@/hooks/useOT";

interface OTStatusBadgeProps {
  status: SurgeryStatus;
  className?: string;
}

const statusConfig: Record<SurgeryStatus, { label: string; variant: string }> = {
  requested: { label: "Requested", variant: "bg-gray-100 text-gray-700 border-gray-200" },
  booked: { label: "Booked", variant: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  scheduled: { label: "Scheduled", variant: "bg-blue-100 text-blue-700 border-blue-200" },
  confirmed: { label: "Confirmed", variant: "bg-teal-100 text-teal-700 border-teal-200" },
  rescheduled: { label: "Rescheduled", variant: "bg-amber-100 text-amber-700 border-amber-200" },
  pre_op: { label: "Pre-Op", variant: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  in_progress: { label: "In Progress", variant: "bg-purple-100 text-purple-700 border-purple-200" },
  completed: { label: "Completed", variant: "bg-green-100 text-green-700 border-green-200" },
  cancelled: { label: "Cancelled", variant: "bg-red-100 text-red-700 border-red-200" },
  postponed: { label: "Postponed", variant: "bg-orange-100 text-orange-700 border-orange-200" },
  failed: { label: "Failed", variant: "bg-red-100 text-red-800 border-red-300" },
  expired: { label: "Expired", variant: "bg-slate-100 text-slate-600 border-slate-200" },
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
