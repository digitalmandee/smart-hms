import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2 } from "lucide-react";

export type DepartmentType = 
  | "all" 
  | "opd" 
  | "ipd" 
  | "lab" 
  | "radiology" 
  | "pharmacy" 
  | "surgery" 
  | "emergency"
  | "consultation"
  | "procedure";

interface DepartmentFilterProps {
  value: DepartmentType;
  onChange: (value: DepartmentType) => void;
  className?: string;
  showLabel?: boolean;
}

export const DEPARTMENT_OPTIONS: { value: DepartmentType; label: string; color: string }[] = [
  { value: "all", label: "All Departments", color: "bg-gray-500" },
  { value: "opd", label: "OPD", color: "bg-blue-500" },
  { value: "ipd", label: "IPD", color: "bg-purple-500" },
  { value: "consultation", label: "Consultation", color: "bg-indigo-500" },
  { value: "lab", label: "Laboratory", color: "bg-cyan-500" },
  { value: "radiology", label: "Radiology", color: "bg-orange-500" },
  { value: "pharmacy", label: "Pharmacy", color: "bg-pink-500" },
  { value: "surgery", label: "Surgery / OT", color: "bg-red-500" },
  { value: "procedure", label: "Procedures", color: "bg-teal-500" },
  { value: "emergency", label: "Emergency", color: "bg-amber-500" },
];

export function getDepartmentLabel(dept: DepartmentType): string {
  return DEPARTMENT_OPTIONS.find(opt => opt.value === dept)?.label || "All Departments";
}

export function getDepartmentColor(dept: DepartmentType): string {
  return DEPARTMENT_OPTIONS.find(opt => opt.value === dept)?.color || "bg-gray-500";
}

export function DepartmentFilter({ value, onChange, className, showLabel = true }: DepartmentFilterProps) {
  return (
    <div className="flex items-center gap-2">
      {showLabel && <Building2 className="h-4 w-4 text-muted-foreground" />}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={className || "w-[180px]"}>
          <SelectValue placeholder="Select Department" />
        </SelectTrigger>
        <SelectContent>
          {DEPARTMENT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${option.color}`} />
                {option.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
