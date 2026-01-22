import { useState } from "react";
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
import { AlertTriangle, Search, Users, FileWarning, AlertCircle, Plus, Eye, FileText } from "lucide-react";
import { format, subDays } from "date-fns";

const ACTION_TYPES = [
  { value: "verbal_warning", label: "Verbal Warning", severity: "low" },
  { value: "written_warning", label: "Written Warning", severity: "medium" },
  { value: "final_warning", label: "Final Warning", severity: "high" },
  { value: "suspension", label: "Suspension", severity: "high" },
  { value: "termination", label: "Termination", severity: "critical" },
];

const VIOLATION_CATEGORIES = [
  "Attendance Issues",
  "Policy Violation",
  "Misconduct",
  "Performance",
  "Safety Violation",
  "Harassment",
  "Insubordination",
  "Other",
];

export default function DisciplinaryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedActionType, setSelectedActionType] = useState<string>("all");
  
  const { data: employees, isLoading: loadingEmployees } = useEmployees();
  const { data: departments, isLoading: loadingDepts } = useDepartments();

  // Mock disciplinary data (in production, this would come from a dedicated table)
  const disciplinaryRecords = employees?.slice(0, 15).map((emp, index) => {
    const actionType = ACTION_TYPES[index % ACTION_TYPES.length];
    const category = VIOLATION_CATEGORIES[index % VIOLATION_CATEGORIES.length];
    
    return {
      id: `disc-${index}`,
      employee: emp,
      actionType: actionType.value,
      actionLabel: actionType.label,
      severity: actionType.severity,
      category,
      incidentDate: subDays(new Date(), index * 7 + 5),
      actionDate: subDays(new Date(), index * 7),
      status: index % 4 === 0 ? "pending" : index % 4 === 1 ? "under_review" : "resolved",
      description: `${category} - ${actionType.label} issued for policy violation.`,
      issuedBy: "HR Manager",
    };
  }) || [];

  const filteredRecords = disciplinaryRecords.filter(record => {
    const matchesSearch = `${record.employee.first_name} ${record.employee.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.employee.employee_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDepartment === "all" || record.employee.department_id === selectedDepartment;
    const matchesAction = selectedActionType === "all" || record.actionType === selectedActionType;
    return matchesSearch && matchesDept && matchesAction;
  });

  const totalRecords = disciplinaryRecords.length;
  const pendingCount = disciplinaryRecords.filter(r => r.status === "pending").length;
  const underReviewCount = disciplinaryRecords.filter(r => r.status === "under_review").length;
  const activeWarnings = disciplinaryRecords.filter(r => 
    r.actionType.includes("warning") && r.status === "resolved"
  ).length;

  const isLoading = loadingEmployees || loadingDepts;

  const getDepartmentName = (deptId: string | null) => {
    if (!deptId) return "N/A";
    return departments?.find(d => d.id === deptId)?.name || "Unknown";
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "low":
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Low</Badge>;
      case "medium":
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Medium</Badge>;
      case "high":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">High</Badge>;
      case "critical":
        return <Badge className="bg-red-600 text-white hover:bg-red-600">Critical</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-100 text-amber-700">Pending</Badge>;
      case "under_review":
        return <Badge className="bg-blue-100 text-blue-700">Under Review</Badge>;
      case "resolved":
        return <Badge className="bg-green-100 text-green-700">Resolved</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Disciplinary Actions"
        breadcrumbs={[
          { label: "HR", href: "/app/hr" },
          { label: "Compliance", href: "/app/hr/compliance" },
          { label: "Disciplinary" }
        ]}
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Incident
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileWarning className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold">{totalRecords}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Actions</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Under Review</p>
                <p className="text-2xl font-bold">{underReviewCount}</p>
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
                <p className="text-sm text-muted-foreground">Active Warnings</p>
                <p className="text-2xl font-bold">{activeWarnings}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Type Summary */}
      <div className="grid gap-4 md:grid-cols-5">
        {ACTION_TYPES.map((action) => {
          const count = disciplinaryRecords.filter(r => r.actionType === action.value).length;
          
          return (
            <Card key={action.value}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{action.label}</p>
                    <p className="text-2xl font-bold mt-1">{count}</p>
                  </div>
                  {getSeverityBadge(action.severity)}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Disciplinary Records
              </CardTitle>
              <CardDescription>Track and manage employee disciplinary actions</CardDescription>
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
              <Select value={selectedActionType} onValueChange={setSelectedActionType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {ACTION_TYPES.map((action) => (
                    <SelectItem key={action.value} value={action.value}>{action.label}</SelectItem>
                  ))}
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
                  <TableHead>Action Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Incident Date</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No disciplinary records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={record.employee.profile_photo_url || ""} />
                            <AvatarFallback>
                              {record.employee.first_name?.[0]}{record.employee.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{record.employee.first_name} {record.employee.last_name}</p>
                            <p className="text-xs text-muted-foreground">{record.employee.employee_number}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getDepartmentName(record.employee.department_id)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{record.actionLabel}</Badge>
                      </TableCell>
                      <TableCell>{record.category}</TableCell>
                      <TableCell>{format(record.incidentDate, "MMM d, yyyy")}</TableCell>
                      <TableCell>{getSeverityBadge(record.severity)}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
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
