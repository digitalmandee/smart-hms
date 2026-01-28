import { useState } from "react";
import { format, subDays } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ReportFilters } from "@/components/reports/ReportFilters";
import { ReportTable, Column } from "@/components/reports/ReportTable";
import { ReportExportButton } from "@/components/reports/ReportExportButton";
import { ReportSummaryCard } from "@/components/reports/ReportSummaryCard";
import { ShiftFilter, ShiftType, getShiftLabel } from "@/components/reports/ShiftFilter";
import { useShiftWiseCollection, useCashierWiseCollection, useShiftWiseDetails, ShiftWiseDetail, CashierCollection } from "@/hooks/useShiftWiseData";
import { useBranches } from "@/hooks/useBranches";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, Legend } from "recharts";
import { DollarSign, Clock, Users, CreditCard, Loader2, Sun, Sunset, Moon } from "lucide-react";
import { formatCurrency } from "@/lib/exportUtils";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SHIFT_COLORS = {
  morning: "hsl(45, 93%, 47%)", // Yellow/orange for morning sun
  evening: "hsl(25, 95%, 53%)", // Orange for sunset
  night: "hsl(240, 60%, 45%)", // Deep blue for night
};

const SHIFT_ICONS = {
  morning: Sun,
  evening: Sunset,
  night: Moon,
};

export default function ShiftWiseCollectionReport() {
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedShift, setSelectedShift] = useState<ShiftType>("all");
  const [activeTab, setActiveTab] = useState("overview");

  const dateFrom = format(dateRange.from, "yyyy-MM-dd");
  const dateTo = format(dateRange.to, "yyyy-MM-dd");

  const { data: branches } = useBranches();
  const { data: shiftData, isLoading } = useShiftWiseCollection(
    dateFrom,
    dateTo,
    selectedBranch !== "all" ? selectedBranch : undefined
  );
  const { data: cashierData, isLoading: cashierLoading } = useCashierWiseCollection(
    dateFrom,
    dateTo,
    selectedBranch !== "all" ? selectedBranch : undefined
  );
  const { data: detailData, isLoading: detailsLoading } = useShiftWiseDetails(
    dateFrom,
    dateTo,
    selectedShift,
    selectedBranch !== "all" ? selectedBranch : undefined
  );

  const branchOptions = branches?.map((b) => ({
    value: b.id,
    label: b.name,
  })) || [];

  const shifts = shiftData?.shifts || [];
  const totalRevenue = shiftData?.total || 0;

  // Pie chart data
  const pieData = shifts.map((s) => ({
    name: s.shiftLabel.split(" ")[0],
    value: s.revenue,
    percentage: s.percentage.toFixed(1),
  }));

  // Payment method breakdown for selected shift
  const selectedShiftData = shifts.find((s) => s.shift === selectedShift);
  const paymentMethodData = selectedShiftData?.paymentMethods || [];

  // Cashier table columns
  const cashierColumns: Column<CashierCollection>[] = [
    {
      key: "cashierName",
      header: "Cashier",
      sortable: true,
    },
    {
      key: "shift",
      header: "Shift",
      sortable: true,
      cell: (row) => {
        const Icon = SHIFT_ICONS[row.shift as keyof typeof SHIFT_ICONS] || Clock;
        return (
          <Badge variant="outline" className="gap-1">
            <Icon className="h-3 w-3" />
            {row.shift.charAt(0).toUpperCase() + row.shift.slice(1)}
          </Badge>
        );
      },
    },
    {
      key: "transactionCount",
      header: "Transactions",
      sortable: true,
      className: "text-center",
    },
    {
      key: "cashAmount",
      header: "Cash",
      sortable: true,
      className: "text-right",
      cell: (row) => formatCurrency(row.cashAmount),
    },
    {
      key: "cardAmount",
      header: "Card",
      sortable: true,
      className: "text-right",
      cell: (row) => formatCurrency(row.cardAmount),
    },
    {
      key: "otherAmount",
      header: "Other",
      sortable: true,
      className: "text-right",
      cell: (row) => formatCurrency(row.otherAmount),
    },
    {
      key: "totalAmount",
      header: "Total",
      sortable: true,
      className: "text-right font-bold",
      cell: (row) => <span className="font-bold">{formatCurrency(row.totalAmount)}</span>,
    },
  ];

  // Detail table columns
  const detailColumns: Column<ShiftWiseDetail>[] = [
    { key: "time", header: "Time", sortable: true },
    { key: "invoice_number", header: "Invoice #", sortable: true },
    { key: "patient_name", header: "Patient", sortable: true },
    { key: "payment_method", header: "Method", sortable: true },
    { key: "cashier_name", header: "Cashier", sortable: true },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      className: "text-right",
      cell: (row) => <span className="font-medium">{formatCurrency(row.amount)}</span>,
    },
  ];

  const exportColumns = [
    { key: "time", header: "Time" },
    { key: "invoice_number", header: "Invoice Number" },
    { key: "patient_name", header: "Patient Name" },
    { key: "payment_method", header: "Payment Method" },
    { key: "cashier_name", header: "Cashier" },
    { key: "amount", header: "Amount", format: (v: number) => formatCurrency(v) },
    { key: "shift", header: "Shift" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shift-wise Collection Report"
        description="Analyze revenue collection patterns across different work shifts"
      />

      {/* Filters */}
      <ReportFilters
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        showBranchFilter
        branchOptions={branchOptions}
        selectedBranch={selectedBranch}
        onBranchChange={setSelectedBranch}
        isLoading={isLoading}
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <ReportSummaryCard
          title="Total Collection"
          value={formatCurrency(totalRevenue)}
          subtitle={`${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d")}`}
          icon={DollarSign}
          isLoading={isLoading}
        />
        {shifts.map((shift) => {
          const Icon = SHIFT_ICONS[shift.shift as keyof typeof SHIFT_ICONS] || Clock;
          return (
            <ReportSummaryCard
              key={shift.shift}
              title={shift.shiftLabel.split(" ")[0]}
              value={formatCurrency(shift.revenue)}
              subtitle={`${shift.count} transactions (${shift.percentage.toFixed(1)}%)`}
              icon={Icon}
              variant={shift.shift === "morning" ? "success" : shift.shift === "evening" ? "warning" : "info"}
              isLoading={isLoading}
            />
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Shift Overview</TabsTrigger>
          <TabsTrigger value="cashiers">Cashier Summary</TabsTrigger>
          <TabsTrigger value="details">Transaction Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Shift Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Collection by Shift</CardTitle>
                <CardDescription>Revenue distribution across shifts</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex h-[300px] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : pieData.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          innerRadius={60}
                          paddingAngle={3}
                          label={({ name, percentage }) => `${name}: ${percentage}%`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell
                              key={index}
                              fill={
                                SHIFT_COLORS[
                                  shifts[index]?.shift as keyof typeof SHIFT_COLORS
                                ] || "hsl(var(--muted))"
                              }
                            />
                          ))}
                        </Pie>
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Shift Cards with Payment Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Shift Details</CardTitle>
                <CardDescription>Click to see payment method breakdown</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {shifts.map((shift) => {
                  const Icon = SHIFT_ICONS[shift.shift as keyof typeof SHIFT_ICONS] || Clock;
                  const isSelected = selectedShift === shift.shift;
                  return (
                    <div
                      key={shift.shift}
                      onClick={() => setSelectedShift(shift.shift)}
                      className={cn(
                        "p-4 rounded-lg border cursor-pointer transition-all",
                        isSelected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="p-2 rounded-full"
                            style={{
                              backgroundColor: `${SHIFT_COLORS[shift.shift as keyof typeof SHIFT_COLORS]}20`,
                            }}
                          >
                            <Icon
                              className="h-5 w-5"
                              style={{ color: SHIFT_COLORS[shift.shift as keyof typeof SHIFT_COLORS] }}
                            />
                          </div>
                          <div>
                            <p className="font-medium">{shift.shiftLabel}</p>
                            <p className="text-sm text-muted-foreground">{shift.count} transactions</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{formatCurrency(shift.revenue)}</p>
                          <p className="text-sm text-muted-foreground">{shift.percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                      {isSelected && shift.paymentMethods.length > 0 && (
                        <div className="pt-3 border-t space-y-2">
                          {shift.paymentMethods.map((pm) => (
                            <div key={pm.method} className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">{pm.method}</span>
                              <span>{formatCurrency(pm.amount)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cashiers">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Cashier-wise Collection</CardTitle>
                  <CardDescription>Breakdown by cashier and shift</CardDescription>
                </div>
                <ReportExportButton
                  data={cashierData || []}
                  filename={`cashier-collection-${dateFrom}-${dateTo}`}
                  columns={[
                    { key: "cashierName", header: "Cashier Name" },
                    { key: "shift", header: "Shift" },
                    { key: "transactionCount", header: "Transactions" },
                    { key: "cashAmount", header: "Cash", format: (v: number) => formatCurrency(v) },
                    { key: "cardAmount", header: "Card", format: (v: number) => formatCurrency(v) },
                    { key: "otherAmount", header: "Other", format: (v: number) => formatCurrency(v) },
                    { key: "totalAmount", header: "Total", format: (v: number) => formatCurrency(v) },
                  ]}
                  isLoading={cashierLoading}
                />
              </div>
            </CardHeader>
            <CardContent>
              <ReportTable
                data={cashierData || []}
                columns={cashierColumns}
                isLoading={cashierLoading}
                pageSize={15}
                searchPlaceholder="Search by cashier name..."
                emptyMessage="No cashier data available"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Transaction Details</CardTitle>
                  <CardDescription>
                    {selectedShift === "all"
                      ? "All transactions"
                      : `${getShiftLabel(selectedShift)} transactions`}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <ShiftFilter value={selectedShift} onChange={setSelectedShift} />
                  <ReportExportButton
                    data={detailData || []}
                    filename={`shift-transactions-${selectedShift}-${dateFrom}-${dateTo}`}
                    columns={exportColumns}
                    isLoading={detailsLoading}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ReportTable
                data={detailData || []}
                columns={detailColumns}
                isLoading={detailsLoading}
                pageSize={20}
                searchPlaceholder="Search by patient, invoice, or cashier..."
                emptyMessage="No transactions found"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
