/**
 * OPD Department Report
 * Analytics and statistics by OPD department
 */

import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  CalendarIcon,
  Download,
  Users,
  Building2,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { useOPDDepartmentStats, OPDDepartmentStat } from "@/hooks/useOPDDepartmentStats";
import { PageHeader } from "@/components/PageHeader";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

type Period = "today" | "week" | "month" | "custom";

export default function OPDDepartmentReport() {
  const [period, setPeriod] = useState<Period>("today");
  const [customDateFrom, setCustomDateFrom] = useState<Date | undefined>();
  const [customDateTo, setCustomDateTo] = useState<Date | undefined>();

  const { data: summary, isLoading, error } = useOPDDepartmentStats(
    period,
    customDateFrom ? format(customDateFrom, "yyyy-MM-dd") : undefined,
    customDateTo ? format(customDateTo, "yyyy-MM-dd") : undefined
  );

  const getPeriodLabel = () => {
    switch (period) {
      case "week":
        return "This Week";
      case "month":
        return "This Month";
      case "custom":
        if (customDateFrom && customDateTo) {
          return `${format(customDateFrom, "MMM d")} - ${format(customDateTo, "MMM d, yyyy")}`;
        }
        return "Custom Range";
      default:
        return "Today";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Failed to load OPD department stats.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const chartData = summary?.departments.map((dept) => ({
    name: dept.code,
    fullName: dept.name,
    patients: dept.patientCount,
    completed: dept.completedCount,
    revenue: dept.revenue,
    color: dept.color || "#3b82f6",
  })) || [];

  const pieData = chartData.filter((d) => d.patients > 0);

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="OPD Department Analytics"
        description={`Patient distribution and performance by OPD department - ${getPeriodLabel()}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/app" },
          { label: "Reports", href: "/app/reports" },
          { label: "OPD Departments" },
        ]}
      />

      {/* Period Selector */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={period === "today" ? "default" : "outline"}
          size="sm"
          onClick={() => setPeriod("today")}
        >
          Today
        </Button>
        <Button
          variant={period === "week" ? "default" : "outline"}
          size="sm"
          onClick={() => setPeriod("week")}
        >
          This Week
        </Button>
        <Button
          variant={period === "month" ? "default" : "outline"}
          size="sm"
          onClick={() => setPeriod("month")}
        >
          This Month
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant={period === "custom" ? "default" : "outline"} size="sm">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Custom Range
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={{
                from: customDateFrom,
                to: customDateTo,
              }}
              onSelect={(range) => {
                setCustomDateFrom(range?.from);
                setCustomDateTo(range?.to);
                if (range?.from && range?.to) {
                  setPeriod("custom");
                }
              }}
              numberOfMonths={2}
              disabled={(date) => date > new Date()}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Active Departments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary?.departments.length || 0}</p>
            <p className="text-xs text-muted-foreground">with patient activity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Patients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary?.totalPatients || 0}</p>
            <p className="text-xs text-muted-foreground">across all OPDs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary?.totalCompleted || 0}</p>
            <p className="text-xs text-muted-foreground">
              {summary?.totalPatients
                ? `${Math.round((summary.totalCompleted / summary.totalPatients) * 100)}% rate`
                : "0% rate"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Revenue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(summary?.totalRevenue || 0)}</p>
            <p className="text-xs text-muted-foreground">collected</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Count by Department</CardTitle>
            <CardDescription>Number of patients per OPD department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={60} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border rounded-lg p-2 shadow-lg">
                            <p className="font-medium">{data.fullName}</p>
                            <p className="text-sm text-muted-foreground">
                              Patients: {data.patients}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Completed: {data.completed}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="patients" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Distribution</CardTitle>
            <CardDescription>Share of patients by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="patients"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Department Details</CardTitle>
          <CardDescription>Detailed breakdown per OPD department</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Patients</TableHead>
                <TableHead className="text-right">Completed</TableHead>
                <TableHead className="text-right">Cancelled</TableHead>
                <TableHead className="text-right">No Show</TableHead>
                <TableHead className="text-right">Completion Rate</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary?.departments.map((dept) => {
                const completionRate =
                  dept.patientCount > 0
                    ? Math.round((dept.completedCount / dept.patientCount) * 100)
                    : 0;

                return (
                  <TableRow key={dept.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: dept.color || "#3b82f6" }}
                        />
                        <span className="font-medium">{dept.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {dept.code}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {dept.patientCount}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {dept.completedCount}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      {dept.cancelledCount}
                    </TableCell>
                    <TableCell className="text-right text-amber-600">
                      {dept.noShowCount}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Progress value={completionRate} className="w-16 h-2" />
                        <span className="text-sm">{completionRate}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(dept.revenue)}
                    </TableCell>
                  </TableRow>
                );
              })}
              {(!summary?.departments || summary.departments.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No department data for this period
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
