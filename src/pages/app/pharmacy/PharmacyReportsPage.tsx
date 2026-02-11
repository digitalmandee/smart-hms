import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  usePaymentMethodBreakdown, useTopSellingMedicines, usePharmacySalesStats,
  useDailySalesSummary, useHourlySalesAnalysis, useSalesByCategory,
  useDiscountAnalysis, useMonthlyComparison,
  useStockValuation, useExpiryReport, useLowStockReport, useDeadStockReport, useStockMovementSummary,
  useProfitMarginReport, useReturnsSummary, useCreditSalesReport,
  useSupplierPurchaseSummary, usePOStatusReport,
} from "@/hooks/usePharmacyReports";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { formatCurrency } from "@/lib/currency";
import {
  BarChart3, TrendingUp, Package, DollarSign, Calendar, Loader2,
  ShoppingCart, AlertTriangle, Clock, Percent, FileText, RotateCcw,
  PieChart as PieChartIcon, Layers,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
import { ReportExportButton } from "@/components/reports/ReportExportButton";

const REPORT_CATEGORIES = [
  {
    label: "Sales Reports",
    icon: DollarSign,
    reports: [
      { id: "daily-sales", name: "Daily Sales Summary" },
      { id: "hourly-sales", name: "Hourly Sales Analysis" },
      { id: "sales-category", name: "Sales by Category" },
      { id: "payment-methods", name: "Payment Methods" },
      { id: "discount-analysis", name: "Discount Analysis" },
      { id: "monthly-comparison", name: "Monthly Comparison" },
      { id: "top-products", name: "Top Selling Products" },
    ],
  },
  {
    label: "Inventory Reports",
    icon: Package,
    reports: [
      { id: "stock-valuation", name: "Stock Valuation" },
      { id: "expiry-report", name: "Expiry Report" },
      { id: "low-stock", name: "Low Stock / Reorder" },
      { id: "dead-stock", name: "Dead Stock" },
      { id: "stock-movements", name: "Stock Movements" },
    ],
  },
  {
    label: "Financial Reports",
    icon: TrendingUp,
    reports: [
      { id: "profit-margin", name: "Profit Margin" },
      { id: "returns-summary", name: "Returns & Refunds" },
      { id: "credit-sales", name: "Credit Sales" },
    ],
  },
  {
    label: "Procurement Reports",
    icon: ShoppingCart,
    reports: [
      { id: "supplier-summary", name: "Supplier Purchases" },
      { id: "po-status", name: "PO Status Pipeline" },
    ],
  },
];

const PIE_COLORS = ["#22c55e", "#3b82f6", "#ef4444", "#8b5cf6", "#f59e0b", "#06b6d4", "#ec4899", "#6b7280"];

export default function PharmacyReportsPage() {
  const [selectedReport, setSelectedReport] = useState("daily-sales");
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    end: format(endOfMonth(new Date()), "yyyy-MM-dd"),
  });

  // All hooks (only the active ones matter for performance due to staleTime)
  const salesStats = usePharmacySalesStats(dateRange.start, dateRange.end);
  const dailySales = useDailySalesSummary(dateRange.start, dateRange.end);
  const hourlySales = useHourlySalesAnalysis(dateRange.start, dateRange.end);
  const salesByCategory = useSalesByCategory(dateRange.start, dateRange.end);
  const paymentBreakdown = usePaymentMethodBreakdown(dateRange.start, dateRange.end);
  const discountAnalysis = useDiscountAnalysis(dateRange.start, dateRange.end);
  const monthlyComparison = useMonthlyComparison(6);
  const topMedicines = useTopSellingMedicines(dateRange.start, dateRange.end, 15);
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

  const stats = salesStats.data;

  const renderLoading = () => (
    <div className="flex items-center justify-center h-[300px]">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );

  const renderEmpty = (msg: string) => (
    <div className="flex items-center justify-center h-[200px] text-muted-foreground">{msg}</div>
  );

  const renderReport = () => {
    switch (selectedReport) {
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
            <ReportExportButton
              data={data}
              filename={`daily-sales-${dateRange.start}`}
              columns={[
                { key: "date", header: "Date" },
                { key: "count", header: "Transactions" },
                { key: "sales", header: "Gross Sales", format: (v: number) => formatCurrency(v) },
                { key: "discount", header: "Discounts", format: (v: number) => formatCurrency(v) },
                { key: "net", header: "Net Sales", format: (v: number) => formatCurrency(v) },
              ]}
              pdfOptions={{ title: "Daily Sales Summary", dateRange: { from: new Date(dateRange.start), to: new Date(dateRange.end) } }}
            />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Transactions</TableHead>
                  <TableHead className="text-right">Gross Sales</TableHead>
                  <TableHead className="text-right">Discounts</TableHead>
                  <TableHead className="text-right">Net Sales</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((d) => (
                  <TableRow key={d.date}>
                    <TableCell>{format(new Date(d.date), "MMM dd, yyyy")}</TableCell>
                    <TableCell className="text-right">{d.count}</TableCell>
                    <TableCell className="text-right">{formatCurrency(d.sales)}</TableCell>
                    <TableCell className="text-right text-destructive">{formatCurrency(d.discount)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(d.net)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
            <ReportExportButton
              data={data.filter(d => d.count > 0)}
              filename={`hourly-sales-${dateRange.start}`}
              columns={[
                { key: "label", header: "Hour" },
                { key: "count", header: "Transactions" },
                { key: "sales", header: "Sales", format: (v: number) => formatCurrency(v) },
              ]}
              pdfOptions={{ title: "Hourly Sales Analysis" }}
            />
          </div>
        );
      }

      case "sales-category": {
        const data = salesByCategory.data || [];
        if (salesByCategory.isLoading) return renderLoading();
        if (!data.length) return renderEmpty("No category data");
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Table>
                <TableHeader><TableRow><TableHead>Category</TableHead><TableHead className="text-right">Items Sold</TableHead><TableHead className="text-right">Revenue</TableHead></TableRow></TableHeader>
                <TableBody>
                  {data.map((c) => (
                    <TableRow key={c.name}><TableCell>{c.name}</TableCell><TableCell className="text-right">{c.quantity}</TableCell><TableCell className="text-right font-medium">{formatCurrency(c.revenue)}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <ReportExportButton data={data} filename={`sales-by-category-${dateRange.start}`} columns={[{ key: "name", header: "Category" }, { key: "quantity", header: "Qty" }, { key: "revenue", header: "Revenue", format: (v: number) => formatCurrency(v) }]} pdfOptions={{ title: "Sales by Category" }} />
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
            <Table>
              <TableHeader><TableRow><TableHead>Month</TableHead><TableHead className="text-right">Transactions</TableHead><TableHead className="text-right">Sales</TableHead><TableHead className="text-right">Discounts</TableHead></TableRow></TableHeader>
              <TableBody>
                {data.map((m) => (
                  <TableRow key={m.month}><TableCell>{m.month}</TableCell><TableCell className="text-right">{m.count}</TableCell><TableCell className="text-right font-medium">{formatCurrency(m.sales)}</TableCell><TableCell className="text-right text-destructive">{formatCurrency(m.discount)}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
            <ReportExportButton data={data} filename="monthly-comparison" columns={[{ key: "month", header: "Month" }, { key: "count", header: "Transactions" }, { key: "sales", header: "Sales", format: (v: number) => formatCurrency(v) }, { key: "discount", header: "Discounts", format: (v: number) => formatCurrency(v) }]} pdfOptions={{ title: "Monthly Comparison" }} />
          </div>
        );
      }

      case "top-products": {
        const data = topMedicines.data || [];
        if (topMedicines.isLoading) return renderLoading();
        if (!data.length) return renderEmpty("No sales data");
        return (
          <div className="space-y-4">
            <Table>
              <TableHeader><TableRow><TableHead>Rank</TableHead><TableHead>Product</TableHead><TableHead className="text-right">Qty Sold</TableHead><TableHead className="text-right">Revenue</TableHead></TableRow></TableHeader>
              <TableBody>
                {data.map((m, i) => (
                  <TableRow key={m.medicine_id}><TableCell>#{i + 1}</TableCell><TableCell>{m.name}</TableCell><TableCell className="text-right">{m.quantity}</TableCell><TableCell className="text-right font-medium">{formatCurrency(m.revenue)}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
            <ReportExportButton data={data.map((m, i) => ({ rank: i + 1, ...m }))} filename={`top-products-${dateRange.start}`} columns={[{ key: "rank", header: "Rank" }, { key: "name", header: "Product" }, { key: "quantity", header: "Qty" }, { key: "revenue", header: "Revenue", format: (v: number) => formatCurrency(v) }]} pdfOptions={{ title: "Top Selling Products" }} />
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
            <Table>
              <TableHeader><TableRow><TableHead>Medicine</TableHead><TableHead>Category</TableHead><TableHead>Batch</TableHead><TableHead className="text-right">Qty</TableHead><TableHead className="text-right">Cost Value</TableHead><TableHead className="text-right">Retail Value</TableHead><TableHead className="text-right">Margin</TableHead></TableRow></TableHeader>
              <TableBody>
                {data.items.slice(0, 50).map((item: any, i: number) => (
                  <TableRow key={i}><TableCell>{item.medicine}</TableCell><TableCell>{item.category}</TableCell><TableCell>{item.batch}</TableCell><TableCell className="text-right">{item.quantity}</TableCell><TableCell className="text-right">{formatCurrency(item.costValue)}</TableCell><TableCell className="text-right">{formatCurrency(item.retailValue)}</TableCell><TableCell className="text-right">{item.margin.toFixed(1)}%</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
            <ReportExportButton data={data.items} filename="stock-valuation" columns={[{ key: "medicine", header: "Medicine" }, { key: "category", header: "Category" }, { key: "batch", header: "Batch" }, { key: "quantity", header: "Qty" }, { key: "costValue", header: "Cost Value", format: (v: number) => formatCurrency(v) }, { key: "retailValue", header: "Retail Value", format: (v: number) => formatCurrency(v) }, { key: "margin", header: "Margin %", format: (v: number) => `${v.toFixed(1)}%` }]} pdfOptions={{ title: "Stock Valuation Report", orientation: "landscape" }} />
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
            <Table>
              <TableHeader><TableRow><TableHead>Medicine</TableHead><TableHead>Batch</TableHead><TableHead>Expiry</TableHead><TableHead>Risk Window</TableHead><TableHead className="text-right">Qty</TableHead><TableHead className="text-right">Value at Risk</TableHead></TableRow></TableHeader>
              <TableBody>
                {data.map((d: any, i: number) => (
                  <TableRow key={i}><TableCell>{d.medicine}</TableCell><TableCell>{d.batch}</TableCell><TableCell>{d.expiryDate}</TableCell><TableCell><Badge variant={d.bucket === "Expired" || d.bucket === "0-30 days" ? "destructive" : "secondary"}>{d.bucket}</Badge></TableCell><TableCell className="text-right">{d.quantity}</TableCell><TableCell className="text-right">{formatCurrency(d.valueAtRisk)}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
            <ReportExportButton data={data} filename="expiry-report" columns={[{ key: "medicine", header: "Medicine" }, { key: "batch", header: "Batch" }, { key: "expiryDate", header: "Expiry" }, { key: "bucket", header: "Window" }, { key: "quantity", header: "Qty" }, { key: "valueAtRisk", header: "Value at Risk", format: (v: number) => formatCurrency(v) }]} pdfOptions={{ title: "Expiry Report" }} />
          </div>
        );
      }

      case "low-stock": {
        const data = lowStock.data || [];
        if (lowStock.isLoading) return renderLoading();
        if (!data.length) return renderEmpty("All items above reorder level");
        return (
          <div className="space-y-4">
            <Table>
              <TableHeader><TableRow><TableHead>Medicine</TableHead><TableHead>Batch</TableHead><TableHead className="text-right">Current</TableHead><TableHead className="text-right">Reorder Level</TableHead><TableHead className="text-right">Deficit</TableHead><TableHead className="text-right">Suggested Order</TableHead><TableHead className="text-right">Est. Cost</TableHead></TableRow></TableHeader>
              <TableBody>
                {data.map((d: any, i: number) => (
                  <TableRow key={i}><TableCell>{d.medicine}</TableCell><TableCell>{d.batch}</TableCell><TableCell className="text-right text-destructive font-medium">{d.currentStock}</TableCell><TableCell className="text-right">{d.reorderLevel}</TableCell><TableCell className="text-right">{d.deficit}</TableCell><TableCell className="text-right font-medium">{d.suggestedOrder}</TableCell><TableCell className="text-right">{formatCurrency(d.suggestedOrder * d.unitCost)}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
            <ReportExportButton data={data} filename="low-stock-report" columns={[{ key: "medicine", header: "Medicine" }, { key: "currentStock", header: "Current" }, { key: "reorderLevel", header: "Reorder Level" }, { key: "deficit", header: "Deficit" }, { key: "suggestedOrder", header: "Suggested" }]} pdfOptions={{ title: "Low Stock / Reorder Report" }} />
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
            <Table>
              <TableHeader><TableRow><TableHead>Medicine</TableHead><TableHead>Category</TableHead><TableHead>Batch</TableHead><TableHead className="text-right">Qty</TableHead><TableHead className="text-right">Value</TableHead></TableRow></TableHeader>
              <TableBody>
                {data.map((d: any, i: number) => (
                  <TableRow key={i}><TableCell>{d.medicine}</TableCell><TableCell>{d.category}</TableCell><TableCell>{d.batch}</TableCell><TableCell className="text-right">{d.quantity}</TableCell><TableCell className="text-right">{formatCurrency(d.value)}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
            <ReportExportButton data={data} filename="dead-stock" columns={[{ key: "medicine", header: "Medicine" }, { key: "category", header: "Category" }, { key: "batch", header: "Batch" }, { key: "quantity", header: "Qty" }, { key: "value", header: "Value", format: (v: number) => formatCurrency(v) }]} pdfOptions={{ title: "Dead Stock Report" }} />
          </div>
        );
      }

      case "stock-movements": {
        const data = stockMovements.data || [];
        if (stockMovements.isLoading) return renderLoading();
        if (!data.length) return renderEmpty("No movements");
        return (
          <div className="space-y-4">
            <Table>
              <TableHeader><TableRow><TableHead>Movement Type</TableHead><TableHead className="text-right">In Qty</TableHead><TableHead className="text-right">Out Qty</TableHead><TableHead className="text-right">Count</TableHead><TableHead className="text-right">Value</TableHead></TableRow></TableHeader>
              <TableBody>
                {data.map((m: any) => (
                  <TableRow key={m.type}><TableCell className="font-medium">{m.type}</TableCell><TableCell className="text-right text-green-600">{m.inQty || "-"}</TableCell><TableCell className="text-right text-destructive">{m.outQty || "-"}</TableCell><TableCell className="text-right">{m.count}</TableCell><TableCell className="text-right">{formatCurrency(m.value)}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
            <ReportExportButton data={data} filename={`stock-movements-${dateRange.start}`} columns={[{ key: "type", header: "Type" }, { key: "inQty", header: "In" }, { key: "outQty", header: "Out" }, { key: "count", header: "Count" }, { key: "value", header: "Value", format: (v: number) => formatCurrency(v) }]} pdfOptions={{ title: "Stock Movement Summary" }} />
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
            <Table>
              <TableHeader><TableRow><TableHead>Medicine</TableHead><TableHead className="text-right">Qty Sold</TableHead><TableHead className="text-right">Revenue</TableHead><TableHead className="text-right">Cost</TableHead><TableHead className="text-right">Profit</TableHead><TableHead className="text-right">Margin %</TableHead></TableRow></TableHeader>
              <TableBody>
                {data.slice(0, 30).map((d, i) => (
                  <TableRow key={i}><TableCell>{d.name}</TableCell><TableCell className="text-right">{d.qtySold}</TableCell><TableCell className="text-right">{formatCurrency(d.revenue)}</TableCell><TableCell className="text-right">{formatCurrency(d.cost)}</TableCell><TableCell className="text-right text-green-600">{formatCurrency(d.profit)}</TableCell><TableCell className="text-right">{d.marginPercent.toFixed(1)}%</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
            <ReportExportButton data={data} filename={`profit-margin-${dateRange.start}`} columns={[{ key: "name", header: "Medicine" }, { key: "qtySold", header: "Qty" }, { key: "revenue", header: "Revenue", format: (v: number) => formatCurrency(v) }, { key: "cost", header: "Cost", format: (v: number) => formatCurrency(v) }, { key: "profit", header: "Profit", format: (v: number) => formatCurrency(v) }, { key: "marginPercent", header: "Margin %", format: (v: number) => `${v.toFixed(1)}%` }]} pdfOptions={{ title: "Profit Margin Report", orientation: "landscape" }} />
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
              <Table>
                <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Reason</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
                <TableBody>
                  {data.returns.map((r: any) => (
                    <TableRow key={r.id}><TableCell>{format(new Date(r.created_at), "MMM dd, yyyy")}</TableCell><TableCell>{r.void_reason || "N/A"}</TableCell><TableCell className="text-right">{formatCurrency(r.total_amount)}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
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
              <Table>
                <TableHeader><TableRow><TableHead>Transaction</TableHead><TableHead>Customer</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Total</TableHead><TableHead className="text-right">Paid</TableHead><TableHead className="text-right">Outstanding</TableHead></TableRow></TableHeader>
                <TableBody>
                  {data.creditTransactions.map((t: any) => (
                    <TableRow key={t.id}><TableCell>{t.transaction_number}</TableCell><TableCell>{t.customer_name || "Walk-in"}</TableCell><TableCell>{format(new Date(t.created_at), "MMM dd")}</TableCell><TableCell className="text-right">{formatCurrency(t.total_amount)}</TableCell><TableCell className="text-right">{formatCurrency(t.amount_paid)}</TableCell><TableCell className="text-right text-destructive font-medium">{formatCurrency(Number(t.total_amount) - Number(t.amount_paid))}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : renderEmpty("No credit sales in this period")}
          </div>
        );
      }

      // ============ PROCUREMENT REPORTS ============

      case "supplier-summary": {
        const data = supplierSummary.data || [];
        if (supplierSummary.isLoading) return renderLoading();
        if (!data.length) return renderEmpty("No purchase data");
        return (
          <div className="space-y-4">
            <Table>
              <TableHeader><TableRow><TableHead>Supplier</TableHead><TableHead>Code</TableHead><TableHead className="text-right">POs</TableHead><TableHead className="text-right">Total Purchases</TableHead><TableHead className="text-right">Received</TableHead><TableHead className="text-right">Pending</TableHead></TableRow></TableHeader>
              <TableBody>
                {data.map((s: any, i: number) => (
                  <TableRow key={i}><TableCell className="font-medium">{s.vendor}</TableCell><TableCell>{s.code}</TableCell><TableCell className="text-right">{s.poCount}</TableCell><TableCell className="text-right">{formatCurrency(s.totalPurchases)}</TableCell><TableCell className="text-right text-green-600">{formatCurrency(s.received)}</TableCell><TableCell className="text-right text-amber-600">{formatCurrency(s.pending)}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
            <ReportExportButton data={data} filename={`supplier-summary-${dateRange.start}`} columns={[{ key: "vendor", header: "Supplier" }, { key: "poCount", header: "POs" }, { key: "totalPurchases", header: "Total", format: (v: number) => formatCurrency(v) }, { key: "received", header: "Received", format: (v: number) => formatCurrency(v) }, { key: "pending", header: "Pending", format: (v: number) => formatCurrency(v) }]} pdfOptions={{ title: "Supplier Purchase Summary" }} />
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

      default:
        return renderEmpty("Select a report from the sidebar");
    }
  };

  const currentReportName = REPORT_CATEGORIES.flatMap(c => c.reports).find(r => r.id === selectedReport)?.name || "Report";

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
          <CardContent><div className="text-2xl font-bold">{REPORT_CATEGORIES.reduce((s, c) => s + c.reports.length, 0)}</div><p className="text-xs text-muted-foreground">Across {REPORT_CATEGORIES.length} categories</p></CardContent>
        </Card>
      </div>

      {/* Report Selector + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Report List */}
        <Card className="lg:col-span-1">
          <CardContent className="p-3">
            <ScrollArea className="h-[600px]">
              {REPORT_CATEGORIES.map((cat) => (
                <div key={cat.label} className="mb-4">
                  <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    <cat.icon className="h-3.5 w-3.5" />
                    {cat.label}
                  </div>
                  {cat.reports.map((report) => (
                    <Button
                      key={report.id}
                      variant={selectedReport === report.id ? "secondary" : "ghost"}
                      className="w-full justify-start text-sm h-9 px-3"
                      onClick={() => setSelectedReport(report.id)}
                    >
                      {report.name}
                    </Button>
                  ))}
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Right: Report Content */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>{currentReportName}</CardTitle>
          </CardHeader>
          <CardContent>{renderReport()}</CardContent>
        </Card>
      </div>
    </div>
  );
}
