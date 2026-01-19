import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DAYS_OF_WEEK = [
  { value: "monday", label: "Mon" },
  { value: "tuesday", label: "Tue" },
  { value: "wednesday", label: "Wed" },
  { value: "thursday", label: "Thu" },
  { value: "friday", label: "Fri" },
  { value: "saturday", label: "Sat" },
  { value: "sunday", label: "Sun" },
];

interface WorkingHoursEditorProps {
  workingDays: string[];
  startTime: string;
  endTime: string;
  onWorkingDaysChange: (days: string[]) => void;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  disabled?: boolean;
}

export function WorkingHoursEditor({
  workingDays,
  startTime,
  endTime,
  onWorkingDaysChange,
  onStartTimeChange,
  onEndTimeChange,
  disabled = false,
}: WorkingHoursEditorProps) {
  const toggleDay = (day: string) => {
    if (workingDays.includes(day)) {
      onWorkingDaysChange(workingDays.filter((d) => d !== day));
    } else {
      onWorkingDaysChange([...workingDays, day]);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Working Days</Label>
        <div className="flex flex-wrap gap-3 mt-2">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day.value} className="flex items-center space-x-2">
              <Checkbox
                id={`day-${day.value}`}
                checked={workingDays.includes(day.value)}
                onCheckedChange={() => toggleDay(day.value)}
                disabled={disabled}
              />
              <Label
                htmlFor={`day-${day.value}`}
                className="text-sm cursor-pointer"
              >
                {day.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="start-time">Opening Time</Label>
          <Input
            id="start-time"
            type="time"
            value={startTime}
            onChange={(e) => onStartTimeChange(e.target.value)}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end-time">Closing Time</Label>
          <Input
            id="end-time"
            type="time"
            value={endTime}
            onChange={(e) => onEndTimeChange(e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
