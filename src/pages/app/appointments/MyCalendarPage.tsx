import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Users } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useAppointments, type AppointmentWithRelations } from '@/hooks/useAppointments';
import { useDoctorByEmployeeId } from '@/hooks/useDoctors';
import { useAuth } from '@/contexts/AuthContext';
import { useAppointmentNotifications } from '@/hooks/useAppointmentNotifications';

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-500',
  checked_in: 'bg-yellow-500',
  in_progress: 'bg-green-500',
  completed: 'bg-muted-foreground',
  cancelled: 'bg-red-500',
  no_show: 'bg-orange-500',
};

const statusTextColors: Record<string, string> = {
  scheduled: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
  checked_in: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400',
  in_progress: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
  completed: 'text-muted-foreground bg-muted',
  cancelled: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400',
  no_show: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400',
};

export default function MyCalendarPage() {
  const navigate = useNavigate();
  const { profile, hasRole } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Get doctor linked to current user's employee
  const { data: doctor } = useDoctorByEmployeeId(profile?.id || '');

  // Enable realtime notifications for this doctor
  useAppointmentNotifications({
    doctorId: doctor?.id,
    enabled: !!doctor?.id,
  });

  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  // Fetch appointments for the selected date
  const { data: appointments, isLoading } = useAppointments({
    dateFrom: dateStr,
    dateTo: dateStr,
    doctorId: doctor?.id,
  });

  // Sort appointments by time
  const sortedAppointments = useMemo(() => {
    if (!appointments) return [];
    return [...appointments].sort((a, b) => 
      (a.appointment_time || '').localeCompare(b.appointment_time || '')
    );
  }, [appointments]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!appointments) return { total: 0, confirmed: 0, checkedIn: 0, completed: 0 };
    return {
      total: appointments.length,
      confirmed: appointments.filter(a => a.status === 'scheduled').length,
      checkedIn: appointments.filter(a => a.status === 'checked_in').length,
      completed: appointments.filter(a => a.status === 'completed').length,
    };
  }, [appointments]);

  // Get upcoming appointments (next 3 that are not completed/cancelled)
  const upcomingAppointments = useMemo(() => {
    return sortedAppointments
      .filter(a => ['scheduled', 'checked_in', 'in_progress'].includes(a.status || ''))
      .slice(0, 3);
  }, [sortedAppointments]);

  // Generate time slots for the day view
  const timeSlots = useMemo(() => {
    const slots: { time: string; appointment?: AppointmentWithRelations }[] = [];
    for (let hour = 8; hour < 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const appointment = sortedAppointments.find(a => 
          a.appointment_time?.startsWith(time)
        );
        slots.push({ time, appointment });
      }
    }
    return slots;
  }, [sortedAppointments]);

  const formatTimeDisplay = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  // Determine title based on role
  const getRoleTitle = () => {
    if (hasRole('surgeon')) return 'Surgeon';
    if (hasRole('anesthetist')) return 'Anesthetist';
    if (hasRole('nurse')) return 'Nurse';
    return 'Doctor';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Calendar"
        description={`Your personal schedule${doctor ? ` - Dr. ${doctor.profile?.full_name}` : ''}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/app' },
          { label: 'My Calendar' },
        ]}
      />

      {/* Date Navigation & Stats */}
      <div className="flex flex-col lg:flex-row gap-4">
        <Card className="flex-1">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setSelectedDate(subDays(selectedDate, 1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="min-w-[200px]">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(selectedDate, 'EEEE, MMM d, yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Button variant="outline" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                {!isToday && (
                  <Button variant="ghost" onClick={() => setSelectedDate(new Date())}>
                    Today
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
                <p className="text-xs text-muted-foreground">Scheduled</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{stats.checkedIn}</p>
                <p className="text-xs text-muted-foreground">Waiting</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Done</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Schedule */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Day Schedule
              {isToday && <Badge variant="secondary">Today</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : (
              <div className="space-y-1">
                {timeSlots.map(({ time, appointment }) => (
                  <div
                    key={time}
                    className={cn(
                      'flex items-stretch rounded-lg transition-colors',
                      appointment ? 'bg-muted/30' : 'hover:bg-muted/20'
                    )}
                  >
                    {/* Time column */}
                    <div className="w-20 flex-shrink-0 p-2 text-sm font-medium text-muted-foreground flex items-center">
                      {formatTimeDisplay(time)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-2 border-l">
                      {appointment ? (
                        <div
                          className="flex items-center justify-between cursor-pointer hover:bg-muted/50 rounded-lg p-2 -m-2"
                          onClick={() => navigate(`/app/appointments/${appointment.id}`)}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={cn(
                                'w-3 h-3 rounded-full flex-shrink-0',
                                statusColors[appointment.status || 'scheduled']
                              )}
                            />
                            <div>
                              <p className="font-medium">
                                {appointment.patient?.first_name} {appointment.patient?.last_name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Token #{appointment.token_number}
                                {appointment.chief_complaint && ` • ${appointment.chief_complaint}`}
                              </p>
                            </div>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={cn('capitalize', statusTextColors[appointment.status || 'scheduled'])}
                          >
                            {appointment.status?.replace('_', ' ')}
                          </Badge>
                        </div>
                      ) : (
                        <div className="h-8 flex items-center text-sm text-muted-foreground/50">
                          —
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Sidebar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Upcoming
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No upcoming appointments
              </p>
            ) : (
              upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="p-3 rounded-lg border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/app/appointments/${appointment.id}`)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">
                        {appointment.patient?.first_name} {appointment.patient?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.appointment_time && formatTimeDisplay(appointment.appointment_time)}
                      </p>
                    </div>
                    <Badge 
                      variant="outline"
                      className={cn('text-xs capitalize', statusTextColors[appointment.status || 'scheduled'])}
                    >
                      {appointment.status?.replace('_', ' ')}
                    </Badge>
                  </div>
                  {appointment.chief_complaint && (
                    <p className="text-xs text-muted-foreground mt-2 truncate">
                      {appointment.chief_complaint}
                    </p>
                  )}
                </div>
              ))
            )}

            {/* Legend */}
            <div className="pt-4 border-t space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Status Legend</p>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Scheduled</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span>Waiting</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span>In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                  <span>Completed</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
