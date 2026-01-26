import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmployeeStats, useDepartments } from "@/hooks/useHR";
import { useAttendanceStats } from "@/hooks/useAttendance";
import { usePayrollStats } from "@/hooks/usePayroll";
import { useDepartmentDistribution, useAttendanceTrends, useLeaveDistribution, useLeaveStats } from "@/hooks/useHRReports";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { Users, UserCheck, Clock, Calendar, DollarSign, TrendingUp, Download, FileText, Briefcase, Building } from "lucide-react";
import { format } from "date-fns";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function HRReportsPage() {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const today = format(new Date(), "yyyy-MM-dd");
  
  const { data: employeeStats, isLoading: statsLoading } = useEmployeeStats();
  const { data: attendanceStats, isLoading: attendanceLoading } = useAttendanceStats(today);
  const { data: payrollStats, isLoading: payrollLoading } = usePayrollStats();
  const { data: departments } = useDepartments();
  
  // Real data hooks
  const { data: deptDistribution } = useDepartmentDistribution();
  const { data: attendanceTrends } = useAttendanceTrends(parseInt(year));
  const { data: leaveDistribution } = useLeaveDistribution(parseInt(year));
  const { data: leaveStats } = useLeaveStats(parseInt(year));

  const isLoading = statsLoading || attendanceLoading || payrollLoading;

  // Use real department data or fallback
  const departmentData = (deptDistribution?.slice(0, 6) || []).map((dept: any, idx: number) => ({
    name: dept.name.length > 12 ? dept.name.slice(0, 12) + "..." : dept.name,
    employees: dept.count,
    fill: COLORS[idx % COLORS.length],
  }));

  // Use real attendance data or fallback
  const attendanceTrendData = attendanceTrends?.length ? attendanceTrends : [
    { month: "Jan", present: 0, absent: 0, late: 0 },
    { month: "Feb", present: 0, absent: 0, late: 0 },
    { month: "Mar", present: 0, absent: 0, late: 0 },
  ];

  // Use real leave data or fallback
  const leaveDistributionData = (leaveDistribution?.length ? leaveDistribution : [
    { name: "No data", value: 1 },
  ]).map((item: any, idx: number) => ({
    ...item,
    fill: COLORS[idx % COLORS.length],
  }));

  const formatCurrency = (value: number) => `Rs. ${value?.toLocaleString() || 0}`;

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">HR Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive workforce analytics and statistics</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{employeeStats?.total || 0}</p>
                <p className="text-xs text-green-600">+{employeeStats?.recentJoiners || 0} this month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Present Today</p>
                <p className="text-2xl font-bold">{attendanceStats?.present || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {attendanceStats?.late || 0} late arrivals
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-amber-500/10">
                <Calendar className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">On Leave</p>
                <p className="text-2xl font-bold">{attendanceStats?.onLeave || 0}</p>
                <p className="text-xs text-muted-foreground">
                  Approved leaves today
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Loans</p>
                <p className="text-2xl font-bold">{formatCurrency(payrollStats?.totalActiveLoanAmount || 0)}</p>
                <p className="text-xs text-muted-foreground">
                  {payrollStats?.pendingLoanApprovals || 0} pending approvals
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="leave">Leave Analysis</TabsTrigger>
          <TabsTrigger value="department">Department</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Employees by Department
                </CardTitle>
                <CardDescription>Distribution across departments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" className="text-xs" />
                      <YAxis type="category" dataKey="name" width={100} className="text-xs" />
                      <Tooltip />
                      <Bar dataKey="employees" radius={[0, 4, 4, 0]}>
                        {departmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Leave Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Leave Distribution
                </CardTitle>
                <CardDescription>Leave types breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={leaveDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {leaveDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Attendance Trends
              </CardTitle>
              <CardDescription>Monthly attendance rate comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={attendanceTrendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="present" stroke="hsl(var(--primary))" strokeWidth={2} name="Present %" />
                    <Line type="monotone" dataKey="absent" stroke="hsl(var(--destructive))" strokeWidth={2} name="Absent %" />
                    <Line type="monotone" dataKey="late" stroke="hsl(var(--chart-4))" strokeWidth={2} name="Late %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leave" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-4xl font-bold text-primary">{leaveStats?.totalApproved || 0}</p>
                <p className="text-sm text-muted-foreground mt-2">Total Leaves Taken</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-4xl font-bold text-amber-600">{leaveStats?.pendingApprovals || 0}</p>
                <p className="text-sm text-muted-foreground mt-2">Pending Approvals</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-4xl font-bold text-green-600">{leaveStats?.approvedThisMonth || 0}</p>
                <p className="text-sm text-muted-foreground mt-2">Approved This Month</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="department" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Department Statistics</CardTitle>
              <CardDescription>Employee distribution and metrics by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departments?.map((dept) => (
                  <div key={dept.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Briefcase className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{dept.name}</p>
                        <p className="text-sm text-muted-foreground">{dept.code}</p>
                      </div>
                    </div>
                    <Badge variant={dept.is_active ? "default" : "secondary"}>
                      {dept.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = "/app/hr/attendance/reports"}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Clock className="h-8 w-8 text-primary" />
              <div>
                <p className="font-semibold">Attendance Reports</p>
                <p className="text-sm text-muted-foreground">Detailed attendance analytics</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = "/app/hr/payroll/reports"}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <DollarSign className="h-8 w-8 text-primary" />
              <div>
                <p className="font-semibold">Payroll Reports</p>
                <p className="text-sm text-muted-foreground">Salary trends and analysis</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = "/app/hr/leaves/balances"}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <p className="font-semibold">Leave Balances</p>
                <p className="text-sm text-muted-foreground">Employee leave status</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
