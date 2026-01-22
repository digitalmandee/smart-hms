import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/PageHeader";
import { useEmployees, useDepartments, useShifts } from "@/hooks/useHR";
import { Calendar, ChevronLeft, ChevronRight, Users, Clock, Building2 } from "lucide-react";
import { format, startOfWeek, addDays, addWeeks, subWeeks } from "date-fns";

export default function DutyRosterPage() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  
  const { data: employees, isLoading: loadingEmployees } = useEmployees();
  const { data: departments, isLoading: loadingDepts } = useDepartments();
  const { data: shifts, isLoading: loadingShifts } = useShifts();

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  const filteredEmployees = selectedDepartment === "all" 
    ? employees 
    : employees?.filter(emp => emp.department_id === selectedDepartment);

  const getShiftName = (shiftId: string | null) => {
    if (!shiftId) return "Unassigned";
    const shift = shifts?.find(s => s.id === shiftId);
    return shift?.name || "Unknown";
  };

  const getShiftColor = (shiftName: string) => {
    const name = shiftName.toLowerCase();
    if (name.includes("morning") || name.includes("day")) return "bg-amber-100 text-amber-800";
    if (name.includes("evening") || name.includes("afternoon")) return "bg-blue-100 text-blue-800";
    if (name.includes("night")) return "bg-purple-100 text-purple-800";
    return "bg-muted text-muted-foreground";
  };

  const isLoading = loadingEmployees || loadingDepts || loadingShifts;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Duty Roster"
        breadcrumbs={[
          { label: "HR", href: "/app/hr" },
          { label: "Attendance", href: "/app/hr/attendance" },
          { label: "Duty Roster" }
        ]}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Staff</p>
                <p className="text-2xl font-bold">{employees?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Shifts</p>
                <p className="text-2xl font-bold">{shifts?.filter(s => s.is_active)?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Departments</p>
                <p className="text-2xl font-bold">{departments?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Calendar className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Week Of</p>
                <p className="text-lg font-bold">{format(currentWeekStart, "MMM d")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Navigation */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Schedule
            </CardTitle>
            <div className="flex items-center gap-4">
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments?.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setCurrentWeekStart(prev => subWeeks(prev, 1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}>
                  Today
                </Button>
                <Button variant="outline" size="icon" onClick={() => setCurrentWeekStart(prev => addWeeks(prev, 1))}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-muted-foreground min-w-[180px]">Employee</th>
                    {weekDays.map((day) => (
                      <th key={day.toString()} className="text-center p-3 font-medium text-muted-foreground min-w-[100px]">
                        <div className="flex flex-col">
                          <span className="text-xs">{format(day, "EEE")}</span>
                          <span className="text-sm">{format(day, "MMM d")}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees?.slice(0, 20).map((employee) => {
                    const shiftName = getShiftName(employee.shift_id);
                    return (
                      <tr key={employee.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{employee.first_name} {employee.last_name}</p>
                            <p className="text-xs text-muted-foreground">{employee.designation?.name || "N/A"}</p>
                          </div>
                        </td>
                        {weekDays.map((day) => (
                          <td key={day.toString()} className="text-center p-2">
                            <Badge variant="secondary" className={getShiftColor(shiftName)}>
                              {shiftName}
                            </Badge>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {(!filteredEmployees || filteredEmployees.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  No employees found for the selected department.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
