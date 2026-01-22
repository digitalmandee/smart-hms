import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/PageHeader";
import { useEmployees, useDepartments } from "@/hooks/useHR";
import { Phone, ChevronLeft, ChevronRight, Users, Clock, AlertCircle, Calendar } from "lucide-react";
import { format, startOfWeek, addDays, addWeeks, subWeeks } from "date-fns";

export default function OnCallSchedulePage() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  
  const { data: employees, isLoading: loadingEmployees } = useEmployees();
  const { data: departments, isLoading: loadingDepts } = useDepartments();

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  // Filter departments that would typically have on-call requirements
  const clinicalDepts = departments?.filter(d => {
    const name = d.name.toLowerCase();
    return name.includes("emergency") || name.includes("icu") || name.includes("surgery") || 
           name.includes("medicine") || name.includes("pediatric") || name.includes("gynec") ||
           name.includes("ortho") || name.includes("cardiac");
  });

  const selectedDepts = selectedDepartment === "all" ? clinicalDepts : clinicalDepts?.filter(d => d.id === selectedDepartment);

  const getDeptEmployees = (deptId: string) => {
    return employees?.filter(emp => emp.department_id === deptId && emp.status === "active")?.slice(0, 5) || [];
  };

  const isLoading = loadingEmployees || loadingDepts;

  // Mock on-call assignments (in production, this would come from a dedicated table)
  const getOnCallAssignment = (deptId: string, dayIndex: number) => {
    const deptEmployees = getDeptEmployees(deptId);
    if (deptEmployees.length === 0) return null;
    // Simple rotation logic for demo
    const primaryIndex = dayIndex % deptEmployees.length;
    const backupIndex = (dayIndex + 1) % deptEmployees.length;
    return {
      primary: deptEmployees[primaryIndex],
      backup: deptEmployees.length > 1 ? deptEmployees[backupIndex] : null
    };
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="On-Call Schedule"
        breadcrumbs={[
          { label: "HR", href: "/app/hr" },
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
                <p className="text-sm text-muted-foreground">On-Call Staff</p>
                <p className="text-2xl font-bold">{(clinicalDepts?.length || 0) * 2}</p>
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
                      {weekDays.map((day, dayIndex) => {
                        const assignment = getOnCallAssignment(dept.id, dayIndex);
                        return (
                          <td key={day.toString()} className="p-2">
                            {assignment ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 p-1.5 rounded bg-green-50 border border-green-200">
                                  <Avatar className="h-5 w-5">
                                    <AvatarImage src={assignment.primary.profile_photo_url || ""} />
                                    <AvatarFallback className="text-[10px]">
                                      {assignment.primary.first_name?.[0]}{assignment.primary.last_name?.[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs font-medium truncate">
                                    {assignment.primary.first_name}
                                  </span>
                                  <Badge variant="secondary" className="text-[10px] px-1 py-0 bg-green-100 text-green-700">P</Badge>
                                </div>
                                {assignment.backup && (
                                  <div className="flex items-center gap-1.5 p-1.5 rounded bg-muted/50 border">
                                    <Avatar className="h-5 w-5">
                                      <AvatarImage src={assignment.backup.profile_photo_url || ""} />
                                      <AvatarFallback className="text-[10px]">
                                        {assignment.backup.first_name?.[0]}{assignment.backup.last_name?.[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs text-muted-foreground truncate">
                                      {assignment.backup.first_name}
                                    </span>
                                    <Badge variant="outline" className="text-[10px] px-1 py-0">B</Badge>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-1 p-2 rounded bg-destructive/10 text-destructive">
                                <AlertCircle className="h-3 w-3" />
                                <span className="text-xs">No coverage</span>
                              </div>
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
              <Badge variant="secondary" className="bg-green-100 text-green-700">P</Badge>
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
    </div>
  );
}
