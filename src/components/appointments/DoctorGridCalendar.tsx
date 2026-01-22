import { useMemo } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import type { DoctorWithProfile } from '@/hooks/useDoctors';
import type { AppointmentWithRelations } from '@/hooks/useAppointments';

interface DoctorGridCalendarProps {
  date: Date;
  doctors: DoctorWithProfile[];
  appointments: AppointmentWithRelations[];
  onSlotClick: (doctorId: string, time: string) => void;
  onAppointmentClick: (appointmentId: string) => void;
  startHour?: number;
  endHour?: number;
  slotDuration?: number; // in minutes
}

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-500/20 border-blue-500 text-blue-700 dark:text-blue-300',
  checked_in: 'bg-yellow-500/20 border-yellow-500 text-yellow-700 dark:text-yellow-300',
  in_progress: 'bg-green-500/20 border-green-500 text-green-700 dark:text-green-300',
  completed: 'bg-muted border-muted-foreground/20 text-muted-foreground',
  cancelled: 'bg-red-500/20 border-red-500 text-red-700 dark:text-red-300',
  no_show: 'bg-orange-500/20 border-orange-500 text-orange-700 dark:text-orange-300',
};

export function DoctorGridCalendar({
  date,
  doctors,
  appointments,
  onSlotClick,
  onAppointmentClick,
  startHour = 8,
  endHour = 20,
  slotDuration = 30,
}: DoctorGridCalendarProps) {
  // Generate time slots
  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  }, [startHour, endHour, slotDuration]);

  // Get appointment for a specific doctor and time
  const getAppointmentForSlot = (doctorId: string, time: string) => {
    return appointments.find(
      (a) =>
        a.doctor_id === doctorId &&
        a.appointment_time?.startsWith(time) &&
        a.status !== 'cancelled'
    );
  };

  // Format time for display
  const formatTimeDisplay = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const dateStr = format(date, 'yyyy-MM-dd');

  if (doctors.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No doctors available for the selected branch
      </div>
    );
  }

  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-md border">
      <div className="min-w-max">
        {/* Header row with doctor names */}
        <div className="flex border-b bg-muted/50 sticky top-0 z-10">
          <div className="w-24 flex-shrink-0 p-3 font-medium text-sm border-r">
            Time
          </div>
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="w-40 flex-shrink-0 p-3 border-r text-center"
            >
              <Avatar className="h-10 w-10 mx-auto mb-2">
                <AvatarFallback className="text-xs">
                  {doctor.profile?.full_name?.split(' ').map((n) => n[0]).join('') || 'DR'}
                </AvatarFallback>
              </Avatar>
              <p className="font-medium text-sm truncate">
                {doctor.profile?.full_name || 'Unknown'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {doctor.specialization || 'General'}
              </p>
            </div>
          ))}
        </div>

        {/* Time slots grid */}
        <div className="divide-y">
          {timeSlots.map((time) => (
            <div key={time} className="flex">
              {/* Time column */}
              <div className="w-24 flex-shrink-0 p-2 text-sm font-medium text-muted-foreground border-r bg-muted/30">
                {formatTimeDisplay(time)}
              </div>

              {/* Doctor columns */}
              {doctors.map((doctor) => {
                const appointment = getAppointmentForSlot(doctor.id, time);
                const isAvailable = !appointment;

                return (
                  <div
                    key={`${doctor.id}-${time}`}
                    className={cn(
                      'w-40 flex-shrink-0 p-1 border-r min-h-[60px] transition-colors',
                      isAvailable && 'hover:bg-primary/10 cursor-pointer'
                    )}
                    onClick={() => {
                      if (isAvailable) {
                        onSlotClick(doctor.id, time);
                      } else if (appointment) {
                        onAppointmentClick(appointment.id);
                      }
                    }}
                  >
                    {appointment ? (
                      <div
                        className={cn(
                          'p-2 rounded border text-xs h-full cursor-pointer hover:opacity-80 transition-opacity',
                          statusColors[appointment.status || 'scheduled']
                        )}
                      >
                        <p className="font-medium truncate">
                          {appointment.patient?.first_name} {appointment.patient?.last_name}
                        </p>
                        <p className="text-muted-foreground truncate">
                          Token #{appointment.token_number}
                        </p>
                        <Badge variant="outline" className="mt-1 text-[10px] capitalize">
                          {appointment.status?.replace('_', ' ')}
                        </Badge>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-muted-foreground opacity-0 hover:opacity-100 transition-opacity">
                        Click to book
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
