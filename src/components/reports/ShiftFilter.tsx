import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock } from "lucide-react";

export type ShiftType = "all" | "morning" | "evening" | "night";

interface ShiftFilterProps {
  value: ShiftType;
  onChange: (value: ShiftType) => void;
  className?: string;
}

export const SHIFT_OPTIONS = [
  { value: "all", label: "All Shifts" },
  { value: "morning", label: "Morning (6AM - 2PM)" },
  { value: "evening", label: "Evening (2PM - 10PM)" },
  { value: "night", label: "Night (10PM - 6AM)" },
] as const;

export function getShiftFromTime(time: string | Date): ShiftType {
  const date = typeof time === "string" ? new Date(time) : time;
  const hour = date.getHours();
  
  if (hour >= 6 && hour < 14) return "morning";
  if (hour >= 14 && hour < 22) return "evening";
  return "night";
}

export function getShiftLabel(shift: ShiftType): string {
  return SHIFT_OPTIONS.find(opt => opt.value === shift)?.label || "All Shifts";
}

export function ShiftFilter({ value, onChange, className }: ShiftFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Clock className="h-4 w-4 text-muted-foreground" />
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={className || "w-[180px]"}>
          <SelectValue placeholder="Select Shift" />
        </SelectTrigger>
        <SelectContent>
          {SHIFT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
