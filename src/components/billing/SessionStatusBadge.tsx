import { Badge } from "@/components/ui/badge";
import { SessionStatus } from "@/hooks/useBillingSessions";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";

interface SessionStatusBadgeProps {
  status: SessionStatus;
  showIcon?: boolean;
  size?: 'sm' | 'default';
}

export function SessionStatusBadge({
  status,
  showIcon = true,
  size = 'default',
}: SessionStatusBadgeProps) {
  const config = {
    open: {
      variant: 'default' as const,
      label: 'Open',
      icon: Clock,
      className: 'bg-success/20 text-success border-success/30',
    },
    closed: {
      variant: 'secondary' as const,
      label: 'Closed',
      icon: CheckCircle,
      className: 'bg-muted text-muted-foreground',
    },
    reconciled: {
      variant: 'outline' as const,
      label: 'Reconciled',
      icon: AlertCircle,
      className: 'bg-primary/10 text-primary border-primary/30',
    },
  };

  const { label, icon: Icon, className } = config[status] || config.closed;

  return (
    <Badge
      variant="outline"
      className={`${className} ${size === 'sm' ? 'text-xs py-0' : ''}`}
    >
      {showIcon && <Icon className={`${size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} mr-1`} />}
      {label}
    </Badge>
  );
}
