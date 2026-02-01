import { format, isToday, startOfWeek, addDays } from "date-fns";
import { Calendar, Clock, Sun, Moon, Sunrise, Sunset, Coffee, User, Building2, BadgeCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { Capacitor } from "@capacitor/core";

interface Shift {
  id: string;
  name: string;
  start_time: string | null;
  end_time: string | null;
  break_duration_minutes: number;
  is_night_shift: boolean;
  is_active: boolean;
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  employee_number: string;
  shift: Shift | null;
  department?: { name: string } | null;
  designation?: { name: string } | null;
}

interface ShiftAssignment {
  effective_from: string;
  shift: Shift | null;
}

interface MobileMyScheduleProps {
  employee: Employee;
  assignments: ShiftAssignment[];
}

export function MobileMySchedule({ employee, assignments }: MobileMyScheduleProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const scrollRef = useRef<HTMLDivElement>(null);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    return addDays(weekStart, i);
  });

  // Scroll to today on mount
  useEffect(() => {
    const todayIndex = weekDays.findIndex(day => isToday(day));
    if (scrollRef.current && todayIndex >= 0) {
      const scrollContainer = scrollRef.current;
      const dayWidth = 64; // w-16 = 4rem = 64px
      const gap = 8; // gap-2 = 0.5rem = 8px
      const containerWidth = scrollContainer.clientWidth;
      const scrollPosition = (todayIndex * (dayWidth + gap)) - (containerWidth / 2) + (dayWidth / 2);
      scrollContainer.scrollTo({ left: Math.max(0, scrollPosition), behavior: 'smooth' });
    }
  }, []);

  const formatTime = (time: string | null) => {
    if (!time) return "N/A";
    const [hours, minutes] = time.split(":");
    const h = parseInt(hours);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getShiftIcon = (shiftName: string | undefined, size = "h-5 w-5") => {
    if (!shiftName) return <Clock className={size} />;
    const name = shiftName.toLowerCase();
    if (name.includes("morning")) return <Sunrise className={cn(size, "text-amber-500")} />;
    if (name.includes("evening")) return <Sunset className={cn(size, "text-orange-500")} />;
    if (name.includes("night")) return <Moon className={cn(size, "text-indigo-500")} />;
    if (name.includes("general")) return <Sun className={cn(size, "text-yellow-500")} />;
    return <Clock className={cn(size, "text-primary")} />;
  };

  const getShiftForDay = (day: Date) => {
    const dayStr = format(day, "yyyy-MM-dd");
    const assignment = assignments?.find(a => a.effective_from === dayStr);
    return assignment?.shift || employee?.shift;
  };

  const selectedShift = getShiftForDay(selectedDate);

  const handleDaySelect = async (day: Date) => {
    setSelectedDate(day);
    if (Capacitor.isNativePlatform()) {
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch (e) {}
    }
  };

  return (
    <div className="px-4 py-4 space-y-4 pb-24">
      {/* Date Header */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Week of {format(weekDays[0], "MMM d")} - {format(weekDays[6], "MMM d, yyyy")}
        </p>
        <h2 className="text-lg font-semibold mt-1">
          {isToday(selectedDate) ? "Today" : format(selectedDate, "EEEE")}, {format(selectedDate, "MMM d")}
        </h2>
      </div>

      {/* Horizontal Scrollable Day Selector */}
      <div 
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scroll-smooth scrollbar-hide"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {weekDays.map((day, index) => {
          const dayShift = getShiftForDay(day);
          const isTodayDay = isToday(day);
          const isSelected = format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
          
          return (
            <button
              key={index}
              onClick={() => handleDaySelect(day)}
              className={cn(
                "flex-shrink-0 w-16 py-3 rounded-xl border text-center transition-all touch-manipulation",
                "active:scale-95",
                isSelected 
                  ? "bg-primary text-primary-foreground border-primary shadow-md" 
                  : isTodayDay
                    ? "border-primary/50 bg-primary/5"
                    : "border-border bg-card hover:border-primary/30"
              )}
              style={{ scrollSnapAlign: 'center' }}
            >
              <div className={cn(
                "text-xs font-medium uppercase",
                isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
              )}>
                {format(day, "EEE")}
              </div>
              <div className={cn(
                "text-xl font-bold",
                isSelected ? "text-primary-foreground" : ""
              )}>
                {format(day, "d")}
              </div>
              <div className="mt-1 flex justify-center">
                {dayShift ? (
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    isSelected ? "bg-primary-foreground" : "bg-primary"
                  )} />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Day Shift Details */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          {selectedShift ? (
            <div className="space-y-4">
              {/* Shift Header */}
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-primary/10">
                  {getShiftIcon(selectedShift.name, "h-6 w-6")}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{selectedShift.name}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant={selectedShift.is_active ? "default" : "secondary"} className="text-xs">
                      {selectedShift.is_active ? "Active" : "Inactive"}
                    </Badge>
                    {selectedShift.is_night_shift && (
                      <Badge variant="outline" className="text-xs gap-1">
                        <Moon className="h-3 w-3" />
                        Night
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Time Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Start Time</p>
                  <p className="text-lg font-semibold">{formatTime(selectedShift.start_time)}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">End Time</p>
                  <p className="text-lg font-semibold">{formatTime(selectedShift.end_time)}</p>
                </div>
              </div>

              {/* Break Duration */}
              {selectedShift.break_duration_minutes > 0 && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/30 rounded-lg py-2">
                  <Coffee className="h-4 w-4" />
                  <span>{selectedShift.break_duration_minutes} min break</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No shift scheduled</p>
              <p className="text-sm text-muted-foreground/70">Day Off</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Employee Details Card */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4 space-y-3">
          <h4 className="font-medium text-muted-foreground text-sm uppercase tracking-wide">Employee Details</h4>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="font-medium">{employee.first_name} {employee.last_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Department</p>
                <p className="font-medium">{employee.department?.name || "N/A"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <BadgeCheck className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Designation</p>
                <p className="font-medium">{employee.designation?.name || "N/A"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-muted">
                <span className="text-xs font-mono font-semibold text-muted-foreground">#</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Employee ID</p>
                <p className="font-medium font-mono">{employee.employee_number}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
