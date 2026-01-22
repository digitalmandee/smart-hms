import { useState } from "react";
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
import { ChevronLeft, ChevronRight, Siren, UserPlus, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function EmergencyRosterPage() {
  const { profile } = useAuth();
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [selectedShiftId, setSelectedShiftId] = useState<string>("");

  const startDateStr = format(currentWeekStart, "yyyy-MM-dd");
  const endDateStr = format(addDays(currentWeekStart, 6), "yyyy-MM-dd");

  const { data: allEmployees, isLoading: loadingEmployees } = useEmployees();
  const { data: shifts, isLoading: loadingShifts } = useShifts();
  const { data: assignments } = useShiftAssignments(startDateStr, endDateStr);
  const createAssignment = useCreateShiftAssignment();

  // Filter Emergency-related shifts
  const erShifts = shifts?.filter(s => 
    s.code?.startsWith("ER") || s.name?.toLowerCase().includes("emergency")
  ) || [];

  // Filter employees who work in Emergency
  const erEmployees = allEmployees?.filter(e => {
    const deptName = typeof e.department === "string" ? e.department : e.department?.name || "";
    const desig = typeof e.designation === "string" ? e.designation : e.designation?.name || "";
    return (
      deptName.toLowerCase().includes("emergency") ||
      deptName.toLowerCase().includes("er") ||
      deptName.toLowerCase().includes("casualty") ||
      desig.toLowerCase().includes("emergency")
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
      toast.success("Emergency duty assigned successfully");
      setAssignDialogOpen(false);
      setSelectedEmployee(null);
      setSelectedShiftId("");
    } catch (error) {
      toast.error("Failed to assign emergency duty");
    }
  };

  // Check for coverage gaps (simplified - in real app this would be more complex)
  const coverageGaps = weekDays.filter(day => {
    const dayEmployees = erEmployees.filter(e => getEmployeeShift(e.id));
    return dayEmployees.length < 2; // Need at least 2 staff per day
  });

  const isLoading = loadingEmployees || loadingShifts;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Emergency Roster"
        description="Manage emergency department 24/7 coverage"
        breadcrumbs={[
          { label: "HR", href: "/app/hr" },
          { label: "Attendance", href: "/app/hr/attendance" },
          { label: "Emergency Roster" },
        ]}
      />

      {/* Coverage Alert */}
      {coverageGaps.length > 0 && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Coverage Gap Detected</p>
              <p className="text-sm text-muted-foreground">
                {coverageGaps.length} day(s) may have insufficient ER staffing this week
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ER Staff
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{erEmployees.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Day Shift (12hr)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {erShifts.find(s => s.code === "ERD") ? "Active" : "-"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Night Shift (12hr)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">
              {erShifts.find(s => s.code === "ERN") ? "Active" : "-"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Coverage Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={coverageGaps.length === 0 ? "default" : "destructive"}>
              {coverageGaps.length === 0 ? "Complete" : `${coverageGaps.length} Gaps`}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-end gap-2">
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
            ) : erEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  <Siren className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No Emergency staff found. Employees in Emergency/ER department will appear here.</p>
                </TableCell>
              </TableRow>
            ) : (
              erEmployees.map(employee => {
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
              Assign ER Duty - {selectedEmployee?.first_name} {selectedEmployee?.last_name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select ER Shift</Label>
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
                          style={{ backgroundColor: shift.color || "#ef4444" }}
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
