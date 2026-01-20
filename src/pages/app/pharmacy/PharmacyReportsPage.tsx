import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePOSTransactions } from "@/hooks/usePOS";
import { useInventory } from "@/hooks/usePharmacy";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  DollarSign,
  Calendar,
  Download,
  Printer
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function PharmacyReportsPage() {
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    end: format(endOfMonth(new Date()), "yyyy-MM-dd"),
  });
  const [reportType, setReportType] = useState("sales");

  const { data: transactions = [] } = usePOSTransactions();
  const { data: inventory = [] } = useInventory();

  // Calculate sales summary
  const paidTx = transactions.filter(tx => tx.status === 'completed');
  const totalSales = paidTx.reduce((sum, tx) => sum + (tx.total_amount || 0), 0);
  const totalTransactions = paidTx.length;
  const avgTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0;

  // Sales by day (mock data for chart)
  const salesByDay = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayTx = paidTx.filter(tx => 
      format(new Date(tx.created_at), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    );
    return {
      day: format(date, "EEE"),
      sales: dayTx.reduce((sum, tx) => sum + (tx.total_amount || 0), 0),
      count: dayTx.length,
    };
  });

  // Payment method breakdown
  const paymentBreakdown = [
    { name: "Cash", value: 65, color: "#22c55e" },
    { name: "Card", value: 20, color: "#3b82f6" },
    { name: "JazzCash", value: 10, color: "#ef4444" },
    { name: "EasyPaisa", value: 5, color: "#8b5cf6" },
  ];

  // Top selling medicines (mock)
  const topMedicines = [
    { name: "Panadol 500mg", quantity: 245, revenue: 4900 },
    { name: "Augmentin 625mg", quantity: 120, revenue: 18000 },
    { name: "Disprin", quantity: 180, revenue: 1800 },
    { name: "Brufen 400mg", quantity: 95, revenue: 2375 },
    { name: "Flagyl 400mg", quantity: 78, revenue: 3120 },
  ];

  // Inventory value
  const inventoryValue = inventory.reduce((sum: number, item: any) => 
    sum + ((item.selling_price || 0) * (item.quantity || 0)), 0
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pharmacy Reports"
        description="Sales analytics and inventory reports"
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        }
      />

      {/* Date Range Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales Report</SelectItem>
                  <SelectItem value="inventory">Inventory Report</SelectItem>
                  <SelectItem value="sessions">Session Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button>
              <Calendar className="mr-2 h-4 w-4" />
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {totalSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {totalTransactions} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {avgTransaction.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per sale</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {inventoryValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{inventory.length} items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">
              Total sales today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="sales-trend" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales-trend">Sales Trend</TabsTrigger>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="top-products">Top Products</TabsTrigger>
        </TabsList>

        <TabsContent value="sales-trend">
          <Card>
            <CardHeader>
              <CardTitle>Daily Sales (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesByDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`Rs. ${value.toFixed(2)}`, "Sales"]}
                    />
                    <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment-methods">
          <Card>
            <CardHeader>
              <CardTitle>Payment Method Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {paymentBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top-products">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Qty Sold</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topMedicines.map((medicine, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">#{index + 1}</TableCell>
                      <TableCell>{medicine.name}</TableCell>
                      <TableCell className="text-right">{medicine.quantity}</TableCell>
                      <TableCell className="text-right font-medium">
                        Rs. {medicine.revenue.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
