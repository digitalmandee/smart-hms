import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useExecutiveSummary } from "@/hooks/useExecutiveSummary";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { DollarSign, Users, Bed, Pill, TestTube, TrendingUp, AlertTriangle, Calendar, Download, Building2 } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import PageHeader from "@/components/common/PageHeader";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

const formatCurrency = (value: number) => `Rs. ${value.toLocaleString()}`;

export default function ExecutiveDashboardReport() {
  const [period, setPeriod] = useState("this-month");
  
  const getDateRange = () => {
    const now = new Date();
    switch (period) {
      case "last-month": return { startDate: startOfMonth(subMonths(now, 1)), endDate: endOfMonth(subMonths(now, 1)) };
      case "last-3-months": return { startDate: startOfMonth(subMonths(now, 2)), endDate: endOfMonth(now) };
      default: return { startDate: startOfMonth(now), endDate: endOfMonth(now) };
    }
  };

  const { startDate, endDate } = getDateRange();
  const { data, isLoading } = useExecutiveSummary({ startDate, endDate });

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const summary = data || { revenue: { total: 0, collected: 0, outstanding: 0, trend: 0 }, opd: { consultations: 0, avgPerDoctor: 0 }, ipd: { activeAdmissions: 0, occupancyRate: 0, totalBeds: 0 }, pharmacy: { todaySales: 0, monthSales: 0 }, lab: { ordersProcessed: 0, pendingOrders: 0 }, hr: { totalEmployees: 0, attendanceRate: 0 }, financial: { byDepartment: [] }, alerts: [], patientFootfall: 0 };

  const pieData = summary.financial.byDepartment.filter(d => d.count > 0).map((d, i) => ({ name: d.name, value: d.count, fill: COLORS[i % COLORS.length] }));

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Executive Dashboard"
        description="Complete hospital performance overview"
        breadcrumbs={[{ label: "Reports", href: "/app/reports" }, { label: "Executive Dashboard" }]}
        actions={
          <div className="flex gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="last-3-months">Last 3 Months</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export</Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20"><DollarSign className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-xl font-bold">{formatCurrency(summary.revenue.total)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100"><TrendingUp className="h-5 w-5 text-green-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Collected</p>
                <p className="text-xl font-bold">{formatCurrency(summary.revenue.collected)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100"><AlertTriangle className="h-5 w-5 text-amber-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-xl font-bold">{formatCurrency(summary.revenue.outstanding)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100"><Users className="h-5 w-5 text-blue-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Patient Footfall</p>
                <p className="text-xl font-bold">{summary.patientFootfall}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100"><Bed className="h-5 w-5 text-purple-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Bed Occupancy</p>
                <p className="text-xl font-bold">{summary.ipd.occupancyRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" />Activity by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Department Summaries */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Department Summary</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2"><Calendar className="h-4 w-4 text-blue-600" /><span className="font-medium">OPD</span></div>
                <p className="text-2xl font-bold">{summary.opd.consultations}</p>
                <p className="text-xs text-muted-foreground">Consultations</p>
                <p className="text-xs mt-1">Avg {summary.opd.avgPerDoctor}/doctor</p>
              </div>
              <div className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2"><Bed className="h-4 w-4 text-purple-600" /><span className="font-medium">IPD</span></div>
                <p className="text-2xl font-bold">{summary.ipd.activeAdmissions}</p>
                <p className="text-xs text-muted-foreground">Active Admissions</p>
                <p className="text-xs mt-1">{summary.ipd.totalBeds} total beds</p>
              </div>
              <div className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2"><Pill className="h-4 w-4 text-pink-600" /><span className="font-medium">Pharmacy</span></div>
                <p className="text-2xl font-bold">{formatCurrency(summary.pharmacy.monthSales)}</p>
                <p className="text-xs text-muted-foreground">Month Sales</p>
                <p className="text-xs mt-1">Today: {formatCurrency(summary.pharmacy.todaySales)}</p>
              </div>
              <div className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2"><TestTube className="h-4 w-4 text-cyan-600" /><span className="font-medium">Laboratory</span></div>
                <p className="text-2xl font-bold">{summary.lab.ordersProcessed}</p>
                <p className="text-xs text-muted-foreground">Orders Processed</p>
                <p className="text-xs mt-1">{summary.lab.pendingOrders} pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* HR & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>HR Summary</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-primary">{summary.hr.totalEmployees}</p>
                <p className="text-sm text-muted-foreground">Total Staff</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-600">{summary.hr.attendanceRate}%</p>
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{summary.hr.presentToday}</p>
                <p className="text-sm text-muted-foreground">Present Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Alerts & Notifications</CardTitle></CardHeader>
          <CardContent>
            {summary.alerts.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No alerts at this time</p>
            ) : (
              <div className="space-y-3">
                {summary.alerts.map((alert, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className={`h-5 w-5 ${alert.type === "error" ? "text-red-500" : alert.type === "warning" ? "text-amber-500" : "text-blue-500"}`} />
                      <span>{alert.title}</span>
                    </div>
                    <Badge variant={alert.type === "error" ? "destructive" : "secondary"}>{alert.count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
