import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfWeek, addDays, isToday } from "date-fns";
import { Calendar, Clock, Sun, Moon, Sunrise, Sunset, Coffee } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/PageHeader";

export default function MySchedulePage() {
  const { profile } = useAuth();

  // Fetch current user's employee record with shift
  const { data: employee, isLoading } = useQuery({
    queryKey: ["my-employee-record", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;
      
      const { data, error } = await supabase
        .from("employees")
        .select(`
          id,
          first_name,
          last_name,
          employee_number,
          organization_id,
          join_date,
          shift_id,
          shift:shifts(*),
          department:departments(name),
          designation:designations(name)
        `)
        .eq("profile_id", profile.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });

  // Fetch shift assignments for this week if employee exists
  const { data: assignments } = useQuery({
    queryKey: ["my-shift-assignments", employee?.id],
    queryFn: async () => {
      if (!employee?.id) return [];
      
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const weekEnd = addDays(weekStart, 6);
      
      const { data, error } = await supabase
        .from("shift_assignments")
        .select(`
          *,
          shift:shifts(*)
        `)
        .eq("employee_id", employee.id)
        .gte("effective_from", format(weekStart, "yyyy-MM-dd"))
        .lte("effective_from", format(weekEnd, "yyyy-MM-dd"));
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!employee?.id,
  });

  const formatTime = (time: string | null) => {
    if (!time) return "N/A";
    const [hours, minutes] = time.split(":");
    const h = parseInt(hours);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getShiftIcon = (shiftName: string | undefined) => {
    if (!shiftName) return <Clock className="h-5 w-5" />;
    const name = shiftName.toLowerCase();
    if (name.includes("morning")) return <Sunrise className="h-5 w-5 text-amber-500" />;
    if (name.includes("evening")) return <Sunset className="h-5 w-5 text-orange-500" />;
    if (name.includes("night")) return <Moon className="h-5 w-5 text-indigo-500" />;
    if (name.includes("general")) return <Sun className="h-5 w-5 text-yellow-500" />;
    return <Clock className="h-5 w-5 text-primary" />;
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    return addDays(weekStart, i);
  });

  // Get the shift for a particular day (from assignments or default)
  const getShiftForDay = (day: Date) => {
    const dayStr = format(day, "yyyy-MM-dd");
    const assignment = assignments?.find(a => a.effective_from === dayStr);
    return assignment?.shift || employee?.shift;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Schedule" description="View your work schedule and shifts" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Schedule" description="View your work schedule and shifts" />
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No Employee Record Found</h3>
            <p className="text-muted-foreground mt-2">
              Your account is not linked to an employee record. Please contact HR for assistance.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentShift = employee.shift;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="My Schedule" 
        description="View your work schedule and shifts" 
      />

      {/* Current Shift Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              {getShiftIcon(currentShift?.name)}
              Current Shift
            </CardTitle>
            <CardDescription>Your assigned work shift</CardDescription>
          </CardHeader>
          <CardContent>
            {currentShift ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-lg">{currentShift.name}</span>
                  <Badge variant={currentShift.is_active ? "default" : "secondary"}>
                    {currentShift.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Start Time</span>
                    <p className="font-medium">{formatTime(currentShift.start_time)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">End Time</span>
                    <p className="font-medium">{formatTime(currentShift.end_time)}</p>
                  </div>
                </div>
                {currentShift.break_duration_minutes > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Coffee className="h-4 w-4" />
                    <span>{currentShift.break_duration_minutes} min break</span>
                  </div>
                )}
                {currentShift.is_night_shift && (
                  <Badge variant="outline" className="gap-1">
                    <Moon className="h-3 w-3" />
                    Night Shift
                  </Badge>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No shift assigned. Contact HR.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Employee Details</CardTitle>
            <CardDescription>Your work information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-muted-foreground">Name</span>
                <p className="font-medium">{employee.first_name} {employee.last_name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Department</span>
                  <p className="font-medium">{employee.department?.name || "N/A"}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Designation</span>
                  <p className="font-medium">{employee.designation?.name || "N/A"}</p>
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Employee Number</span>
                <p className="font-medium">{employee.employee_number}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            This Week's Schedule
          </CardTitle>
          <CardDescription>
            Week of {format(weekDays[0], "MMM d")} - {format(weekDays[6], "MMM d, yyyy")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, index) => {
              const dayShift = getShiftForDay(day);
              const isTodayDay = isToday(day);
              
              return (
                <div
                  key={index}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    isTodayDay 
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className={`text-xs font-medium uppercase ${isTodayDay ? "text-primary" : "text-muted-foreground"}`}>
                    {format(day, "EEE")}
                  </div>
                  <div className={`text-lg font-bold ${isTodayDay ? "text-primary" : ""}`}>
                    {format(day, "d")}
                  </div>
                  <div className="mt-2 flex justify-center">
                    {getShiftIcon(dayShift?.name)}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground truncate">
                    {dayShift ? dayShift.name : "Off"}
                  </div>
                  {dayShift && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {formatTime(dayShift.start_time)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
