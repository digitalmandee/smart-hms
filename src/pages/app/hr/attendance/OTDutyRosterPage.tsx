import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { format, startOfWeek, addDays } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ShiftBadge } from "@/components/hr/ShiftBadge";
import { useEmployees, useShifts, useShiftAssignments, useCreateShiftAssignment } from "@/hooks/useHR";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft, ChevronRight, Scissors, UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

// OT Staff categories
const OT_DEPARTMENTS = ["Surgery", "Orthopedics", "Gynecology", "Neurosurgery", "Cardiac Surgery"];
const OT_ROLES = ["Surgeon", "Anesthetist", "OT Nurse", "OT Technician"];

export default function OTDutyRosterPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [selectedShiftId, setSelectedShiftId] = useState<string>("");

  const startDateStr = format(currentWeekStart, "yyyy-MM-dd");
  const endDateStr = format(addDays(currentWeekStart, 6), "yyyy-MM-dd");

  const { data: allEmployees, isLoading: loadingEmployees } = useEmployees();
  const { data: shifts, isLoading: loadingShifts } = useShifts();
  const { data: assignments } = useShiftAssignments(startDateStr, endDateStr);
  const createAssignment = useCreateShiftAssignment();

  // Filter OT-related shifts
  const otShifts = shifts?.filter(s => 
    s.code?.startsWith("OT") || s.name?.toLowerCase().includes("ot")
  ) || [];

  // Filter employees who work in OT
  const otEmployees = allEmployees?.filter(e => {
    const deptName = typeof e.department === "string" ? e.department : e.department?.name || "";
    const desig = typeof e.designation === "string" ? e.designation : e.designation?.name || "";
    return (
      deptName.toLowerCase().includes("surgery") ||
      deptName.toLowerCase().includes("ot") ||
      desig.toLowerCase().includes("surgeon") ||
      desig.toLowerCase().includes("anesthetist") ||
      desig.toLowerCase().includes("ot nurse") ||
      deptName.toLowerCase().includes("anesthesia")
    );
  }).slice(0, 20) || [];

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  const getEmployeeShift = (employeeId: string) => {
    const assignment = assignments?.find(a => a.employee_id === employeeId && a.is_current);
    if (assignment) {
      return shifts?.find(s => s.id === assignment.shift_id);
    }
    const employee = allEmployees?.find(e => e.id === employeeId);
    return employee?.shift_id ? shifts?.find(s => s.id === employee.shift_id) : null;
  };

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentWeekStart(prev => 
      direction === "prev" ? addDays(prev, -7) : addDays(prev, 7)
    );
  };

  const handleAssign = async () => {
    if (!selectedEmployee || !selectedShiftId) return;
    
    try {
      await createAssignment.mutateAsync({
        employee_id: selectedEmployee.id,
        shift_id: selectedShiftId,
        effective_from: format(currentWeekStart, "yyyy-MM-dd"),
        is_current: true,
      });
      toast.success("OT duty assigned successfully");
      setAssignDialogOpen(false);
      setSelectedEmployee(null);
      setSelectedShiftId("");
    } catch (error) {
      toast.error("Failed to assign OT duty");
    }
  };

  const isLoading = loadingEmployees || loadingShifts;

  return (
    <div className="space-y-6">
      <PageHeader
        title="OT Duty Roster"
        description="Manage operating theater staff schedules"
        breadcrumbs={[
          { label: t('nav.hr' as any), href: "/app/hr" },
          { label: "Attendance", href: "/app/hr/attendance" },
          { label: "OT Duty Roster" },
        ]}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              OT Staff
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{otEmployees.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Day Shift
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {otShifts.find(s => s.code === "OTD") ? "Active" : "-"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Night Shift
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {otShifts.find(s => s.code === "OTN") ? "Active" : "-"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Week Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">Draft</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All OT Departments</SelectItem>
              {OT_DEPARTMENTS.map(dept => (
                <SelectItem key={dept} value={dept.toLowerCase()}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigateWeek("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium min-w-[200px] text-center">
            {format(currentWeekStart, "MMM d")} - {format(addDays(currentWeekStart, 6), "MMM d, yyyy")}
          </span>
          <Button variant="outline" size="icon" onClick={() => navigateWeek("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Roster Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px] sticky left-0 bg-background">Staff Member</TableHead>
              <TableHead className="w-[120px]">Role</TableHead>
              {weekDays.map(day => (
                <TableHead key={day.toString()} className="text-center min-w-[100px]">
                  <div>{format(day, "EEE")}</div>
                  <div className="text-xs text-muted-foreground">{format(day, "MMM d")}</div>
                </TableHead>
              ))}
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  {weekDays.map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-6 w-16 mx-auto" /></TableCell>
                  ))}
                  <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                </TableRow>
              ))
            ) : otEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  <Scissors className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No OT staff found. Employees in Surgery or Anesthesia departments will appear here.</p>
                </TableCell>
              </TableRow>
            ) : (
              otEmployees.map(employee => {
                const shift = getEmployeeShift(employee.id);
                return (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium sticky left-0 bg-background">
                      {employee.first_name} {employee.last_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {typeof employee.designation === "string" ? employee.designation : employee.designation?.name || "Staff"}
                      </Badge>
                    </TableCell>
                    {weekDays.map(day => (
                      <TableCell key={day.toString()} className="text-center">
                        {shift ? (
                          <ShiftBadge shift={shift} size="sm" />
                        ) : (
                          <Badge variant="secondary" className="text-xs">Off</Badge>
                        )}
                      </TableCell>
                    ))}
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setSelectedShiftId(shift?.id || "");
                          setAssignDialogOpen(true);
                        }}
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Assign OT Duty - {selectedEmployee?.first_name} {selectedEmployee?.last_name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select OT Shift</Label>
              <Select value={selectedShiftId} onValueChange={setSelectedShiftId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose shift..." />
                </SelectTrigger>
                <SelectContent>
                  {shifts?.filter(s => s.is_active).map(shift => (
                    <SelectItem key={shift.id} value={shift.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: shift.color || "#6366f1" }}
                        />
                        {shift.name} ({shift.start_time} - {shift.end_time})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssign} 
              disabled={!selectedShiftId || createAssignment.isPending}
            >
              {createAssignment.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
