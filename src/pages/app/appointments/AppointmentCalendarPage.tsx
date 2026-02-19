import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  subDays,
  isSameMonth,
  isSameDay,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Grid3X3, CalendarDays } from 'lucide-react';
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
import { useBranches } from '@/hooks/useBranches';
import { useAuth } from '@/contexts/AuthContext';
import { DoctorGridCalendar } from '@/components/appointments/DoctorGridCalendar';
import { useTranslation, useIsRTL } from '@/lib/i18n';


const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-500',
  checked_in: 'bg-yellow-500',
  in_progress: 'bg-green-500',
  completed: 'bg-muted-foreground',
  cancelled: 'bg-red-500',
  no_show: 'bg-orange-500',
};

export default function AppointmentCalendarPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile } = useAuth();
  const { t, language } = useTranslation();
  const isRTL = useIsRTL();

  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [doctorFilter, setDoctorFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>(profile?.branch_id || 'all');
  const [viewMode, setViewMode] = useState<'month' | 'day'>('day');

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  // For day view, fetch just that day's appointments
  const dateFrom = viewMode === 'day' 
    ? format(selectedDate, 'yyyy-MM-dd')
    : format(monthStart, 'yyyy-MM-dd');
  const dateTo = viewMode === 'day'
    ? format(selectedDate, 'yyyy-MM-dd')
    : format(monthEnd, 'yyyy-MM-dd');

  const { data: appointments } = useAppointments({
    dateFrom,
    dateTo,
    doctorId: doctorFilter !== 'all' ? doctorFilter : undefined,
    branchId: branchFilter !== 'all' ? branchFilter : undefined,
  });

  const { data: doctors } = useDoctors(branchFilter !== 'all' ? branchFilter : undefined);
  const { data: branches } = useBranches();

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments?.filter((a) => a.appointment_date === dateStr) || [];
  };

  // Handle slot click from grid view
  const handleSlotClick = (doctorId: string, time: string) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    navigate(`/app/appointments/new?date=${dateStr}&time=${time}&doctor=${doctorId}`);
  };

  // Handle appointment click
  const handleAppointmentClick = (appointmentId: string) => {
    navigate(`/app/appointments/${appointmentId}`);
  };

  // Filter doctors for grid view
  const filteredDoctors = doctorFilter !== 'all' 
    ? doctors?.filter(d => d.id === doctorFilter) || []
    : doctors || [];

  const renderHeader = () => (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        {/* View Mode Toggle */}
        <div className="flex border rounded-md">
          <Button
            variant={viewMode === 'day' ? 'secondary' : 'ghost'}
            size="sm"
            className="rounded-e-none gap-2"
            onClick={() => setViewMode('day')}
          >
            <Grid3X3 className="h-4 w-4" />
            {t('apptCal.day')}
          </Button>
          <Button
            variant={viewMode === 'month' ? 'secondary' : 'ghost'}
            size="sm"
            className="rounded-s-none gap-2"
            onClick={() => setViewMode('month')}
          >
            <CalendarDays className="h-4 w-4" />
            {t('apptCal.month')}
          </Button>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => {
              if (viewMode === 'day') {
                setSelectedDate(isRTL ? addDays(selectedDate, 1) : subDays(selectedDate, 1));
              } else {
                setCurrentMonth(isRTL ? addMonths(currentMonth, 1) : subMonths(currentMonth, 1));
              }
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold min-w-[180px] text-center">
            {viewMode === 'day' 
              ? format(selectedDate, 'EEE, MMM d, yyyy')
              : format(currentMonth, 'MMMM yyyy')
            }
          </h2>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => {
              if (viewMode === 'day') {
                setSelectedDate(isRTL ? subDays(selectedDate, 1) : addDays(selectedDate, 1));
              } else {
                setCurrentMonth(isRTL ? subMonths(currentMonth, 1) : addMonths(currentMonth, 1));
              }
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              setSelectedDate(new Date());
              setCurrentMonth(new Date());
            }}
          >
            {t('apptCal.today')}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Branch Filter */}
        <Select key={`branch-${language}`} value={branchFilter} onValueChange={setBranchFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t('apptCal.allBranches')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('apptCal.allBranches')}</SelectItem>
            {branches?.map((branch) => (
              <SelectItem key={branch.id} value={branch.id}>
                {branch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Doctor Filter */}
        <Select key={`doctor-${language}`} value={doctorFilter} onValueChange={setDoctorFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t('apptCal.allDoctors')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('apptCal.allDoctors')}</SelectItem>
            {doctors?.map((doctor) => (
              <SelectItem key={doctor.id} value={doctor.id}>
                Dr. {doctor.profile?.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
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
            onClick={() => {
              setSelectedDate(currentDay);
              setViewMode('day');
            }}
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

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('apptCal.title')}
        description={t('apptCal.description')}
        breadcrumbs={[
          { label: t('nav.dashboard'), href: '/app' },
          { label: t('nav.appointments'), href: '/app/appointments' },
          { label: t('apptCal.title') },
        ]}
        actions={
          <Button onClick={() => navigate('/app/appointments/new')}>
            <Plus className="h-4 w-4 me-2" />
            {t('apptCal.newAppointment')}
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6">
          {renderHeader()}
          
          {viewMode === 'month' ? (
            <>
              {renderDays()}
              {renderCells()}
            </>
          ) : (
            <DoctorGridCalendar
              date={selectedDate}
              doctors={filteredDoctors}
              appointments={appointments || []}
              onSlotClick={handleSlotClick}
              onAppointmentClick={handleAppointmentClick}
            />
          )}
        </CardContent>
      </Card>

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
