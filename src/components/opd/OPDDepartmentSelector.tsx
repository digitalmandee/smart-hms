import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useOPDDepartments } from "@/hooks/useOPDDepartments";
import { Loader2, Building2 } from "lucide-react";

interface OPDDepartmentSelectorProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  branchId?: string;
  showAllOption?: boolean;
  allOptionLabel?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showLabel?: boolean;
}

export function OPDDepartmentSelector({
  value,
  onChange,
  branchId,
  showAllOption = false,
  allOptionLabel = "All Departments",
  placeholder = "Select OPD Department",
  disabled = false,
  className,
  showLabel = true,
}: OPDDepartmentSelectorProps) {
  const { data: departments, isLoading } = useOPDDepartments(branchId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 h-10 px-3">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading departments...</span>
      </div>
    );
  }

  if (!departments || departments.length === 0) {
    return null; // Don't show selector if no departments configured
  }

  return (
    <div className="flex items-center gap-2">
      {showLabel && <Building2 className="h-4 w-4 text-muted-foreground" />}
      <Select
        value={value || (showAllOption ? "all" : undefined)}
        onValueChange={(v) => onChange(v === "all" ? undefined : v)}
        disabled={disabled}
      >
        <SelectTrigger className={className || "w-[200px]"}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {showAllOption && (
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                {allOptionLabel}
              </div>
            </SelectItem>
          )}
          {departments.map((dept) => (
            <SelectItem key={dept.id} value={dept.id}>
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: dept.color || "#3b82f6" }}
                />
                <span>{dept.name}</span>
                <Badge variant="outline" className="ml-1 text-xs">
                  {dept.code}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
