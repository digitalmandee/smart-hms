import { Clock, User, Phone, MoreVertical, AlertTriangle, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AppointmentWithRelations } from '@/hooks/useAppointments';
import { cn } from '@/lib/utils';

const priorityColors: Record<number, { bg: string; icon: boolean; label: string }> = {
  0: { bg: '', icon: false, label: 'Normal' },
  1: { bg: 'bg-yellow-500', icon: true, label: 'Urgent' },
  2: { bg: 'bg-red-500', icon: true, label: 'Emergency' },
};

interface AppointmentCardProps {
  appointment: AppointmentWithRelations;
  variant?: 'queue' | 'list' | 'compact';
  onCheckIn?: () => void;
  onStart?: () => void;
  onComplete?: () => void;
  onCancel?: () => void;
  onNoShow?: () => void;
  onClick?: () => void;
}

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  checked_in: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  in_progress: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  completed: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  no_show: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
};

const statusLabels: Record<string, string> = {
  scheduled: 'Scheduled',
  checked_in: 'Checked In',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
};

export function AppointmentCard({
  appointment,
  variant = 'list',
  onCheckIn,
  onStart,
  onComplete,
  onCancel,
  onNoShow,
  onClick,
}: AppointmentCardProps) {
  const patient = appointment.patient;
  const doctor = appointment.doctor;
  const status = appointment.status || 'scheduled';
  const priority = (appointment as any).priority || 0;
  const priorityStyle = priorityColors[priority];
  const hasCheckInVitals = !!(appointment as any).check_in_vitals;

  const formatTime = (time: string | null) => {
    if (!time) return '--:--';
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  if (variant === 'queue') {
    return (
      <Card
        className={cn(
          'p-4 cursor-pointer hover:shadow-md transition-all',
          status === 'in_progress' && 'ring-2 ring-primary'
        )}
        onClick={onClick}
      >
      <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold relative',
              status === 'in_progress' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
            )}>
              {appointment.token_number || '-'}
              {priority > 0 && (
                <span className={cn('absolute -top-1 -right-1 w-4 h-4 rounded-full', priorityStyle.bg)} />
              )}
            </div>
            <div>
              <p className="font-medium">
                {patient?.first_name} {patient?.last_name}
              </p>
              <p className="text-sm text-muted-foreground">
                {patient?.patient_number}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {formatTime(appointment.appointment_time)}
                </span>
                {hasCheckInVitals && (
                  <Tooltip>
                    <TooltipTrigger>
                      <Activity className="h-3 w-3 text-green-500" />
                    </TooltipTrigger>
                    <TooltipContent>Vitals recorded at check-in</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              {priority > 0 && (
                <Badge className={cn('text-white', priorityStyle.bg)}>
                  {priority === 2 && <AlertTriangle className="h-3 w-3 mr-1" />}
                  {priorityStyle.label}
                </Badge>
              )}
              <Badge className={statusColors[status]}>
                {statusLabels[status]}
              </Badge>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {status === 'scheduled' && onCheckIn && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onCheckIn(); }}>
                    Check In
                  </DropdownMenuItem>
                )}
                {status === 'checked_in' && onStart && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStart(); }}>
                    Start Consultation
                  </DropdownMenuItem>
                )}
                {status === 'in_progress' && onComplete && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onComplete(); }}>
                    Complete
                  </DropdownMenuItem>
                )}
                {(status === 'scheduled' || status === 'checked_in') && onNoShow && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onNoShow(); }}>
                    Mark No Show
                  </DropdownMenuItem>
                )}
                {status === 'scheduled' && onCancel && (
                  <DropdownMenuItem 
                    onClick={(e) => { e.stopPropagation(); onCancel(); }}
                    className="text-destructive"
                  >
                    Cancel
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'p-2 rounded-md border cursor-pointer hover:bg-muted/50 transition-colors',
          status === 'in_progress' && 'border-primary bg-primary/5'
        )}
        onClick={onClick}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {formatTime(appointment.appointment_time)}
          </span>
          <span className="font-medium text-sm truncate">
            {patient?.first_name} {patient?.last_name}
          </span>
          <Badge variant="outline" className={cn('text-xs ml-auto', statusColors[status])}>
            {statusLabels[status]}
          </Badge>
        </div>
      </div>
    );
  }

  // Default list variant
  return (
    <Card className="p-4 hover:shadow-sm transition-shadow cursor-pointer" onClick={onClick}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">
              {patient?.first_name} {patient?.last_name}
            </p>
            <p className="text-sm text-muted-foreground">
              {patient?.patient_number}
            </p>
            {patient?.phone && (
              <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                <Phone className="h-3 w-3" />
                {patient.phone}
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <Badge className={statusColors[status]}>
            {statusLabels[status]}
          </Badge>
          <div className="mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1 justify-end">
              <Clock className="h-3 w-3" />
              {formatTime(appointment.appointment_time)}
            </div>
            {doctor && (
              <p className="mt-1">Dr. {doctor.profile?.full_name}</p>
            )}
          </div>
        </div>
      </div>
      {appointment.chief_complaint && (
        <p className="mt-3 text-sm text-muted-foreground border-t pt-3">
          <span className="font-medium">Chief Complaint:</span> {appointment.chief_complaint}
        </p>
      )}
    </Card>
  );
}
