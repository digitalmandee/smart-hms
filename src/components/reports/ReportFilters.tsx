import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Download, Printer, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateRange {
  from: Date;
  to: Date;
}

interface FilterOption {
  value: string;
  label: string;
}

interface ReportFiltersProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  
  // Optional filters - support both naming conventions for flexibility
  showBranchFilter?: boolean;
  branches?: FilterOption[];
  branchOptions?: FilterOption[];
  selectedBranch?: string;
  onBranchChange?: (value: string) => void;
  
  showDoctorFilter?: boolean;
  doctors?: FilterOption[];
  doctorOptions?: FilterOption[];
  selectedDoctor?: string;
  onDoctorChange?: (value: string) => void;
  
  showStatusFilter?: boolean;
  statusOptions?: FilterOption[];
  selectedStatus?: string;
  onStatusChange?: (value: string) => void;
  
  showPaymentMethodFilter?: boolean;
  paymentMethods?: FilterOption[];
  selectedPaymentMethod?: string;
  onPaymentMethodChange?: (value: string) => void;
  
  // Export actions
  onExportCSV?: () => void;
  onPrint?: () => void;
  
  // Loading state
  isLoading?: boolean;
}

const presetRanges = [
  { label: "Today", days: 0 },
  { label: "Yesterday", days: 1 },
  { label: "Last 7 Days", days: 7 },
  { label: "Last 30 Days", days: 30 },
  { label: "This Month", days: -1 }, // Special case
  { label: "Last Month", days: -2 }, // Special case
];

export function ReportFilters({
  dateRange,
  onDateRangeChange,
  showBranchFilter,
  branches,
  branchOptions,
  selectedBranch,
  onBranchChange,
  showDoctorFilter,
  doctors,
  doctorOptions,
  selectedDoctor,
  onDoctorChange,
  showStatusFilter,
  statusOptions,
  selectedStatus,
  onStatusChange,
  showPaymentMethodFilter,
  paymentMethods,
  selectedPaymentMethod,
  onPaymentMethodChange,
  onExportCSV,
  onPrint,
  isLoading,
}: ReportFiltersProps) {
  // Merge options arrays (support both naming conventions)
  const branchList = branches || branchOptions || [];
  const doctorList = doctors || doctorOptions || [];
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const handlePresetClick = (days: number) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    if (days === 0) {
      // Today
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      onDateRangeChange({ from: start, to: today });
    } else if (days === 1) {
      // Yesterday
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      const yesterdayEnd = new Date(yesterday);
      yesterdayEnd.setHours(23, 59, 59, 999);
      onDateRangeChange({ from: yesterday, to: yesterdayEnd });
    } else if (days === -1) {
      // This month
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      onDateRangeChange({ from: start, to: today });
    } else if (days === -2) {
      // Last month
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      end.setHours(23, 59, 59, 999);
      onDateRangeChange({ from: start, to: end });
    } else {
      // Last N days
      const start = new Date(today);
      start.setDate(start.getDate() - days);
      start.setHours(0, 0, 0, 0);
      onDateRangeChange({ from: start, to: today });
    }
  };

  const hasActiveFilters = selectedBranch !== 'all' || selectedDoctor !== 'all' || 
    selectedStatus !== 'all' || selectedPaymentMethod !== 'all';

  const clearFilters = () => {
    if (onBranchChange) onBranchChange('all');
    if (onDoctorChange) onDoctorChange('all');
    if (onStatusChange) onStatusChange('all');
    if (onPaymentMethodChange) onPaymentMethodChange('all');
  };

  return (
    <div className="space-y-4">
      {/* Main Row: Date Range + Actions */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Date Range Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start text-left font-normal min-w-[240px]">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(dateRange.from, "MMM dd, yyyy")} - {format(dateRange.to, "MMM dd, yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3 border-b">
              <div className="flex flex-wrap gap-1">
                {presetRanges.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePresetClick(preset.days)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
            <Calendar
              mode="range"
              selected={{ from: dateRange.from, to: dateRange.to }}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  onDateRangeChange({ from: range.from, to: range.to });
                } else if (range?.from) {
                  onDateRangeChange({ from: range.from, to: range.from });
                }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        {/* Filters Toggle */}
        {(showBranchFilter || showDoctorFilter || showStatusFilter || showPaymentMethodFilter) && (
          <Button
            variant={hasActiveFilters ? "default" : "outline"}
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && <span className="ml-1 bg-white text-primary rounded-full w-5 h-5 text-xs flex items-center justify-center">!</span>}
          </Button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Export Actions */}
        {onExportCSV && (
          <Button variant="outline" onClick={onExportCSV} disabled={isLoading}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        )}
        {onPrint && (
          <Button variant="outline" onClick={onPrint} disabled={isLoading}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        )}
      </div>

      {/* Expandable Filters Row */}
      {isFiltersOpen && (
        <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/50 rounded-lg">
          {showBranchFilter && branchList.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Branch:</span>
              <Select value={selectedBranch || 'all'} onValueChange={onBranchChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branchList.map((branch) => (
                    <SelectItem key={branch.value} value={branch.value}>
                      {branch.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {showDoctorFilter && doctorList.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Doctor:</span>
              <Select value={selectedDoctor || 'all'} onValueChange={onDoctorChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Doctors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doctors</SelectItem>
                  {doctorList.map((doctor) => (
                    <SelectItem key={doctor.value} value={doctor.value}>
                      {doctor.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {showStatusFilter && statusOptions && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Select value={selectedStatus || 'all'} onValueChange={onStatusChange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {showPaymentMethodFilter && paymentMethods && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Payment:</span>
              <Select value={selectedPaymentMethod || 'all'} onValueChange={onPaymentMethodChange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
              <X className="h-4 w-4 mr-1" />
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
