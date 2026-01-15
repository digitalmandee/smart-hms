import { Badge } from '@/components/ui/badge';
import { ImagingOrderStatus, IMAGING_STATUSES } from '@/hooks/useImaging';
import { cn } from '@/lib/utils';

interface ImagingStatusBadgeProps {
  status: ImagingOrderStatus;
  className?: string;
}

export function ImagingStatusBadge({ status, className }: ImagingStatusBadgeProps) {
  const config = IMAGING_STATUSES.find(s => s.value === status);

  return (
    <Badge className={cn(config?.color || 'bg-gray-100 text-gray-800', className)}>
      {config?.label || status}
    </Badge>
  );
}
