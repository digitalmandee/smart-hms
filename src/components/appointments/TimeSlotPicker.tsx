import { useEffect } from 'react';
import { useAvailableSlots } from '@/hooks/useDoctors';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface TimeSlotPickerProps {
  doctorId: string;
  date: string;
  selectedSlot: string | null;
  initialSlot?: string | null; // Pre-fill from URL params
  onSelect: (slot: string) => void;
}

export function TimeSlotPicker({
  doctorId,
  date,
  selectedSlot,
  initialSlot,
  onSelect,
}: TimeSlotPickerProps) {
  const { data: slots, isLoading } = useAvailableSlots(doctorId, date);

  // Auto-select initial slot when slots are loaded and no slot is selected yet
  useEffect(() => {
    if (initialSlot && slots && slots.length > 0 && !selectedSlot) {
      const matchingSlot = slots.find(s => s.time === initialSlot && s.available);
      if (matchingSlot) {
        onSelect(matchingSlot.time);
      }
    }
  }, [initialSlot, slots, selectedSlot, onSelect]);

  if (!doctorId || !date) {
    return (
      <div className="p-6 text-center text-muted-foreground border rounded-lg bg-muted/50">
        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Select a doctor and date to see available slots</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="h-10 rounded-md" />
        ))}
      </div>
    );
  }

  if (!slots || slots.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground border rounded-lg bg-muted/50">
        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No slots available for this date</p>
        <p className="text-sm mt-1">Try selecting a different date or doctor</p>
      </div>
    );
  }

  const morningSlots = slots.filter(s => {
    const hour = parseInt(s.time.split(':')[0]);
    return hour < 12;
  });

  const afternoonSlots = slots.filter(s => {
    const hour = parseInt(s.time.split(':')[0]);
    return hour >= 12 && hour < 17;
  });

  const eveningSlots = slots.filter(s => {
    const hour = parseInt(s.time.split(':')[0]);
    return hour >= 17;
  });

  const renderSlotGroup = (groupSlots: typeof slots, label: string) => {
    if (groupSlots.length === 0) return null;

    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">{label}</h4>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {groupSlots.map((slot) => (
            <button
              key={slot.time}
              type="button"
              onClick={() => slot.available && onSelect(slot.time)}
              disabled={!slot.available}
              className={cn(
                'px-3 py-2 text-sm rounded-md border transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                slot.available
                  ? selectedSlot === slot.time
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background hover:bg-muted border-border'
                  : 'bg-muted/50 text-muted-foreground cursor-not-allowed border-transparent'
              )}
            >
              {formatTime12Hour(slot.time)}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {renderSlotGroup(morningSlots, 'Morning')}
      {renderSlotGroup(afternoonSlots, 'Afternoon')}
      {renderSlotGroup(eveningSlots, 'Evening')}
    </div>
  );
}

function formatTime12Hour(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
}
