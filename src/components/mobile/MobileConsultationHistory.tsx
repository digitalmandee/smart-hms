import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { format, isToday, isYesterday, isThisWeek, differenceInDays } from "date-fns";
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
import { Search, Filter, CalendarIcon, History, User, Stethoscope, ChevronRight, ArrowUp, FileText } from "lucide-react";
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

function getRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  const days = differenceInDays(new Date(), date);
  if (days < 7) return `${days} days ago`;
  return format(date, "MMM d, yyyy");
}

function getDateGroup(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  if (isThisWeek(date, { weekStartsOn: 0 })) return "This Week";
  return "Earlier";
}

function groupByDate(consultations: Consultation[]): { label: string; items: Consultation[] }[] {
  const groups: Record<string, Consultation[]> = {};
  const order = ["Today", "Yesterday", "This Week", "Earlier"];

  for (const c of consultations) {
    const group = getDateGroup(c.created_at);
    if (!groups[group]) groups[group] = [];
    groups[group].push(c);
  }

  return order
    .filter((label) => groups[label]?.length)
    .map((label) => ({ label, items: groups[label] }));
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
  const [showScrollTop, setShowScrollTop] = useState(false);

  const hasActiveFilters = doctorFilter !== "all" || dateFrom || dateTo;

  const triggerHaptic = async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  };

  const handleCardTap = async () => {
    await triggerHaptic();
  };

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    setShowScrollTop(target.scrollTop > 300);
  }, []);

  const scrollToTop = () => {
    const container = document.querySelector('[data-consultation-scroll]');
    container?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const grouped = groupByDate(consultations);

  return (
    <PullToRefresh onRefresh={onRefresh}>
      <div className="pb-24" onScroll={handleScroll} data-consultation-scroll>
        {/* Sticky Search Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-4 pt-4 pb-3 border-b border-border/30">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold">Consultations</h1>
              <p className="text-xs text-muted-foreground">
                {consultations.length} record{consultations.length !== 1 ? "s" : ""}
              </p>
            </div>
            <Link to="/app/opd">
              <Button variant="outline" size="sm" className="h-9">
                <History className="h-4 w-4 mr-1" />
                OPD
              </Button>
            </Link>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Patient name or MR#..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 h-11 text-base"
              />
            </div>
            <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant={hasActiveFilters ? "default" : "outline"}
                  size="icon"
                  className="h-11 w-11 shrink-0 relative"
                >
                  <Filter className="h-5 w-5" />
                  {hasActiveFilters && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[70vh]">
                <SheetHeader>
                  <SheetTitle>Filter Consultations</SheetTitle>
                </SheetHeader>
                <div className="py-6 space-y-6">
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

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-2">
              {doctorFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  <Stethoscope className="h-3 w-3" />
                  {doctors.find((d) => d.id === doctorFilter)?.profile?.full_name}
                </Badge>
              )}
              {dateFrom && (
                <Badge variant="secondary">From: {format(dateFrom, "MMM d")}</Badge>
              )}
              {dateTo && (
                <Badge variant="secondary">To: {format(dateTo, "MMM d")}</Badge>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-4 pt-3">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-[88px] rounded-xl" />
              ))}
            </div>
          ) : consultations.length === 0 ? (
            <div className="flex flex-col items-center text-center py-16">
              <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <FileText className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <p className="text-base font-medium text-muted-foreground">No consultations found</p>
              <p className="text-sm text-muted-foreground/70 mt-1 max-w-[240px]">
                Try adjusting your search or filters to find what you're looking for
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {grouped.map((group) => (
                <div key={group.label}>
                  {/* Date group header */}
                  <div className="sticky top-[140px] z-[5] py-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-background/90 backdrop-blur-sm px-2 py-0.5 rounded-full">
                      {group.label}
                    </span>
                  </div>

                  <div className="space-y-2.5 pb-2">
                    {group.items.map((consultation) => (
                      <Link
                        key={consultation.id}
                        to={`/app/opd/consultations/${consultation.id}`}
                        onClick={handleCardTap}
                      >
                        <Card className={cn(
                          "overflow-hidden active:scale-[0.98] transition-all border-l-4",
                          consultation.diagnosis
                            ? "border-l-green-500"
                            : "border-l-muted-foreground/20"
                        )}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <User className="h-4 w-4 text-primary" />
                                  </div>
                                  <div className="min-w-0">
                                    <span className="font-semibold text-sm truncate block">
                                      {consultation.patient?.first_name} {consultation.patient?.last_name}
                                    </span>
                                    <p className="text-xs text-muted-foreground">
                                      MR# {consultation.patient?.patient_number}
                                    </p>
                                  </div>
                                </div>

                                {consultation.diagnosis && (
                                  <p className="text-xs text-muted-foreground line-clamp-1 italic ml-10 mt-0.5">
                                    "{consultation.diagnosis}"
                                  </p>
                                )}

                                <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground ml-10">
                                  <span className="flex items-center gap-1">
                                    <Stethoscope className="h-3 w-3" />
                                    Dr. {(consultation.doctor as any)?.profile?.full_name || "Unknown"}
                                  </span>
                                  <span>•</span>
                                  <span>{getRelativeDate(consultation.created_at)}</span>
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-2 shrink-0">
                                {consultation.appointment?.token_number && (
                                  <Badge variant="outline" className="text-[10px] h-5">
                                    #{consultation.appointment.token_number}
                                  </Badge>
                                )}
                                <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scroll to top FAB */}
        {showScrollTop && (
          <Button
            onClick={scrollToTop}
            size="icon"
            className="fixed bottom-24 right-4 z-20 h-10 w-10 rounded-full shadow-lg animate-fade-in"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        )}
      </div>
    </PullToRefresh>
  );
}
