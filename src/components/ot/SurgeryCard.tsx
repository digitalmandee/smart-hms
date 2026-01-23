import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OTStatusBadge } from "./OTStatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import { 
  Clock, 
  User, 
  Stethoscope, 
  Building2, 
  ChevronRight,
  Play,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Surgery } from "@/hooks/useOT";

interface SurgeryCardProps {
  surgery: Surgery;
  onView?: () => void;
  onStart?: () => void;
  onComplete?: () => void;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

export function SurgeryCard({ 
  surgery, 
  onView, 
  onStart, 
  onComplete,
  showActions = true,
  compact = false,
  className 
}: SurgeryCardProps) {
  const patientName = surgery.patient 
    ? `${surgery.patient.first_name} ${surgery.patient.last_name}`
    : 'Unknown Patient';

  const surgeonName = surgery.lead_surgeon?.profile?.full_name || 'Not Assigned';

  const scheduledTime = surgery.scheduled_start_time 
    ? format(new Date(`2000-01-01T${surgery.scheduled_start_time}`), 'h:mm a')
    : 'TBD';

  if (compact) {
    return (
      <div 
        className={cn(
          "flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors",
          className
        )}
        onClick={onView}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0">
            <OTStatusBadge status={surgery.status} />
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate">{patientName}</p>
            <p className="text-sm text-muted-foreground truncate">{surgery.procedure_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm text-muted-foreground">{scheduledTime}</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <OTStatusBadge status={surgery.status} />
              <PriorityBadge priority={surgery.priority} />
            </div>
            <p className="text-sm text-muted-foreground font-mono">
              {surgery.surgery_number}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-semibold">{scheduledTime}</p>
            {surgery.estimated_duration_minutes && (
              <p className="text-xs text-muted-foreground">
                ~{surgery.estimated_duration_minutes} min
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Patient */}
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className="min-w-0">
            <p className="font-medium truncate">{patientName}</p>
            {surgery.patient?.patient_number && (
              <p className="text-xs text-muted-foreground">{surgery.patient.patient_number}</p>
            )}
          </div>
        </div>

        {/* Procedure */}
        <div>
          <p className="text-sm font-medium line-clamp-2">{surgery.procedure_name}</p>
          {surgery.diagnosis && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
              Dx: {surgery.diagnosis}
            </p>
          )}
        </div>

        {/* Surgeon */}
        <div className="flex items-center gap-2 text-sm">
          <Stethoscope className="h-4 w-4 text-muted-foreground" />
          <span>{surgeonName}</span>
        </div>

        {/* OT Room */}
        {surgery.ot_room && (
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span>{surgery.ot_room.name} ({surgery.ot_room.room_number})</span>
          </div>
        )}

        {/* Actual timing */}
        {surgery.actual_start_time && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              Started: {format(new Date(surgery.actual_start_time), 'h:mm a')}
              {surgery.actual_end_time && (
                <> — Ended: {format(new Date(surgery.actual_end_time), 'h:mm a')}</>
              )}
            </span>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-2">
            {onView && (
              <Button variant="outline" size="sm" onClick={onView} className="flex-1">
                View Details
              </Button>
            )}
            {surgery.status === 'scheduled' && onStart && (
              <Button size="sm" onClick={onStart} className="flex-1 gap-1">
                <Play className="h-4 w-4" />
                Start
              </Button>
            )}
            {surgery.status === 'in_progress' && onComplete && (
              <Button size="sm" onClick={onComplete} className="flex-1 gap-1">
                <CheckCircle2 className="h-4 w-4" />
                Complete
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
