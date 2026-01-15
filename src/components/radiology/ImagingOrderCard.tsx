import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImagingOrderWithRelations, IMAGING_STATUSES, IMAGING_PRIORITIES, IMAGING_MODALITIES } from '@/hooks/useImaging';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Eye, Play, FileText, User } from 'lucide-react';

interface ImagingOrderCardProps {
  order: ImagingOrderWithRelations;
  showActions?: boolean;
  onStartStudy?: (order: ImagingOrderWithRelations) => void;
}

export function ImagingOrderCard({ order, showActions = true, onStartStudy }: ImagingOrderCardProps) {
  const navigate = useNavigate();

  const statusConfig = IMAGING_STATUSES.find(s => s.value === order.status);
  const priorityConfig = IMAGING_PRIORITIES.find(p => p.value === order.priority);
  const modalityConfig = IMAGING_MODALITIES.find(m => m.value === order.modality);

  const patientName = order.patient 
    ? `${order.patient.first_name} ${order.patient.last_name}` 
    : 'Unknown Patient';

  const patientAge = order.patient?.date_of_birth
    ? `${Math.floor((new Date().getTime() - new Date(order.patient.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))}y`
    : '';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-sm text-muted-foreground">
                {order.order_number}
              </span>
              <Badge className={priorityConfig?.color || 'bg-gray-100'}>
                {priorityConfig?.label || order.priority}
              </Badge>
              <Badge variant="outline" className={statusConfig?.color}>
                {statusConfig?.label || order.status}
              </Badge>
            </div>

            <h3 className="font-semibold text-lg truncate">{order.procedure_name}</h3>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <User className="h-4 w-4" />
              <span>{patientName}</span>
              {order.patient?.patient_number && (
                <span className="font-mono">({order.patient.patient_number})</span>
              )}
              {patientAge && (
                <>
                  <span>•</span>
                  <span>{patientAge}</span>
                </>
              )}
              {order.patient?.gender && (
                <>
                  <span>•</span>
                  <span className="capitalize">{order.patient.gender}</span>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm">
              <span className="text-muted-foreground">
                Modality: <span className="text-foreground">{modalityConfig?.label || order.modality}</span>
              </span>
              {order.clinical_indication && (
                <span className="text-muted-foreground truncate max-w-[200px]">
                  Indication: <span className="text-foreground">{order.clinical_indication}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span>Ordered: {format(new Date(order.ordered_at), 'MMM d, yyyy h:mm a')}</span>
              {order.scheduled_date && (
                <span>
                  Scheduled: {format(new Date(order.scheduled_date), 'MMM d, yyyy')}
                  {order.scheduled_time && ` ${order.scheduled_time}`}
                </span>
              )}
            </div>
          </div>

          {showActions && (
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/app/radiology/orders/${order.id}`)}
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>

              {['ordered', 'scheduled'].includes(order.status) && onStartStudy && (
                <Button
                  size="sm"
                  onClick={() => onStartStudy(order)}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Start
                </Button>
              )}

              {order.status === 'completed' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/app/radiology/report/${order.id}`)}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Report
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
