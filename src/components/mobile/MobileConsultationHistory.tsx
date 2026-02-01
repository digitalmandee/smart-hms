import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PullToRefresh } from "@/components/mobile/PullToRefresh";
import { Search, Filter, CalendarIcon, Eye, History, User, Stethoscope, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { Capacitor } from "@capacitor/core";

interface Consultation {
  id: string;
  created_at: string;
  diagnosis?: string;
  patient?: {
    id: string;
    first_name?: string;
    last_name?: string;
    patient_number?: string;
  };
  doctor?: {
    profile?: {
      full_name?: string;
    };
  };
  appointment?: {
    token_number?: number;
  };
}

interface Doctor {
  id: string;
  profile?: {
    full_name?: string;
  };
}

interface MobileConsultationHistoryProps {
  consultations: Consultation[];
  doctors: Doctor[];
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  doctorFilter: string;
  onDoctorFilterChange: (value: string) => void;
  dateFrom?: Date;
  onDateFromChange: (date?: Date) => void;
  dateTo?: Date;
  onDateToChange: (date?: Date) => void;
  onClearFilters: () => void;
  onRefresh: () => Promise<void>;
}

export function MobileConsultationHistory({
  consultations,
  doctors,
  isLoading,
  search,
  onSearchChange,
  doctorFilter,
  onDoctorFilterChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  onClearFilters,
  onRefresh,
}: MobileConsultationHistoryProps) {
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const hasActiveFilters = doctorFilter !== "all" || dateFrom || dateTo;

  const triggerHaptic = async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  };

  const handleCardTap = async () => {
    await triggerHaptic();
  };

  return (
    <PullToRefresh onRefresh={onRefresh}>
      <div className="px-4 py-4 space-y-4 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Consultation History</h1>
            <p className="text-sm text-muted-foreground">
              {consultations.length} record(s)
            </p>
          </div>
          <Link to="/app/opd">
            <Button variant="outline" size="sm">
              <History className="h-4 w-4 mr-1" />
              OPD
            </Button>
          </Link>
        </div>

        {/* Search & Filter Row */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Patient name or MR#..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-12"
            />
          </div>
          <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant={hasActiveFilters ? "default" : "outline"}
                size="icon"
                className="h-12 w-12 shrink-0"
              >
                <Filter className="h-5 w-5" />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[70vh]">
              <SheetHeader>
                <SheetTitle>Filter Consultations</SheetTitle>
              </SheetHeader>
              <div className="py-6 space-y-6">
                {/* Doctor Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Doctor</label>
                  <Select value={doctorFilter} onValueChange={onDoctorFilterChange}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="All Doctors" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Doctors</SelectItem>
                      {doctors.map((doc) => (
                        <SelectItem key={doc.id} value={doc.id}>
                          Dr. {doc.profile?.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date From */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">From Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-12 justify-start text-left font-normal",
                          !dateFrom && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFrom ? format(dateFrom, "MMM d, yyyy") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={dateFrom} onSelect={onDateFromChange} />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Date To */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">To Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-12 justify-start text-left font-normal",
                          !dateTo && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateTo ? format(dateTo, "MMM d, yyyy") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={dateTo} onSelect={onDateToChange} />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 h-12"
                    onClick={() => {
                      onClearFilters();
                      setFilterSheetOpen(false);
                    }}
                  >
                    Clear All
                  </Button>
                  <Button
                    className="flex-1 h-12"
                    onClick={() => setFilterSheetOpen(false)}
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {doctorFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                <Stethoscope className="h-3 w-3" />
                {doctors.find((d) => d.id === doctorFilter)?.profile?.full_name}
              </Badge>
            )}
            {dateFrom && (
              <Badge variant="secondary">
                From: {format(dateFrom, "MMM d")}
              </Badge>
            )}
            {dateTo && (
              <Badge variant="secondary">
                To: {format(dateTo, "MMM d")}
              </Badge>
            )}
          </div>
        )}

        {/* Consultation List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : consultations.length === 0 ? (
          <Card className="py-12">
            <CardContent className="flex flex-col items-center text-center">
              <History className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No consultations found</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Try adjusting your filters
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {consultations.map((consultation) => (
              <Link
                key={consultation.id}
                to={`/app/opd/consultations/${consultation.id}`}
                onClick={handleCardTap}
              >
                <Card className="overflow-hidden active:scale-[0.98] transition-transform">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Patient Name & MR# */}
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4 text-primary shrink-0" />
                          <span className="font-medium truncate">
                            {consultation.patient?.first_name} {consultation.patient?.last_name}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          MR# {consultation.patient?.patient_number}
                        </p>

                        {/* Diagnosis */}
                        {consultation.diagnosis && (
                          <p className="text-sm text-muted-foreground line-clamp-1 italic">
                            "{consultation.diagnosis}"
                          </p>
                        )}

                        {/* Doctor & Date */}
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Stethoscope className="h-3 w-3" />
                            Dr. {(consultation.doctor as any)?.profile?.full_name || "Unknown"}
                          </span>
                          <span>•</span>
                          <span>
                            {format(new Date(consultation.created_at), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>

                      {/* Token & Arrow */}
                      <div className="flex flex-col items-end gap-2">
                        {consultation.appointment?.token_number && (
                          <Badge variant="outline" className="shrink-0">
                            #{consultation.appointment.token_number}
                          </Badge>
                        )}
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PullToRefresh>
  );
}
