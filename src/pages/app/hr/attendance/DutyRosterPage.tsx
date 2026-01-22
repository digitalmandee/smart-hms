import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/PageHeader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useEmployees, useDepartments, useShifts, useShiftAssignments, useCreateShiftAssignment } from "@/hooks/useHR";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, ChevronLeft, ChevronRight, Users, Clock, Building2, Plus, Loader2 } from "lucide-react";
import { format, startOfWeek, addDays, addWeeks, subWeeks } from "date-fns";

export default function DutyRosterPage() {
  const { profile } = useAuth();
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [selectedShift, setSelectedShift] = useState<string>("");
  
  const weekEnd = addDays(currentWeekStart, 6);
  const startDateStr = format(currentWeekStart, "yyyy-MM-dd");
  const endDateStr = format(weekEnd, "yyyy-MM-dd");
  
  const { data: employees, isLoading: loadingEmployees } = useEmployees();
  const { data: departments, isLoading: loadingDepts } = useDepartments();
  const { data: shifts, isLoading: loadingShifts } = useShifts();
  const { data: shiftAssignments, isLoading: loadingAssignments } = useShiftAssignments(startDateStr, endDateStr);
  const createAssignment = useCreateShiftAssignment();

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  const filteredEmployees = selectedDepartment === "all" 
    ? employees 
    : employees?.filter(emp => emp.department_id === selectedDepartment);

  const getEmployeeShift = (employeeId: string) => {
    // First check shift_assignments table
    const assignment = shiftAssignments?.find(a => a.employee_id === employeeId);
    if (assignment?.shift) {
      return assignment.shift;
    }
    // Fallback to employee.shift_id if no assignment found
    const employee = employees?.find(e => e.id === employeeId);
    if (employee?.shift_id) {
      return shifts?.find(s => s.id === employee.shift_id);
    }
    return null;
  };

  const getShiftDisplay = (shift: any) => {
    if (!shift) return { name: "Unassigned", color: "bg-muted text-muted-foreground", style: undefined };
    
    const name = shift.name?.toLowerCase() || "";
    let colorClass = "bg-muted text-muted-foreground";
    
    if (shift.is_night_shift) {
      colorClass = "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
    } else if (name.includes("morning") || name.includes("day")) {
      colorClass = "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
    } else if (name.includes("evening") || name.includes("afternoon")) {
      colorClass = "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    } else if (name.includes("night")) {
      colorClass = "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
    }
    
    return { name: shift.name, color: colorClass, style: undefined };
  };

  const handleOpenAssignDialog = (employee: any) => {
    setSelectedEmployee(employee);
    const currentShift = getEmployeeShift(employee.id);
    setSelectedShift(currentShift?.id || "");
    setAssignDialogOpen(true);
  };

  const handleAssignShift = async () => {
    if (!selectedEmployee || !selectedShift) return;
    
    await createAssignment.mutateAsync({
      employee_id: selectedEmployee.id,
      shift_id: selectedShift,
      effective_from: format(new Date(), "yyyy-MM-dd"),
      is_current: true,
    });
    
    setAssignDialogOpen(false);
    setSelectedEmployee(null);
    setSelectedShift("");
  };

  const isLoading = loadingEmployees || loadingDepts || loadingShifts || loadingAssignments;
  const activeShifts = shifts?.filter(s => s.is_active) || [];
  const assignedCount = shiftAssignments?.length || 0;

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
                <p className="text-sm text-muted-foreground">Assigned</p>
                <p className="text-2xl font-bold">{assignedCount}</p>
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
                <p className="text-sm text-muted-foreground">Active Shifts</p>
                <p className="text-2xl font-bold">{activeShifts.length}</p>
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
                    <th className="text-left p-3 font-medium text-muted-foreground min-w-[200px]">Employee</th>
                    {weekDays.map((day) => (
                      <th key={day.toString()} className="text-center p-3 font-medium text-muted-foreground min-w-[100px]">
                        <div className="flex flex-col">
                          <span className="text-xs">{format(day, "EEE")}</span>
                          <span className="text-sm">{format(day, "MMM d")}</span>
                        </div>
                      </th>
                    ))}
                    <th className="text-center p-3 font-medium text-muted-foreground w-[80px]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees?.slice(0, 20).map((employee) => {
                    const shift = getEmployeeShift(employee.id);
                    const display = getShiftDisplay(shift);
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
                            <Badge 
                              variant="secondary" 
                              className={display.color}
                              style={display.style}
                            >
                              {display.name}
                            </Badge>
                          </td>
                        ))}
                        <td className="text-center p-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenAssignDialog(employee)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </td>
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

      {/* Assign Shift Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Shift</DialogTitle>
          </DialogHeader>
          
          {selectedEmployee && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">{selectedEmployee.first_name} {selectedEmployee.last_name}</p>
                <p className="text-sm text-muted-foreground">{selectedEmployee.designation?.name || "N/A"}</p>
              </div>
              
              <div className="space-y-2">
                <Label>Select Shift</Label>
                <Select value={selectedShift} onValueChange={setSelectedShift}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a shift" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeShifts.map((shift) => (
                      <SelectItem key={shift.id} value={shift.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className={`w-3 h-3 rounded-full ${shift.is_night_shift ? 'bg-purple-500' : 'bg-amber-500'}`}
                          />
                          <span>{shift.name}</span>
                          <span className="text-muted-foreground text-xs">
                            ({shift.start_time} - {shift.end_time})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleAssignShift} 
              disabled={!selectedShift || createAssignment.isPending}
            >
              {createAssignment.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Assign Shift
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}