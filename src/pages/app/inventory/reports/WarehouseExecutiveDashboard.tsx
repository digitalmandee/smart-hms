import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/PageHeader";
import { ReportExportButton } from "@/components/reports/ReportExportButton";
import { useWarehouseExecutiveSummary } from "@/hooks/useWarehouseExecutiveSummary";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganizations";
import { formatCurrency } from "@/lib/exportUtils";
import {
  DollarSign, ShoppingCart, ClipboardCheck, FileText,
  AlertTriangle, Users, Package, TrendingUp, ArrowRight,
  Truck, BarChart3
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function WarehouseExecutiveDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: organization } = useOrganization(profile?.organization_id);
  const [period, setPeriod] = useState("this-month");
  const { data, isLoading } = useWarehouseExecutiveSummary(period);

  const isWarehouse = organization?.facility_type === "warehouse";
  const title = isWarehouse ? "Warehouse Executive Dashboard" : "Inventory Executive Dashboard";

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
    stockValue: 0, totalPOs: 0, totalSpend: 0, grnCount: 0,
    pendingRequisitions: 0, lowStockCount: 0, activeVendors: 0,
    expiringItems: 0, categoryDistribution: [], monthlyTrend: [],
    topVendors: [], alerts: [],
  };

  const exportData = [
    { metric: "Total Stock Value", value: formatCurrency(summary.stockValue) },
    { metric: "Purchase Orders", value: String(summary.totalPOs) },
    { metric: "Total Spend", value: formatCurrency(summary.totalSpend) },
    { metric: "GRN Count", value: String(summary.grnCount) },
    { metric: "Pending Requisitions", value: String(summary.pendingRequisitions) },
    { metric: "Low Stock Alerts", value: String(summary.lowStockCount) },
    { metric: "Active Vendors", value: String(summary.activeVendors) },
  ];

  const exportColumns = [
    { key: "metric", header: "Metric" },
    { key: "value", header: "Value" },
  ];

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title={title}
        description="Complete warehouse performance overview with drill-down analytics"
        breadcrumbs={[
          { label: "Inventory", href: "/app/inventory" },
          { label: "Reports", href: "/app/inventory/reports" },
          { label: "Executive Dashboard" },
        ]}
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
            <ReportExportButton
              data={exportData}
              columns={exportColumns}
              filename="warehouse-executive-dashboard"
              title={title}
            />
          </div>
        }
      />

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/app/inventory/reports/valuation")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20"><DollarSign className="h-5 w-5 text-primary" /></div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Stock Value</p>
                <p className="text-xl font-bold">{formatCurrency(summary.stockValue)}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/app/inventory/reports/procurement")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20"><ShoppingCart className="h-5 w-5 text-blue-600" /></div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">PO Spend</p>
                <p className="text-xl font-bold">{formatCurrency(summary.totalSpend)}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20"><ClipboardCheck className="h-5 w-5 text-green-600" /></div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">GRNs Received</p>
                <p className="text-xl font-bold">{summary.grnCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/app/inventory/requisitions")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20"><FileText className="h-5 w-5 text-amber-600" /></div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Pending Requisitions</p>
                <p className="text-xl font-bold">{summary.pendingRequisitions}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className={summary.lowStockCount > 0 ? "border-orange-200 bg-orange-50/50 dark:border-orange-900 dark:bg-orange-950/20" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20"><AlertTriangle className="h-5 w-5 text-orange-600" /></div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className={`text-xl font-bold ${summary.lowStockCount > 0 ? "text-orange-600" : ""}`}>{summary.lowStockCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/app/inventory/vendors")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20"><Users className="h-5 w-5 text-purple-600" /></div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Active Vendors</p>
                <p className="text-xl font-bold">{summary.activeVendors}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Vendors by Spend */}
        {summary.topVendors.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Top Vendors by Spend</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={summary.topVendors} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(v) => `Rs.${(v / 1000).toFixed(0)}K`} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="spend" fill="hsl(var(--primary))" name="Spend" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Category Distribution */}
        {summary.categoryDistribution.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" />Category Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={summary.categoryDistribution.slice(0, 6)} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">
                    {summary.categoryDistribution.slice(0, 6).map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Department Performance Grid */}
      <Card>
        <CardHeader><CardTitle>Department Performance</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-lg border cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate("/app/inventory/reports/valuation")}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" /><span className="font-medium">Stock</span></div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">{formatCurrency(summary.stockValue)}</p>
              <p className="text-xs text-muted-foreground">Total Value</p>
            </div>

            <div className="p-4 rounded-lg border cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate("/app/inventory/reports/procurement")}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2"><ShoppingCart className="h-4 w-4 text-blue-600" /><span className="font-medium">Procurement</span></div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">{summary.totalPOs}</p>
              <p className="text-xs text-muted-foreground">Purchase Orders</p>
            </div>

            <div className="p-4 rounded-lg border cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate("/app/inventory/store-transfers")}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-green-600" /><span className="font-medium">Transfers</span></div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">{summary.grnCount}</p>
              <p className="text-xs text-muted-foreground">GRNs This Period</p>
            </div>

            <div className="p-4 rounded-lg border cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate("/app/inventory/reports/vendor-performance")}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2"><Users className="h-4 w-4 text-purple-600" /><span className="font-medium">Vendors</span></div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">{summary.activeVendors}</p>
              <p className="text-xs text-muted-foreground">Active Vendors</p>
            </div>

            <div className="p-4 rounded-lg border cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate("/app/inventory/reports/abc-analysis")}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-cyan-600" /><span className="font-medium">ABC Analysis</span></div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">View Pareto classification</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Section */}
      {summary.alerts.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" />Alerts & Notifications</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.alerts.map((alert, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Badge variant={alert.type === "danger" ? "destructive" : alert.type === "warning" ? "default" : "outline"}>
                      {alert.type === "danger" ? "Critical" : alert.type === "warning" ? "Warning" : "Info"}
                    </Badge>
                    <span className="text-sm">{alert.message}</span>
                  </div>
                  <span className="text-lg font-bold">{alert.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
