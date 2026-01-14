import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertTriangle, Clock, Calendar } from "lucide-react";
import type { SurgeryPriority } from "@/hooks/useOT";

interface PriorityBadgeProps {
  priority: SurgeryPriority;
  showIcon?: boolean;
  className?: string;
}

const priorityConfig: Record<SurgeryPriority, { 
  label: string; 
  variant: string;
  icon: typeof AlertTriangle;
}> = {
  emergency: { 
    label: "Emergency", 
    variant: "bg-red-500 text-white border-red-600",
    icon: AlertTriangle,
  },
  urgent: { 
    label: "Urgent", 
    variant: "bg-orange-500 text-white border-orange-600",
    icon: Clock,
  },
  elective: { 
    label: "Elective", 
    variant: "bg-slate-100 text-slate-700 border-slate-200",
    icon: Calendar,
  },
};

export function PriorityBadge({ priority, showIcon = true, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority] || priorityConfig.elective;
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={cn(config.variant, "font-medium gap-1", className)}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </Badge>
  );
}
