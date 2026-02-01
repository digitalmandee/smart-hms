import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays, subDays, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, Scissors, Check, X, AlertTriangle, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Calendar } from '@/components/ui/calendar';
import { PullToRefresh } from '@/components/mobile/PullToRefresh';
import { useHaptics } from '@/hooks/useHaptics';
import { cn } from '@/lib/utils';

interface Appointment {
  id: string;
  token_number: number | null;
  status: string | null;
  appointment_time: string | null;
  chief_complaint?: string | null;
  patient?: {
    first_name: string;
    last_name: string;
  };
}

interface Surgery {
  id: string;
  procedure_name?: string;
  scheduled_start_time?: string;
  status?: string;
  patient?: {
    first_name: string;
    last_name: string;
  };
  ot_room?: {
    name?: string;
    room_number?: string;
  };
  team_members?: any[];
}

interface MobileCalendarViewProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  appointments: Appointment[];
  surgeries?: Surgery[];
  stats: {
    total: number;
    confirmed: number;
    checkedIn: number;
    completed: number;
  };
  isLoading: boolean;
  onRefresh: () => Promise<void>;
  doctorName?: string;
  currentDoctorId?: string;
  onAcceptSurgery?: (surgeryId: string, assignmentId: string) => void;
}

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-500',
  checked_in: 'bg-yellow-500',
  in_progress: 'bg-green-500',
  completed: 'bg-muted-foreground',
  cancelled: 'bg-red-500',
  no_show: 'bg-orange-500',
};

export function MobileCalendarView({
  selectedDate,
  onDateChange,
  appointments,
  surgeries = [],
  stats,
  isLoading,
  onRefresh,
  doctorName,
  currentDoctorId,
  onAcceptSurgery,
}: MobileCalendarViewProps) {
  const navigate = useNavigate();
  const haptics = useHaptics();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const dateScrollRef = useRef<HTMLDivElement>(null);

  const isToday = isSameDay(selectedDate, new Date());

  // Generate dates for horizontal picker (-3 to +7 days)
  const dateRange = useMemo(() => {
    const dates: Date[] = [];
    for (let i = -3; i <= 7; i++) {
      dates.push(addDays(new Date(), i));
    }
    return dates;
  }, []);

  // Sort appointments by time
  const sortedAppointments = useMemo(() => {
    return [...appointments].sort((a, b) =>
      (a.appointment_time || '').localeCompare(b.appointment_time || '')
    );
  }, [appointments]);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const handleDateTap = (date: Date) => {
    haptics.light();
    onDateChange(date);
  };

  const handleAppointmentTap = (appointment: Appointment) => {
    haptics.light();
    navigate(`/app/appointments/${appointment.id}`);
  };

  const handleSurgeryTap = (surgery: Surgery) => {
    haptics.light();
    navigate(`/app/ot/surgeries/${surgery.id}`);
  };

  return (
    <PullToRefresh onRefresh={onRefresh}>
      <div className="pb-24">
        {/* Header */}
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-xl font-bold">My Calendar</h1>
            <Sheet open={calendarOpen} onOpenChange={setCalendarOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {format(selectedDate, 'MMM d')}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-auto pb-8">
                <SheetHeader>
                  <SheetTitle>Select Date</SheetTitle>
                </SheetHeader>
                <div className="flex justify-center mt-4">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        onDateChange(date);
                        setCalendarOpen(false);
                      }
                    }}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
          {doctorName && (
            <p className="text-sm text-muted-foreground">Dr. {doctorName}</p>
          )}
        </div>

        {/* Horizontal Date Picker */}
        <div className="relative">
          <div
            ref={dateScrollRef}
            className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {dateRange.map((date) => {
              const isSelected = isSameDay(date, selectedDate);
              const isDateToday = isSameDay(date, new Date());
              return (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDateTap(date)}
                  className={cn(
                    'flex flex-col items-center justify-center min-w-[56px] h-[72px] rounded-xl transition-all shrink-0',
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'bg-muted/50 hover:bg-muted'
                  )}
                >
                  <span className={cn(
                    'text-xs font-medium',
                    isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  )}>
                    {format(date, 'EEE')}
                  </span>
                  <span className={cn(
                    'text-lg font-bold',
                    isSelected ? 'text-primary-foreground' : ''
                  )}>
                    {format(date, 'd')}
                  </span>
                  {isDateToday && !isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-0.5" />
                  )}
                  {isDateToday && isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="px-4 py-3 border-y bg-muted/30">
          <div className="flex justify-around">
            <div className="text-center">
              <p className="text-lg font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-blue-600">{stats.confirmed}</p>
              <p className="text-xs text-muted-foreground">Scheduled</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-yellow-600">{stats.checkedIn}</p>
              <p className="text-xs text-muted-foreground">Waiting</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-green-600">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">Done</p>
            </div>
          </div>
        </div>

        {/* Surgeries Section (if any) */}
        {surgeries.length > 0 && (
          <div className="px-4 py-4">
            <div className="flex items-center gap-2 mb-3">
              <Scissors className="h-4 w-4 text-primary" />
              <h2 className="font-semibold">Surgeries</h2>
              <Badge variant="secondary" className="ml-auto">{surgeries.length}</Badge>
            </div>
            <div className="space-y-2">
              {surgeries.map((surgery) => (
                <Card
                  key={surgery.id}
                  className="active:scale-[0.98] transition-transform cursor-pointer"
                  onClick={() => handleSurgeryTap(surgery)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">
                          {surgery.patient?.first_name} {surgery.patient?.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {surgery.procedure_name}
                        </p>
                        {surgery.scheduled_start_time && (
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatTime(surgery.scheduled_start_time)}
                            {surgery.ot_room && (
                              <span className="text-primary">
                                OT: {surgery.ot_room.name || surgery.ot_room.room_number}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <Badge
                        variant={surgery.status === 'completed' ? 'secondary' : 'outline'}
                        className="capitalize text-xs shrink-0"
                      >
                        {surgery.status?.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Appointments Section */}
        <div className="px-4 py-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Appointments</h2>
            {isToday && <Badge variant="secondary">Today</Badge>}
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading schedule...
            </div>
          ) : sortedAppointments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No appointments scheduled</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedAppointments.map((appointment) => (
                <Card
                  key={appointment.id}
                  className="active:scale-[0.98] transition-transform cursor-pointer"
                  onClick={() => handleAppointmentTap(appointment)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      {/* Time */}
                      <div className="w-16 text-center shrink-0">
                        <span className="text-sm font-medium">
                          {appointment.appointment_time
                            ? formatTime(appointment.appointment_time)
                            : '--:--'}
                        </span>
                      </div>

                      {/* Status Indicator */}
                      <div
                        className={cn(
                          'w-1 h-10 rounded-full shrink-0',
                          statusColors[appointment.status || 'scheduled']
                        )}
                      />

                      {/* Patient Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">
                            {appointment.patient?.first_name} {appointment.patient?.last_name}
                          </span>
                          <Badge variant="outline" className="text-xs shrink-0">
                            #{appointment.token_number}
                          </Badge>
                        </div>
                        {appointment.chief_complaint && (
                          <p className="text-xs text-muted-foreground truncate">
                            {appointment.chief_complaint}
                          </p>
                        )}
                      </div>

                      {/* Status Badge */}
                      <Badge
                        variant="outline"
                        className={cn(
                          'capitalize text-xs shrink-0',
                          appointment.status === 'in_progress' && 'bg-green-100 text-green-700 border-green-300',
                          appointment.status === 'checked_in' && 'bg-yellow-100 text-yellow-700 border-yellow-300'
                        )}
                      >
                        {appointment.status?.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </PullToRefresh>
  );
}
