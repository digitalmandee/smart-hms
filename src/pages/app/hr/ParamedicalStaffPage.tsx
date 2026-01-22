import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/PageHeader";
import { useEmployees, useEmployeeCategories, useDepartments } from "@/hooks/useHR";
import { Search, Plus, Stethoscope, FlaskConical, Scan, Activity } from "lucide-react";

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  on_leave: "bg-amber-100 text-amber-800",
  resigned: "bg-red-100 text-red-800",
  terminated: "bg-gray-100 text-gray-800",
};

export default function ParamedicalStaffPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: employees, isLoading } = useEmployees();
  const { data: categories } = useEmployeeCategories();
  const { data: departments } = useDepartments();

  // Filter for paramedical categories
  const paramedicalCategoryIds = categories?.filter((c) =>
    c.name.toLowerCase().includes("paramedical") ||
    c.name.toLowerCase().includes("technician") ||
    c.code?.toLowerCase().includes("para")
  ).map((c) => c.id) || [];

  // Filter employees by paramedical category or department
  const paramedicalStaff = employees?.filter((emp) => {
    const dept = typeof emp.department === "object" ? emp.department?.name : "";
    const isParamedicalDept = dept?.toLowerCase().includes("lab") ||
      dept?.toLowerCase().includes("radiology") ||
      dept?.toLowerCase().includes("pharmacy") ||
      dept?.toLowerCase().includes("pathology");
    
    return paramedicalCategoryIds.includes(emp.category_id || "") || isParamedicalDept;
  }) || [];

  // Filter employees by paramedical category or department
  const paramedicalStaff = employees?.filter((emp) => {
    const dept = departments?.find((d) => d.id === emp.department_id);
    const isParamedicalDept = dept?.name.toLowerCase().includes("lab") ||
      dept?.name.toLowerCase().includes("radiology") ||
      dept?.name.toLowerCase().includes("pharmacy") ||
      dept?.name.toLowerCase().includes("pathology");
    
    return paramedicalCategoryIds.includes(emp.employee_category_id || "") || isParamedicalDept;
  }) || [];

  const filteredStaff = paramedicalStaff.filter((emp) =>
    `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.employee_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDeptName = (emp: any) => typeof emp.department === "object" ? emp.department?.name : "-";
  const getCatName = (emp: any) => typeof emp.category === "object" ? emp.category?.name : "-";
  const getDesignation = (emp: any) => typeof emp.designation === "object" ? emp.designation?.name : emp.designation || "-";

  // Stats
  const totalStaff = paramedicalStaff.length;
  const activeStaff = paramedicalStaff.filter((e) => e.employment_status === "active").length;
  const labStaff = paramedicalStaff.filter((e) => getDeptName(e).toLowerCase().includes("lab")).length;
  const radiologyStaff = paramedicalStaff.filter((e) => getDeptName(e).toLowerCase().includes("radiology")).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Paramedical Staff"
        description="Manage technicians, lab staff, and other paramedical employees"
        breadcrumbs={[
          { label: "HR", href: "/app/hr" },
          { label: "Employees" },
          { label: "Paramedical Staff" },
        ]}
        actions={
          <Button onClick={() => navigate("/app/hr/employees/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Staff
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Activity className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{totalStaff}</div>
                <p className="text-muted-foreground text-sm">Total Staff</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Stethoscope className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{activeStaff}</div>
                <p className="text-muted-foreground text-sm">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <FlaskConical className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{labStaff}</div>
                <p className="text-muted-foreground text-sm">Lab Staff</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Scan className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{radiologyStaff}</div>
                <p className="text-muted-foreground text-sm">Radiology Staff</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or employee number..." className="pl-9"
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </div>

      {/* Staff Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Employee #</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={emp.profile_photo_url || ""} />
                          <AvatarFallback>
                            {emp.first_name?.[0]}{emp.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{emp.first_name} {emp.last_name}</p>
                          <p className="text-sm text-muted-foreground">{emp.personal_phone || emp.personal_email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{emp.employee_number}</TableCell>
                    <TableCell>{getDeptName(emp)}</TableCell>
                    <TableCell>{getDesignation(emp)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{getCatName(emp)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[emp.employment_status || "active"]}>
                        {emp.employment_status?.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/app/hr/employees/${emp.id}`)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!filteredStaff.length && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No paramedical staff found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
