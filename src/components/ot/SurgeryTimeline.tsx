import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { 
  FileText, 
  Calendar, 
  CheckCircle2, 
  RefreshCw,
  Clipboard,
  Play,
  Square,
  Heart,
  Trophy,
  XCircle,
  Clock,
  UserCheck,
  Stethoscope,
} from "lucide-react";
import type { SurgeryStatus } from "@/hooks/useOT";

interface SurgeryTimelineProps {
  status: SurgeryStatus;
  outcome?: 'successful' | 'failed' | 'expired' | 'unknown' | null;
  timestamps?: {
    created_at?: string;
    booked_at?: string;
    surgeon_confirmed_at?: string;
    anesthesia_confirmed_at?: string;
    confirmed_at?: string;
    pre_op_started_at?: string;
    ready_at?: string;
    actual_start_time?: string;
    actual_end_time?: string;
    outcome_recorded_at?: string;
  };
  className?: string;
  compact?: boolean;
  showDetailedConfirmation?: boolean;
}

interface TimelineStep {
  key: string;
  label: string;
  icon: typeof FileText;
  statuses: SurgeryStatus[];
}

// Standard timeline steps
const standardTimelineSteps: TimelineStep[] = [
  { key: 'requested', label: 'Requested', icon: FileText, statuses: ['requested'] },
  { key: 'booked', label: 'Booked', icon: Calendar, statuses: ['booked', 'rescheduled'] },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2, statuses: ['confirmed', 'on_hold' as SurgeryStatus] },
  { key: 'pre_op', label: 'Pre-Op', icon: Clipboard, statuses: ['pre_op'] },
  { key: 'ready', label: 'Ready', icon: CheckCircle2, statuses: ['ready' as SurgeryStatus] },
  { key: 'in_progress', label: 'In Progress', icon: Play, statuses: ['in_progress'] },
  { key: 'completed', label: 'Completed', icon: Square, statuses: ['completed'] },
];

// Detailed timeline with individual surgeon/anesthesia confirmations
const detailedTimelineSteps: TimelineStep[] = [
  { key: 'requested', label: 'Requested', icon: FileText, statuses: ['requested'] },
  { key: 'booked', label: 'Booked', icon: Calendar, statuses: ['booked', 'rescheduled'] },
  { key: 'surgeon_confirmed', label: 'Surgeon', icon: UserCheck, statuses: [] },
  { key: 'anesthesia_confirmed', label: 'Anesthesia', icon: Stethoscope, statuses: [] },
  { key: 'pre_op', label: 'Pre-Op', icon: Clipboard, statuses: ['pre_op', 'confirmed', 'on_hold' as SurgeryStatus] },
  { key: 'ready', label: 'Ready', icon: CheckCircle2, statuses: ['ready' as SurgeryStatus] },
  { key: 'in_progress', label: 'In Progress', icon: Play, statuses: ['in_progress'] },
  { key: 'completed', label: 'Completed', icon: Square, statuses: ['completed'] },
];

// Status order mapping - use string keys for new statuses until types are regenerated
const statusOrder: Record<string, number> = {
  requested: 0,
  booked: 1,
  rescheduled: 1,
  on_hold: 3,
  confirmed: 3,
  scheduled: 3, // Legacy - treat as confirmed
  pre_op: 4,
  ready: 5,
  in_progress: 6,
  completed: 7,
  cancelled: -1,
  postponed: -1,
  failed: 7,
  expired: -1,
};

export function SurgeryTimeline({ 
  status, 
  outcome,
  timestamps,
  className,
  compact = false,
  showDetailedConfirmation = false,
}: SurgeryTimelineProps) {
  const currentOrder = statusOrder[status as string] ?? -1;
  const isCancelled = status === 'cancelled' || status === 'postponed' || status === 'expired';
  const isOnHold = (status as string) === 'on_hold';
  const isFailed = status === 'failed' || outcome === 'failed';
  
  // Use detailed or standard timeline based on prop
  const timelineSteps = showDetailedConfirmation ? detailedTimelineSteps : standardTimelineSteps;

  // Check if step is completed based on key and timestamps
  const isStepCompleted = (stepKey: string): boolean => {
    if (isCancelled) return false;
    
    switch (stepKey) {
      case 'surgeon_confirmed':
        return !!timestamps?.surgeon_confirmed_at;
      case 'anesthesia_confirmed':
        return !!timestamps?.anesthesia_confirmed_at;
      default:
        const step = timelineSteps.find(s => s.key === stepKey);
        if (!step) return false;
        const stepOrder = statusOrder[step.statuses[0] as SurgeryStatus] ?? -1;
        return currentOrder >= stepOrder;
    }
  };

  // Get timestamp for a step
  const getStepTimestamp = (stepKey: string): string | undefined => {
    if (!timestamps) return undefined;
    switch (stepKey) {
      case 'requested': return timestamps.created_at;
      case 'booked': return timestamps.booked_at;
      case 'surgeon_confirmed': return timestamps.surgeon_confirmed_at;
      case 'anesthesia_confirmed': return timestamps.anesthesia_confirmed_at;
      case 'confirmed': return timestamps.confirmed_at || timestamps.anesthesia_confirmed_at;
      case 'pre_op': return timestamps.pre_op_started_at;
      case 'ready': return timestamps.ready_at;
      case 'in_progress': return timestamps.actual_start_time;
      case 'completed': return timestamps.actual_end_time;
      default: return undefined;
    }
  };

  if (compact) {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {timelineSteps.map((step, index) => {
          const isCompleted = isStepCompleted(step.key);
          const isCurrent = step.statuses.includes(status);
          const StepIcon = step.icon;

          return (
            <div key={step.key} className="flex items-center">
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                  isCompleted && !isCurrent && "bg-green-100 text-green-600",
                  isCurrent && !isCancelled && "bg-primary text-primary-foreground",
                  isCurrent && isFailed && "bg-red-100 text-red-600",
                  !isCompleted && !isCurrent && "bg-muted text-muted-foreground",
                  isCancelled && "bg-muted text-muted-foreground"
                )}
                title={step.label}
              >
                <StepIcon className="h-3 w-3" />
              </div>
              {index < timelineSteps.length - 1 && (
                <div
                  className={cn(
                    "w-4 h-0.5 transition-colors",
                    isCompleted && !isCancelled ? "bg-green-400" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}

        {/* Outcome indicator */}
        {status === 'completed' && outcome && (
          <div className="flex items-center ml-1">
            <div className="w-4 h-0.5 bg-muted" />
            <div
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center",
                outcome === 'successful' && "bg-green-100 text-green-600",
                outcome === 'failed' && "bg-red-100 text-red-600",
                outcome === 'expired' && "bg-muted text-muted-foreground",
                outcome === 'unknown' && "bg-amber-100 text-amber-600"
              )}
              title={outcome === 'successful' ? 'Successful' : outcome === 'failed' ? 'Failed' : 'Unknown'}
            >
              {outcome === 'successful' && <Trophy className="h-3 w-3" />}
              {outcome === 'failed' && <XCircle className="h-3 w-3" />}
              {(outcome === 'expired' || outcome === 'unknown') && <Clock className="h-3 w-3" />}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {/* Cancelled/Failed overlay message */}
      {(isCancelled || isFailed) && (
        <div className={cn(
          "mb-4 p-3 rounded-lg border text-sm",
          isCancelled && "bg-gray-50 border-gray-200 text-gray-600",
          isFailed && "bg-red-50 border-red-200 text-red-600"
        )}>
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            <span className="font-medium">
              {status === 'cancelled' && 'Surgery Cancelled'}
              {status === 'postponed' && 'Surgery Postponed'}
              {status === 'expired' && 'Surgery Expired (No Confirmation)'}
              {isFailed && 'Surgery Failed'}
            </span>
          </div>
        </div>
      )}

      {/* Timeline steps */}
      <div className="flex items-start justify-between">
        {timelineSteps.map((step, index) => {
          const isCompleted = isStepCompleted(step.key);
          const isCurrent = step.statuses.includes(status);
          const StepIcon = step.icon;
          const timestamp = getStepTimestamp(step.key);

          return (
            <div key={step.key} className="flex-1 relative">
              {/* Connector line */}
              {index < timelineSteps.length - 1 && (
                <div
                  className={cn(
                    "absolute top-4 left-1/2 w-full h-0.5 transition-colors",
                    isCompleted && !isCancelled ? "bg-green-400" : "bg-muted"
                  )}
                />
              )}

              {/* Step circle and label */}
              <div className="relative flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all",
                    isCompleted && !isCurrent && "bg-green-100 text-green-600 ring-2 ring-green-200",
                    isCurrent && !isCancelled && !isFailed && "bg-primary text-primary-foreground ring-4 ring-primary/20 animate-pulse",
                    isCurrent && isFailed && "bg-destructive text-destructive-foreground ring-4 ring-destructive/20",
                    !isCompleted && !isCurrent && "bg-muted text-muted-foreground",
                    isCancelled && !isCompleted && "bg-muted text-muted-foreground"
                  )}
                >
                  <StepIcon className="h-4 w-4" />
                </div>
                <span className={cn(
                  "mt-2 text-xs font-medium text-center",
                  isCurrent && "text-primary",
                  !isCompleted && !isCurrent && "text-muted-foreground"
                )}>
                  {step.label}
                </span>
                {timestamp && (
                  <span className="text-xs text-muted-foreground mt-0.5">
                    {format(new Date(timestamp), 'h:mm a')}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Outcome step (only when completed) */}
        {status === 'completed' && (
          <div className="flex-1 relative">
            <div
              className={cn(
                "absolute top-4 right-1/2 w-full h-0.5",
                outcome ? "bg-green-400" : "bg-muted"
              )}
            />
            <div className="relative flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center z-10",
                  outcome === 'successful' && "bg-green-500 text-white ring-4 ring-green-200",
                  outcome === 'failed' && "bg-destructive text-destructive-foreground ring-4 ring-destructive/20",
                  (outcome === 'expired' || outcome === 'unknown') && "bg-amber-500 text-white",
                  !outcome && "bg-muted text-muted-foreground animate-pulse"
                )}
              >
                {outcome === 'successful' && <Trophy className="h-4 w-4" />}
                {outcome === 'failed' && <XCircle className="h-4 w-4" />}
                {(outcome === 'expired' || outcome === 'unknown') && <Clock className="h-4 w-4" />}
                {!outcome && <Heart className="h-4 w-4" />}
              </div>
              <span className={cn(
                "mt-2 text-xs font-medium text-center",
                outcome === 'successful' && "text-green-600",
                outcome === 'failed' && "text-destructive",
                !outcome && "text-muted-foreground"
              )}>
                {outcome === 'successful' && 'Successful'}
                {outcome === 'failed' && 'Failed'}
                {outcome === 'expired' && 'Expired'}
                {outcome === 'unknown' && 'Unknown'}
                {!outcome && 'Outcome'}
              </span>
              {timestamps?.outcome_recorded_at && (
                <span className="text-xs text-muted-foreground mt-0.5">
                  {format(new Date(timestamps.outcome_recorded_at), 'h:mm a')}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
