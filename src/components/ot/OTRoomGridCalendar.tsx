import { useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { OTStatusBadge } from './OTStatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { otLogger } from '@/lib/logger';
import type { OTRoom, Surgery } from '@/hooks/useOT';

interface OTRoomGridCalendarProps {
  date: Date;
  rooms: OTRoom[];
  surgeries: Surgery[];
  onSlotClick: (roomId: string, time: string) => void;
  onSurgeryClick: (surgeryId: string) => void;
  startHour?: number;
  endHour?: number;
  isLoading?: boolean;
}

export function OTRoomGridCalendar({
  date,
  rooms,
  surgeries,
  onSlotClick,
  onSurgeryClick,
  startHour = 7,
  endHour = 20,
  isLoading = false,
}: OTRoomGridCalendarProps) {
  const dateStr = format(date, 'yyyy-MM-dd');

  // Filter surgeries to only those for the current date
  const surgeriesForDate = useMemo(() => {
    const filtered = surgeries.filter(s => s.scheduled_date === dateStr);
    return filtered;
  }, [surgeries, dateStr]);

  // Debug logging for surgery visibility
  useEffect(() => {
    otLogger.debug('OTRoomGridCalendar: Rendering', {
      date: dateStr,
      totalSurgeries: surgeries.length,
      surgeriesForDate: surgeriesForDate.length,
      roomCount: rooms.length,
    });

    // Log details of each surgery for the date
    surgeriesForDate.forEach(s => {
      otLogger.debug('OTRoomGridCalendar: Surgery for date', {
        id: s.id,
        surgeryNumber: s.surgery_number,
        scheduledDate: s.scheduled_date,
        scheduledStartTime: s.scheduled_start_time,
        otRoomId: s.ot_room_id,
        status: s.status,
        roomMatch: rooms.some(r => r.id === s.ot_room_id),
      });
    });

    // Log any surgeries that won't display due to missing room
    const orphanedSurgeries = surgeriesForDate.filter(s => !rooms.some(r => r.id === s.ot_room_id));
    if (orphanedSurgeries.length > 0) {
      otLogger.warn('OTRoomGridCalendar: Surgeries with no matching room', {
        orphanedCount: orphanedSurgeries.length,
        surgeries: orphanedSurgeries.map(s => ({
          id: s.id,
          surgeryNumber: s.surgery_number,
          otRoomId: s.ot_room_id,
        })),
      });
    }
  }, [surgeries, surgeriesForDate, rooms, dateStr]);

  // Generate hourly time slots
  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let hour = startHour; hour < endHour; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      slots.push(time);
    }
    return slots;
  }, [startHour, endHour]);

  // Parse time to minutes since midnight - handles HH:MM:SS and HH:MM formats
  const parseTime = (timeStr: string): number => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':').map(Number);
    const hours = parts[0] || 0;
    const minutes = parts[1] || 0;
    return hours * 60 + minutes;
  };

  // Check if a surgery occupies a time slot
  const getSurgeryForSlot = (roomId: string, slotTime: string) => {
    const slotMinutes = parseTime(slotTime);
    
    return surgeriesForDate.find((s) => {
      if (s.ot_room_id !== roomId || s.status === 'cancelled') return false;
      
      const startMinutes = parseTime(s.scheduled_start_time);
      const duration = s.estimated_duration_minutes || 60;
      const endMinutes = startMinutes + duration;
      
      return slotMinutes >= startMinutes && slotMinutes < endMinutes;
    });
  };

  // Check if this is the start slot of a surgery
  const isSurgeryStartSlot = (roomId: string, slotTime: string) => {
    const slotMinutes = parseTime(slotTime);
    
    return surgeriesForDate.find((s) => {
      if (s.ot_room_id !== roomId || s.status === 'cancelled') return false;
      const startMinutes = parseTime(s.scheduled_start_time);
      return slotMinutes <= startMinutes && startMinutes < slotMinutes + 60;
    });
  };

  // Calculate how many slots a surgery spans
  const getSurgerySpan = (surgery: Surgery) => {
    const duration = surgery.estimated_duration_minutes || 60;
    return Math.ceil(duration / 60);
  };

  // Format time for display
  const formatTimeDisplay = (time: string) => {
    const [hours] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    return `${displayHour}:00 ${period}`;
  };

  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Loading schedule...
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No OT rooms available for the selected branch
      </div>
    );
  }

  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-md border">
      <div className="min-w-max">
        {/* Header row with room names */}
        <div className="flex border-b bg-muted/50 sticky top-0 z-10">
          <div className="w-24 flex-shrink-0 p-3 font-medium text-sm border-r">
            Time
          </div>
          {rooms.map((room) => (
            <div
              key={room.id}
              className="w-48 flex-shrink-0 p-3 border-r text-center"
            >
              <p className="font-medium text-sm">
                {room.name || `OT ${room.room_number}`}
              </p>
              <p className="text-xs text-muted-foreground">
                {room.room_type || 'General'} • Floor {room.floor || 1}
              </p>
              <Badge 
                variant={room.status === 'available' ? 'default' : 'secondary'}
                className="mt-1 text-[10px] capitalize"
              >
                {room.status}
              </Badge>
            </div>
          ))}
        </div>

        {/* Time slots grid */}
        <div className="divide-y">
          {timeSlots.map((time, slotIndex) => (
            <div key={time} className="flex">
              {/* Time column */}
              <div className="w-24 flex-shrink-0 p-2 text-sm font-medium text-muted-foreground border-r bg-muted/30 h-20 flex items-center">
                {formatTimeDisplay(time)}
              </div>

              {/* Room columns */}
              {rooms.map((room) => {
                const surgery = getSurgeryForSlot(room.id, time);
                const isStartSlot = isSurgeryStartSlot(room.id, time);
                const isAvailable = !surgery && room.status === 'available';
                const isMaintenance = room.status === 'maintenance';

                // If this is a continuation of a surgery (not the start), render empty
                if (surgery && !isStartSlot) {
                  return (
                    <div
                      key={`${room.id}-${time}`}
                      className="w-48 flex-shrink-0 border-r h-20"
                    />
                  );
                }

                return (
                  <div
                    key={`${room.id}-${time}`}
                    className={cn(
                      'w-48 flex-shrink-0 p-1 border-r h-20 transition-colors',
                      isAvailable && 'hover:bg-primary/10 cursor-pointer',
                      isMaintenance && 'bg-muted/50'
                    )}
                    onClick={() => {
                      if (isAvailable) {
                        onSlotClick(room.id, time);
                      } else if (surgery) {
                        onSurgeryClick(surgery.id);
                      }
                    }}
                    style={
                      surgery && isStartSlot
                        ? { height: `${getSurgerySpan(surgery) * 80}px` }
                        : undefined
                    }
                  >
                    {surgery && isStartSlot ? (
                      <div
                        className={cn(
                          'p-2 rounded border text-xs h-full cursor-pointer hover:opacity-80 transition-opacity',
                          surgery.status === 'in_progress'
                            ? 'bg-green-500/20 border-green-500'
                            : surgery.status === 'completed'
                            ? 'bg-muted border-muted-foreground/20'
                            : 'bg-blue-500/20 border-blue-500'
                        )}
                      >
                        <div className="flex items-center gap-1 mb-1">
                          <OTStatusBadge status={surgery.status} className="text-[10px] px-1 py-0" />
                          <PriorityBadge priority={surgery.priority} className="text-[10px] px-1 py-0" />
                        </div>
                        <p className="font-medium truncate">
                          {surgery.patient?.first_name} {surgery.patient?.last_name}
                        </p>
                        <p className="text-muted-foreground truncate">
                          {surgery.procedure_name}
                        </p>
                        <p className="text-muted-foreground">
                          {format(new Date(`2000-01-01T${surgery.scheduled_start_time}`), 'h:mm a')}
                          {surgery.estimated_duration_minutes && 
                            ` (${surgery.estimated_duration_minutes} min)`
                          }
                        </p>
                        {surgery.lead_surgeon?.profile?.full_name && (
                          <p className="text-muted-foreground truncate mt-1">
                            Dr. {surgery.lead_surgeon.profile.full_name}
                          </p>
                        )}
                      </div>
                    ) : isMaintenance ? (
                      <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                        Maintenance
                      </div>
                    ) : isAvailable ? (
                      <div className="h-full flex items-center justify-center text-xs text-muted-foreground opacity-0 hover:opacity-100 transition-opacity">
                        Click to book
                      </div>
                    ) : null}
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
