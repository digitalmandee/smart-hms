import { formatDistanceToNow } from 'date-fns';
import { Clock, AlertTriangle, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AppointmentWithRelations } from '@/hooks/useAppointments';

const priorityConfig: Record<number, { label: string; variant: 'destructive' | 'default' | 'secondary' | 'outline'; icon: React.ElementType; borderColor: string }> = {
  2: { label: 'Emergency', variant: 'destructive', icon: AlertTriangle, borderColor: 'border-l-red-500' },
  1: { label: 'Urgent', variant: 'default', icon: AlertCircle, borderColor: 'border-l-amber-500' },
  0: { label: 'Normal', variant: 'secondary', icon: Clock, borderColor: 'border-l-green-500' },
};

interface PatientVitalsCardProps {
  appointment: AppointmentWithRelations;
  onRecordVitals: () => void;
}

export function PatientVitalsCard({ appointment, onRecordVitals }: PatientVitalsCardProps) {
  const priority = appointment.priority || 0;
  const config = priorityConfig[priority] || priorityConfig[0];
  const PriorityIcon = config.icon;

  const waitTime = appointment.check_in_at
    ? formatDistanceToNow(new Date(appointment.check_in_at), { addSuffix: false })
    : null;

  return (
    <Card className={`p-3 border-l-4 ${config.borderColor} hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-lg">#{appointment.token_number}</span>
            <Badge variant={config.variant} className="flex items-center gap-1">
              <PriorityIcon className="h-3 w-3" />
              {config.label}
            </Badge>
          </div>
          <p className="font-medium truncate">
            {appointment.patient?.first_name} {appointment.patient?.last_name}
          </p>
          <p className="text-xs text-muted-foreground">
            MR# {appointment.patient?.patient_number}
          </p>
          {waitTime && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Clock className="h-3 w-3" />
              Waiting: {waitTime}
            </p>
          )}
          {appointment.chief_complaint && (
            <p className="text-sm text-muted-foreground mt-1 italic line-clamp-1">
              "{appointment.chief_complaint}"
            </p>
          )}
        </div>
        <Button size="sm" onClick={onRecordVitals}>
          Record Vitals
        </Button>
      </div>
    </Card>
  );
}
