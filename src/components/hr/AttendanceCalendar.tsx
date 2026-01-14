import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AttendanceStatusBadge } from "./AttendanceStatusBadge";
import { cn } from "@/lib/utils";

interface AttendanceRecord {
  attendance_date: string;
  status: string;
  check_in?: string | null;
  check_out?: string | null;
  working_hours?: number | null;
  late_minutes?: number | null;
}

interface AttendanceCalendarProps {
  records: AttendanceRecord[];
  month: number;
  year: number;
  onMonthChange?: (month: number, year: number) => void;
  onDateClick?: (date: string, record?: AttendanceRecord) => void;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function AttendanceCalendar({
  records,
  month,
  year,
  onMonthChange,
  onDateClick,
}: AttendanceCalendarProps) {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const today = new Date();

  const recordMap = new Map<string, AttendanceRecord>();
  records.forEach((record) => {
    recordMap.set(record.attendance_date, record);
  });

  const handlePrevMonth = () => {
    if (onMonthChange) {
      if (month === 1) {
        onMonthChange(12, year - 1);
      } else {
        onMonthChange(month - 1, year);
      }
    }
  };

  const handleNextMonth = () => {
    if (onMonthChange) {
      if (month === 12) {
        onMonthChange(1, year + 1);
      } else {
        onMonthChange(month + 1, year);
      }
    }
  };

  const formatDate = (day: number) => {
    const m = String(month).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
  };

  const isToday = (day: number) => {
    return (
      today.getDate() === day &&
      today.getMonth() === month - 1 &&
      today.getFullYear() === year
    );
  };

  const isFuture = (day: number) => {
    const date = new Date(year, month - 1, day);
    return date > today;
  };

  const formatTime = (time: string | null | undefined) => {
    if (!time) return "-";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" onClick={handlePrevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold">
          {MONTHS[month - 1]} {year}
        </h3>
        <Button variant="outline" size="icon" onClick={handleNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Days header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before the first day of month */}
        {Array.from({ length: firstDay }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {/* Days of the month */}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const dateStr = formatDate(day);
          const record = recordMap.get(dateStr);
          const future = isFuture(day);

          return (
            <div
              key={day}
              className={cn(
                "aspect-square p-1 border rounded-md flex flex-col items-center justify-center gap-0.5 transition-colors",
                isToday(day) && "border-primary border-2",
                future && "opacity-50",
                !future && onDateClick && "cursor-pointer hover:bg-accent/50"
              )}
              onClick={() => !future && onDateClick?.(dateStr, record)}
            >
              <span
                className={cn(
                  "text-sm",
                  isToday(day) && "font-bold text-primary"
                )}
              >
                {day}
              </span>
              {record && !future && (
                <AttendanceStatusBadge status={record.status} size="sm" />
              )}
              {record?.check_in && (
                <span className="text-[9px] text-muted-foreground">
                  {formatTime(record.check_in)}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t">
        <div className="flex items-center gap-1.5">
          <AttendanceStatusBadge status="present" size="sm" />
          <span className="text-xs text-muted-foreground">Present</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AttendanceStatusBadge status="absent" size="sm" />
          <span className="text-xs text-muted-foreground">Absent</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AttendanceStatusBadge status="late" size="sm" />
          <span className="text-xs text-muted-foreground">Late</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AttendanceStatusBadge status="half_day" size="sm" />
          <span className="text-xs text-muted-foreground">Half Day</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AttendanceStatusBadge status="on_leave" size="sm" />
          <span className="text-xs text-muted-foreground">Leave</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AttendanceStatusBadge status="weekend" size="sm" />
          <span className="text-xs text-muted-foreground">Weekend</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AttendanceStatusBadge status="holiday" size="sm" />
          <span className="text-xs text-muted-foreground">Holiday</span>
        </div>
      </div>
    </div>
  );
}
