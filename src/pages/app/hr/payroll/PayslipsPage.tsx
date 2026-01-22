import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, FileText, Calendar, Users } from "lucide-react";
import { usePayrollRuns, usePayrollDetails, useEmployeeSalaries } from "@/hooks/usePayroll";
import { EmployeePayslipsDialog } from "@/components/hr/EmployeePayslipsDialog";
import { format } from "date-fns";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function PayslipsPage() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedRun, setSelectedRun] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: payrollRuns, isLoading } = usePayrollRuns();
  const { data: salaries } = useEmployeeSalaries({ isCurrent: true });
  const { data: payrollEntries, isLoading: isLoadingEntries } = usePayrollDetails(selectedRun?.id || "");

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString());

  const filteredRuns = payrollRuns?.filter((run: any) => {
    if (run.year?.toString() !== selectedYear) return false;
    if (selectedMonth !== "all" && run.month?.toString() !== selectedMonth) return false;
    return run.status === "completed";
  });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(amount);

  const handleViewPayslips = (run: any) => {
    setSelectedRun(run);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payslips"
        description="View and print employee payslips"
        breadcrumbs={[
          { label: "HR", href: "/app/hr" },
          { label: "Payroll", href: "/app/hr/payroll" },
          { label: "Payslips" },
        ]}
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll Runs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payrollRuns?.length || 0}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Year</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payrollRuns?.filter((r: any) => r.year === currentYear).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Payroll runs in {currentYear}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salaries?.length || 0}</div>
            <p className="text-xs text-muted-foreground">With salary records</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>Payroll Runs</CardTitle>
            <div className="flex gap-2">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {MONTHS.map((month, index) => (
                    <SelectItem key={index} value={(index + 1).toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-28">
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
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading payroll runs...</div>
          ) : filteredRuns?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No completed payroll runs found for selected period
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Gross Amount</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pay Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRuns?.map((run: any) => (
                  <TableRow key={run.id}>
                    <TableCell className="font-medium">
                      {MONTHS[(run.month || 1) - 1]} {run.year}
                    </TableCell>
                    <TableCell>{run.total_employees || 0}</TableCell>
                    <TableCell>{formatCurrency(run.total_gross || 0)}</TableCell>
                    <TableCell className="text-destructive">
                      -{formatCurrency(run.total_deductions || 0)}
                    </TableCell>
                    <TableCell className="font-medium text-primary">
                      {formatCurrency(run.total_net || 0)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={run.status === "completed" ? "default" : "secondary"}>
                        {run.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {run.pay_date ? format(new Date(run.pay_date), "dd MMM yyyy") : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewPayslips(run)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Payslips
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Employee Payslips Dialog */}
      <EmployeePayslipsDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        payrollRun={selectedRun}
        entries={payrollEntries || []}
        isLoading={isLoadingEntries}
        organizationName="Shifa Medical Center"
      />
    </div>
  );
}
