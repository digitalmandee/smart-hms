import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMyPayslips } from "@/hooks/usePayroll";
import { useAuth } from "@/contexts/AuthContext";
import { PayslipPreview } from "@/components/hr/PayslipPreview";
import { Loader2, Eye, FileText, Download } from "lucide-react";
import { format } from "date-fns";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function MyPayslipsPage() {
  const { profile } = useAuth();
  const { data: payslips, isLoading } = useMyPayslips();
  const [selectedPayslip, setSelectedPayslip] = useState<any | null>(null);
  const [yearFilter, setYearFilter] = useState<string>("all");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get unique years from payslips
  const years = [...new Set(payslips?.map(p => p.payroll_run?.year).filter(Boolean))].sort((a, b) => b - a);

  // Filter payslips by year
  const filteredPayslips = yearFilter === "all" 
    ? payslips 
    : payslips?.filter(p => p.payroll_run?.year?.toString() === yearFilter);

  const getPayslipData = (payslip: any) => ({
    employee: {
      name: profile?.full_name || "Employee",
      employeeNumber: payslip.employee_number || "N/A",
      department: payslip.department_name,
      designation: payslip.designation_name,
    },
    period: {
      month: payslip.payroll_run?.month || 1,
      year: payslip.payroll_run?.year || new Date().getFullYear(),
    },
    earnings: Array.isArray(payslip.earnings) ? payslip.earnings : [],
    deductions: Array.isArray(payslip.deductions) ? payslip.deductions : [],
    workingDays: payslip.total_working_days || 0,
    daysWorked: payslip.present_days || 0,
    leaveDays: payslip.leave_days || 0,
    paymentDate: payslip.payroll_run?.pay_date,
    paymentMethod: payslip.payment_method || "Bank Transfer",
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Payslips"
        description="View and download your salary slips"
        breadcrumbs={[
          { label: "My Work" },
          { label: "Payslips" },
        ]}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Salary History
          </CardTitle>
          {years.length > 0 && (
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter by year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map(year => (
                  <SelectItem key={year} value={year?.toString() || ""}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardHeader>
        <CardContent>
          {!filteredPayslips?.length ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No payslips found</p>
              <p className="text-sm mt-1">Your salary slips will appear here after payroll processing</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Gross Salary</TableHead>
                  <TableHead className="text-right">Deductions</TableHead>
                  <TableHead className="text-right">Net Salary</TableHead>
                  <TableHead>Pay Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayslips.map((payslip) => (
                  <TableRow key={payslip.id}>
                    <TableCell className="font-medium">
                      {MONTHS[(payslip.payroll_run?.month || 1) - 1]} {payslip.payroll_run?.year}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(payslip.gross_salary || 0)}
                    </TableCell>
                    <TableCell className="text-right text-destructive">
                      {formatCurrency(payslip.total_deductions || 0)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-primary">
                      {formatCurrency(payslip.net_salary || 0)}
                    </TableCell>
                    <TableCell>
                      {payslip.payroll_run?.pay_date
                        ? format(new Date(payslip.payroll_run.pay_date), "MMM d, yyyy")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={payslip.payroll_run?.status === "completed" ? "default" : "secondary"}>
                        {payslip.payroll_run?.status === "completed" ? "Paid" : "Processing"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedPayslip(payslip)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Payslip Preview Dialog */}
      <Dialog open={!!selectedPayslip} onOpenChange={() => setSelectedPayslip(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payslip Details</DialogTitle>
          </DialogHeader>
          {selectedPayslip && (
            <PayslipPreview data={getPayslipData(selectedPayslip)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
