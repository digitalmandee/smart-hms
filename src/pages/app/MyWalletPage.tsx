import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, DollarSign, Clock, Calendar, FileText, Download } from "lucide-react";
import { useMyWalletSummary, useMyEarnings } from "@/hooks/useDoctorCompensation";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const SOURCE_TYPE_LABELS: Record<string, string> = {
  consultation: "Consultation",
  procedure: "Procedure",
  surgery: "Surgery",
  lab_referral: "Lab Referral",
  radiology_referral: "Radiology Referral",
  pharmacy_referral: "Pharmacy Referral",
  ipd_visit: "IPD Visit",
  other: "Other",
};

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function MyWalletPage() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState((currentDate.getMonth() + 1).toString().padStart(2, '0'));
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString());
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const years = Array.from({ length: 3 }, (_, i) => (currentDate.getFullYear() - i).toString());

  const { data: summary, isLoading: summaryLoading } = useMyWalletSummary(selectedMonth, parseInt(selectedYear));
  const { data: earnings, isLoading: earningsLoading } = useMyEarnings({
    month: selectedMonth,
    year: parseInt(selectedYear),
    isPaid: statusFilter === "all" ? undefined : statusFilter === "paid",
  });

  // Prepare chart data from summary
  const chartData = summary?.bySource
    ? Object.entries(summary.bySource).map(([source, amount]) => ({
        name: SOURCE_TYPE_LABELS[source] || source,
        value: amount as number,
      }))
    : [];

  const getStatusBadge = (isPaid: boolean) => {
    return isPaid ? (
      <Badge variant="default" className="bg-primary/10 text-primary hover:bg-primary/20">
        Paid
      </Badge>
    ) : (
      <Badge variant="outline" className="text-amber-600 border-amber-300 dark:text-amber-400">
        Unpaid
      </Badge>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="My Wallet"
        description="Track your earnings and commission history"
      />

      {/* Period Selector */}
      <div className="flex flex-wrap gap-4">
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-40">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((month, idx) => (
              <SelectItem key={idx} value={(idx + 1).toString().padStart(2, '0')}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-9 w-32" />
            ) : (
              <p className="text-3xl font-bold text-primary">
                {formatCurrency(summary?.unpaid || 0)}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">Unpaid earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-9 w-32" />
            ) : (
              <p className="text-3xl font-bold">
                {formatCurrency(summary?.total || 0)}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {MONTHS[parseInt(selectedMonth) - 1]} {selectedYear}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Settled Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-9 w-32" />
            ) : (
              <p className="text-3xl font-bold text-primary">
                {formatCurrency(summary?.paid || 0)}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">Already paid out</p>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown and Chart */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Earnings Breakdown Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Earnings Breakdown</CardTitle>
            <CardDescription>By source type</CardDescription>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <div className="flex items-center justify-center h-[200px]">
                <Skeleton className="h-40 w-40 rounded-full" />
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                <FileText className="h-12 w-12 mb-2 opacity-50" />
                <p>No earnings this period</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Source Breakdown List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Source Details</CardTitle>
            <CardDescription>Earnings by category</CardDescription>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : summary?.bySource && Object.keys(summary.bySource).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(summary.bySource).map(([source, amount]) => (
                  <div key={source} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">{SOURCE_TYPE_LABELS[source] || source}</span>
                    <span className="text-lg font-semibold">{formatCurrency(amount as number)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[160px] text-muted-foreground">
                <p>No earnings data</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Earnings History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Earnings History</CardTitle>
            <CardDescription>Detailed transaction log</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" disabled>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {earningsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : earnings && earnings.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Gross Amount</TableHead>
                    <TableHead className="text-right">Your Share</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {earnings.map((earning) => (
                    <TableRow key={earning.id}>
                      <TableCell>
                        {earning.earning_date ? format(new Date(earning.earning_date), "dd MMM yyyy") : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {SOURCE_TYPE_LABELS[earning.source_type] || earning.source_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {earning.source_reference || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(earning.gross_amount)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(earning.doctor_share_amount)}
                        <span className="text-xs text-muted-foreground ml-1">
                          ({earning.doctor_share_percent}%)
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(earning.is_paid)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mb-4 opacity-50" />
              <p>No earnings recorded for this period</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
