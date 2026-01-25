import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import type { SurgeryStatus } from "@/hooks/useOT";
import { otLogger } from "@/lib/logger";

interface OTStatusBadgeProps {
  status: SurgeryStatus;
  scheduledDate?: string;
  scheduledTime?: string;
  className?: string;
}

const statusConfig: Record<SurgeryStatus, { label: string; variant: string }> = {
  requested: { label: "Requested", variant: "bg-gray-100 text-gray-700 border-gray-200" },
  booked: { label: "Booked", variant: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  on_hold: { label: "On Hold", variant: "bg-orange-100 text-orange-700 border-orange-200" },
  scheduled: { label: "Scheduled", variant: "bg-blue-100 text-blue-700 border-blue-200" },
  confirmed: { label: "Confirmed", variant: "bg-teal-100 text-teal-700 border-teal-200" },
  rescheduled: { label: "Rescheduled", variant: "bg-amber-100 text-amber-700 border-amber-200" },
  pre_op: { label: "Pre-Op", variant: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  ready: { label: "Ready", variant: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  in_progress: { label: "In Progress", variant: "bg-purple-100 text-purple-700 border-purple-200" },
  completed: { label: "Completed", variant: "bg-green-100 text-green-700 border-green-200" },
  cancelled: { label: "Cancelled", variant: "bg-red-100 text-red-700 border-red-200" },
  postponed: { label: "Postponed", variant: "bg-orange-100 text-orange-700 border-orange-200" },
  failed: { label: "Failed", variant: "bg-red-100 text-red-800 border-red-300" },
  expired: { label: "Expired", variant: "bg-slate-100 text-slate-600 border-slate-200" },
};

export function OTStatusBadge({ status, scheduledDate, scheduledTime, className }: OTStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.scheduled;

  // Detect if surgery is delayed (past scheduled time but not started/completed)
  const isDelayed = useMemo(() => {
    if (!scheduledDate || !scheduledTime) return false;
    // Don't show delayed for these terminal/active statuses
    if (['completed', 'cancelled', 'in_progress', 'postponed', 'failed', 'expired'].includes(status)) {
      return false;
    }
    
    try {
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      const now = new Date();
      const delayed = now > scheduledDateTime;
      
      if (delayed) {
        otLogger.warn('OTStatusBadge: Surgery is delayed', { 
          status, 
          scheduledDate, 
          scheduledTime,
          now: now.toISOString()
        });
      }
      
      return delayed;
    } catch (e) {
      return false;
    }
  }, [scheduledDate, scheduledTime, status]);

  // Show delayed badge if surgery is past its scheduled time
  if (isDelayed) {
    return (
      <Badge 
        variant="destructive" 
        className={cn("font-medium gap-1", className)}
      >
        <AlertTriangle className="h-3 w-3" />
        Delayed
      </Badge>
    );
  }

  return (
    <Badge 
      variant="outline" 
      className={cn(config.variant, "font-medium", className)}
    >
      {config.label}
    </Badge>
  );
}
