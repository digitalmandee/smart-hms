import { Clock, User, Phone, MoreVertical, AlertTriangle, Activity, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AppointmentWithRelations } from '@/hooks/useAppointments';
import { cn } from '@/lib/utils';

const priorityConfig: Record<number, { bg: string; badgeBg: string; icon: boolean; label: string }> = {
  0: { bg: '', badgeBg: 'bg-success', icon: false, label: 'Normal' },
  1: { bg: 'bg-warning/5', badgeBg: 'bg-warning', icon: true, label: 'Urgent' },
  2: { bg: 'bg-destructive/5', badgeBg: 'bg-destructive', icon: true, label: 'Emergency' },
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

const statusConfig: Record<string, { bg: string; label: string }> = {
  scheduled: { bg: 'bg-info/10 text-info border-info/30', label: 'Scheduled' },
  checked_in: { bg: 'bg-warning/10 text-warning border-warning/30', label: 'Checked In' },
  in_progress: { bg: 'bg-success/10 text-success border-success/30', label: 'In Progress' },
  completed: { bg: 'bg-muted text-muted-foreground', label: 'Completed' },
  cancelled: { bg: 'bg-destructive/10 text-destructive border-destructive/30', label: 'Cancelled' },
  no_show: { bg: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', label: 'No Show' },
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
  const priorityStyle = priorityConfig[priority];
  const statusStyle = statusConfig[status];
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
          'p-4 cursor-pointer hover:shadow-md transition-all border-l-4',
          status === 'in_progress' && 'ring-2 ring-primary border-l-primary',
          priority === 2 && 'border-l-destructive',
          priority === 1 && 'border-l-warning',
          priority === 0 && status !== 'in_progress' && 'border-l-transparent',
          priorityStyle.bg
        )}
        onClick={onClick}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Token Number - Prominent */}
            <div className={cn(
              'relative w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold shadow-sm',
              status === 'in_progress' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-foreground'
            )}>
              {appointment.token_number || '-'}
              {priority === 2 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive flex items-center justify-center">
                  <Zap className="h-3 w-3 text-white" />
                </span>
              )}
              {priority === 1 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-warning" />
              )}
            </div>
            <div>
              <p className="font-semibold text-base">
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
                      <Activity className="h-3.5 w-3.5 text-success" />
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
                <Badge className={cn('text-white', priorityStyle.badgeBg)}>
                  {priority === 2 && <AlertTriangle className="h-3 w-3 mr-1" />}
                  {priorityStyle.label}
                </Badge>
              )}
              <Badge variant="outline" className={statusStyle.bg}>
                {statusStyle.label}
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
                {(status === 'scheduled' || status === 'checked_in') && (
                  <>
                    <DropdownMenuSeparator />
                    {onNoShow && (
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
                  </>
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
          'p-2.5 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors',
          status === 'in_progress' && 'border-primary bg-primary/5',
          priority === 2 && 'border-l-2 border-l-destructive',
          priority === 1 && 'border-l-2 border-l-warning'
        )}
        onClick={onClick}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold',
            status === 'in_progress' ? 'bg-primary text-primary-foreground' : 'bg-muted'
          )}>
            {appointment.token_number || '-'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {formatTime(appointment.appointment_time)}
              </span>
              <span className="font-medium text-sm truncate">
                {patient?.first_name} {patient?.last_name}
              </span>
            </div>
          </div>
          <Badge variant="outline" className={cn('text-xs shrink-0', statusStyle.bg)}>
            {statusStyle.label}
          </Badge>
        </div>
      </div>
    );
  }

  // Default list variant
  return (
    <Card 
      className={cn(
        'p-4 hover:shadow-sm transition-shadow cursor-pointer',
        priority === 2 && 'border-l-4 border-l-destructive',
        priority === 1 && 'border-l-4 border-l-warning'
      )} 
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          {/* Token Badge */}
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg',
            status === 'in_progress' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          )}>
            {appointment.token_number || <User className="h-5 w-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold">
                {patient?.first_name} {patient?.last_name}
              </p>
              {priority === 2 && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Emergency
                </Badge>
              )}
            </div>
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
          <Badge variant="outline" className={statusStyle.bg}>
            {statusStyle.label}
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
