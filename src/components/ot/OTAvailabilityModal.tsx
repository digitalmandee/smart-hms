import { useState } from "react";
import { format, addDays, startOfWeek, addWeeks } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useOTRooms, useSurgeries } from "@/hooks/useOT";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface OTAvailabilityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSlotSelect?: (date: string, roomId: string, time: string) => void;
  preferredDateFrom?: string;
  preferredDateTo?: string;
}

export function OTAvailabilityModal({
  open,
  onOpenChange,
  onSlotSelect,
  preferredDateFrom,
  preferredDateTo,
}: OTAvailabilityModalProps) {
  const { profile } = useAuth();
  const [weekOffset, setWeekOffset] = useState(0);
  
  const weekStart = startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  const { data: rooms } = useOTRooms(profile?.branch_id || undefined);
  const { data: surgeries } = useSurgeries();

  // Filter surgeries for the current week
  const weekSurgeries = surgeries?.filter(s => {
    const surgeryDate = new Date(s.scheduled_date);
    return surgeryDate >= weekStart && surgeryDate < addDays(weekStart, 7);
  }) || [];

  // Check if a slot is available
  const getSlotStatus = (date: Date, roomId: string) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const roomSurgeries = weekSurgeries.filter(
      s => s.scheduled_date === dateStr && s.ot_room_id === roomId && s.status !== "cancelled"
    );

    if (roomSurgeries.length === 0) return "available";
    if (roomSurgeries.length >= 3) return "full";
    return "partial";
  };

  const handleSlotClick = (date: Date, roomId: string) => {
    const status = getSlotStatus(date, roomId);
    if (status === "full") return;
    
    onSlotSelect?.(format(date, "yyyy-MM-dd"), roomId, "09:00");
    onOpenChange(false);
  };

  const statusConfig = {
    available: { 
      label: "Available", 
      className: "bg-success/10 text-success border-success/20 hover:bg-success/20 cursor-pointer",
      icon: CheckCircle2 
    },
    partial: { 
      label: "Partial", 
      className: "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20 cursor-pointer",
      icon: Clock 
    },
    full: { 
      label: "Full", 
      className: "bg-destructive/10 text-destructive border-destructive/20 cursor-not-allowed opacity-60",
      icon: XCircle 
    },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>OT Room Availability</DialogTitle>
          <DialogDescription>
            View available OT slots for the selected week. Click on an available slot to select it.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWeekOffset(prev => prev - 1)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous Week
          </Button>
          
          <span className="font-medium">
            {format(weekStart, "MMM d")} - {format(addDays(weekStart, 6), "MMM d, yyyy")}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWeekOffset(prev => prev + 1)}
          >
            Next Week
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Legend */}
        <div className="flex gap-4 justify-center mb-4">
          {Object.entries(statusConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-1.5 text-xs">
              <config.icon className="h-3.5 w-3.5" />
              <span>{config.label}</span>
            </div>
          ))}
        </div>

        <ScrollArea className="h-[400px]">
          <div className="min-w-[800px]">
            {/* Header Row - Days */}
            <div className="grid grid-cols-8 gap-2 mb-2">
              <div className="text-sm font-medium text-muted-foreground p-2">OT Room</div>
              {weekDays.map(day => (
                <div key={day.toISOString()} className="text-center p-2">
                  <p className="text-xs text-muted-foreground">{format(day, "EEE")}</p>
                  <p className="font-medium">{format(day, "d")}</p>
                </div>
              ))}
            </div>

            {/* Room Rows */}
            {rooms?.map(room => (
              <div key={room.id} className="grid grid-cols-8 gap-2 mb-2">
                <div className="p-2 flex items-center">
                  <div>
                    <p className="font-medium text-sm">{room.name}</p>
                    <p className="text-xs text-muted-foreground">{room.room_type}</p>
                  </div>
                </div>
                
                {weekDays.map(day => {
                  const status = getSlotStatus(day, room.id);
                  const config = statusConfig[status];
                  const isPast = day < new Date(new Date().setHours(0,0,0,0));
                  
                  return (
                    <div
                      key={`${room.id}-${day.toISOString()}`}
                      className={cn(
                        "p-2 rounded-lg border text-center transition-colors",
                        isPast ? "bg-muted/50 cursor-not-allowed opacity-50" : config.className
                      )}
                      onClick={() => !isPast && handleSlotClick(day, room.id)}
                    >
                      <config.icon className="h-4 w-4 mx-auto" />
                      <p className="text-xs mt-1">{config.label}</p>
                    </div>
                  );
                })}
              </div>
            ))}

            {(!rooms || rooms.length === 0) && (
              <p className="text-center text-muted-foreground py-8">
                No OT rooms configured for this branch
              </p>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
