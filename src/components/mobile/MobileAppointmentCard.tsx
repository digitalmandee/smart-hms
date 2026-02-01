import { Clock, User, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useHaptics } from "@/hooks/useHaptics";

interface MobileAppointmentCardProps {
  id: string;
  patientName: string;
  patientNumber?: string;
  time: string;
  status: string;
  appointmentType?: string;
  tokenNumber?: number;
  chiefComplaint?: string;
  doctorName?: string;
  onClick?: () => void;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  scheduled: { label: "Scheduled", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
  checked_in: { label: "Checked In", className: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300" },
  in_progress: { label: "In Progress", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300" },
  completed: { label: "Completed", className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
  no_show: { label: "No Show", className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" },
};

export function MobileAppointmentCard({
  id,
  patientName,
  patientNumber,
  time,
  status,
  appointmentType,
  tokenNumber,
  chiefComplaint,
  doctorName,
  onClick
}: MobileAppointmentCardProps) {
  const haptics = useHaptics();
  const statusInfo = statusConfig[status] || statusConfig.scheduled;

  const formatTime = (timeStr: string) => {
    if (!timeStr) return "--:--";
    const [hours, minutes] = timeStr.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  const handleClick = () => {
    haptics.light();
    onClick?.();
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "bg-card border rounded-xl p-4 active:scale-[0.98] transition-transform touch-manipulation cursor-pointer",
        onClick && "cursor-pointer"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Token & Status */}
          <div className="flex items-center gap-2 mb-2">
            {tokenNumber && (
              <Badge variant="outline" className="text-xs font-mono">
                #{tokenNumber}
              </Badge>
            )}
            <Badge className={cn("text-xs", statusInfo.className)}>
              {statusInfo.label}
            </Badge>
          </div>

          {/* Patient Name */}
          <p className="font-semibold text-base truncate">{patientName}</p>
          
          {/* Patient Number */}
          {patientNumber && (
            <p className="text-xs text-muted-foreground">MR# {patientNumber}</p>
          )}

          {/* Time & Type */}
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTime(time)}
            </span>
            {appointmentType && (
              <span className="capitalize">{appointmentType.replace("_", " ")}</span>
            )}
          </div>

          {/* Doctor */}
          {doctorName && (
            <p className="text-xs text-muted-foreground mt-1">
              Dr. {doctorName}
            </p>
          )}

          {/* Chief Complaint */}
          {chiefComplaint && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-1">
              {chiefComplaint}
            </p>
          )}
        </div>

        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
      </div>
    </div>
  );
}
