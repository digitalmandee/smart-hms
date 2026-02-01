import { Check, Clock, AlertCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useHaptics } from "@/hooks/useHaptics";

interface TaskCardProps {
  id: string;
  title: string;
  description?: string;
  dueTime?: string;
  status: "pending" | "in_progress" | "completed" | "overdue";
  priority?: "low" | "normal" | "high" | "urgent";
  category?: string;
  patientName?: string;
  onComplete?: () => void;
  onClick?: () => void;
  className?: string;
}

const statusConfig = {
  pending: { label: "Pending", icon: Clock, color: "text-muted-foreground" },
  in_progress: { label: "In Progress", icon: Clock, color: "text-blue-500" },
  completed: { label: "Done", icon: Check, color: "text-emerald-500" },
  overdue: { label: "Overdue", icon: AlertCircle, color: "text-destructive" }
};

const priorityConfig = {
  low: { label: "Low", color: "bg-muted text-muted-foreground" },
  normal: { label: "Normal", color: "bg-blue-500/10 text-blue-600" },
  high: { label: "High", color: "bg-amber-500/10 text-amber-600" },
  urgent: { label: "Urgent", color: "bg-destructive/10 text-destructive" }
};

export function TaskCard({
  id,
  title,
  description,
  dueTime,
  status,
  priority = "normal",
  category,
  patientName,
  onComplete,
  onClick,
  className
}: TaskCardProps) {
  const haptics = useHaptics();
  const statusInfo = statusConfig[status];
  const priorityInfo = priorityConfig[priority];
  const StatusIcon = statusInfo.icon;

  const handleClick = () => {
    haptics.light();
    onClick?.();
  };

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    haptics.success();
    onComplete?.();
  };

  const isCompleted = status === "completed";

  return (
    <div
      onClick={handleClick}
      className={cn(
        "relative bg-card border rounded-xl p-4 transition-all",
        "active:scale-[0.98] touch-manipulation cursor-pointer",
        isCompleted && "opacity-60",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Completion checkbox */}
        <button
          onClick={handleComplete}
          disabled={isCompleted}
          className={cn(
            "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
            "touch-manipulation active:scale-90",
            isCompleted 
              ? "bg-emerald-500 border-emerald-500 text-white" 
              : "border-muted-foreground/30 hover:border-primary"
          )}
        >
          {isCompleted && <Check className="h-4 w-4" />}
        </button>

        <div className="flex-1 min-w-0">
          {/* Category & Priority */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {category && (
              <Badge variant="outline" className="text-xs">
                {category}
              </Badge>
            )}
            {priority !== "normal" && (
              <Badge className={cn("text-xs", priorityInfo.color)}>
                {priorityInfo.label}
              </Badge>
            )}
          </div>

          {/* Title */}
          <h4 className={cn(
            "font-medium text-foreground",
            isCompleted && "line-through"
          )}>
            {title}
          </h4>

          {/* Description or Patient */}
          {(description || patientName) && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {patientName ? `Patient: ${patientName}` : description}
            </p>
          )}

          {/* Due Time */}
          {dueTime && (
            <div className={cn(
              "flex items-center gap-1 mt-2 text-xs",
              status === "overdue" ? "text-destructive" : "text-muted-foreground"
            )}>
              <StatusIcon className="h-3.5 w-3.5" />
              {dueTime}
            </div>
          )}
        </div>

        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
      </div>
    </div>
  );
}
