import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useExecutiveSummary } from "@/hooks/useExecutiveSummary";
import { useBranches } from "@/hooks/useBranches";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { DollarSign, Users, Bed, Pill, TestTube, TrendingUp, TrendingDown, AlertTriangle, Calendar, Download, Building2, ArrowRight, Minus } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { ReportExportButton } from "@/components/reports/ReportExportButton";
import { formatCurrency } from "@/lib/currency";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export default function ExecutiveDashboardReport() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState("this-month");
  const [branchId, setBranchId] = useState("all");
  const { data: branches } = useBranches();
  
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
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const summary = data || { 
    revenue: { total: 0, collected: 0, outstanding: 0, trend: 0 }, 
    opd: { consultations: 0, avgPerDoctor: 0, revenue: 0 }, 
    ipd: { activeAdmissions: 0, occupancyRate: 0, totalBeds: 0, todayDischarges: 0, revenue: 0 }, 
    pharmacy: { todaySales: 0, monthSales: 0, lowStockCount: 0, expiringCount: 0 }, 
    lab: { ordersProcessed: 0, pendingOrders: 0, revenue: 0, urgentPending: 0 }, 
    hr: { totalEmployees: 0, presentToday: 0, attendanceRate: 0 }, 
    financial: { byDepartment: [], totalRevenue: 0, totalExpenses: 0, netProfit: 0 }, 
    alerts: [], 
    patientFootfall: 0,
    beds: { total: 0, occupied: 0, free: 0, maintenance: 0, occupancyRate: 0 },
  };

  const pieData = summary.financial.byDepartment.filter(d => d.count > 0).map((d, i) => ({ 
    name: d.name, 
    value: d.revenue || d.count, 
    fill: COLORS[i % COLORS.length] 
  }));

  const revenueVsExpenseData = [
    { name: "Revenue", value: summary.financial.totalRevenue, fill: "hsl(var(--chart-2))" },
    { name: "Expenses", value: summary.financial.totalExpenses, fill: "hsl(var(--destructive))" },
  ];

  // Export data for PDF/CSV
  const exportData = summary.financial.byDepartment.map(d => ({
    department: d.name,
    transactions: d.count,
    revenue: d.revenue,
  }));

  const exportColumns = [
    { key: "department", header: "Department" },
    { key: "transactions", header: "Transactions" },
    { key: "revenue", header: "Revenue", format: (v: number) => formatCurrency(v) },
  ];

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Executive Dashboard"
        description="Complete hospital performance overview with drill-down analytics"
        breadcrumbs={[{ label: "Reports", href: "/app/reports" }, { label: "Executive Dashboard" }]}
        actions={
          <div className="flex gap-2">
            <Select value={branchId} onValueChange={setBranchId}>
              <SelectTrigger className="w-40"><SelectValue placeholder="All Branches" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches?.map(b => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="last-3-months">Last 3 Months</SelectItem>
              </SelectContent>
            </Select>
            <ReportExportButton
              data={exportData}
              columns={exportColumns}
              filename="executive-dashboard"
              title="Executive Dashboard Report"
              pdfOptions={{
                title: "Executive Dashboard Report",
                subtitle: "Hospital Performance Overview",
                dateRange: { from: startDate, to: endDate },
              }}
            />
          </div>
        }
      />

      {/* Financial Overview - Gross vs Net */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/app/billing/invoices")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20"><DollarSign className="h-5 w-5 text-primary" /></div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Gross Revenue</p>
                <p className="text-xl font-bold">{formatCurrency(summary.revenue.total)}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/app/billing/payments")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20"><TrendingUp className="h-5 w-5 text-green-600" /></div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Collected</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(summary.revenue.collected)}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/app/billing/invoices?status=pending")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20"><AlertTriangle className="h-5 w-5 text-amber-600" /></div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-xl font-bold text-amber-600">{formatCurrency(summary.revenue.outstanding)}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/20"><TrendingDown className="h-5 w-5 text-destructive" /></div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Expenses</p>
                <p className="text-xl font-bold text-destructive">{formatCurrency(summary.financial.totalExpenses)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={summary.financial.netProfit >= 0 ? "border-green-500/30" : "border-destructive/30"}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${summary.financial.netProfit >= 0 ? "bg-green-500/20" : "bg-destructive/20"}`}>
                {summary.financial.netProfit >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-destructive" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Net Profit</p>
                <p className={`text-xl font-bold ${summary.financial.netProfit >= 0 ? "text-green-600" : "text-destructive"}`}>
                  {formatCurrency(summary.financial.netProfit)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/app/reception")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20"><Users className="h-5 w-5 text-blue-600" /></div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Patient Footfall</p>
                <p className="text-xl font-bold">{summary.patientFootfall}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Beds Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bed className="h-5 w-5" />Bed Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-3xl font-bold">{summary.beds.total}</p>
              <p className="text-sm text-muted-foreground">Total Beds</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-500/10 cursor-pointer hover:bg-green-500/20" onClick={() => navigate("/app/ipd/beds?status=available")}>
              <p className="text-3xl font-bold text-green-600">{summary.beds.free}</p>
              <p className="text-sm text-muted-foreground">Available</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-blue-500/10 cursor-pointer hover:bg-blue-500/20" onClick={() => navigate("/app/ipd/beds?status=occupied")}>
              <p className="text-3xl font-bold text-blue-600">{summary.beds.occupied}</p>
              <p className="text-sm text-muted-foreground">Occupied</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-amber-500/10">
              <p className="text-3xl font-bold text-amber-600">{summary.beds.maintenance}</p>
              <p className="text-sm text-muted-foreground">Housekeeping</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-primary/10">
              <p className="text-3xl font-bold text-primary">{summary.beds.occupancyRate}%</p>
              <p className="text-sm text-muted-foreground">Occupancy Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Revenue Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" />Revenue by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Department Summaries - Clickable */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Department Performance</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg border cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate("/app/opd")}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-blue-600" /><span className="font-medium">OPD</span></div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold">{summary.opd.consultations}</p>
                <p className="text-xs text-muted-foreground">Consultations</p>
                <p className="text-xs mt-1">Avg {summary.opd.avgPerDoctor}/doctor</p>
              </div>

              <div className="p-4 rounded-lg border cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate("/app/ipd")}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2"><Bed className="h-4 w-4 text-purple-600" /><span className="font-medium">IPD</span></div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold">{summary.ipd.activeAdmissions}</p>
                <p className="text-xs text-muted-foreground">Active Admissions</p>
                <p className="text-xs mt-1">{summary.ipd.todayDischarges} discharges today</p>
              </div>

              <div className="p-4 rounded-lg border cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate("/app/pharmacy")}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2"><Pill className="h-4 w-4 text-pink-600" /><span className="font-medium">Pharmacy</span></div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold">{formatCurrency(summary.pharmacy.monthSales)}</p>
                <p className="text-xs text-muted-foreground">Month Sales</p>
                <p className="text-xs mt-1">Today: {formatCurrency(summary.pharmacy.todaySales)}</p>
              </div>

              <div className="p-4 rounded-lg border cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate("/app/lab")}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2"><TestTube className="h-4 w-4 text-cyan-600" /><span className="font-medium">Laboratory</span></div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold">{formatCurrency(summary.lab.revenue)}</p>
                <p className="text-xs text-muted-foreground">Lab Revenue</p>
                <p className="text-xs mt-1">{summary.lab.pendingOrders} pending ({summary.lab.urgentPending} urgent)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* HR & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/app/hr")}>
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
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className={`h-5 w-5 ${alert.type === "error" ? "text-destructive" : alert.type === "warning" ? "text-amber-500" : "text-blue-500"}`} />
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
