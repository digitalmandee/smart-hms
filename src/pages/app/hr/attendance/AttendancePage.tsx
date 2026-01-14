import { useState } from "react";
import { format } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AttendanceStatusBadge } from "@/components/hr/AttendanceStatusBadge";
import { useAttendanceRecords, useMarkAttendance } from "@/hooks/useAttendance";
import { useEmployees, useDepartments } from "@/hooks/useHR";
import { Loader2, Search, Clock, Users, UserCheck, UserX } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const { data: attendance, isLoading } = useAttendanceRecords({
    date: dateStr,
    department_id: departmentFilter !== "all" ? departmentFilter : undefined,
  });
  const { data: employees } = useEmployees();
  const { data: departments } = useDepartments();
  const markAttendance = useMarkAttendance();

  // Calculate stats
  const present = attendance?.filter((a) => a.status === "present").length || 0;
  const absent = attendance?.filter((a) => a.status === "absent").length || 0;
  const late = attendance?.filter((a) => a.status === "late").length || 0;
  const onLeave = attendance?.filter((a) => a.status === "on_leave").length || 0;
  const total = employees?.length || 0;

  const filteredAttendance = attendance?.filter((record) => {
    const employeeName = `${record.employee?.first_name} ${record.employee?.last_name}`.toLowerCase();
    return employeeName.includes(search.toLowerCase());
  });

  const handleMarkAttendance = async (
    employeeId: string,
    status: "present" | "absent" | "late" | "half_day"
  ) => {
    try {
      await markAttendance.mutateAsync({
        employee_id: employeeId,
        attendance_date: dateStr,
        status,
        check_in: status !== "absent" ? format(new Date(), "HH:mm:ss") : undefined,
      });
    } catch (error) {
      console.error("Failed to mark attendance:", error);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Attendance"
        description={`Attendance for ${format(selectedDate, "EEEE, MMMM d, yyyy")}`}
        breadcrumbs={[
          { label: "HR", href: "/app/hr" },
          { label: "Attendance" },
        ]}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatsCard
          title="Total Staff"
          value={total}
          icon={<Users className="h-5 w-5" />}
        />
        <StatsCard
          title="Present"
          value={present}
          icon={<UserCheck className="h-5 w-5" />}
          className="bg-green-50 dark:bg-green-950"
        />
        <StatsCard
          title="Absent"
          value={absent}
          icon={<UserX className="h-5 w-5" />}
          className="bg-red-50 dark:bg-red-950"
        />
        <StatsCard
          title="Late"
          value={late}
          icon={<Clock className="h-5 w-5" />}
          className="bg-yellow-50 dark:bg-yellow-950"
        />
        <StatsCard
          title="On Leave"
          value={onLeave}
          icon={<Calendar className="h-5 w-5" />}
          className="bg-blue-50 dark:bg-blue-950"
        />
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Calendar Sidebar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Attendance Table */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments?.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Working Hours</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : filteredAttendance && filteredAttendance.length > 0 ? (
                    filteredAttendance.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {record.employee?.first_name} {record.employee?.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {record.employee?.employee_number}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{record.employee?.department?.name || "-"}</TableCell>
                        <TableCell>
                          {record.check_in
                            ? format(new Date(`2000-01-01T${record.check_in}`), "hh:mm a")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {record.check_out
                            ? format(new Date(`2000-01-01T${record.check_out}`), "hh:mm a")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <AttendanceStatusBadge status={record.status || "absent"} />
                        </TableCell>
                        <TableCell>
                          {record.working_hours ? `${record.working_hours.toFixed(1)} hrs` : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs"
                              onClick={() => handleMarkAttendance(record.employee_id, "present")}
                            >
                              P
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs"
                              onClick={() => handleMarkAttendance(record.employee_id, "absent")}
                            >
                              A
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs"
                              onClick={() => handleMarkAttendance(record.employee_id, "late")}
                            >
                              L
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No attendance records for this date
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
