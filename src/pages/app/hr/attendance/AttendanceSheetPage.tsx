import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDate, isWeekend } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAttendanceRecords } from "@/hooks/useAttendance";
import { useEmployees, useDepartments } from "@/hooks/useHR";
import { Loader2, Download, Printer } from "lucide-react";
import { cn } from "@/lib/utils";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function AttendanceSheetPage() {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth());
  const [year, setYear] = useState(currentDate.getFullYear());
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  const monthStart = startOfMonth(new Date(year, month));
  const monthEnd = endOfMonth(new Date(year, month));
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const { data: attendanceRecords, isLoading } = useAttendanceRecords({
    startDate: format(monthStart, "yyyy-MM-dd"),
    endDate: format(monthEnd, "yyyy-MM-dd"),
    departmentId: departmentFilter !== "all" ? departmentFilter : undefined,
  });
  const { data: employees } = useEmployees();
  const { data: departments } = useDepartments();

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - 2 + i);

  const getStatusCell = (status: string | undefined) => {
    switch (status) {
      case "present":
        return { label: "P", className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" };
      case "absent":
        return { label: "A", className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" };
      case "late":
        return { label: "L", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" };
      case "half_day":
        return { label: "H", className: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" };
      case "on_leave":
        return { label: "LV", className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" };
      case "weekend":
        return { label: "WO", className: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400" };
      case "holiday":
        return { label: "H", className: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" };
      default:
        return { label: "-", className: "bg-gray-50 text-gray-400 dark:bg-gray-900" };
    }
  };

  // Group attendance by employee
  const attendanceByEmployee = new Map<string, Map<string, string>>();
  attendanceRecords?.forEach((record) => {
    if (!attendanceByEmployee.has(record.employee_id)) {
      attendanceByEmployee.set(record.employee_id, new Map());
    }
    attendanceByEmployee.get(record.employee_id)?.set(record.attendance_date, record.status || "absent");
  });

  // Filter employees by department
  const filteredEmployees = employees?.filter((emp) => {
    if (departmentFilter === "all") return true;
    return emp.department_id === departmentFilter;
  });

  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Sheet"
        description={`Monthly attendance overview for ${months[month]} ${year}`}
        breadcrumbs={[
          { label: t('nav.hr'), href: "/app/hr" },
          { label: t('nav.attendance'), href: "/app/hr/attendance" },
          { label: "Sheet" },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={month.toString()} onValueChange={(v) => setMonth(parseInt(v))}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((m, idx) => (
              <SelectItem key={idx} value={idx.toString()}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded flex items-center justify-center text-xs font-medium">P</div>
          <span>Present</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-100 dark:bg-red-900 rounded flex items-center justify-center text-xs font-medium">A</div>
          <span>Absent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-yellow-100 dark:bg-yellow-900 rounded flex items-center justify-center text-xs font-medium">L</div>
          <span>Late</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center text-xs font-medium">LV</div>
          <span>Leave</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center text-xs font-medium">WO</div>
          <span>Weekend</span>
        </div>
      </div>

      {/* Attendance Grid */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="sticky left-0 bg-background z-10 p-2 text-left font-medium min-w-[200px]">
                    Employee
                  </th>
                  {daysInMonth.map((day) => (
                    <th
                      key={day.toISOString()}
                      className={cn(
                        "p-1 text-center font-medium min-w-[32px]",
                        isWeekend(day) && "bg-muted/50"
                      )}
                    >
                      <div className="text-xs text-muted-foreground">{format(day, "EEE")[0]}</div>
                      <div>{getDate(day)}</div>
                    </th>
                  ))}
                  <th className="p-2 text-center font-medium min-w-[60px] bg-muted/30">Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees && filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => {
                    const empAttendance = attendanceByEmployee.get(employee.id);
                    let presentDays = 0;

                    return (
                      <tr key={employee.id} className="border-b hover:bg-muted/50">
                        <td className="sticky left-0 bg-background z-10 p-2">
                          <div className="font-medium">
                            {employee.first_name} {employee.last_name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {employee.employee_number}
                          </div>
                        </td>
                        {daysInMonth.map((day) => {
                          const dateStr = format(day, "yyyy-MM-dd");
                          let status = empAttendance?.get(dateStr);

                          if (!status && isWeekend(day)) {
                            status = "weekend";
                          }

                          if (status === "present") presentDays++;

                          const cell = getStatusCell(status);
                          return (
                            <td key={day.toISOString()} className="p-1 text-center">
                              <div
                                className={cn(
                                  "w-6 h-6 mx-auto rounded text-xs font-medium flex items-center justify-center",
                                  cell.className
                                )}
                              >
                                {cell.label}
                              </div>
                            </td>
                          );
                        })}
                        <td className="p-2 text-center font-medium bg-muted/30">
                          {presentDays}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={daysInMonth.length + 2} className="p-8 text-center text-muted-foreground">
                      No employees found for this department
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
