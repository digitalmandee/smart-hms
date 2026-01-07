import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  parseISO,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAppointments } from '@/hooks/useAppointments';
import { useDoctors } from '@/hooks/useDoctors';

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-500',
  checked_in: 'bg-yellow-500',
  in_progress: 'bg-green-500',
  completed: 'bg-gray-400',
  cancelled: 'bg-red-500',
  no_show: 'bg-orange-500',
};

export default function AppointmentCalendarPage() {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [doctorFilter, setDoctorFilter] = useState<string>('all');

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const { data: appointments } = useAppointments({
    dateFrom: format(monthStart, 'yyyy-MM-dd'),
    dateTo: format(monthEnd, 'yyyy-MM-dd'),
    doctorId: doctorFilter !== 'all' ? doctorFilter : undefined,
  });

  const { data: doctors } = useDoctors();

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments?.filter((a) => a.appointment_date === dateStr) || [];
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold min-w-[180px] text-center">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={() => setCurrentMonth(new Date())}>
          Today
        </Button>
      </div>
      <Select value={doctorFilter} onValueChange={setDoctorFilter}>
        <SelectTrigger className="w-48">
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
  );

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 mb-2">
        {days.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const currentDay = day;
        const dayAppointments = getAppointmentsForDate(currentDay);
        const isToday = isSameDay(currentDay, new Date());
        const isCurrentMonth = isSameMonth(currentDay, currentMonth);
        const isSelected = selectedDate && isSameDay(currentDay, selectedDate);

        days.push(
          <div
            key={day.toString()}
            className={cn(
              'min-h-[100px] border-t border-r p-1 cursor-pointer transition-colors',
              !isCurrentMonth && 'bg-muted/30',
              isSelected && 'bg-primary/10',
              'hover:bg-muted/50'
            )}
            onClick={() => setSelectedDate(currentDay)}
          >
            <div className="flex items-center justify-between mb-1">
              <span
                className={cn(
                  'text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full',
                  isToday && 'bg-primary text-primary-foreground',
                  !isCurrentMonth && 'text-muted-foreground'
                )}
              >
                {format(currentDay, 'd')}
              </span>
              {dayAppointments.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {dayAppointments.length}
                </Badge>
              )}
            </div>
            <div className="space-y-1">
              {dayAppointments.slice(0, 3).map((appt) => (
                <div
                  key={appt.id}
                  className="text-xs truncate flex items-center gap-1 hover:bg-muted rounded px-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/app/appointments/${appt.id}`);
                  }}
                >
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full flex-shrink-0',
                      statusColors[appt.status || 'scheduled']
                    )}
                  />
                  <span className="truncate">
                    {appt.appointment_time?.substring(0, 5)} {appt.patient?.first_name}
                  </span>
                </div>
              ))}
              {dayAppointments.length > 3 && (
                <div className="text-xs text-muted-foreground px-1">
                  +{dayAppointments.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 border-l border-b">
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  const renderSelectedDatePanel = () => {
    if (!selectedDate) return null;

    const dayAppointments = getAppointmentsForDate(selectedDate);

    return (
      <Card className="mt-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h3>
            <Button
              size="sm"
              onClick={() =>
                navigate(`/app/appointments/new?date=${format(selectedDate, 'yyyy-MM-dd')}`)
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Book Appointment
            </Button>
          </div>

          {dayAppointments.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No appointments scheduled
            </p>
          ) : (
            <div className="space-y-2">
              {dayAppointments
                .sort((a, b) => (a.appointment_time || '').localeCompare(b.appointment_time || ''))
                .map((appt) => (
                  <div
                    key={appt.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer"
                    onClick={() => navigate(`/app/appointments/${appt.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          'w-3 h-3 rounded-full',
                          statusColors[appt.status || 'scheduled']
                        )}
                      />
                      <div>
                        <p className="font-medium">
                          {appt.patient?.first_name} {appt.patient?.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {appt.appointment_time?.substring(0, 5)} •{' '}
                          {appt.doctor && `Dr. ${appt.doctor.profile?.full_name}`}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {appt.status?.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointment Calendar"
        description="View and manage appointments in calendar view"
        breadcrumbs={[
          { label: 'Dashboard', href: '/app' },
          { label: 'Appointments', href: '/app/appointments' },
          { label: 'Calendar' },
        ]}
        actions={
          <Button onClick={() => navigate('/app/appointments/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6">
          {renderHeader()}
          {renderDays()}
          {renderCells()}
        </CardContent>
      </Card>

      {renderSelectedDatePanel()}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className={cn('w-3 h-3 rounded-full', statusColors.scheduled)} />
          <span>Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('w-3 h-3 rounded-full', statusColors.checked_in)} />
          <span>Checked In</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('w-3 h-3 rounded-full', statusColors.in_progress)} />
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('w-3 h-3 rounded-full', statusColors.completed)} />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('w-3 h-3 rounded-full', statusColors.cancelled)} />
          <span>Cancelled</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('w-3 h-3 rounded-full', statusColors.no_show)} />
          <span>No Show</span>
        </div>
      </div>
    </div>
  );
}
