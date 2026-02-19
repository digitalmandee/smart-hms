import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/PageHeader";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useEmployees, useDepartments, useOnCallSchedules, useCreateOnCallSchedule, useDeleteOnCallSchedule } from "@/hooks/useHR";
import { useAuth } from "@/contexts/AuthContext";
import { Phone, ChevronLeft, ChevronRight, Users, Clock, AlertCircle, Calendar, Plus, Loader2, Trash2 } from "lucide-react";
import { format, startOfWeek, addDays, addWeeks, subWeeks } from "date-fns";

export default function OnCallSchedulePage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [onCallType, setOnCallType] = useState<string>("primary");
  
  const weekEnd = addDays(currentWeekStart, 6);
  const startDateStr = format(currentWeekStart, "yyyy-MM-dd");
  const endDateStr = format(weekEnd, "yyyy-MM-dd");
  
  const { data: employees, isLoading: loadingEmployees } = useEmployees();
  const { data: departments, isLoading: loadingDepts } = useDepartments();
  const { data: onCallSchedules, isLoading: loadingSchedules } = useOnCallSchedules(startDateStr, endDateStr);
  const createOnCall = useCreateOnCallSchedule();
  const deleteOnCall = useDeleteOnCallSchedule();

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  // Filter departments that would typically have on-call requirements
  const clinicalDepts = departments?.filter(d => {
    const name = d.name.toLowerCase();
    return name.includes("emergency") || name.includes("icu") || name.includes("surgery") || 
           name.includes("medicine") || name.includes("pediatric") || name.includes("gynec") ||
           name.includes("ortho") || name.includes("cardiac") || name.includes("radiology") ||
           name.includes("laboratory") || name.includes("pharmacy");
  });

  const selectedDepts = selectedDepartment === "all" ? clinicalDepts : clinicalDepts?.filter(d => d.id === selectedDepartment);

  const getDeptEmployees = (deptId: string) => {
    return employees?.filter(emp => emp.department_id === deptId && emp.employment_status === "active") || [];
  };

  const getOnCallAssignment = (deptId: string, date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const deptSchedules = onCallSchedules?.filter(
      s => s.department_id === deptId && s.schedule_date === dateStr
    );
    
    const primary = deptSchedules?.find(s => s.on_call_type === "primary");
    const backup = deptSchedules?.find(s => s.on_call_type === "backup");
    
    return { primary, backup };
  };

  const handleOpenAssignDialog = (dept: any, date: Date) => {
    setSelectedDept(dept);
    setSelectedDate(date);
    setSelectedEmployee("");
    setOnCallType("primary");
    setAssignDialogOpen(true);
  };

  const handleCreateOnCall = async () => {
    if (!selectedDept || !selectedDate || !selectedEmployee || !profile?.organization_id) return;
    
    await createOnCall.mutateAsync({
      organization_id: profile.organization_id,
      branch_id: profile.branch_id,
      department_id: selectedDept.id,
      employee_id: selectedEmployee,
      schedule_date: format(selectedDate, "yyyy-MM-dd"),
      start_time: "00:00",
      end_time: "23:59",
      on_call_type: onCallType,
    });
    
    setAssignDialogOpen(false);
  };

  const handleDeleteOnCall = async (id: string) => {
    await deleteOnCall.mutateAsync(id);
  };

  const isLoading = loadingEmployees || loadingDepts || loadingSchedules;
  const totalOnCallStaff = onCallSchedules?.length || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="On-Call Schedule"
        breadcrumbs={[
          { label: t('nav.hr' as any), href: "/app/hr" },
          { label: "Attendance", href: "/app/hr/attendance" },
          { label: "On-Call Schedule" }
        ]}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Clinical Depts</p>
                <p className="text-2xl font-bold">{clinicalDepts?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">On-Call This Week</p>
                <p className="text-2xl font-bold">{totalOnCallStaff}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Coverage</p>
                <p className="text-2xl font-bold">24/7</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Calendar className="h-5 w-5 text-blue-600" />
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
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Weekly On-Call Assignments
              </CardTitle>
              <CardDescription>Primary and backup coverage for each department</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {clinicalDepts?.map((dept) => (
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
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-muted-foreground min-w-[150px]">Department</th>
                    {weekDays.map((day) => (
                      <th key={day.toString()} className="text-center p-3 font-medium text-muted-foreground min-w-[140px]">
                        <div className="flex flex-col">
                          <span className="text-xs">{format(day, "EEE")}</span>
                          <span className="text-sm">{format(day, "MMM d")}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedDepts?.map((dept) => (
                    <tr key={dept.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <p className="font-medium">{dept.name}</p>
                        <p className="text-xs text-muted-foreground">{getDeptEmployees(dept.id).length} staff</p>
                      </td>
                      {weekDays.map((day) => {
                        const assignment = getOnCallAssignment(dept.id, day);
                        return (
                          <td key={day.toString()} className="p-2">
                            {assignment.primary || assignment.backup ? (
                              <div className="space-y-1">
                                {assignment.primary && (
                                  <div className="flex items-center gap-1.5 p-1.5 rounded bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 group">
                                    <Avatar className="h-5 w-5">
                                      <AvatarImage src={(assignment.primary.employee as any)?.profile_photo_url || ""} />
                                      <AvatarFallback className="text-[10px]">
                                        {(assignment.primary.employee as any)?.first_name?.[0]}{(assignment.primary.employee as any)?.last_name?.[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs font-medium truncate flex-1">
                                      {(assignment.primary.employee as any)?.first_name}
                                    </span>
                                    <Badge variant="secondary" className="text-[10px] px-1 py-0 bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300">P</Badge>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-4 w-4 opacity-0 group-hover:opacity-100"
                                      onClick={() => handleDeleteOnCall(assignment.primary!.id)}
                                    >
                                      <Trash2 className="h-3 w-3 text-destructive" />
                                    </Button>
                                  </div>
                                )}
                                {assignment.backup && (
                                  <div className="flex items-center gap-1.5 p-1.5 rounded bg-muted/50 border group">
                                    <Avatar className="h-5 w-5">
                                      <AvatarImage src={(assignment.backup.employee as any)?.profile_photo_url || ""} />
                                      <AvatarFallback className="text-[10px]">
                                        {(assignment.backup.employee as any)?.first_name?.[0]}{(assignment.backup.employee as any)?.last_name?.[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs text-muted-foreground truncate flex-1">
                                      {(assignment.backup.employee as any)?.first_name}
                                    </span>
                                    <Badge variant="outline" className="text-[10px] px-1 py-0">B</Badge>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-4 w-4 opacity-0 group-hover:opacity-100"
                                      onClick={() => handleDeleteOnCall(assignment.backup!.id)}
                                    >
                                      <Trash2 className="h-3 w-3 text-destructive" />
                                    </Button>
                                  </div>
                                )}
                                {!assignment.backup && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full h-6 text-xs"
                                    onClick={() => handleOpenAssignDialog(dept, day)}
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add Backup
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                className="w-full h-full min-h-[60px] flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground hover:bg-primary/5"
                                onClick={() => handleOpenAssignDialog(dept, day)}
                              >
                                <AlertCircle className="h-4 w-4 text-destructive" />
                                <span className="text-xs">No coverage</span>
                                <Plus className="h-3 w-3" />
                              </Button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!selectedDepts || selectedDepts.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  No clinical departments configured for on-call coverage.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">P</Badge>
              <span className="text-muted-foreground">Primary On-Call</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">B</Badge>
              <span className="text-muted-foreground">Backup On-Call</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-muted-foreground">No Coverage</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assign On-Call Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign On-Call</DialogTitle>
          </DialogHeader>
          
          {selectedDept && selectedDate && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">{selectedDept.name}</p>
                <p className="text-sm text-muted-foreground">{format(selectedDate, "EEEE, MMMM d, yyyy")}</p>
              </div>
              
              <div className="space-y-2">
                <Label>On-Call Type</Label>
                <Select value={onCallType} onValueChange={setOnCallType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary On-Call</SelectItem>
                    <SelectItem value="backup">Backup On-Call</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Select Employee</Label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {getDeptEmployees(selectedDept.id).map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getDeptEmployees(selectedDept.id).length === 0 && (
                  <p className="text-xs text-muted-foreground">No active employees in this department</p>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleCreateOnCall} 
              disabled={!selectedEmployee || createOnCall.isPending}
            >
              {createOnCall.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}