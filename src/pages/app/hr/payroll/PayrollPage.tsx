import { useState } from "react";
import { format } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePayrollRuns } from "@/hooks/usePayroll";
import { Loader2, Plus, DollarSign, Users, FileText, TrendingUp } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { useNavigate } from "react-router-dom";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function PayrollPage() {
  const navigate = useNavigate();
  const currentDate = new Date();
  const [year, setYear] = useState(currentDate.getFullYear());

  const { data: payrollRuns, isLoading } = usePayrollRuns(year);

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - 2 + i);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processed":
        return <Badge className="bg-green-500">Processed</Badge>;
      case "processing":
        return <Badge className="bg-blue-500">Processing</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Calculate stats
  const totalPayroll = payrollRuns?.reduce((sum, run) => sum + (run.total_net_salary || 0), 0) || 0;
  const processedRuns = payrollRuns?.filter((r) => r.status === "processed").length || 0;
  const employeesProcessed = payrollRuns?.reduce((sum, run) => sum + (run.employee_count || 0), 0) || 0;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll Management"
        description="Process and manage employee payroll"
        breadcrumbs={[
          { label: "HR", href: "/app/hr" },
          { label: "Payroll" },
        ]}
        actions={
          <Button onClick={() => navigate("/app/hr/payroll/process")}>
            <Plus className="h-4 w-4 mr-2" />
            Process Payroll
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total YTD Payroll"
          value={formatCurrency(totalPayroll)}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatsCard
          title="Processed Runs"
          value={processedRuns}
          icon={<FileText className="h-5 w-5" />}
        />
        <StatsCard
          title="Employees Paid"
          value={employeesProcessed}
          icon={<Users className="h-5 w-5" />}
        />
        <StatsCard
          title="Avg Per Run"
          value={formatCurrency(processedRuns > 0 ? totalPayroll / processedRuns : 0)}
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Payroll Runs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Runs - {year}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Gross Salary</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Processed On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : payrollRuns && payrollRuns.length > 0 ? (
                  payrollRuns.map((run) => (
                    <TableRow key={run.id}>
                      <TableCell className="font-medium">
                        {months[run.month - 1]} {run.year}
                      </TableCell>
                      <TableCell>{run.employee_count}</TableCell>
                      <TableCell>{formatCurrency(run.total_gross_salary || 0)}</TableCell>
                      <TableCell>{formatCurrency(run.total_deductions || 0)}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(run.total_net_salary || 0)}
                      </TableCell>
                      <TableCell>{getStatusBadge(run.status || "draft")}</TableCell>
                      <TableCell>
                        {run.processed_at
                          ? format(new Date(run.processed_at), "MMM d, yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/app/hr/payroll/${run.id}`)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No payroll runs found for {year}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate("/app/hr/payroll/salaries")}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Employee Salaries</h3>
              <p className="text-sm text-muted-foreground">Manage salary structures</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate("/app/hr/payroll/loans")}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Loans & Advances</h3>
              <p className="text-sm text-muted-foreground">Manage employee loans</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate("/app/hr/payroll/reports")}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Reports</h3>
              <p className="text-sm text-muted-foreground">View payroll reports</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
