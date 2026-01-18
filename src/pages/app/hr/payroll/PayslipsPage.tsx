import { useState, useRef } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Printer, Download, Eye, FileText, Calendar } from "lucide-react";
import { usePayrollRuns, useEmployeeSalaries } from "@/hooks/usePayroll";
import { PayslipPreview } from "@/components/hr/PayslipPreview";
import { useReactToPrint } from "react-to-print";
import { format } from "date-fns";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function PayslipsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedPayslip, setSelectedPayslip] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const { data: payrollRuns, isLoading } = usePayrollRuns();
  const { data: salaries } = useEmployeeSalaries({ isCurrent: true });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString());

  const filteredRuns = payrollRuns?.filter((run: any) => {
    if (run.payroll_year?.toString() !== selectedYear) return false;
    if (selectedMonth !== "all" && run.payroll_month?.toString() !== selectedMonth) return false;
    return run.status === "completed" || run.status === "approved";
  });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(amount);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: selectedPayslip ? `Payslip-${selectedPayslip.month}-${selectedPayslip.year}` : "Payslip",
  });

  // Generate mock payslip data for preview
  const generatePayslipData = (run: any) => {
    // This would normally come from payroll details API
    return {
      employee: {
        name: "Sample Employee",
        employeeNumber: "EMP-001",
        department: "Operations",
        designation: "Staff",
      },
      period: {
        month: run.payroll_month,
        year: run.payroll_year,
      },
      earnings: [
        { name: "Basic Salary", amount: run.total_gross * 0.5 },
        { name: "House Rent Allowance", amount: run.total_gross * 0.25 },
        { name: "Medical Allowance", amount: run.total_gross * 0.15 },
        { name: "Transport Allowance", amount: run.total_gross * 0.1 },
      ],
      deductions: [
        { name: "Provident Fund", amount: run.total_deductions * 0.6 },
        { name: "Tax", amount: run.total_deductions * 0.3 },
        { name: "Other", amount: run.total_deductions * 0.1 },
      ],
      workingDays: 26,
      daysWorked: 24,
      leaveDays: 2,
      paymentDate: run.pay_date,
      paymentMethod: "Bank Transfer",
    };
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payslips"
        description="View and print employee payslips"
        breadcrumbs={[
          { label: "HR", path: "/app/hr" },
          { label: "Payroll", path: "/app/hr/payroll" },
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
              {payrollRuns?.filter((r: any) => r.payroll_year === currentYear).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Payroll runs in {currentYear}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
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
                      {MONTHS[(run.payroll_month || 1) - 1]} {run.payroll_year}
                    </TableCell>
                    <TableCell>{run.total_employees || 0}</TableCell>
                    <TableCell>{formatCurrency(run.total_gross || 0)}</TableCell>
                    <TableCell className="text-red-600">
                      -{formatCurrency(run.total_deductions || 0)}
                    </TableCell>
                    <TableCell className="font-medium text-green-600">
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
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedPayslip({
                              ...run,
                              month: run.payroll_month,
                              year: run.payroll_year,
                            });
                            setIsPreviewOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Payslip Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Payslip Preview</span>
              <Button variant="outline" size="sm" onClick={() => handlePrint()}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </DialogTitle>
          </DialogHeader>
          {selectedPayslip && (
            <div ref={printRef}>
              <PayslipPreview
                data={generatePayslipData(selectedPayslip)}
                organizationName="Shifa Medical Center"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
