import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmployeePerformance } from "@/hooks/useEmployeePerformance";
import { useDepartments } from "@/hooks/useHR";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Users, UserCheck, Clock, TrendingUp, Download, Search, Award, AlertTriangle } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { exportToCSV } from "@/lib/exportUtils";
import { PageHeader } from "@/components/PageHeader";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function EmployeePerformanceReport() {
  const [startDate, setStartDate] = useState(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState(endOfMonth(new Date()));
  const [departmentId, setDepartmentId] = useState("all");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useEmployeePerformance({ startDate, endDate, departmentId, search });
  const { data: departments } = useDepartments();

  const handleExport = () => {
    if (!data?.employees) return;
    exportToCSV(data.employees, `employee-performance-${format(new Date(), "yyyy-MM-dd")}`, [
      { key: "employeeCode", header: "Employee ID" },
      { key: "fullName", header: "Name" },
      { key: "department", header: "Department" },
      { key: "designation", header: "Designation" },
      { key: "workingDays", header: "Working Days" },
      { key: "presentDays", header: "Present Days" },
      { key: "lateDays", header: "Late Days" },
      { key: "leaveDays", header: "Leave Days" },
      { key: "attendanceRate", header: "Attendance %" },
      { key: "performanceScore", header: "Performance Score" },
    ]);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-100";
    if (score >= 75) return "text-blue-600 bg-blue-100";
    if (score >= 60) return "text-amber-600 bg-amber-100";
    return "text-red-600 bg-red-100";
  };

  // Prepare department chart data
  const deptChartData = data?.employees ? 
    Object.entries(data.employees.reduce((acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + emp.attendanceRate;
      return acc;
    }, {} as Record<string, number>)).map(([name, total], idx) => ({
      name: name.length > 12 ? name.slice(0, 12) + "..." : name,
      avgAttendance: Math.round(total / data.employees.filter(e => e.department === name).length),
      fill: COLORS[idx % COLORS.length],
    })).slice(0, 6) : [];

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const summary = data?.summary || { totalEmployees: 0, avgAttendanceRate: 0, perfectAttendance: 0, highPerformers: 0, totalLateArrivals: 0, avgPerformanceScore: 0 };

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Employee Performance Report"
        description="Attendance rates, punctuality, and productivity metrics"
        breadcrumbs={[
          { label: "HR", href: "/app/hr" },
          { label: "Reports", href: "/app/hr/reports" },
          { label: "Performance" },
        ]}
      />

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="text-sm font-medium mb-1 block">From</label>
              <Input type="date" value={format(startDate, "yyyy-MM-dd")} onChange={(e) => setStartDate(new Date(e.target.value))} className="w-40" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">To</label>
              <Input type="date" value={format(endDate, "yyyy-MM-dd")} onChange={(e) => setEndDate(new Date(e.target.value))} className="w-40" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Department</label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger className="w-48"><SelectValue placeholder="All Departments" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments?.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="relative flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-1 block">Search</label>
              <Search className="absolute left-3 top-9 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Button variant="outline" onClick={handleExport}><Download className="h-4 w-4 mr-2" />Export</Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10"><Users className="h-6 w-6 text-primary" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{summary.totalEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100"><TrendingUp className="h-6 w-6 text-green-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Attendance Rate</p>
                <p className="text-2xl font-bold">{summary.avgAttendanceRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100"><Award className="h-6 w-6 text-blue-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">High Performers (90%+)</p>
                <p className="text-2xl font-bold">{summary.highPerformers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-amber-100"><AlertTriangle className="h-6 w-6 text-amber-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Total Late Arrivals</p>
                <p className="text-2xl font-bold">{summary.totalLateArrivals}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Attendance by Department</CardTitle>
            <CardDescription>Average attendance rate per department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" width={80} className="text-xs" />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Bar dataKey="avgAttendance" radius={[0, 4, 4, 0]}>
                    {deptChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Employee Performance Details</CardTitle>
            <CardDescription>{data?.employees.length || 0} employees found</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[400px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-center">Present</TableHead>
                    <TableHead className="text-center">Late</TableHead>
                    <TableHead className="text-center">Attendance %</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.employees.slice(0, 20).map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{emp.fullName}</p>
                          <p className="text-xs text-muted-foreground">{emp.employeeCode}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{emp.department}</TableCell>
                      <TableCell className="text-center">{emp.presentDays}/{emp.workingDays}</TableCell>
                      <TableCell className="text-center">{emp.lateDays > 0 ? <Badge variant="outline" className="text-amber-600">{emp.lateDays}</Badge> : "-"}</TableCell>
                      <TableCell className="text-center">{emp.attendanceRate}%</TableCell>
                      <TableCell className="text-center">
                        <Badge className={getScoreColor(emp.performanceScore)}>{emp.performanceScore}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
