import { Badge } from '@/components/ui/badge';
import { ImagingPriority, IMAGING_PRIORITIES } from '@/hooks/useImaging';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

interface ImagingPriorityBadgeProps {
  priority: ImagingPriority;
  className?: string;
  showIcon?: boolean;
}

export function ImagingPriorityBadge({ priority, className, showIcon = false }: ImagingPriorityBadgeProps) {
  const config = IMAGING_PRIORITIES.find(p => p.value === priority);
  const isUrgent = priority === 'stat' || priority === 'urgent';

  return (
    <Badge className={cn(config?.color || 'bg-gray-100 text-gray-800', className)}>
      {showIcon && isUrgent && <AlertTriangle className="h-3 w-3 mr-1" />}
      {config?.label || priority}
    </Badge>
  );
}
