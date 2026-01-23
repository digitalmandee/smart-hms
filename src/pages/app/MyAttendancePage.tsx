import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/PageHeader";

const statusColors: Record<string, string> = {
  present: "bg-green-100 text-green-800",
  absent: "bg-red-100 text-red-800",
  late: "bg-amber-100 text-amber-800",
  half_day: "bg-blue-100 text-blue-800",
  on_leave: "bg-purple-100 text-purple-800",
  holiday: "bg-gray-100 text-gray-800",
  weekend: "bg-gray-50 text-gray-500",
};

const statusIcons: Record<string, React.ReactNode> = {
  present: <CheckCircle2 className="h-4 w-4 text-green-600" />,
  absent: <XCircle className="h-4 w-4 text-red-600" />,
  late: <AlertCircle className="h-4 w-4 text-amber-600" />,
  half_day: <Clock className="h-4 w-4 text-blue-600" />,
  on_leave: <Calendar className="h-4 w-4 text-purple-600" />,
};

export default function MyAttendancePage() {
  const { profile } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Fetch current user's employee record
  const { data: employee } = useQuery({
    queryKey: ["my-employee-record-attendance", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;
      
      const { data, error } = await supabase
        .from("employees")
        .select("id, first_name, last_name, employee_number, organization_id")
        .eq("profile_id", profile.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });

  // Fetch attendance records for current month
  const { data: attendanceRecords, isLoading } = useQuery({
    queryKey: ["my-attendance", employee?.id, format(currentMonth, "yyyy-MM")],
    queryFn: async () => {
      if (!employee?.id) return [];
      
      const monthStart = format(startOfMonth(currentMonth), "yyyy-MM-dd");
      const monthEnd = format(endOfMonth(currentMonth), "yyyy-MM-dd");
      
      const { data, error } = await supabase
        .from("attendance_records")
        .select("*")
        .eq("employee_id", employee.id)
        .gte("attendance_date", monthStart)
        .lte("attendance_date", monthEnd)
        .order("attendance_date", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!employee?.id,
  });

  const formatTime = (time: string | null) => {
    if (!time) return "-";
    try {
      // Handle both full datetime strings and time-only strings (HH:mm:ss)
      const isTimeOnly = /^\d{2}:\d{2}(:\d{2})?$/.test(time);
      const dateToFormat = isTimeOnly ? new Date(`2000-01-01T${time}`) : new Date(time);
      if (isNaN(dateToFormat.getTime())) return "-";
      return format(dateToFormat, "hh:mm a");
    } catch {
      return "-";
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    if (nextMonth <= new Date()) {
      setCurrentMonth(nextMonth);
    }
  };

  // Calculate summary stats
  const summary = {
    present: attendanceRecords?.filter(r => r.status === "present").length || 0,
    absent: attendanceRecords?.filter(r => r.status === "absent").length || 0,
    late: attendanceRecords?.filter(r => r.status === "late").length || 0,
    onLeave: attendanceRecords?.filter(r => r.status === "on_leave").length || 0,
    halfDay: attendanceRecords?.filter(r => r.status === "half_day").length || 0,
    totalWorkingHours: attendanceRecords?.reduce((sum, r) => sum + (r.working_hours || 0), 0) || 0,
  };

  if (!employee && !isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Attendance" description="View your attendance records" />
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No Employee Record Found</h3>
            <p className="text-muted-foreground mt-2">
              Your account is not linked to an employee record. Please contact HR.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="My Attendance" 
        description="View your attendance records and statistics" 
      />

      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <h2 className="text-lg font-semibold">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={goToNextMonth}
          disabled={format(currentMonth, "yyyy-MM") === format(new Date(), "yyyy-MM")}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.present}</p>
                <p className="text-xs text-muted-foreground">Present</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.absent}</p>
                <p className="text-xs text-muted-foreground">Absent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.late}</p>
                <p className="text-xs text-muted-foreground">Late</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.onLeave}</p>
                <p className="text-xs text-muted-foreground">On Leave</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.totalWorkingHours.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Total Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Attendance Records</CardTitle>
          <CardDescription>Daily attendance for {format(currentMonth, "MMMM yyyy")}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : attendanceRecords && attendanceRecords.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Working Hours</TableHead>
                  <TableHead>Late (mins)</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {format(new Date(record.attendance_date), "EEE, MMM d")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {statusIcons[record.status || "present"]}
                        <Badge className={statusColors[record.status || "present"]}>
                          {record.status?.replace("_", " ") || "Present"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{formatTime(record.check_in)}</TableCell>
                    <TableCell>{formatTime(record.check_out)}</TableCell>
                    <TableCell>
                      {record.working_hours ? `${record.working_hours.toFixed(1)} hrs` : "-"}
                    </TableCell>
                    <TableCell>
                      {record.late_minutes ? (
                        <span className="text-amber-600">{record.late_minutes}</span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {record.remarks || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No attendance records for this month</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
