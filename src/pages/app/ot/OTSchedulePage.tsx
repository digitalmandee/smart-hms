import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SurgeryQueueList } from "@/components/ot/SurgeryQueueList";
import { OTRoomGridCalendar } from "@/components/ot/OTRoomGridCalendar";
import { OTStatusBadge } from "@/components/ot/OTStatusBadge";
import { PriorityBadge } from "@/components/ot/PriorityBadge";
import { 
  Plus, 
  CalendarIcon, 
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  LayoutGrid,
  List
} from "lucide-react";
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { useSurgeries, useStartSurgery, useCompleteSurgery, useOTRooms, type SurgeryStatus, type SurgeryPriority } from "@/hooks/useOT";
import { useDoctors } from "@/hooks/useDoctors";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export default function OTSchedulePage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'grid'>('grid');
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [surgeonFilter, setSurgeonFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const dateFrom = viewMode === 'day' ? format(selectedDate, 'yyyy-MM-dd') : format(weekStart, 'yyyy-MM-dd');
  const dateTo = viewMode === 'day' ? format(selectedDate, 'yyyy-MM-dd') : format(weekEnd, 'yyyy-MM-dd');

  const { data: surgeries, isLoading } = useSurgeries({
    dateFrom,
    dateTo,
    branchId: profile?.branch_id || undefined,
    status: statusFilter !== 'all' ? statusFilter as SurgeryStatus : undefined,
    priority: priorityFilter !== 'all' ? priorityFilter as SurgeryPriority : undefined,
    surgeonId: surgeonFilter !== 'all' ? surgeonFilter : undefined,
  });

  const { data: doctors } = useDoctors();
  const { data: otRooms } = useOTRooms(profile?.branch_id);

  const startSurgery = useStartSurgery();
  const completeSurgery = useCompleteSurgery();

  const filteredSurgeries = surgeries?.filter(s => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const patientName = `${s.patient?.first_name} ${s.patient?.last_name}`.toLowerCase();
    return (
      patientName.includes(query) ||
      s.procedure_name.toLowerCase().includes(query) ||
      s.surgery_number.toLowerCase().includes(query)
    );
  });

  const handlePrevious = () => {
    if (viewMode === 'week') {
      setSelectedDate(subDays(selectedDate, 7));
    } else {
      setSelectedDate(subDays(selectedDate, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'week') {
      setSelectedDate(addDays(selectedDate, 7));
    } else {
      setSelectedDate(addDays(selectedDate, 1));
    }
  };

  const handleSlotClick = (roomId: string, time: string) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    navigate(`/app/ot/surgeries/new?date=${dateStr}&time=${time}&room=${roomId}`);
  };

  const handleSurgeryClick = (surgeryId: string) => {
    navigate(`/app/ot/surgeries/${surgeryId}`);
  };

  const getSurgeriesForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return filteredSurgeries?.filter(s => s.scheduled_date === dateStr) || [];
  };

  // Check if there are any upcoming surgeries when current view is empty
  const hasUpcoming = surgeries && surgeries.length > 0;
  const currentViewEmpty = !filteredSurgeries || filteredSurgeries.length === 0;
  
  // Find next surgery date for "jump to" feature
  const jumpToNextSurgery = () => {
    if (surgeries && surgeries.length > 0) {
      const nextSurgery = surgeries[0];
      if (nextSurgery?.scheduled_date) {
        setSelectedDate(new Date(nextSurgery.scheduled_date));
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <PageHeader
            title="Surgery Schedule"
            description="View and manage scheduled surgeries"
          />
          {surgeries && surgeries.length > 0 && (
            <Badge 
              variant="secondary" 
              className="cursor-pointer hover:bg-secondary/80"
              onClick={jumpToNextSurgery}
            >
              {surgeries.length} upcoming
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {currentViewEmpty && hasUpcoming && (
            <Button variant="outline" onClick={jumpToNextSurgery}>
              <Calendar className="h-4 w-4 mr-2" />
              Jump to Next Surgery
            </Button>
          )}
          <Button onClick={() => navigate("/app/ot/surgeries/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Surgery
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Date Navigation */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handlePrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="min-w-[200px]">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {viewMode === 'day' 
                      ? format(selectedDate, 'EEEE, MMM d, yyyy')
                      : `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button variant="outline" size="icon" onClick={handleNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                className="rounded-r-none"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4 mr-1" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'day' ? 'secondary' : 'ghost'}
                size="sm"
                className="rounded-none border-x"
                onClick={() => setViewMode('day')}
              >
                <List className="h-4 w-4 mr-1" />
                Day
              </Button>
              <Button
                variant={viewMode === 'week' ? 'secondary' : 'ghost'}
                size="sm"
                className="rounded-l-none"
                onClick={() => setViewMode('week')}
              >
                Week
              </Button>
            </div>

            <div className="flex-1" />

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patient, procedure..."
                className="pl-9 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filters */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="pre_op">Pre-Op</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="elective">Elective</SelectItem>
              </SelectContent>
            </Select>

            <Select value={surgeonFilter} onValueChange={setSurgeonFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Surgeons" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Surgeons</SelectItem>
                {doctors?.map(doc => (
                  <SelectItem key={doc.id} value={doc.id}>
                    {doc.profile?.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Schedule View */}
      {viewMode === 'grid' ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {format(selectedDate, 'EEEE, MMMM d, yyyy')} - Room Grid View
              <span className="text-muted-foreground font-normal ml-2">
                ({otRooms?.length || 0} rooms)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OTRoomGridCalendar
              date={selectedDate}
              rooms={otRooms || []}
              surgeries={filteredSurgeries || []}
              onSlotClick={handleSlotClick}
              onSurgeryClick={handleSurgeryClick}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      ) : viewMode === 'day' ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              <span className="text-muted-foreground font-normal ml-2">
                ({filteredSurgeries?.length || 0} surgeries)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SurgeryQueueList
              surgeries={filteredSurgeries || []}
              isLoading={isLoading}
              onStartSurgery={(id) => startSurgery.mutateAsync(id)}
              onCompleteSurgery={(id) => completeSurgery.mutateAsync(id)}
              emptyMessage={`No surgeries scheduled for ${format(selectedDate, 'MMMM d')}`}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-7">
          {weekDays.map((day) => {
            const daySurgeries = getSurgeriesForDay(day);
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            
            return (
              <Card 
                key={day.toISOString()} 
                className={cn(
                  "min-h-[200px]",
                  isToday && "ring-2 ring-primary"
                )}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    <span className={cn(
                      "block text-center",
                      isToday && "text-primary"
                    )}>
                      {format(day, 'EEE')}
                    </span>
                    <span className={cn(
                      "block text-center text-2xl",
                      isToday && "bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center mx-auto"
                    )}>
                      {format(day, 'd')}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {daySurgeries.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center">No surgeries</p>
                  ) : (
                    daySurgeries.slice(0, 4).map((surgery) => (
                      <div
                        key={surgery.id}
                        className="p-2 rounded bg-muted/50 text-xs cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => navigate(`/app/ot/surgeries/${surgery.id}`)}
                      >
                        <div className="flex items-center gap-1 mb-1">
                          <OTStatusBadge 
                            status={surgery.status} 
                            scheduledDate={surgery.scheduled_date}
                            scheduledTime={surgery.scheduled_start_time}
                            className="text-[10px] px-1 py-0" 
                          />
                        </div>
                        <p className="font-medium truncate">
                          {surgery.patient?.first_name} {surgery.patient?.last_name}
                        </p>
                        <p className="text-muted-foreground truncate">
                          {format(new Date(`2000-01-01T${surgery.scheduled_start_time}`), 'h:mm a')}
                        </p>
                      </div>
                    ))
                  )}
                  {daySurgeries.length > 4 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{daySurgeries.length - 4} more
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
