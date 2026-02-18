import { format } from "date-fns";
import { Clock, User, ChevronRight, ChevronLeft, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useHaptics } from "@/hooks/useHaptics";
import { useIsRTL } from "@/lib/i18n";

interface AppointmentCardProps {
  id: string;
  patientName: string;
  patientPhone?: string;
  time: string;
  type: string;
  status: "scheduled" | "checked_in" | "in_progress" | "completed" | "cancelled" | "no_show";
  priority?: number;
  tokenNumber?: number;
  chiefComplaint?: string;
  onClick?: () => void;
  className?: string;
}

const statusConfig = {
  scheduled: { label: "Scheduled", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  checked_in: { label: "Waiting", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  in_progress: { label: "In Progress", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  completed: { label: "Completed", color: "bg-muted text-muted-foreground border-border" },
  cancelled: { label: "Cancelled", color: "bg-destructive/10 text-destructive border-destructive/20" },
  no_show: { label: "No Show", color: "bg-muted text-muted-foreground border-border" }
};

const priorityConfig = {
  0: { label: "Normal", color: "" },
  1: { label: "Urgent", color: "border-l-amber-500" },
  2: { label: "Emergency", color: "border-l-destructive" }
};

export function AppointmentCard({
  id,
  patientName,
  patientPhone,
  time,
  type,
  status,
  priority = 0,
  tokenNumber,
  chiefComplaint,
  onClick,
  className
}: AppointmentCardProps) {
  const haptics = useHaptics();
  const statusInfo = statusConfig[status];
  const priorityInfo = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig[0];

  const handleClick = () => {
    haptics.light();
    onClick?.();
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "relative bg-card border rounded-xl p-4 transition-all",
        "active:scale-[0.98] touch-manipulation cursor-pointer",
        priority > 0 && "border-l-4",
        priorityInfo.color,
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Token & Priority */}
          <div className="flex items-center gap-2 mb-2">
            {tokenNumber && (
              <Badge variant="outline" className="text-xs font-mono">
                #{tokenNumber}
              </Badge>
            )}
            {priority === 2 && (
              <Badge variant="destructive" className="text-xs">
                <AlertCircle className="h-3 w-3 mr-1" />
                Emergency
              </Badge>
            )}
            {priority === 1 && (
              <Badge className="text-xs bg-amber-500/20 text-amber-700 border-amber-500/30">
                Urgent
              </Badge>
            )}
          </div>

          {/* Patient Name */}
          <h4 className="font-semibold text-foreground truncate">{patientName}</h4>
          
          {/* Time & Type */}
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {time}
            </span>
            <span className="truncate">{type}</span>
          </div>

          {/* Chief Complaint */}
          {chiefComplaint && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
              {chiefComplaint}
            </p>
          )}
        </div>

        {/* Status & Arrow */}
        <div className="flex flex-col items-end gap-2">
          <Badge variant="outline" className={cn("text-xs", statusInfo.color)}>
            {statusInfo.label}
          </Badge>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
