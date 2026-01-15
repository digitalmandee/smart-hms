import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImagingOrderWithRelations } from '@/hooks/useImaging';
import { ModalityBadge } from './ModalityBadge';
import { ImagingPriorityBadge } from './ImagingPriorityBadge';
import { ImagingStatusBadge } from './ImagingStatusBadge';
import { format } from 'date-fns';
import { Play, CheckCircle2, User, Clock } from 'lucide-react';

interface TechnicianWorklistCardProps {
  order: ImagingOrderWithRelations;
  onStartStudy: (order: ImagingOrderWithRelations) => void;
  onCompleteStudy: (order: ImagingOrderWithRelations) => void;
}

export function TechnicianWorklistCard({ order, onStartStudy, onCompleteStudy }: TechnicianWorklistCardProps) {
  const patientName = order.patient 
    ? `${order.patient.first_name} ${order.patient.last_name}` 
    : 'Unknown Patient';

  const patientAge = order.patient?.date_of_birth
    ? `${Math.floor((new Date().getTime() - new Date(order.patient.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))}y`
    : '';

  const isInProgress = order.status === 'in_progress';
  const isPending = ['ordered', 'scheduled'].includes(order.status);

  return (
    <Card className={`transition-all ${order.priority === 'stat' ? 'border-red-300 bg-red-50/50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-sm text-muted-foreground">
                {order.order_number}
              </span>
              <ImagingPriorityBadge priority={order.priority} showIcon />
              <ImagingStatusBadge status={order.status} />
            </div>

            <div className="flex items-center gap-2 mb-1">
              <ModalityBadge modality={order.modality} />
              <h3 className="font-semibold">{order.procedure_name}</h3>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{patientName}</span>
              {order.patient?.patient_number && (
                <span className="font-mono text-xs">({order.patient.patient_number})</span>
              )}
              {patientAge && <span>• {patientAge}</span>}
              {order.patient?.gender && <span>• {order.patient.gender}</span>}
            </div>

            {order.procedure?.body_part && (
              <p className="text-sm mt-1">
                <span className="text-muted-foreground">Body Part:</span> {order.procedure.body_part}
              </p>
            )}

            {order.clinical_indication && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {order.clinical_indication}
              </p>
            )}

            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(new Date(order.ordered_at), 'h:mm a')}
              </span>
              {order.procedure?.estimated_duration_minutes && (
                <span>Est. {order.procedure.estimated_duration_minutes} min</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {isPending && (
              <Button onClick={() => onStartStudy(order)} size="sm">
                <Play className="h-4 w-4 mr-1" />
                Start
              </Button>
            )}

            {isInProgress && (
              <Button onClick={() => onCompleteStudy(order)} size="sm" variant="secondary">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Complete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
