import { useState } from "react";
import { format, subDays } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ReportFilters } from "@/components/reports/ReportFilters";
import { ReportTable, Column } from "@/components/reports/ReportTable";
import { ReportExportButton } from "@/components/reports/ReportExportButton";
import { ReportSummaryCard } from "@/components/reports/ReportSummaryCard";
import { DepartmentFilter, DepartmentType, getDepartmentColor, getDepartmentLabel } from "@/components/reports/DepartmentFilter";
import { useDepartmentRevenue, useDepartmentRevenueDetails, DepartmentRevenueDetail } from "@/hooks/useDepartmentRevenue";
import { useBranches } from "@/hooks/useBranches";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, Legend } from "recharts";
import { DollarSign, TrendingUp, Receipt, Loader2, Building2 } from "lucide-react";
import { formatCurrency } from "@/lib/exportUtils";
import { cn } from "@/lib/utils";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(142, 76%, 36%)",
  "hsl(340, 82%, 52%)",
  "hsl(30, 100%, 50%)",
];

export default function DepartmentRevenueReport() {
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentType>("all");

  const dateFrom = format(dateRange.from, "yyyy-MM-dd");
  const dateTo = format(dateRange.to, "yyyy-MM-dd");

  const { data: branches } = useBranches();
  const { data: revenueData, isLoading } = useDepartmentRevenue(
    dateFrom,
    dateTo,
    selectedBranch !== "all" ? selectedBranch : undefined
  );
  const { data: detailData, isLoading: detailsLoading } = useDepartmentRevenueDetails(
    dateFrom,
    dateTo,
    selectedDepartment,
    selectedBranch !== "all" ? selectedBranch : undefined
  );

  const branchOptions = branches?.map((b) => ({
    value: b.id,
    label: b.name,
  })) || [];

  const summary = revenueData?.summary || [];
  const totalRevenue = revenueData?.total || 0;

  // Chart data for pie
  const pieData = summary.map((item) => ({
    name: item.departmentLabel,
    value: item.revenue,
    percentage: item.percentage.toFixed(1),
  }));

  // Chart data for bar
  const barData = summary.map((item) => ({
    department: item.departmentLabel.substring(0, 10),
    revenue: item.revenue,
    count: item.count,
  }));

  // Detail table columns
  const detailColumns: Column<DepartmentRevenueDetail>[] = [
    {
      key: "invoice_date",
      header: "Date",
      sortable: true,
      cell: (row) => format(new Date(row.invoice_date), "dd MMM yyyy"),
    },
    { key: "invoice_number", header: "Invoice #", sortable: true },
    { key: "patient_name", header: "Patient", sortable: true },
    { key: "description", header: "Service", sortable: true },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      className: "text-right",
      cell: (row) => <span className="font-medium">{formatCurrency(row.amount)}</span>,
    },
  ];

  const exportColumns = [
    { key: "invoice_date", header: "Date" },
    { key: "invoice_number", header: "Invoice Number" },
    { key: "patient_name", header: "Patient Name" },
    { key: "description", header: "Service Description" },
    { key: "department", header: "Department" },
    { key: "amount", header: "Amount", format: (v: number) => formatCurrency(v) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Department Revenue Report"
        description="Revenue breakdown by clinical departments with drill-down details"
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
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          subtitle={`${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d, yyyy")}`}
          icon={DollarSign}
          isLoading={isLoading}
        />
        <ReportSummaryCard
          title="Top Department"
          value={summary[0]?.departmentLabel || "-"}
          subtitle={summary[0] ? `${formatCurrency(summary[0].revenue)} (${summary[0].percentage.toFixed(1)}%)` : undefined}
          icon={TrendingUp}
          variant="success"
          isLoading={isLoading}
        />
        <ReportSummaryCard
          title="Total Transactions"
          value={summary.reduce((sum, d) => sum + d.count, 0).toLocaleString()}
          subtitle="Invoice items"
          icon={Receipt}
          variant="info"
          isLoading={isLoading}
        />
        <ReportSummaryCard
          title="Departments"
          value={summary.length}
          subtitle="With revenue"
          icon={Building2}
          isLoading={isLoading}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Department</CardTitle>
            <CardDescription>Comparison of revenue across departments</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-[300px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : barData.length > 0 ? (
              <ChartContainer
                config={{ revenue: { label: "Revenue", color: "hsl(var(--primary))" } }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical" margin={{ left: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="department" width={75} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                      {barData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Distribution</CardTitle>
            <CardDescription>Percentage share of each department</CardDescription>
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
                      innerRadius={50}
                      paddingAngle={2}
                      label={({ name, percentage }) => `${percentage}%`}
                    >
                      {pieData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
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
      </div>

      {/* Summary Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Department Summary</CardTitle>
              <CardDescription>Click on a department to view transaction details</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-2">
              {summary.map((dept, index) => (
                <div
                  key={dept.department}
                  onClick={() => setSelectedDepartment(dept.department)}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors",
                    selectedDepartment === dept.department
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div>
                      <p className="font-medium">{dept.departmentLabel}</p>
                      <p className="text-sm text-muted-foreground">{dept.count} transactions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(dept.revenue)}</p>
                    <p className="text-sm text-muted-foreground">{dept.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Table */}
      {selectedDepartment !== "all" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{getDepartmentLabel(selectedDepartment)} Transactions</CardTitle>
                <CardDescription>
                  Detailed list of all transactions for this department
                </CardDescription>
              </div>
              <ReportExportButton
                data={detailData || []}
                filename={`department-revenue-${selectedDepartment}-${dateFrom}-${dateTo}`}
                columns={exportColumns}
                isLoading={detailsLoading}
              />
            </div>
          </CardHeader>
          <CardContent>
            <ReportTable
              data={detailData || []}
              columns={detailColumns}
              isLoading={detailsLoading}
              pageSize={15}
              searchPlaceholder="Search by patient, invoice, or service..."
              emptyMessage="No transactions found for this department"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
