import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Users, RefreshCw, Clock, AlertTriangle, ChevronRight, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PullToRefresh } from '@/components/mobile/PullToRefresh';
import { useHaptics } from '@/hooks/useHaptics';
import { cn } from '@/lib/utils';

interface QueueAppointment {
  id: string;
  token_number: number | null;
  status: string | null;
  appointment_time: string | null;
  priority?: number;
  patient?: {
    first_name: string;
    last_name: string;
    patient_number?: string;
  };
  doctor?: {
    profile?: {
      full_name: string;
    };
  };
}

interface Doctor {
  id: string;
  profile?: {
    full_name: string;
  };
}

interface MobileQueueViewProps {
  queue: QueueAppointment[];
  doctors?: Doctor[];
  selectedDoctor: string;
  onDoctorChange: (value: string) => void;
  onRefresh: () => Promise<void>;
  onAction: (appointmentId: string, action: 'checkIn' | 'start' | 'complete' | 'cancel' | 'noShow') => Promise<void>;
  isDoctor?: boolean;
}

type QueueTab = 'in_progress' | 'checked_in' | 'scheduled';

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-500',
  checked_in: 'bg-yellow-500',
  in_progress: 'bg-green-500',
  completed: 'bg-muted-foreground',
  cancelled: 'bg-red-500',
  no_show: 'bg-orange-500',
};

const priorityStyles: Record<number, { bg: string; text: string; label: string }> = {
  0: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Normal' },
  1: { bg: 'bg-warning/20', text: 'text-warning', label: 'Urgent' },
  2: { bg: 'bg-destructive/20', text: 'text-destructive', label: 'Emergency' },
};

export function MobileQueueView({
  queue,
  doctors,
  selectedDoctor,
  onDoctorChange,
  onRefresh,
  onAction,
  isDoctor = false,
}: MobileQueueViewProps) {
  const navigate = useNavigate();
  const haptics = useHaptics();
  const [activeTab, setActiveTab] = useState<QueueTab>('checked_in');
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  // Sort queue by priority (high first) then token
  const sortedQueue = useMemo(() => {
    return [...queue].sort((a, b) => {
      const priorityA = a.priority || 0;
      const priorityB = b.priority || 0;
      if (priorityB !== priorityA) return priorityB - priorityA;
      return (a.token_number || 0) - (b.token_number || 0);
    });
  }, [queue]);

  // Group appointments by status
  const groups = useMemo(() => ({
    in_progress: sortedQueue.filter(a => a.status === 'in_progress'),
    checked_in: sortedQueue.filter(a => a.status === 'checked_in'),
    scheduled: sortedQueue.filter(a => a.status === 'scheduled'),
  }), [sortedQueue]);

  const tabLabels: Record<QueueTab, { label: string; count: number }> = {
    in_progress: { label: 'Serving', count: groups.in_progress.length },
    checked_in: { label: 'Waiting', count: groups.checked_in.length },
    scheduled: { label: 'Upcoming', count: groups.scheduled.length },
  };

  const emergencyCount = groups.checked_in.filter(a => a.priority === 2).length;
  const urgentCount = groups.checked_in.filter(a => a.priority === 1).length;

  const handleCardTap = (appointment: QueueAppointment) => {
    haptics.light();
    if (isDoctor) {
      navigate(`/app/opd/consultation/${appointment.id}`);
    } else {
      navigate(`/app/appointments/${appointment.id}`);
    }
  };

  const handleTabChange = (tab: QueueTab) => {
    haptics.light();
    setActiveTab(tab);
  };

  const renderAppointmentCard = (appointment: QueueAppointment, showActions = false) => {
    const priority = appointment.priority || 0;
    const priorityStyle = priorityStyles[priority] || priorityStyles[0];

    return (
      <Card
        key={appointment.id}
        className={cn(
          'active:scale-[0.98] transition-transform cursor-pointer',
          priority > 0 && 'border-l-4',
          priority === 2 && 'border-l-destructive',
          priority === 1 && 'border-l-warning'
        )}
        onClick={() => handleCardTap(appointment)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            {/* Token Number */}
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0',
              appointment.status === 'in_progress' ? 'bg-primary text-primary-foreground' : 'bg-muted'
            )}>
              {appointment.token_number || '-'}
            </div>

            {/* Patient Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold truncate">
                  {appointment.patient?.first_name} {appointment.patient?.last_name}
                </h3>
                {priority > 0 && (
                  <Badge variant="outline" className={cn('text-xs', priorityStyle.text)}>
                    {priorityStyle.label}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                MR# {appointment.patient?.patient_number || 'N/A'}
              </p>
              {appointment.appointment_time && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Clock className="h-3 w-3" />
                  {appointment.appointment_time.slice(0, 5)}
                </div>
              )}
            </div>

            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
          </div>

          {/* Quick Actions */}
          {showActions && (
            <div className="flex gap-2 mt-3 pt-3 border-t">
              {appointment.status === 'scheduled' && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      haptics.medium();
                      navigate(`/app/appointments/${appointment.id}/check-in`);
                    }}
                  >
                    Check In
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      haptics.warning();
                      onAction(appointment.id, 'noShow');
                    }}
                  >
                    No Show
                  </Button>
                </>
              )}
              {appointment.status === 'checked_in' && (
                <>
                  <Button
                    size="sm"
                    className="flex-1 h-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      haptics.medium();
                      onAction(appointment.id, 'start');
                    }}
                  >
                    <Stethoscope className="h-4 w-4 mr-2" />
                    Start
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      haptics.warning();
                      onAction(appointment.id, 'noShow');
                    }}
                  >
                    No Show
                  </Button>
                </>
              )}
              {appointment.status === 'in_progress' && (
                <Button
                  size="sm"
                  variant="default"
                  className="flex-1 h-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    haptics.success();
                    onAction(appointment.id, 'complete');
                  }}
                >
                  Complete
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <PullToRefresh onRefresh={onRefresh}>
      <div className="px-4 py-4 space-y-4 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Today's Queue</h1>
            <p className="text-sm text-muted-foreground">{format(new Date(), 'EEEE, MMM d')}</p>
          </div>
          <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Users className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto pb-8">
              <SheetHeader>
                <SheetTitle>Filter by Doctor</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <Select value={selectedDoctor} onValueChange={(v) => {
                  onDoctorChange(v);
                  setFilterSheetOpen(false);
                }}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="All Doctors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Doctors</SelectItem>
                    {doctors?.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        Dr. {doctor.profile?.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{queue.length} in queue</span>
          </div>
          {emergencyCount > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {emergencyCount}
            </Badge>
          )}
          {urgentCount > 0 && (
            <Badge className="bg-warning text-warning-foreground">
              {urgentCount} urgent
            </Badge>
          )}
        </div>

        {/* Tabs */}
        <div className="flex bg-muted rounded-xl p-1 gap-1">
          {(Object.keys(tabLabels) as QueueTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={cn(
                'flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all',
                activeTab === tab
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              {tabLabels[tab].label}
              <span className={cn(
                'ml-1.5 px-1.5 py-0.5 rounded-full text-xs',
                activeTab === tab ? 'bg-primary/10 text-primary' : 'bg-muted-foreground/20'
              )}>
                {tabLabels[tab].count}
              </span>
            </button>
          ))}
        </div>

        {/* Now Serving Banner (if any in progress) */}
        {activeTab === 'checked_in' && groups.in_progress.length > 0 && (
          <Card className="border-primary bg-primary/5">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Now Serving
              </div>
              <div className="space-y-2">
                {groups.in_progress.slice(0, 2).map((apt) => (
                  <div key={apt.id} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                      {apt.token_number}
                    </div>
                    <span className="text-sm font-medium">
                      {apt.patient?.first_name} {apt.patient?.last_name}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Appointment List */}
        <div className="space-y-3">
          {groups[activeTab].length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No patients {activeTab === 'in_progress' ? 'being served' : activeTab === 'checked_in' ? 'waiting' : 'scheduled'}</p>
            </div>
          ) : (
            groups[activeTab].map((appointment) => 
              renderAppointmentCard(appointment, true)
            )
          )}
        </div>
      </div>
    </PullToRefresh>
  );
}
