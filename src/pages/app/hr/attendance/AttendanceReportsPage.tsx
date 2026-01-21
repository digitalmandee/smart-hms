import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAttendanceStats } from "@/hooks/useAttendance";
import { useDepartments } from "@/hooks/useHR";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { Users, Clock, UserCheck, UserX, AlertTriangle, Download, Calendar } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { exportToCSV } from "@/lib/exportUtils";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--destructive))'];

export default function AttendanceReportsPage() {
  const [dateRange, setDateRange] = useState("this-month");
  const [department, setDepartment] = useState("all");
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: attendanceStats, isLoading } = useAttendanceStats(today);
  const { data: departments } = useDepartments();

  // Daily trend data (mock - would come from aggregated queries)
  const dailyTrendData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    return {
      date: format(date, "EEE"),
      present: Math.floor(Math.random() * 20) + 75,
      absent: Math.floor(Math.random() * 10) + 2,
      late: Math.floor(Math.random() * 5) + 1,
    };
  });

  // Status distribution
  const statusDistribution = [
    { name: "Present", value: attendanceStats?.present || 0, fill: COLORS[0] },
    { name: "Absent", value: attendanceStats?.absent || 0, fill: COLORS[4] },
    { name: "Late", value: attendanceStats?.late || 0, fill: COLORS[3] },
    { name: "On Leave", value: attendanceStats?.onLeave || 0, fill: COLORS[2] },
    { name: "Half Day", value: attendanceStats?.halfDay || 0, fill: COLORS[1] },
  ].filter(item => item.value > 0);

  // Department-wise data (mock)
  const departmentData = departments?.slice(0, 5).map(dept => ({
    name: dept.name.length > 10 ? dept.name.slice(0, 10) + "..." : dept.name,
    present: Math.floor(Math.random() * 30) + 70,
    absent: Math.floor(Math.random() * 10) + 5,
  })) || [];

  // Top late arrivals (mock)
  const topLateArrivals = [
    { name: "Ahmad Khan", department: "Nursing", lateCount: 8, avgLateMinutes: 25 },
    { name: "Sara Ali", department: "Admin", lateCount: 6, avgLateMinutes: 15 },
    { name: "Imran Shah", department: "Lab", lateCount: 5, avgLateMinutes: 20 },
    { name: "Fatima Bibi", department: "Pharmacy", lateCount: 4, avgLateMinutes: 10 },
    { name: "Ali Hassan", department: "Reception", lateCount: 3, avgLateMinutes: 12 },
  ];

  // Day of week pattern (mock)
  const dayOfWeekData = [
    { day: "Mon", attendance: 95 },
    { day: "Tue", attendance: 92 },
    { day: "Wed", attendance: 94 },
    { day: "Thu", attendance: 91 },
    { day: "Fri", attendance: 88 },
    { day: "Sat", attendance: 85 },
  ];

  const total = (attendanceStats?.present || 0) + (attendanceStats?.absent || 0) + 
                (attendanceStats?.late || 0) + (attendanceStats?.onLeave || 0);
  const presentRate = total > 0 ? Math.round(((attendanceStats?.present || 0) / total) * 100) : 0;
  const absentRate = total > 0 ? Math.round(((attendanceStats?.absent || 0) / total) * 100) : 0;

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Attendance Reports"
        description="Detailed attendance analytics and trends"
        breadcrumbs={[
          { label: "HR", href: "/app/hr" },
          { label: "Attendance", href: "/app/hr/attendance" },
          { label: "Reports" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="this-year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments?.map(dept => (
                  <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-green-500/5 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Present</p>
                <p className="text-2xl font-bold">{attendanceStats?.present || 0}</p>
                <p className="text-xs text-green-600">{presentRate}% attendance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-destructive/10">
                <UserX className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Absent</p>
                <p className="text-2xl font-bold">{attendanceStats?.absent || 0}</p>
                <p className="text-xs text-destructive">{absentRate}% absent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-amber-500/10">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Late Arrivals</p>
                <p className="text-2xl font-bold">{attendanceStats?.late || 0}</p>
                <p className="text-xs text-muted-foreground">Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-500/10">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">On Leave</p>
                <p className="text-2xl font-bold">{attendanceStats?.onLeave || 0}</p>
                <p className="text-xs text-muted-foreground">Approved leaves</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Daily Trends</TabsTrigger>
          <TabsTrigger value="distribution">Status Distribution</TabsTrigger>
          <TabsTrigger value="department">By Department</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Daily Attendance Trend</CardTitle>
              <CardDescription>Last 7 days attendance breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="present" stroke="hsl(var(--primary))" strokeWidth={2} name="Present" />
                    <Line type="monotone" dataKey="absent" stroke="hsl(var(--destructive))" strokeWidth={2} name="Absent" />
                    <Line type="monotone" dataKey="late" stroke="hsl(var(--chart-4))" strokeWidth={2} name="Late" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Status Distribution</CardTitle>
                <CardDescription>Today's breakdown by status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Summary Statistics</CardTitle>
                <CardDescription>Key metrics for selected period</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">Total Employees</span>
                  <span className="font-semibold">{total}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
                  <span className="text-sm">Attendance Rate</span>
                  <span className="font-semibold text-green-600">{presentRate}%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-amber-500/10 rounded-lg">
                  <span className="text-sm">Punctuality Rate</span>
                  <span className="font-semibold text-amber-600">
                    {total > 0 ? Math.round((((attendanceStats?.present || 0) - (attendanceStats?.late || 0)) / total) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-destructive/10 rounded-lg">
                  <span className="text-sm">Absenteeism Rate</span>
                  <span className="font-semibold text-destructive">{absentRate}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="department">
          <Card>
            <CardHeader>
              <CardTitle>Department-wise Attendance</CardTitle>
              <CardDescription>Attendance comparison across departments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="present" fill="hsl(var(--primary))" name="Present %" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="absent" fill="hsl(var(--destructive))" name="Absent %" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Attendance by Day of Week</CardTitle>
                <CardDescription>Average attendance patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dayOfWeekData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="day" className="text-xs" />
                      <YAxis className="text-xs" domain={[80, 100]} />
                      <Tooltip />
                      <Bar dataKey="attendance" fill="hsl(var(--primary))" name="Attendance %" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Top Late Arrivals
                </CardTitle>
                <CardDescription>Employees with most late arrivals this month</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-right">Late Count</TableHead>
                      <TableHead className="text-right">Avg Minutes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topLateArrivals.map((emp, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{emp.name}</TableCell>
                        <TableCell>{emp.department}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={emp.lateCount > 5 ? "destructive" : "secondary"}>
                            {emp.lateCount}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{emp.avgLateMinutes} min</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
