import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAttendanceStats } from "@/hooks/useAttendance";
import { useAttendanceReportData } from "@/hooks/useAttendanceReports";
import { useDepartments } from "@/hooks/useHR";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { Users, Clock, UserCheck, UserX, AlertTriangle, Download, Calendar } from "lucide-react";
import { format } from "date-fns";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--destructive))'];

export default function AttendanceReportsPage() {
  const [dateRange, setDateRange] = useState("this-month");
  const [department, setDepartment] = useState("all");
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: attendanceStats, isLoading: statsLoading } = useAttendanceStats(today);
  const { data: departments } = useDepartments();
  
  // Real data from database
  const { 
    dailyTrend, 
    departmentData, 
    topLateArrivals, 
    dayOfWeekPattern,
    isLoading: reportLoading 
  } = useAttendanceReportData(dateRange, department);

  // Status distribution (from real today's stats)
  const statusDistribution = [
    { name: "Present", value: attendanceStats?.present || 0, fill: COLORS[0] },
    { name: "Absent", value: attendanceStats?.absent || 0, fill: COLORS[4] },
    { name: "Late", value: attendanceStats?.late || 0, fill: COLORS[3] },
    { name: "On Leave", value: attendanceStats?.onLeave || 0, fill: COLORS[2] },
    { name: "Half Day", value: attendanceStats?.halfDay || 0, fill: COLORS[1] },
  ].filter(item => item.value > 0);

  // Format department data for chart
  const deptChartData = departmentData.map(dept => ({
    name: dept.departmentName.length > 10 ? dept.departmentName.slice(0, 10) + "..." : dept.departmentName,
    present: dept.attendanceRate,
    absent: 100 - dept.attendanceRate,
  }));

  const total = (attendanceStats?.present || 0) + (attendanceStats?.absent || 0) + 
                (attendanceStats?.late || 0) + (attendanceStats?.onLeave || 0);
  const presentRate = total > 0 ? Math.round(((attendanceStats?.present || 0) / total) * 100) : 0;
  const absentRate = total > 0 ? Math.round(((attendanceStats?.absent || 0) / total) * 100) : 0;

  const isLoading = statsLoading || reportLoading;

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance Reports</h1>
          <p className="text-muted-foreground">Detailed attendance analytics and trends</p>
        </div>
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
      </div>

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
                {dailyTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyTrend}>
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
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No attendance data available for the selected period
                  </div>
                )}
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
                  {statusDistribution.length > 0 ? (
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
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No attendance recorded for today
                    </div>
                  )}
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
                {deptChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deptChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="present" fill="hsl(var(--primary))" name="Present %" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="absent" fill="hsl(var(--destructive))" name="Absent %" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No department-wise data available
                  </div>
                )}
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
                  {dayOfWeekPattern.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dayOfWeekPattern}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="day" className="text-xs" />
                        <YAxis className="text-xs" domain={[0, 100]} />
                        <Tooltip />
                        <Bar dataKey="attendance" fill="hsl(var(--primary))" name="Attendance %" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No pattern data available
                    </div>
                  )}
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
                    {topLateArrivals.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                          No late arrivals recorded
                        </TableCell>
                      </TableRow>
                    ) : (
                      topLateArrivals.map((emp, idx) => (
                        <TableRow key={emp.employeeId || idx}>
                          <TableCell className="font-medium">{emp.name}</TableCell>
                          <TableCell>{emp.department}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={emp.lateCount > 5 ? "destructive" : "secondary"}>
                              {emp.lateCount}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{emp.avgLateMinutes} min</TableCell>
                        </TableRow>
                      ))
                    )}
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
