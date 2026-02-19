import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/PageHeader";
import { useEmployees, useDepartments } from "@/hooks/useHR";
import { HeartPulse, Search, Users, AlertTriangle, CheckCircle, Clock, FileText } from "lucide-react";
import { differenceInDays, addMonths, format } from "date-fns";

export default function MedicalFitnessPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const { data: employees, isLoading: loadingEmployees } = useEmployees();
  const { data: departments, isLoading: loadingDepts } = useDepartments();

  // Mock medical fitness data (in production, this would come from a dedicated table)
  const employeeFitnessData = employees?.map((emp, index) => {
    const baseDate = new Date();
    // Simulate different expiry scenarios
    const monthsOffset = (index % 18) - 3; // -3 to 14 months from now
    const expiryDate = addMonths(baseDate, monthsOffset);
    const daysUntilExpiry = differenceInDays(expiryDate, baseDate);
    
    let status: "valid" | "expiring" | "expired";
    if (daysUntilExpiry < 0) status = "expired";
    else if (daysUntilExpiry <= 30) status = "expiring";
    else status = "valid";
    
    return {
      ...emp,
      lastExamDate: addMonths(expiryDate, -12),
      expiryDate,
      daysUntilExpiry,
      status,
      examType: index % 3 === 0 ? "Annual" : index % 3 === 1 ? "Pre-employment" : "Periodic",
      fitnessCategory: index % 4 === 0 ? "A" : index % 4 === 1 ? "B" : index % 4 === 2 ? "C" : "Unfit",
    };
  }) || [];

  const filteredEmployees = employeeFitnessData.filter(emp => {
    const matchesSearch = `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emp.employee_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDepartment === "all" || emp.department_id === selectedDepartment;
    const matchesStatus = statusFilter === "all" || emp.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const expiredCount = employeeFitnessData.filter(e => e.status === "expired").length;
  const expiringCount = employeeFitnessData.filter(e => e.status === "expiring").length;
  const validCount = employeeFitnessData.filter(e => e.status === "valid").length;

  const isLoading = loadingEmployees || loadingDepts;

  const getDepartmentName = (deptId: string | null) => {
    if (!deptId) return "N/A";
    return departments?.find(d => d.id === deptId)?.name || "Unknown";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "valid":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Valid</Badge>;
      case "expiring":
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Expiring Soon</Badge>;
      case "expired":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Expired</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getFitnessCategoryBadge = (category: string) => {
    switch (category) {
      case "A":
        return <Badge className="bg-green-100 text-green-700">Fit - A</Badge>;
      case "B":
        return <Badge className="bg-blue-100 text-blue-700">Fit - B</Badge>;
      case "C":
        return <Badge className="bg-amber-100 text-amber-700">Fit - C</Badge>;
      case "Unfit":
        return <Badge className="bg-red-100 text-red-700">Unfit</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Medical Fitness Examinations"
        breadcrumbs={[
          { label: t('nav.hr' as any), href: "/app/hr" },
          { label: "Compliance", href: "/app/hr/compliance" },
          { label: "Medical Fitness" }
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
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{employees?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valid Certificates</p>
                <p className="text-2xl font-bold">{validCount}</p>
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
                <p className="text-sm text-muted-foreground">Expiring (30 days)</p>
                <p className="text-2xl font-bold">{expiringCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expired</p>
                <p className="text-2xl font-bold">{expiredCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <HeartPulse className="h-5 w-5" />
                Medical Fitness Records
              </CardTitle>
              <CardDescription>Manage employee medical examination records and certificates</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments?.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="valid">Valid</SelectItem>
                  <SelectItem value="expiring">Expiring Soon</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Exam Type</TableHead>
                  <TableHead>Last Exam</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Fitness Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No records found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.slice(0, 20).map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={emp.profile_photo_url || ""} />
                            <AvatarFallback>{emp.first_name?.[0]}{emp.last_name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{emp.first_name} {emp.last_name}</p>
                            <p className="text-xs text-muted-foreground">{emp.employee_number}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getDepartmentName(emp.department_id)}</TableCell>
                      <TableCell>{emp.examType}</TableCell>
                      <TableCell>{format(emp.lastExamDate, "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        <div>
                          <p>{format(emp.expiryDate, "MMM d, yyyy")}</p>
                          {emp.status !== "expired" && (
                            <p className="text-xs text-muted-foreground">
                              {emp.daysUntilExpiry} days left
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getFitnessCategoryBadge(emp.fitnessCategory)}</TableCell>
                      <TableCell>{getStatusBadge(emp.status)}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
