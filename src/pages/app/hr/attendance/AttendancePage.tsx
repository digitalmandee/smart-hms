import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
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
import { useAttendanceRecords } from "@/hooks/useAttendance";
import { useEmployees, useDepartments } from "@/hooks/useHR";
import { Loader2, Search, Clock, Users, UserCheck, UserX, CalendarDays } from "lucide-react";

export default function AttendancePage() {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const { data: attendance, isLoading } = useAttendanceRecords({
    date: dateStr,
    departmentId: departmentFilter !== "all" ? departmentFilter : undefined,
  });
  const { data: employees } = useEmployees();
  const { data: departments } = useDepartments();

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Attendance"
        description={`Attendance for ${format(selectedDate, "EEEE, MMMM d, yyyy")}`}
        breadcrumbs={[
          { label: t('nav.hr' as any), href: "/app/hr" },
          { label: "Attendance" },
        ]}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Staff</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-950">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Present</p>
                <p className="text-2xl font-bold">{present}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 dark:bg-red-950">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <UserX className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Absent</p>
                <p className="text-2xl font-bold">{absent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 dark:bg-yellow-950">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Late</p>
                <p className="text-2xl font-bold">{late}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 dark:bg-blue-950">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <CalendarDays className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">On Leave</p>
                <p className="text-2xl font-bold">{onLeave}</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
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
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
