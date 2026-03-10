import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/PageHeader";
import { useEmployees, useDepartments } from "@/hooks/useHR";
import { Users, Building2, User } from "lucide-react";

export default function OrgChartPage() {
  const { data: employees, isLoading: loadingEmp } = useEmployees();
  const { data: departments, isLoading: loadingDept } = useDepartments();

  const isLoading = loadingEmp || loadingDept;

  const deptTree = departments?.map((dept: any) => {
    const deptEmployees = employees?.filter((e: any) => e.department_id === dept.id) || [];
    const manager = deptEmployees.find((e: any) => e.is_department_head || e.designation?.title?.toLowerCase().includes("head") || e.designation?.title?.toLowerCase().includes("manager"));
    return { ...dept, employees: deptEmployees, manager };
  }) || [];

  const unassigned = employees?.filter((e: any) => !e.department_id) || [];

  return (
    <div className="space-y-6">
      <PageHeader title="Organization Chart" description="Visual overview of departments and reporting structure" />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div><p className="text-sm text-muted-foreground">Total Departments</p><p className="text-2xl font-bold">{departments?.length || 0}</p></div>
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div><p className="text-sm text-muted-foreground">Total Employees</p><p className="text-2xl font-bold">{employees?.length || 0}</p></div>
                  <Users className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div><p className="text-sm text-muted-foreground">Unassigned</p><p className="text-2xl font-bold">{unassigned.length}</p></div>
                  <User className="h-8 w-8 text-amber-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Department Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deptTree.map((dept: any) => (
              <Card key={dept.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      {dept.name}
                    </CardTitle>
                    <Badge variant="secondary">{dept.employees.length} staff</Badge>
                  </div>
                  {dept.manager && (
                    <p className="text-sm text-muted-foreground">
                      Head: <span className="font-medium text-foreground">{dept.manager.first_name} {dept.manager.last_name}</span>
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {dept.employees.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">No employees assigned</p>
                    ) : (
                      dept.employees.map((emp: any) => (
                        <div key={emp.id} className="flex items-center justify-between text-sm py-1 border-b border-border/50 last:border-0">
                          <span className="flex items-center gap-2">
                            <User className="h-3 w-3 text-muted-foreground" />
                            {emp.first_name} {emp.last_name}
                          </span>
                          <span className="text-xs text-muted-foreground">{emp.employee_number}</span>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Unassigned employees */}
          {unassigned.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-amber-600" />
                  Unassigned Employees
                  <Badge variant="outline">{unassigned.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {unassigned.map((emp: any) => (
                    <div key={emp.id} className="flex items-center gap-2 text-sm p-2 rounded border">
                      <User className="h-3 w-3 text-muted-foreground" />
                      {emp.first_name} {emp.last_name}
                      <span className="text-xs text-muted-foreground ml-auto">{emp.employee_number}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
