import { SurgeryCard } from "./SurgeryCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Scissors, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Surgery } from "@/hooks/useOT";

interface SurgeryQueueListProps {
  surgeries: Surgery[];
  isLoading?: boolean;
  onStartSurgery?: (surgeryId: string) => void;
  onCompleteSurgery?: (surgeryId: string) => void;
  compact?: boolean;
  emptyMessage?: string;
}

export function SurgeryQueueList({ 
  surgeries, 
  isLoading, 
  onStartSurgery,
  onCompleteSurgery,
  compact = false,
  emptyMessage = "No surgeries scheduled"
}: SurgeryQueueListProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className={compact ? "h-16" : "h-48"} />
        ))}
      </div>
    );
  }

  if (surgeries.length === 0) {
    return (
      <div className="text-center py-8">
        <Scissors className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  // Sort: emergency first, then by time
  const sortedSurgeries = [...surgeries].sort((a, b) => {
    const priorityOrder = { emergency: 0, urgent: 1, elective: 2 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return a.scheduled_start_time.localeCompare(b.scheduled_start_time);
  });

  // Separate in-progress surgeries
  const inProgress = sortedSurgeries.filter(s => s.status === 'in_progress');
  const upcoming = sortedSurgeries.filter(s => s.status !== 'in_progress');

  return (
    <div className="space-y-4">
      {inProgress.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-orange-600">
            <AlertTriangle className="h-4 w-4" />
            In Progress ({inProgress.length})
          </div>
          <div className={compact ? "space-y-2" : "grid gap-4 md:grid-cols-2"}>
            {inProgress.map((surgery) => (
              <SurgeryCard
                key={surgery.id}
                surgery={surgery}
                compact={compact}
                onView={() => navigate(`/app/ot/surgeries/${surgery.id}`)}
                onComplete={onCompleteSurgery ? () => onCompleteSurgery(surgery.id) : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="space-y-2">
          {inProgress.length > 0 && (
            <div className="text-sm font-medium text-muted-foreground">
              Upcoming ({upcoming.length})
            </div>
          )}
          <div className={compact ? "space-y-2" : "grid gap-4 md:grid-cols-2"}>
            {upcoming.map((surgery) => (
              <SurgeryCard
                key={surgery.id}
                surgery={surgery}
                compact={compact}
                onView={() => navigate(`/app/ot/surgeries/${surgery.id}`)}
                onStart={
                  surgery.status === 'scheduled' && onStartSurgery 
                    ? () => onStartSurgery(surgery.id) 
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
