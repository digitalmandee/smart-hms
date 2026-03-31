import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  usePaymentMethodBreakdown, useTopSellingMedicines, usePharmacySalesStats,
  useDailySalesSummary, useHourlySalesAnalysis, useSalesByCategory,
  useDiscountAnalysis, useMonthlyComparison,
  useStockValuation, useExpiryReport, useLowStockReport, useDeadStockReport, useStockMovementSummary,
  useProfitMarginReport, useReturnsSummary, useCreditSalesReport,
  useSupplierPurchaseSummary, usePOStatusReport,
  useCustomerSalesReport, useTransactionLog, useRefundRateAnalysis, useBasketSizeAnalysis,
  useBatchStockReport, useCategoryStockDistribution, useStockAgingReport, useInventoryTurnover,
  useDailyCashSummary, useTaxCollectionReport, useCashierPerformance, usePeakHoursReport,
  useDailyProfitLoss,
} from "@/hooks/usePharmacyReports";
import { ReportTable, Column } from "@/components/reports/ReportTable";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { formatCurrency } from "@/lib/currency";
import {
  BarChart3, TrendingUp, Package, DollarSign, Loader2,
  ShoppingCart, AlertTriangle, Clock, Percent, FileText, RotateCcw,
  PieChart as PieChartIcon, Layers, ArrowLeft, ArrowRight, Users,
  Receipt, TrendingDown, ShoppingBasket, Boxes, Grid3X3, Timer,
  RefreshCcw, Wallet, Calculator, UserCheck, Activity,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
import { ReportExportButton } from "@/components/reports/ReportExportButton";

// ============ REPORT DEFINITIONS ============

interface ReportDef {
  id: string;
  name: string;
  description: string;
  icon: any;
}

interface ReportCategory {
  label: string;
  icon: any;
  borderColor: string;
  reports: ReportDef[];
}

const REPORT_CATEGORIES: ReportCategory[] = [
  {
    label: "Sales Reports",
    icon: DollarSign,
    borderColor: "border-l-primary",
    reports: [
      { id: "daily-sales", name: "Daily Sales Summary", description: "Day-by-day sales, discounts & net revenue", icon: BarChart3 },
      { id: "hourly-sales", name: "Hourly Sales Analysis", description: "Transaction volume by hour of day", icon: Clock },
      { id: "sales-category", name: "Sales by Category", description: "Revenue breakdown by medicine category", icon: PieChartIcon },
      { id: "payment-methods", name: "Payment Methods", description: "Cash, card & digital payment split", icon: Wallet },
      { id: "discount-analysis", name: "Discount Analysis", description: "Discount trends and impact on revenue", icon: Percent },
      { id: "monthly-comparison", name: "Monthly Comparison", description: "Month-over-month sales performance", icon: TrendingUp },
      { id: "top-products", name: "Top Selling Products", description: "Best sellers ranked by revenue", icon: TrendingUp },
      { id: "customer-sales", name: "Customer Sales", description: "Top customers by spend & frequency", icon: Users },
      { id: "transaction-log", name: "Transaction Log", description: "Full receipt-wise transaction history", icon: Receipt },
      { id: "refund-rate", name: "Refund Rate Analysis", description: "Refund trends and reason breakdown", icon: TrendingDown },
      { id: "basket-size", name: "Average Basket Size", description: "Items per transaction & avg value trend", icon: ShoppingBasket },
    ],
  },
  {
    label: "Inventory Reports",
    icon: Package,
    borderColor: "border-l-accent",
    reports: [
      { id: "stock-valuation", name: "Stock Valuation", description: "Current inventory cost & retail value", icon: DollarSign },
      { id: "expiry-report", name: "Expiry Report", description: "Items expiring within 90 days", icon: AlertTriangle },
      { id: "low-stock", name: "Low Stock / Reorder", description: "Items below reorder level", icon: AlertTriangle },
      { id: "dead-stock", name: "Dead Stock", description: "No-movement items in last 30 days", icon: Layers },
      { id: "stock-movements", name: "Stock Movements", description: "In/out movement summary by type", icon: RefreshCcw },
      { id: "batch-stock", name: "Batch-wise Stock", description: "All batches with qty & expiry details", icon: Boxes },
      { id: "category-distribution", name: "Category Distribution", description: "Stock value by medicine category", icon: PieChartIcon },
      { id: "stock-aging", name: "Stock Aging", description: "How long stock has been sitting", icon: Timer },
      { id: "inventory-turnover", name: "Inventory Turnover", description: "Turnover ratio per medicine", icon: RefreshCcw },
    ],
  },
  {
    label: "Financial Reports",
    icon: TrendingUp,
    borderColor: "border-l-secondary",
    reports: [
      { id: "daily-pnl", name: "Daily Profit & Loss", description: "Day-by-day revenue, cost & profit", icon: TrendingUp },
      { id: "profit-margin", name: "Profit Margin", description: "Revenue, cost & margin per medicine", icon: TrendingUp },
      { id: "returns-summary", name: "Returns & Refunds", description: "Voided transactions & refund amounts", icon: RotateCcw },
      { id: "credit-sales", name: "Credit Sales", description: "Outstanding credit balances", icon: FileText },
      { id: "daily-cash", name: "Daily Cash Summary", description: "Cash, card & other collections per day", icon: Wallet },
      { id: "tax-collection", name: "Tax Collection", description: "Tax collected daily & per transaction", icon: Calculator },
    ],
  },
  {
    label: "Procurement Reports",
    icon: ShoppingCart,
    borderColor: "border-l-muted-foreground",
    reports: [
      { id: "supplier-summary", name: "Supplier Purchases", description: "Purchase volume by supplier", icon: ShoppingCart },
      { id: "po-status", name: "PO Status Pipeline", description: "Purchase order status breakdown", icon: Layers },
    ],
  },
  {
    label: "Operational Reports",
    icon: Activity,
    borderColor: "border-l-destructive",
    reports: [
      { id: "cashier-performance", name: "Cashier Performance", description: "Sales & transactions per cashier", icon: UserCheck },
      { id: "peak-hours", name: "Peak Hours Heatmap", description: "Transaction density by day & hour", icon: Grid3X3 },
    ],
  },
];
const PIE_COLORS = ["#22c55e", "#3b82f6", "#ef4444", "#8b5cf6", "#f59e0b", "#06b6d4", "#ec4899", "#6b7280"];

export default function PharmacyReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    end: format(endOfMonth(new Date()), "yyyy-MM-dd"),
  });

  const salesStats = usePharmacySalesStats(dateRange.start, dateRange.end);
  const stats = salesStats.data;

  const totalReports = REPORT_CATEGORIES.reduce((s, c) => s + c.reports.length, 0);

  if (selectedReport) {
    return (
      <ReportDetailView
        reportId={selectedReport}
        dateRange={dateRange}
        setDateRange={setDateRange}
        onBack={() => setSelectedReport(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Pharmacy Reports" description="Comprehensive sales, inventory, financial & procurement analytics" />

      {/* Date Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Sales</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{salesStats.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : formatCurrency(stats?.totalSales || 0)}</div><p className="text-xs text-muted-foreground">{stats?.transactionCount || 0} transactions</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Avg Transaction</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{salesStats.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : formatCurrency(stats?.avgTransaction || 0)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Discounts</CardTitle><Percent className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold text-destructive">{salesStats.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : formatCurrency(stats?.totalDiscount || 0)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Reports Available</CardTitle><BarChart3 className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalReports}</div><p className="text-xs text-muted-foreground">Across {REPORT_CATEGORIES.length} categories</p></CardContent>
        </Card>
      </div>

      {/* Report Cards Grid */}
      {REPORT_CATEGORIES.map((cat) => (
        <div key={cat.label} className="space-y-3">
          <div className="flex items-center gap-2">
            <cat.icon className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">{cat.label}</h2>
            <span className="text-xs text-muted-foreground">({cat.reports.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cat.reports.map((report) => (
              <Card
                key={report.id}
                className={`cursor-pointer hover:shadow-md transition-shadow group border-l-4 ${cat.borderColor}`}
                onClick={() => setSelectedReport(report.id)}
              >
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start gap-3">
                    <report.icon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm">{report.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{report.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============ DETAIL VIEW ============

function ReportDetailView({
  reportId,
  dateRange,
  setDateRange,
  onBack,
}: {
  reportId: string;
  dateRange: { start: string; end: string };
  setDateRange: (r: { start: string; end: string }) => void;
  onBack: () => void;
}) {
  const reportDef = REPORT_CATEGORIES.flatMap(c => c.reports).find(r => r.id === reportId);
  const reportName = reportDef?.name || "Report";

  // All hooks
  const dailySales = useDailySalesSummary(dateRange.start, dateRange.end);
  const hourlySales = useHourlySalesAnalysis(dateRange.start, dateRange.end);
  const salesByCategory = useSalesByCategory(dateRange.start, dateRange.end);
  const paymentBreakdown = usePaymentMethodBreakdown(dateRange.start, dateRange.end);
  const discountAnalysis = useDiscountAnalysis(dateRange.start, dateRange.end);
  const monthlyComparison = useMonthlyComparison(6);
  const topMedicines = useTopSellingMedicines(dateRange.start, dateRange.end);
  const stockValuation = useStockValuation();
  const expiryReport = useExpiryReport();
  const lowStock = useLowStockReport();
  const deadStock = useDeadStockReport(30);
  const stockMovements = useStockMovementSummary(dateRange.start, dateRange.end);
  const profitMargin = useProfitMarginReport(dateRange.start, dateRange.end);
  const returnsSummary = useReturnsSummary(dateRange.start, dateRange.end);
  const creditSales = useCreditSalesReport(dateRange.start, dateRange.end);
  const supplierSummary = useSupplierPurchaseSummary(dateRange.start, dateRange.end);
  const poStatus = usePOStatusReport();
  const customerSales = useCustomerSalesReport(dateRange.start, dateRange.end);
  const transactionLog = useTransactionLog(dateRange.start, dateRange.end);
  const refundRate = useRefundRateAnalysis(dateRange.start, dateRange.end);
  const basketSize = useBasketSizeAnalysis(dateRange.start, dateRange.end);
  const batchStock = useBatchStockReport();
  const categoryDist = useCategoryStockDistribution();
  const stockAging = useStockAgingReport();
  const inventoryTurnover = useInventoryTurnover(dateRange.start, dateRange.end);
  const dailyCash = useDailyCashSummary(dateRange.start, dateRange.end);
  const taxCollection = useTaxCollectionReport(dateRange.start, dateRange.end);
  const cashierPerf = useCashierPerformance(dateRange.start, dateRange.end);
  const peakHours = usePeakHoursReport(dateRange.start, dateRange.end);
  const dailyPnl = useDailyProfitLoss(dateRange.start, dateRange.end);

  const renderLoading = () => (
    <div className="flex items-center justify-center h-[300px]">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );

  const renderEmpty = (msg: string) => (
    <div className="flex items-center justify-center h-[200px] text-muted-foreground">{msg}</div>
  );

  const renderReportContent = () => {
    switch (reportId) {
      case "daily-sales": {
        const data = dailySales.data || [];
        if (dailySales.isLoading) return renderLoading();
        if (!data.length) return renderEmpty("No sales data");
        return (
          <div className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(v) => format(new Date(v), "MMM dd")} />
                  <YAxis />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} labelFormatter={(v) => format(new Date(v), "PPP")} />
                  <Legend />
                  <Bar dataKey="net" name="Net Sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="discount" name="Discounts" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ReportExportButton data={data} filename={`daily-sales-${dateRange.start}`} columns={[{ key: "date", header: "Date" }, { key: "count", header: "Transactions" }, { key: "sales", header: "Gross Sales", format: (v: number) => formatCurrency(v) }, { key: "discount", header: "Discounts", format: (v: number) => formatCurrency(v) }, { key: "net", header: "Net Sales", format: (v: number) => formatCurrency(v) }]} pdfOptions={{ title: "Daily Sales Summary", dateRange: { from: new Date(dateRange.start), to: new Date(dateRange.end) } }} />
            <ReportTable data={data} columns={[
              { key: "date", header: "Date", cell: (r) => format(new Date(r.date), "MMM dd, yyyy"), sortable: true },
              { key: "count", header: "Transactions", cell: (r) => r.count, className: "text-right", sortable: true },
              { key: "sales", header: "Gross Sales", cell: (r) => formatCurrency(r.sales), className: "text-right", sortable: true },
              { key: "discount", header: "Discounts", cell: (r) => <span className="text-destructive">{formatCurrency(r.discount)}</span>, className: "text-right" },
              { key: "net", header: "Net Sales", cell: (r) => <span className="font-medium">{formatCurrency(r.net)}</span>, className: "text-right", sortable: true },
            ]} pageSize={50} searchable={false} />
          </div>
        );
      }

      case "hourly-sales": {
        const data = hourlySales.data || [];
        if (hourlySales.isLoading) return renderLoading();
        return (
          <div className="space-y-4">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip formatter={(v: number, name: string) => [name === "count" ? v : formatCurrency(v), name === "count" ? "Transactions" : "Sales"]} />
                  <Legend />
                  <Bar dataKey="sales" name="Sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="count" name="Transactions" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ReportExportButton data={data.filter(d => d.count > 0)} filename={`hourly-sales-${dateRange.start}`} columns={[{ key: "label", header: "Hour" }, { key: "count", header: "Transactions" }, { key: "sales", header: "Sales", format: (v: number) => formatCurrency(v) }]} pdfOptions={{ title: "Hourly Sales Analysis" }} />
            <ReportTable data={data.filter(d => d.count > 0)} columns={[
              { key: "label", header: "Hour" },
              { key: "count", header: "Transactions", className: "text-right", sortable: true },
              { key: "sales", header: "Sales", cell: (r) => formatCurrency(r.sales), className: "text-right", sortable: true },
            ]} pageSize={50} searchable={false} />
          </div>
        );
      }

      case "sales-category": {
        const data = salesByCategory.data || [];
        if (salesByCategory.isLoading) return renderLoading();
        if (!data.length) return renderEmpty("No category data");
        return (
          <div className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} cx="50%" cy="50%" outerRadius={100} dataKey="revenue" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                    {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ReportExportButton data={data} filename={`sales-by-category-${dateRange.start}`} columns={[{ key: "name", header: "Category" }, { key: "quantity", header: "Qty" }, { key: "revenue", header: "Revenue", format: (v: number) => formatCurrency(v) }]} pdfOptions={{ title: "Sales by Category" }} />
            <ReportTable data={data} columns={[
              { key: "name", header: "Category", sortable: true },
              { key: "quantity", header: "Items Sold", className: "text-right", sortable: true },
              { key: "revenue", header: "Revenue", cell: (r) => <span className="font-medium">{formatCurrency(r.revenue)}</span>, className: "text-right", sortable: true },
            ]} pageSize={50} />
          </div>
        );
      }

      case "payment-methods": {
        const data = paymentBreakdown.data || [];
        if (paymentBreakdown.isLoading) return renderLoading();
        if (!data.length) return renderEmpty("No payment data");
        return (
          <div className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                    {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number, _: string, props: any) => [`${v}% (${formatCurrency(props.payload.amount)})`, props.payload.name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ReportExportButton data={data} filename={`payment-methods-${dateRange.start}`} columns={[{ key: "name", header: "Method" }, { key: "value", header: "Percentage" }, { key: "amount", header: "Amount", format: (v: number) => formatCurrency(v) }]} pdfOptions={{ title: "Payment Methods Breakdown" }} />
            <ReportTable data={data} columns={[
              { key: "name", header: "Method" },
              { key: "value", header: "Share %", cell: (r) => `${r.value}%`, className: "text-right" },
              { key: "amount", header: "Amount", cell: (r) => <span className="font-medium">{formatCurrency(r.amount)}</span>, className: "text-right", sortable: true },
            ]} pageSize={50} searchable={false} />
          </div>
        );
      }

      case "discount-analysis": {
        const data = discountAnalysis.data;
        if (discountAnalysis.isLoading) return renderLoading();
        if (!data) return renderEmpty("No data");
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Discounts</p><p className="text-2xl font-bold text-destructive">{formatCurrency(data.totalDiscount)}</p></CardContent></Card>
              <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Discount Rate</p><p className="text-2xl font-bold">{data.discountPercent.toFixed(1)}%</p></CardContent></Card>
              <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Discounted Transactions</p><p className="text-2xl font-bold">{data.discountedTransactions} / {data.totalTransactions}</p></CardContent></Card>
            </div>
            {data.dailyTrend.length > 0 && (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(v) => format(new Date(v), "MMM dd")} />
                    <YAxis />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Line type="monotone" dataKey="discount" name="Discount" stroke="hsl(var(--destructive))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            <ReportExportButton data={data.dailyTrend} filename={`discount-analysis-${dateRange.start}`} columns={[{ key: "date", header: "Date" }, { key: "sales", header: "Sales", format: (v: number) => formatCurrency(v) }, { key: "discount", header: "Discount", format: (v: number) => formatCurrency(v) }]} pdfOptions={{ title: "Discount Analysis" }} />
            <ReportTable data={data.dailyTrend} columns={[
              { key: "date", header: "Date", cell: (r) => format(new Date(r.date), "MMM dd, yyyy"), sortable: true },
              { key: "sales", header: "Sales", cell: (r) => formatCurrency(r.sales), className: "text-right", sortable: true },
              { key: "discount", header: "Discount", cell: (r) => <span className="text-destructive">{formatCurrency(r.discount)}</span>, className: "text-right", sortable: true },
            ]} pageSize={50} searchable={false} />
          </div>
        );
      }

      case "monthly-comparison": {
        const data = monthlyComparison.data || [];
        if (monthlyComparison.isLoading) return renderLoading();
        if (!data.length) return renderEmpty("No monthly data");
        return (
          <div className="space-y-4">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Legend />
                  <Bar dataKey="sales" name="Sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="discount" name="Discounts" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ReportExportButton data={data} filename="monthly-comparison" columns={[{ key: "month", header: "Month" }, { key: "count", header: "Transactions" }, { key: "sales", header: "Sales", format: (v: number) => formatCurrency(v) }, { key: "discount", header: "Discounts", format: (v: number) => formatCurrency(v) }]} pdfOptions={{ title: "Monthly Comparison" }} />
            <ReportTable data={data} columns={[
              { key: "month", header: "Month", sortable: true },
              { key: "count", header: "Transactions", className: "text-right", sortable: true },
              { key: "sales", header: "Sales", cell: (r) => <span className="font-medium">{formatCurrency(r.sales)}</span>, className: "text-right", sortable: true },
              { key: "discount", header: "Discounts", cell: (r) => <span className="text-destructive">{formatCurrency(r.discount)}</span>, className: "text-right" },
            ]} pageSize={50} searchable={false} />
          </div>
        );
      }

      case "top-products": {
        const data = topMedicines.data || [];
        if (topMedicines.isLoading) return renderLoading();
        if (!data.length) return renderEmpty("No sales data");
        return (
          <div className="space-y-4">
            <ReportExportButton data={data.map((m, i) => ({ rank: i + 1, ...m }))} filename={`top-products-${dateRange.start}`} columns={[{ key: "rank", header: "Rank" }, { key: "name", header: "Product" }, { key: "quantity", header: "Qty" }, { key: "revenue", header: "Revenue", format: (v: number) => formatCurrency(v) }]} pdfOptions={{ title: "Top Selling Products" }} />
            <ReportTable data={data.map((m, i) => ({ rank: i + 1, ...m }))} columns={[
              { key: "rank", header: "Rank", className: "w-16" },
              { key: "name", header: "Product", sortable: true },
              { key: "quantity", header: "Qty Sold", className: "text-right", sortable: true },
              { key: "revenue", header: "Revenue", cell: (r) => <span className="font-medium">{formatCurrency(r.revenue)}</span>, className: "text-right", sortable: true },
            ]} pageSize={50} />
          </div>
        );
      }

      case "customer-sales": {
        const data = customerSales.data || [];
        if (customerSales.isLoading) return renderLoading();
        if (!data.length) return renderEmpty("No customer data");
        return (
          <div className="space-y-4">
            <ReportExportButton data={data} filename={`customer-sales-${dateRange.start}`} columns={[{ key: "name", header: "Customer" }, { key: "phone", header: "Phone" }, { key: "transactions", header: "Visits" }, { key: "totalSpent", header: "Total Spent", format: (v: number) => formatCurrency(v) }, { key: "avgSpent", header: "Avg Spend", format: (v: number) => formatCurrency(v) }]} pdfOptions={{ title: "Customer Sales Report" }} />
            <ReportTable data={data} columns={[
              { key: "name", header: "Customer", sortable: true },
              { key: "phone", header: "Phone" },
              { key: "transactions", header: "Visits", className: "text-right", sortable: true },
              { key: "totalSpent", header: "Total Spent", cell: (r) => <span className="font-medium">{formatCurrency(r.totalSpent)}</span>, className: "text-right", sortable: true },
              { key: "avgSpent", header: "Avg Spend", cell: (r) => formatCurrency(r.avgSpent), className: "text-right" },
            ]} pageSize={50} />
          </div>
        );
      }

      case "transaction-log": {
        const data = transactionLog.data || [];
        if (transactionLog.isLoading) return renderLoading();
        if (!data.length) return renderEmpty("No transactions");
        return (
          <div className="space-y-4">
            <ReportExportButton data={data} filename={`transaction-log-${dateRange.start}`} columns={[{ key: "transaction_number", header: "Receipt #" }, { key: "customer_name", header: "Customer" }, { key: "total_amount", header: "Total", format: (v: number) => formatCurrency(v) }, { key: "payment_method", header: "Payment" }, { key: "status", header: "Status" }, { key: "created_at", header: "Date" }]} pdfOptions={{ title: "Transaction Log", orientation: "landscape" }} />
            <ReportTable data={data} columns={[
              { key: "transaction_number", header: "Receipt #", sortable: true },
              { key: "customer_name", header: "Customer", cell: (r) => r.customer_name || "Walk-in" },
              { key: "total_amount", header: "Total", cell: (r) => <span className="font-medium">{formatCurrency(r.total_amount)}</span>, className: "text-right", sortable: true },
              { key: "discount_amount", header: "Discount", cell: (r) => r.discount_amount > 0 ? <span className="text-destructive">{formatCurrency(r.discount_amount)}</span> : "-", className: "text-right" },
              { key: "payment_method", header: "Payment", cell: (r) => <Badge variant="secondary">{(r.payment_method || "cash").replace(/_/g, " ")}</Badge> },
              { key: "status", header: "Status", cell: (r) => <Badge variant={r.status === "completed" ? "default" : "destructive"}>{r.status}</Badge> },
              { key: "created_at", header: "Date", cell: (r) => format(new Date(r.created_at), "MMM dd, HH:mm"), sortable: true },
            ]} pageSize={50} />
          </div>
        );
      }

      case "refund-rate": {
        const data = refundRate.data;
        if (refundRate.isLoading) return renderLoading();
        if (!data) return renderEmpty("No data");
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Refund Rate</p><p className="text-2xl font-bold text-destructive">{data.refundRate.toFixed(1)}%</p></CardContent></Card>
              <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Refund Count</p><p className="text-2xl font-bold">{data.refundCount} / {data.totalTransactions}</p></CardContent></Card>
              <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Refund Amount</p><p className="text-2xl font-bold text-destructive">{formatCurrency(data.totalRefunds)}</p></CardContent></Card>
            </div>
            {data.reasons.length > 0 && (
              <Card><CardHeader><CardTitle className="text-sm">Refund Reasons</CardTitle></CardHeader><CardContent>
                <div className="flex flex-wrap gap-2">
                  {data.reasons.map(r => <Badge key={r.reason} variant="secondary">{r.reason}: {r.count}</Badge>)}
                </div>
              </CardContent></Card>
            )}
            {data.dailyTrend.length > 0 && (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(v) => format(new Date(v), "MMM dd")} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="refundRate" name="Refund Rate %" stroke="hsl(var(--destructive))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
             )}
            <ReportExportButton data={data.dailyTrend} filename={`refund-rate-${dateRange.start}`} columns={[{ key: "date", header: "Date" }, { key: "refunds", header: "Refunds" }, { key: "sales", header: "Sales" }, { key: "refundRate", header: "Refund Rate %", format: (v: number) => `${v.toFixed(1)}%` }]} pdfOptions={{ title: "Refund Rate Analysis", dateRange: { from: new Date(dateRange.start), to: new Date(dateRange.end) } }} />
          </div>
        );
      }

      case "basket-size": {
        const data = basketSize.data;
        if (basketSize.isLoading) return renderLoading();
        if (!data) return renderEmpty("No data");
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Avg Items per Transaction</p><p className="text-2xl font-bold">{data.avgItems.toFixed(1)}</p></CardContent></Card>
              <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Avg Transaction Value</p><p className="text-2xl font-bold">{formatCurrency(data.avgValue)}</p></CardContent></Card>
            </div>
            {data.dailyTrend.length > 0 && (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(v) => format(new Date(v), "MMM dd")} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="avgItems" name="Avg Items" stroke="hsl(var(--primary))" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="avgValue" name="Avg Value" stroke="hsl(var(--muted-foreground))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            <ReportExportButton data={data.dailyTrend} filename={`basket-size-${dateRange.start}`} columns={[{ key: "date", header: "Date" }, { key: "count", header: "Transactions" }, { key: "avgItems", header: "Avg Items", format: (v: number) => v.toFixed(1) }, { key: "avgValue", header: "Avg Value", format: (v: number) => formatCurrency(v) }]} pdfOptions={{ title: "Average Basket Size" }} />
            <ReportTable data={data.dailyTrend} columns={[
              { key: "date", header: "Date", cell: (r) => format(new Date(r.date), "MMM dd, yyyy"), sortable: true },
              { key: "count", header: "Transactions", className: "text-right", sortable: true },
              { key: "avgItems", header: "Avg Items", cell: (r) => r.avgItems.toFixed(1), className: "text-right" },
              { key: "avgValue", header: "Avg Value", cell: (r) => formatCurrency(r.avgValue), className: "text-right" },
            ]} pageSize={50} searchable={false} />
          </div>
        );
      }

      // ============ INVENTORY REPORTS ============

      case "stock-valuation": {
        const data = stockValuation.data;
        if (stockValuation.isLoading) return renderLoading();
        if (!data) return renderEmpty("No inventory data");
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Cost Value</p><p className="text-2xl font-bold">{formatCurrency(data.totalCost)}</p></CardContent></Card>
              <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Retail Value</p><p className="text-2xl font-bold">{formatCurrency(data.totalRetail)}</p></CardContent></Card>
              <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Potential Profit</p><p className="text-2xl font-bold text-green-600">{formatCurrency(data.totalProfit)}</p></CardContent></Card>
            </div>
            <ReportExportButton data={data.items} filename="stock-valuation" columns={[{ key: "medicine", header: "Medicine" }, { key: "category", header: "Category" }, { key: "batch", header: "Batch" }, { key: "quantity", header: "Qty" }, { key: "costValue", header: "Cost Value", format: (v: number) => formatCurrency(v) }, { key: "retailValue", header: "Retail Value", format: (v: number) => formatCurrency(v) }, { key: "margin", header: "Margin %", format: (v: number) => `${v.toFixed(1)}%` }]} pdfOptions={{ title: "Stock Valuation Report", orientation: "landscape" }} />
            <ReportTable data={data.items} columns={[
              { key: "medicine", header: "Medicine", sortable: true },
              { key: "category", header: "Category", sortable: true },
              { key: "batch", header: "Batch" },
              { key: "quantity", header: "Qty", className: "text-right", sortable: true },
              { key: "costValue", header: "Cost Value", cell: (r) => formatCurrency(r.costValue), className: "text-right", sortable: true },
              { key: "retailValue", header: "Retail Value", cell: (r) => formatCurrency(r.retailValue), className: "text-right", sortable: true },
              { key: "margin", header: "Margin", cell: (r) => `${r.margin.toFixed(1)}%`, className: "text-right", sortable: true },
            ]} pageSize={50} />
          </div>
        );
      }

      case "expiry-report": {
        const data = expiryReport.data || [];
        if (expiryReport.isLoading) return renderLoading();
        if (!data.length) return renderEmpty("No items expiring within 90 days");
        const bucketSummary = data.reduce((acc: Record<string, { count: number; value: number }>, d: any) => {
          if (!acc[d.bucket]) acc[d.bucket] = { count: 0, value: 0 };
          acc[d.bucket].count++;
          acc[d.bucket].value += d.valueAtRisk;
          return acc;
        }, {});
        return (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              {Object.entries(bucketSummary).map(([bucket, info]) => (
                <Badge key={bucket} variant={bucket === "Expired" || bucket === "0-30 days" ? "destructive" : "secondary"} className="text-sm px-3 py-1">
                  {bucket}: {(info as any).count} items ({formatCurrency((info as any).value)})
                </Badge>
              ))}
            </div>
            <ReportExportButton data={data} filename="expiry-report" columns={[{ key: "medicine", header: "Medicine" }, { key: "batch", header: "Batch" }, { key: "expiryDate", header: "Expiry" }, { key: "bucket", header: "Window" }, { key: "quantity", header: "Qty" }, { key: "valueAtRisk", header: "Value at Risk", format: (v: number) => formatCurrency(v) }]} pdfOptions={{ title: "Expiry Report" }} />
            <ReportTable data={data} columns={[
              { key: "medicine", header: "Medicine", sortable: true },
              { key: "batch", header: "Batch" },
              { key: "expiryDate", header: "Expiry", sortable: true },
              { key: "bucket", header: "Risk Window", cell: (r) => <Badge variant={r.bucket === "Expired" || r.bucket === "0-30 days" ? "destructive" : "secondary"}>{r.bucket}</Badge> },
              { key: "quantity", header: "Qty", className: "text-right", sortable: true },
              { key: "valueAtRisk", header: "Value at Risk", cell: (r) => formatCurrency(r.valueAtRisk), className: "text-right", sortable: true },
            ]} pageSize={50} />
          </div>
        );
      }

      case "low-stock": {
        const data = lowStock.data || [];
        if (lowStock.isLoading) return renderLoading();
        if (!data.length) return renderEmpty("All items above reorder level");
        return (
          <div className="space-y-4">
            <ReportExportButton data={data} filename="low-stock-report" columns={[{ key: "medicine", header: "Medicine" }, { key: "currentStock", header: "Current" }, { key: "reorderLevel", header: "Reorder Level" }, { key: "deficit", header: "Deficit" }, { key: "suggestedOrder", header: "Suggested" }]} pdfOptions={{ title: "Low Stock / Reorder Report" }} />
            <ReportTable data={data} columns={[
              { key: "medicine", header: "Medicine", sortable: true },
              { key: "batch", header: "Batch" },
              { key: "currentStock", header: "Current", cell: (r) => <span className="text-destructive font-medium">{r.currentStock}</span>, className: "text-right", sortable: true },
              { key: "reorderLevel", header: "Reorder Level", className: "text-right" },
              { key: "deficit", header: "Deficit", className: "text-right", sortable: true },
              { key: "suggestedOrder", header: "Suggested Order", cell: (r) => <span className="font-medium">{r.suggestedOrder}</span>, className: "text-right" },
              { key: "unitCost", header: "Est. Cost", cell: (r) => formatCurrency(r.suggestedOrder * r.unitCost), className: "text-right" },
            ]} pageSize={50} />
          </div>
        );
      }

      case "dead-stock": {
        const data = deadStock.data || [];
        if (deadStock.isLoading) return renderLoading();
        if (!data.length) return renderEmpty("No dead stock found");
        const totalDeadValue = data.reduce((s: number, d: any) => s + d.value, 0);
        return (
          <div className="space-y-4">
            <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Dead Stock Value</p><p className="text-2xl font-bold text-destructive">{formatCurrency(totalDeadValue)}</p><p className="text-xs text-muted-foreground">{data.length} items with no sales in last 30 days</p></CardContent></Card>
            <ReportExportButton data={data} filename="dead-stock" columns={[{ key: "medicine", header: "Medicine" }, { key: "category", header: "Category" }, { key: "batch", header: "Batch" }, { key: "quantity", header: "Qty" }, { key: "value", header: "Value", format: (v: number) => formatCurrency(v) }]} pdfOptions={{ title: "Dead Stock Report" }} />
            <ReportTable data={data} columns={[
              { key: "medicine", header: "Medicine", sortable: true },
              { key: "category", header: "Category", sortable: true },
              { key: "batch", header: "Batch" },
              { key: "quantity", header: "Qty", className: "text-right", sortable: true },
              { key: "value", header: "Value", cell: (r) => formatCurrency(r.value), className: "text-right", sortable: true },
            ]} pageSize={50} />
          </div>
        );
      }

      case "stock-movements": {
        const data = stockMovements.data || [];
        if (stockMovements.isLoading) return renderLoading();
        if (!data.length) return renderEmpty("No movements");
        return (
          <div className="space-y-4">
            <ReportExportButton data={data} filename={`stock-movements-${dateRange.start}`} columns={[{ key: "type", header: "Type" }, { key: "inQty", header: "In" }, { key: "outQty", header: "Out" }, { key: "count", header: "Count" }, { key: "value", header: "Value", format: (v: number) => formatCurrency(v) }]} pdfOptions={{ title: "Stock Movement Summary" }} />
            <ReportTable data={data} columns={[
              { key: "type", header: "Movement Type", cell: (r) => <span className="font-medium">{r.type}</span> },
              { key: "inQty", header: "In Qty", cell: (r) => r.inQty ? <span className="text-green-600">{r.inQty}</span> : "-", className: "text-right" },
              { key: "outQty", header: "Out Qty", cell: (r) => r.outQty ? <span className="text-destructive">{r.outQty}</span> : "-", className: "text-right" },
              { key: "count", header: "Count", className: "text-right", sortable: true },
              { key: "value", header: "Value", cell: (r) => formatCurrency(r.value), className: "text-right", sortable: true },
            ]} pageSize={50} searchable={false} />
          </div>
        );
      }

      case "batch-stock": {
        const data = batchStock.data || [];
        if (batchStock.isLoading) return renderLoading();
        if (!data.length) return renderEmpty("No batch data");
        return (
          <div className="space-y-4">
            <ReportExportButton data={data} filename="batch-stock" columns={[{ key: "medicine", header: "Medicine" }, { key: "category", header: "Category" }, { key: "batch", header: "Batch" }, { key: "quantity", header: "Qty" }, { key: "unitCost", header: "Cost", format: (v: number) => formatCurrency(v) }, { key: "sellingPrice", header: "Selling", format: (v: number) => formatCurrency(v) }, { key: "expiryDate", header: "Expiry" }]} pdfOptions={{ title: "Batch-wise Stock Report", orientation: "landscape" }} />
            <ReportTable data={data} columns={[
              { key: "medicine", header: "Medicine", sortable: true },
              { key: "category", header: "Category", sortable: true },
              { key: "batch", header: "Batch" },
              { key: "quantity", header: "Qty", className: "text-right", sortable: true },
              { key: "unitCost", header: "Unit Cost", cell: (r) => formatCurrency(r.unitCost), className: "text-right" },
              { key: "sellingPrice", header: "Selling Price", cell: (r) => formatCurrency(r.sellingPrice), className: "text-right" },
              { key: "expiryDate", header: "Expiry", sortable: true },
              { key: "value", header: "Value", cell: (r) => <span className="font-medium">{formatCurrency(r.value)}</span>, className: "text-right", sortable: true },
            ]} pageSize={50} />
          </div>
        );
      }

      case "category-distribution": {
        const data = categoryDist.data || [];
        if (categoryDist.isLoading) return renderLoading();
        if (!data.length) return renderEmpty("No category data");
        return (
          <div className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} cx="50%" cy="50%" outerRadius={100} dataKey="retailValue" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                    {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ReportExportButton data={data} filename="category-stock-distribution" columns={[{ key: "name", header: "Category" }, { key: "items", header: "Batches" }, { key: "totalQty", header: "Total Qty" }, { key: "retailValue", header: "Retail Value", format: (v: number) => formatCurrency(v) }, { key: "costValue", header: "Cost Value", format: (v: number) => formatCurrency(v) }]} pdfOptions={{ title: "Category Stock Distribution" }} />
            <ReportTable data={data} columns={[
              { key: "name", header: "Category", sortable: true },
              { key: "items", header: "Batches", className: "text-right", sortable: true },
              { key: "totalQty", header: "Total Qty", className: "text-right", sortable: true },
              { key: "retailValue", header: "Retail Value", cell: (r) => <span className="font-medium">{formatCurrency(r.retailValue)}</span>, className: "text-right", sortable: true },
              { key: "costValue", header: "Cost Value", cell: (r) => formatCurrency(r.costValue), className: "text-right" },
            ]} pageSize={50} />
          </div>
        );
      }

      case "stock-aging": {
        const data = stockAging.data || [];
        if (stockAging.isLoading) return renderLoading();
        if (!data.length) return renderEmpty("No stock aging data");
        const bucketSummary = data.reduce((acc: Record<string, { count: number; value: number }>, d: any) => {
          if (!acc[d.bucket]) acc[d.bucket] = { count: 0, value: 0 };
          acc[d.bucket].count++;
          acc[d.bucket].value += d.value;
          return acc;
        }, {});
        return (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              {Object.entries(bucketSummary).map(([bucket, info]) => (
                <Badge key={bucket} variant={bucket === "180+ days" || bucket === "91-180 days" ? "destructive" : "secondary"} className="text-sm px-3 py-1">
                  {bucket}: {(info as any).count} items ({formatCurrency((info as any).value)})
                </Badge>
              ))}
            </div>
            <ReportExportButton data={data} filename="stock-aging" columns={[{ key: "medicine", header: "Medicine" }, { key: "batch", header: "Batch" }, { key: "quantity", header: "Qty" }, { key: "ageDays", header: "Age (days)" }, { key: "bucket", header: "Bucket" }, { key: "value", header: "Value", format: (v: number) => formatCurrency(v) }]} pdfOptions={{ title: "Stock Aging Report" }} />
            <ReportTable data={data} columns={[
              { key: "medicine", header: "Medicine", sortable: true },
              { key: "batch", header: "Batch" },
              { key: "quantity", header: "Qty", className: "text-right", sortable: true },
              { key: "ageDays", header: "Age (days)", className: "text-right", sortable: true },
              { key: "bucket", header: "Bucket", cell: (r) => <Badge variant={r.bucket === "180+ days" || r.bucket === "91-180 days" ? "destructive" : "secondary"}>{r.bucket}</Badge> },
              { key: "value", header: "Value", cell: (r) => formatCurrency(r.value), className: "text-right", sortable: true },
            ]} pageSize={50} />
          </div>
        );
      }

      case "inventory-turnover": {
        const data = inventoryTurnover.data || [];
        if (inventoryTurnover.isLoading) return renderLoading();
        if (!data.length) return renderEmpty("No turnover data");
        return (
          <div className="space-y-4">
            <ReportExportButton data={data} filename={`inventory-turnover-${dateRange.start}`} columns={[{ key: "medicine", header: "Medicine" }, { key: "qtySold", header: "Qty Sold" }, { key: "currentStock", header: "Current Stock" }, { key: "turnoverLabel", header: "Turnover Ratio" }]} pdfOptions={{ title: "Inventory Turnover Report" }} />
            <ReportTable data={data} columns={[
              { key: "medicine", header: "Medicine", sortable: true },
              { key: "qtySold", header: "Qty Sold", className: "text-right", sortable: true },
              { key: "currentStock", header: "Current Stock", className: "text-right", sortable: true },
              { key: "turnoverLabel", header: "Turnover Ratio", cell: (r) => <span className={`font-medium ${r.turnoverRatio > 2 ? "text-green-600" : r.turnoverRatio < 0.5 ? "text-destructive" : ""}`}>{r.turnoverLabel}</span>, className: "text-right", sortable: true },
            ]} pageSize={50} />
          </div>
        );
      }

      // ============ FINANCIAL REPORTS ============

      case "profit-margin": {
        const data = profitMargin.data || [];
        if (profitMargin.isLoading) return renderLoading();
        if (!data.length) return renderEmpty("No margin data");
        const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
        const totalCost = data.reduce((s, d) => s + d.cost, 0);
        const totalProfit = data.reduce((s, d) => s + d.profit, 0);
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Revenue</p><p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p></CardContent></Card>
              <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Cost</p><p className="text-2xl font-bold">{formatCurrency(totalCost)}</p></CardContent></Card>
              <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Gross Profit</p><p className="text-2xl font-bold text-green-600">{formatCurrency(totalProfit)}</p><p className="text-xs text-muted-foreground">{totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}% margin</p></CardContent></Card>
            </div>
            <ReportExportButton data={data} filename={`profit-margin-${dateRange.start}`} columns={[{ key: "name", header: "Medicine" }, { key: "qtySold", header: "Qty" }, { key: "revenue", header: "Revenue", format: (v: number) => formatCurrency(v) }, { key: "cost", header: "Cost", format: (v: number) => formatCurrency(v) }, { key: "profit", header: "Profit", format: (v: number) => formatCurrency(v) }, { key: "marginPercent", header: "Margin %", format: (v: number) => `${v.toFixed(1)}%` }]} pdfOptions={{ title: "Profit Margin Report", orientation: "landscape" }} />
            <ReportTable data={data} columns={[
              { key: "name", header: "Medicine", sortable: true },
              { key: "qtySold", header: "Qty Sold", className: "text-right", sortable: true },
              { key: "revenue", header: "Revenue", cell: (r) => formatCurrency(r.revenue), className: "text-right", sortable: true },
              { key: "cost", header: "Cost", cell: (r) => formatCurrency(r.cost), className: "text-right" },
              { key: "profit", header: "Profit", cell: (r) => <span className="text-green-600">{formatCurrency(r.profit)}</span>, className: "text-right", sortable: true },
              { key: "marginPercent", header: "Margin %", cell: (r) => `${r.marginPercent.toFixed(1)}%`, className: "text-right", sortable: true },
            ]} pageSize={50} />
          </div>
        );
      }

      case "returns-summary": {
        const data = returnsSummary.data;
        if (returnsSummary.isLoading) return renderLoading();
        if (!data) return renderEmpty("No data");
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Returns</p><p className="text-2xl font-bold">{data.returnCount}</p></CardContent></Card>
              <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Refund Amount</p><p className="text-2xl font-bold text-destructive">{formatCurrency(data.totalRefundAmount)}</p></CardContent></Card>
            </div>
            {data.returns.length > 0 ? (
              <>
                <ReportExportButton data={data.returns} filename={`returns-summary-${dateRange.start}`} columns={[{ key: "created_at", header: "Date" }, { key: "void_reason", header: "Reason" }, { key: "total_amount", header: "Amount", format: (v: number) => formatCurrency(Number(v)) }]} pdfOptions={{ title: "Returns & Refunds Summary", dateRange: { from: new Date(dateRange.start), to: new Date(dateRange.end) } }} />
                <ReportTable data={data.returns} columns={[
                  { key: "created_at", header: "Date", cell: (r) => format(new Date(r.created_at), "MMM dd, yyyy"), sortable: true },
                  { key: "void_reason", header: "Reason", cell: (r) => r.void_reason || "N/A" },
                  { key: "total_amount", header: "Amount", cell: (r) => formatCurrency(Number(r.total_amount)), className: "text-right", sortable: true },
                ]} pageSize={50} />
              </>
            ) : renderEmpty("No returns/refunds in this period")}
          </div>
        );
      }

      case "credit-sales": {
        const data = creditSales.data;
        if (creditSales.isLoading) return renderLoading();
        if (!data) return renderEmpty("No data");
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Credit Transactions</p><p className="text-2xl font-bold">{data.count}</p></CardContent></Card>
              <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Outstanding Amount</p><p className="text-2xl font-bold text-destructive">{formatCurrency(data.totalOutstanding)}</p></CardContent></Card>
            </div>
            {data.creditTransactions.length > 0 ? (
              <ReportTable data={data.creditTransactions} columns={[
                { key: "transaction_number", header: "Transaction" },
                { key: "customer_name", header: "Customer", cell: (r) => r.customer_name || "Walk-in" },
                { key: "created_at", header: "Date", cell: (r) => format(new Date(r.created_at), "MMM dd"), sortable: true },
                { key: "total_amount", header: "Total", cell: (r) => formatCurrency(Number(r.total_amount)), className: "text-right", sortable: true },
                { key: "amount_paid", header: "Paid", cell: (r) => formatCurrency(Number(r.amount_paid)), className: "text-right" },
                { key: "outstanding", header: "Outstanding", cell: (r) => <span className="text-destructive font-medium">{formatCurrency(Number(r.total_amount) - Number(r.amount_paid))}</span>, className: "text-right" },
              ]} pageSize={50} />
            ) : renderEmpty("No credit sales in this period")}
          </div>
        );
      }

      case "daily-cash": {
        const data = dailyCash.data || [];
        if (dailyCash.isLoading) return renderLoading();
        if (!data.length) return renderEmpty("No cash data");
        return (
          <div className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(v) => format(new Date(v), "MMM dd")} />
                  <YAxis />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Legend />
                  <Bar dataKey="cashIn" name="Cash" fill="#22c55e" stackId="a" />
                  <Bar dataKey="cardIn" name="Card" fill="#3b82f6" stackId="a" />
                  <Bar dataKey="otherIn" name="Other" fill="#f59e0b" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ReportExportButton data={data} filename={`daily-cash-${dateRange.start}`} columns={[{ key: "date", header: "Date" }, { key: "cashIn", header: "Cash", format: (v: number) => formatCurrency(v) }, { key: "cardIn", header: "Card", format: (v: number) => formatCurrency(v) }, { key: "otherIn", header: "Other", format: (v: number) => formatCurrency(v) }, { key: "totalIn", header: "Total", format: (v: number) => formatCurrency(v) }]} pdfOptions={{ title: "Daily Cash Summary" }} />
            <ReportTable data={data} columns={[
              { key: "date", header: "Date", cell: (r) => format(new Date(r.date), "MMM dd, yyyy"), sortable: true },
              { key: "cashIn", header: "Cash", cell: (r) => <span className="text-green-600">{formatCurrency(r.cashIn)}</span>, className: "text-right", sortable: true },
              { key: "cardIn", header: "Card", cell: (r) => formatCurrency(r.cardIn), className: "text-right" },
              { key: "otherIn", header: "Other", cell: (r) => formatCurrency(r.otherIn), className: "text-right" },
              { key: "totalIn", header: "Total", cell: (r) => <span className="font-medium">{formatCurrency(r.totalIn)}</span>, className: "text-right", sortable: true },
            ]} pageSize={50} searchable={false} />
          </div>
        );
      }

      case "tax-collection": {
        const data = taxCollection.data;
        if (taxCollection.isLoading) return renderLoading();
        if (!data) return renderEmpty("No tax data");
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Tax Collected</p><p className="text-2xl font-bold">{formatCurrency(data.totalTax)}</p></CardContent></Card>
              <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Sales</p><p className="text-2xl font-bold">{formatCurrency(data.totalSales)}</p></CardContent></Card>
              <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Effective Tax Rate</p><p className="text-2xl font-bold">{data.effectiveRate.toFixed(2)}%</p></CardContent></Card>
            </div>
            <ReportExportButton data={data.dailySummary} filename={`tax-collection-${dateRange.start}`} columns={[{ key: "date", header: "Date" }, { key: "transactions", header: "Transactions" }, { key: "taxCollected", header: "Tax", format: (v: number) => formatCurrency(v) }, { key: "salesAmount", header: "Sales", format: (v: number) => formatCurrency(v) }]} pdfOptions={{ title: "Tax Collection Report" }} />
            <ReportTable data={data.dailySummary} columns={[
              { key: "date", header: "Date", cell: (r) => format(new Date(r.date), "MMM dd, yyyy"), sortable: true },
              { key: "transactions", header: "Transactions", className: "text-right", sortable: true },
              { key: "taxCollected", header: "Tax Collected", cell: (r) => formatCurrency(r.taxCollected), className: "text-right", sortable: true },
              { key: "salesAmount", header: "Sales", cell: (r) => formatCurrency(r.salesAmount), className: "text-right" },
            ]} pageSize={50} searchable={false} />
          </div>
        );
      }

      // ============ PROCUREMENT REPORTS ============

      case "supplier-summary": {
        const result = supplierSummary.data;
        if (supplierSummary.isLoading) return renderLoading();
        if (!result) return renderEmpty("No purchase data");
        const summaryData = 'summary' in result ? result.summary : (result as any[]);
        const detailData = 'details' in result ? result.details : [];
        if (!summaryData.length) return renderEmpty("No purchase data");
        return (
          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Vendor Summary</h3>
            <ReportExportButton data={summaryData} filename={`supplier-summary-${dateRange.start}`} columns={[{ key: "vendor", header: "Supplier" }, { key: "poCount", header: "POs" }, { key: "totalPurchases", header: "Total", format: (v: number) => formatCurrency(v) }, { key: "received", header: "Received", format: (v: number) => formatCurrency(v) }, { key: "pending", header: "Pending", format: (v: number) => formatCurrency(v) }]} pdfOptions={{ title: "Supplier Purchase Summary" }} />
            <ReportTable data={summaryData} columns={[
              { key: "vendor", header: "Supplier", cell: (r) => <span className="font-medium">{r.vendor}</span>, sortable: true },
              { key: "code", header: "Code" },
              { key: "poCount", header: "POs", className: "text-right", sortable: true },
              { key: "totalPurchases", header: "Total", cell: (r) => formatCurrency(r.totalPurchases), className: "text-right", sortable: true },
              { key: "received", header: "Received", cell: (r) => <span className="text-green-600">{formatCurrency(r.received)}</span>, className: "text-right" },
              { key: "pending", header: "Pending", cell: (r) => <span className="text-amber-600">{formatCurrency(r.pending)}</span>, className: "text-right" },
            ]} pageSize={50} />

            {detailData.length > 0 && (
              <>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-6">Purchase Details — Products by Vendor</h3>
                <ReportExportButton data={detailData} filename={`supplier-details-${dateRange.start}`} columns={[{ key: "vendor", header: "Vendor" }, { key: "poNumber", header: "PO #" }, { key: "productName", header: "Product Name" }, { key: "quantity", header: "Qty" }, { key: "unitPrice", header: "Unit Price", format: (v: number) => formatCurrency(v) }, { key: "totalPrice", header: "Total", format: (v: number) => formatCurrency(v) }]} pdfOptions={{ title: "Supplier Purchase Details — Products", orientation: "landscape" }} />
                <ReportTable data={detailData} columns={[
                  { key: "vendor", header: "Vendor", cell: (r) => <span className="font-medium">{r.vendor}</span>, sortable: true },
                  { key: "poNumber", header: "PO #", sortable: true },
                  { key: "productName", header: "Product Name", sortable: true },
                  { key: "quantity", header: "Qty", className: "text-right", sortable: true },
                  { key: "unitPrice", header: "Unit Price", cell: (r) => formatCurrency(r.unitPrice), className: "text-right" },
                  { key: "totalPrice", header: "Total", cell: (r) => <span className="font-medium">{formatCurrency(r.totalPrice)}</span>, className: "text-right", sortable: true },
                ]} pageSize={50} />
              </>
            )}
          </div>
        );
      }

      case "po-status": {
        const data = poStatus.data || [];
        if (poStatus.isLoading) return renderLoading();
        if (!data.length) return renderEmpty("No purchase orders");
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {data.map((s: any) => (
                <Card key={s.status}><CardContent className="pt-6"><p className="text-sm text-muted-foreground">{s.status}</p><p className="text-2xl font-bold">{s.count}</p><p className="text-xs text-muted-foreground">{formatCurrency(s.totalValue)}</p></CardContent></Card>
              ))}
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} cx="50%" cy="50%" outerRadius={100} dataKey="count" label={({ status, count }) => `${status}: ${count}`}>
                    {data.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ReportExportButton data={data} filename="po-status" columns={[{ key: "status", header: "Status" }, { key: "count", header: "Count" }, { key: "totalValue", header: "Value", format: (v: number) => formatCurrency(v) }]} pdfOptions={{ title: "PO Status Pipeline" }} />
          </div>
        );
      }

      // ============ OPERATIONAL REPORTS ============

      case "cashier-performance": {
        const data = cashierPerf.data || [];
        if (cashierPerf.isLoading) return renderLoading();
        if (!data.length) return renderEmpty("No cashier data");
        return (
          <div className="space-y-4">
            <ReportExportButton data={data} filename={`cashier-performance-${dateRange.start}`} columns={[{ key: "cashier", header: "Cashier" }, { key: "transactions", header: "Transactions" }, { key: "totalSales", header: "Total Sales", format: (v: number) => formatCurrency(v) }, { key: "avgSale", header: "Avg Sale", format: (v: number) => formatCurrency(v) }, { key: "totalDiscount", header: "Discounts", format: (v: number) => formatCurrency(v) }]} pdfOptions={{ title: "Cashier Performance Report" }} />
            <ReportTable data={data} columns={[
              { key: "cashier", header: "Cashier", cell: (r) => <span className="font-medium">{r.cashier}</span>, sortable: true },
              { key: "transactions", header: "Transactions", className: "text-right", sortable: true },
              { key: "totalSales", header: "Total Sales", cell: (r) => formatCurrency(r.totalSales), className: "text-right", sortable: true },
              { key: "avgSale", header: "Avg Sale", cell: (r) => formatCurrency(r.avgSale), className: "text-right" },
              { key: "totalDiscount", header: "Discounts", cell: (r) => <span className="text-destructive">{formatCurrency(r.totalDiscount)}</span>, className: "text-right" },
            ]} pageSize={50} />
          </div>
        );
      }

      case "peak-hours": {
        const data = peakHours.data || [];
        if (peakHours.isLoading) return renderLoading();
        if (!data.length) return renderEmpty("No peak hours data");
        const maxCount = Math.max(...data.map(d => d.count), 1);
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const dayIndexMap: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 };
        const hours = Array.from({ length: 24 }, (_, i) => i);

        return (
          <div className="space-y-4">
            <Card><CardContent className="pt-6">
              <div className="overflow-x-auto">
                <div className="min-w-[700px]">
                  <div className="grid grid-cols-[60px_repeat(24,1fr)] gap-0.5 text-xs">
                    <div />
                    {hours.map(h => <div key={h} className="text-center text-muted-foreground py-1">{h.toString().padStart(2, '0')}</div>)}
                    {days.map(day => (
                      <>
                        <div key={`label-${day}`} className="flex items-center font-medium pr-2">{day}</div>
                        {hours.map(h => {
                          const cell = data.find(c => c.dayIndex === dayIndexMap[day] && c.hour === h);
                          const count = cell?.count || 0;
                          const intensity = count / maxCount;
                          return (
                            <div
                              key={`${day}-${h}`}
                              className="aspect-square rounded-sm flex items-center justify-center text-[10px]"
                              style={{
                                backgroundColor: count === 0
                                  ? "hsl(var(--muted))"
                                  : `rgba(34, 197, 94, ${Math.max(0.15, intensity)})`,
                                color: intensity > 0.5 ? "white" : "inherit",
                              }}
                              title={`${day} ${h}:00 - ${count} transactions`}
                            >
                              {count > 0 ? count : ""}
                            </div>
                          );
                        })}
                      </>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent></Card>
            <ReportExportButton data={data.filter(d => d.count > 0)} filename={`peak-hours-${dateRange.start}`} columns={[{ key: "day", header: "Day" }, { key: "hourLabel", header: "Hour" }, { key: "count", header: "Transactions" }, { key: "sales", header: "Sales", format: (v: number) => formatCurrency(v) }]} pdfOptions={{ title: "Peak Hours Report" }} />
          </div>
        );
      }

      case "daily-pnl": {
        const data = dailyPnl.data || [];
        if (dailyPnl.isLoading) return renderLoading();
        if (!data.length) return renderEmpty("No P&L data for this period");
        const totals = data.reduce(
          (acc, d) => ({ revenue: acc.revenue + d.revenue, cogs: acc.cogs + d.cogs, profit: acc.profit + d.profit, count: acc.count + d.transactionCount }),
          { revenue: 0, cogs: 0, profit: 0, count: 0 }
        );
        const avgMargin = totals.revenue > 0 ? (totals.profit / totals.revenue) * 100 : 0;
        return (
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card><CardContent className="pt-4 pb-3"><p className="text-xs text-muted-foreground">Total Revenue</p><p className="text-xl font-bold">{formatCurrency(totals.revenue)}</p></CardContent></Card>
              <Card><CardContent className="pt-4 pb-3"><p className="text-xs text-muted-foreground">Total COGS</p><p className="text-xl font-bold text-destructive">{formatCurrency(totals.cogs)}</p></CardContent></Card>
              <Card><CardContent className="pt-4 pb-3"><p className="text-xs text-muted-foreground">Gross Profit</p><p className="text-xl font-bold text-green-600">{formatCurrency(totals.profit)}</p></CardContent></Card>
              <Card><CardContent className="pt-4 pb-3"><p className="text-xs text-muted-foreground">Avg Margin</p><p className="text-xl font-bold">{avgMargin.toFixed(1)}%</p></CardContent></Card>
            </div>
            {/* Chart */}
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(v) => format(new Date(v), "MMM dd")} />
                  <YAxis />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} labelFormatter={(v) => format(new Date(v), "PPP")} />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cogs" name="COGS" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" name="Profit" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Export Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="default"
                onClick={() => {
                  const exportBtn = document.querySelector('[data-pnl-export]') as HTMLButtonElement;
                  if (exportBtn) exportBtn.click();
                }}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                Download PDF Report
              </Button>
              <div data-pnl-export>
                <ReportExportButton
                  data={data}
                  filename={`daily-pnl-${dateRange.start}`}
                  columns={[
                    { key: "date", header: "Date" },
                    { key: "transactionCount", header: "Transactions" },
                    { key: "revenue", header: "Revenue", format: (v: number) => formatCurrency(v) },
                    { key: "cogs", header: "COGS", format: (v: number) => formatCurrency(v) },
                    { key: "profit", header: "Profit", format: (v: number) => formatCurrency(v) },
                    { key: "marginPercent", header: "Margin %", format: (v: number) => `${v.toFixed(1)}%` },
                  ]}
                  pdfOptions={{ title: "Daily Profit & Loss", dateRange: { from: new Date(dateRange.start), to: new Date(dateRange.end) } }}
                  summaryRow={{ date: "TOTAL", transactionCount: totals.count, revenue: totals.revenue, cogs: totals.cogs, profit: totals.profit, marginPercent: avgMargin }}
                />
              </div>
            </div>
            {/* Table */}
            <ReportTable
              data={data}
              columns={[
                { key: "date", header: "Date", cell: (r) => format(new Date(r.date), "MMM dd, yyyy"), sortable: true },
                { key: "transactionCount", header: "Transactions", cell: (r) => r.transactionCount, className: "text-right", sortable: true },
                { key: "revenue", header: "Revenue", cell: (r) => formatCurrency(r.revenue), className: "text-right", sortable: true },
                { key: "cogs", header: "COGS", cell: (r) => <span className="text-destructive">{formatCurrency(r.cogs)}</span>, className: "text-right", sortable: true },
                { key: "profit", header: "Profit", cell: (r) => <span className="text-green-600 font-medium">{formatCurrency(r.profit)}</span>, className: "text-right", sortable: true },
                { key: "marginPercent", header: "Margin %", cell: (r) => <Badge variant={r.marginPercent >= 20 ? "default" : "destructive"}>{r.marginPercent.toFixed(1)}%</Badge>, className: "text-right", sortable: true },
              ]}
              pageSize={31}
              searchable={false}
            />
          </div>
        );
      }

      default:
        return renderEmpty("Report not found");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to Reports Hub
        </Button>
      </div>

      <PageHeader title={reportName} description={reportDef?.description || ""} />

      {/* Date Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      <Card>
        <CardContent className="pt-6">
          {renderReportContent()}
        </CardContent>
      </Card>
    </div>
  );
}
