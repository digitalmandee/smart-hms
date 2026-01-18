import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { Download, FileText, TrendingUp, DollarSign, Users, Calendar } from "lucide-react";
import { usePayrollRuns, useEmployeeSalaries, useEmployeeLoans, usePayrollStats } from "@/hooks/usePayroll";
import { format } from "date-fns";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function PayrollReportsPage() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());

  const { data: payrollRuns } = usePayrollRuns();
  const { data: salaries } = useEmployeeSalaries({ isCurrent: true });
  const { data: loans } = useEmployeeLoans();
  const { data: stats } = usePayrollStats();

  const years = Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString());

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      notation: "compact",
    }).format(amount);

  // Monthly payroll data for the selected year
  const monthlyData = MONTHS.map((month, index) => {
    const run = payrollRuns?.find(
      (r: any) => r.payroll_year === parseInt(selectedYear) && r.payroll_month === index + 1
    );
    return {
      month,
      gross: run?.total_gross || 0,
      deductions: run?.total_deductions || 0,
      net: run?.total_net || 0,
      employees: run?.total_employees || 0,
    };
  });

  // Salary distribution data
  const salaryDistribution = (() => {
    const ranges = [
      { label: "< 50K", min: 0, max: 50000 },
      { label: "50K-100K", min: 50000, max: 100000 },
      { label: "100K-200K", min: 100000, max: 200000 },
      { label: "200K-500K", min: 200000, max: 500000 },
      { label: "> 500K", min: 500000, max: Infinity },
    ];
    return ranges.map((range) => ({
      name: range.label,
      value: salaries?.filter((s: any) => s.basic_salary >= range.min && s.basic_salary < range.max).length || 0,
    }));
  })();

  // YTD Summary
  const ytdSummary = {
    totalGross: payrollRuns
      ?.filter((r: any) => r.payroll_year === parseInt(selectedYear))
      .reduce((sum: number, r: any) => sum + (r.total_gross || 0), 0) || 0,
    totalDeductions: payrollRuns
      ?.filter((r: any) => r.payroll_year === parseInt(selectedYear))
      .reduce((sum: number, r: any) => sum + (r.total_deductions || 0), 0) || 0,
    totalNet: payrollRuns
      ?.filter((r: any) => r.payroll_year === parseInt(selectedYear))
      .reduce((sum: number, r: any) => sum + (r.total_net || 0), 0) || 0,
    runCount: payrollRuns?.filter((r: any) => r.payroll_year === parseInt(selectedYear)).length || 0,
  };

  // Loan summary
  const loanSummary = {
    totalActive: loans?.filter((l: any) => l.status === "active").length || 0,
    totalAmount: loans?.filter((l: any) => l.status === "active").reduce((sum: number, l: any) => sum + (l.remaining_amount || 0), 0) || 0,
    monthlyRecovery: loans?.filter((l: any) => l.status === "active").reduce((sum: number, l: any) => sum + (l.emi_amount || 0), 0) || 0,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll Reports"
        description="Analytics and reports for payroll management"
        breadcrumbs={[
          { label: "HR", path: "/app/hr" },
          { label: "Payroll", path: "/app/hr/payroll" },
          { label: "Reports" },
        ]}
      />

      {/* Year Filter */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
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
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">YTD Gross</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(ytdSummary.totalGross)}</div>
            <p className="text-xs text-muted-foreground">{ytdSummary.runCount} payroll runs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">YTD Deductions</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(ytdSummary.totalDeductions)}</div>
            <p className="text-xs text-muted-foreground">Including loans & taxes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">YTD Net Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(ytdSummary.totalNet)}</div>
            <p className="text-xs text-muted-foreground">Total disbursed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loanSummary.totalActive}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(loanSummary.monthlyRecovery)}/month recovery
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="monthly">
        <TabsList>
          <TabsTrigger value="monthly">Monthly Trend</TabsTrigger>
          <TabsTrigger value="distribution">Salary Distribution</TabsTrigger>
          <TabsTrigger value="summary">Summary Table</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Payroll Trend - {selectedYear}</CardTitle>
              <CardDescription>Gross vs Net salary comparison by month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="gross" name="Gross Salary" fill="hsl(var(--primary))" />
                    <Bar dataKey="net" name="Net Salary" fill="hsl(142 76% 36%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Salary Distribution</CardTitle>
              <CardDescription>Employee count by salary range</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={salaryDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {salaryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Summary - {selectedYear}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead>Gross Salary</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Salary</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{row.month}</TableCell>
                      <TableCell>{row.employees || "-"}</TableCell>
                      <TableCell>{row.gross > 0 ? formatCurrency(row.gross) : "-"}</TableCell>
                      <TableCell className="text-red-600">
                        {row.deductions > 0 ? `-${formatCurrency(row.deductions)}` : "-"}
                      </TableCell>
                      <TableCell className="text-green-600 font-medium">
                        {row.net > 0 ? formatCurrency(row.net) : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell>Total</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>{formatCurrency(ytdSummary.totalGross)}</TableCell>
                    <TableCell className="text-red-600">-{formatCurrency(ytdSummary.totalDeductions)}</TableCell>
                    <TableCell className="text-green-600">{formatCurrency(ytdSummary.totalNet)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
