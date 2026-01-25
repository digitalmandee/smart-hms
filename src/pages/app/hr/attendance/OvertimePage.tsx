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
import { useAttendanceRecords } from "@/hooks/useAttendance";
import { Clock, Search, Users, TrendingUp, DollarSign, AlertTriangle, Check, X } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { formatCurrency } from "@/lib/currency";

export default function OvertimePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState(() => format(new Date(), "yyyy-MM"));
  
  const { data: employees, isLoading: loadingEmployees } = useEmployees();
  const { data: departments, isLoading: loadingDepts } = useDepartments();
  
  const monthStart = startOfMonth(new Date(selectedMonth + "-01"));
  const monthEnd = endOfMonth(monthStart);
  
  const { data: attendanceRecords, isLoading: loadingAttendance } = useAttendanceRecords({
    startDate: format(monthStart, "yyyy-MM-dd"),
    endDate: format(monthEnd, "yyyy-MM-dd")
  });

  // Calculate overtime per employee from attendance records
  const employeeOvertimeData = employees?.map(emp => {
    const empRecords = attendanceRecords?.filter(r => r.employee_id === emp.id) || [];
    const totalOTHours = empRecords.reduce((sum, r) => sum + (r.overtime_hours || 0), 0);
    const regularOT = totalOTHours * 0.7; // 70% regular OT
    const nightOT = totalOTHours * 0.3;   // 30% night differential (mock)
    const pendingApproval = Math.floor(totalOTHours * 0.2); // 20% pending
    
    return {
      ...emp,
      totalOTHours,
      regularOT,
      nightOT,
      pendingApproval,
      approvedOT: totalOTHours - pendingApproval,
      estimatedAmount: totalOTHours * 150 // Mock rate
    };
  })?.filter(emp => emp.totalOTHours > 0) || [];

  const filteredEmployees = employeeOvertimeData.filter(emp => {
    const matchesSearch = `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emp.employee_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDepartment === "all" || emp.department_id === selectedDepartment;
    return matchesSearch && matchesDept;
  });

  const totalOTHours = filteredEmployees.reduce((sum, e) => sum + e.totalOTHours, 0);
  const totalPending = filteredEmployees.reduce((sum, e) => sum + e.pendingApproval, 0);
  const totalApproved = filteredEmployees.reduce((sum, e) => sum + e.approvedOT, 0);
  const totalAmount = filteredEmployees.reduce((sum, e) => sum + e.estimatedAmount, 0);

  const isLoading = loadingEmployees || loadingDepts || loadingAttendance;

  const getDepartmentName = (deptId: string | null) => {
    if (!deptId) return "N/A";
    return departments?.find(d => d.id === deptId)?.name || "Unknown";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overtime Management"
        breadcrumbs={[
          { label: "HR", href: "/app/hr" },
          { label: "Attendance", href: "/app/hr/attendance" },
          { label: "Overtime" }
        ]}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total OT Hours</p>
                <p className="text-2xl font-bold">{totalOTHours.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
                <p className="text-2xl font-bold">{totalPending.toFixed(1)} hrs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved OT</p>
                <p className="text-2xl font-bold">{totalApproved.toFixed(1)} hrs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Est. OT Cost</p>
                <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
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
              <CardTitle className="text-lg">Overtime Records</CardTitle>
              <CardDescription>Review and approve overtime hours for {format(monthStart, "MMMM yyyy")}</CardDescription>
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
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-[160px]"
              />
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
                  <TableHead className="text-center">Total OT</TableHead>
                  <TableHead className="text-center">Regular OT</TableHead>
                  <TableHead className="text-center">Night OT</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Est. Amount</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No overtime records found for the selected period.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((emp) => (
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
                      <TableCell className="text-center font-medium">{emp.totalOTHours.toFixed(1)} hrs</TableCell>
                      <TableCell className="text-center">{emp.regularOT.toFixed(1)} hrs</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                          {emp.nightOT.toFixed(1)} hrs
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {emp.pendingApproval > 0 ? (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                            {emp.pendingApproval.toFixed(1)} pending
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            Approved
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(emp.estimatedAmount)}
                      </TableCell>
                      <TableCell className="text-center">
                        {emp.pendingApproval > 0 && (
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50">
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
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
