import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Eye, Printer, Settings, FileSpreadsheet } from "lucide-react";
import { PrintablePayslip } from "./PrintablePayslip";
import { useReactToPrint } from "react-to-print";
import { exportToCSV } from "@/lib/exportUtils";
import { BankSheetTemplateDialog, BankSheetField, useBankSheetTemplate } from "./BankSheetTemplateDialog";

interface PayrollEntry {
  id: string;
  employee_id: string;
  basic_salary: number;
  gross_salary: number;
  net_salary: number;
  total_deductions: number;
  bank_name: string | null;
  account_number: string | null;
  total_working_days: number;
  present_days: number;
  absent_days: number;
  leave_days: number;
  earnings: any;
  deductions: any;
  employee: {
    id: string;
    first_name: string;
    last_name: string;
    employee_number: string;
    department?: { name: string } | null;
    designation?: { name: string } | null;
  } | null;
}

interface EmployeePayslipsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payrollRun: {
    id: string;
    month: number;
    year: number;
    pay_date?: string;
  } | null;
  entries: PayrollEntry[];
  isLoading?: boolean;
  organizationName?: string;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function EmployeePayslipsDialog({
  open,
  onOpenChange,
  payrollRun,
  entries,
  isLoading,
  organizationName = "Organization",
}: EmployeePayslipsDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<PayrollEntry | null>(null);
  const [showPayslip, setShowPayslip] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const { fields: templateFields, setFields: setTemplateFields } = useBankSheetTemplate();

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: selectedEntry 
      ? `Payslip-${selectedEntry.employee.first_name}-${payrollRun?.month}-${payrollRun?.year}` 
      : "Payslip",
  });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(amount || 0);

  const filteredEntries = entries?.filter((entry) => {
    const name = `${entry.employee?.first_name} ${entry.employee?.last_name}`.toLowerCase();
    const empNumber = entry.employee?.employee_number?.toLowerCase() || "";
    return name.includes(searchTerm.toLowerCase()) || empNumber.includes(searchTerm.toLowerCase());
  }) || [];

  const getFieldValue = (e: PayrollEntry, key: string) => {
    switch (key) {
      case "employeeName": return `${e.employee?.first_name || ""} ${e.employee?.last_name || ""}`.trim();
      case "employeeNumber": return e.employee?.employee_number || "N/A";
      case "department": return e.employee?.department?.name || "N/A";
      case "designation": return e.employee?.designation?.name || "N/A";
      case "bankName": return e.bank_name || "N/A";
      case "branchCode": return "N/A"; // Could be added to payroll_entries if needed
      case "accountNumber": return e.account_number || "N/A";
      case "iban": return "N/A"; // Could be added to payroll_entries if needed
      case "basicSalary": return e.basic_salary || 0;
      case "grossSalary": return e.gross_salary || 0;
      case "deductions": return e.total_deductions || 0;
      case "netSalary": return e.net_salary || 0;
      default: return "N/A";
    }
  };

  const downloadBankSheet = () => {
    if (!entries?.length || !payrollRun) return;

    const enabledFields = templateFields.filter(f => f.enabled);
    const columns = enabledFields.map(f => ({
      key: f.key,
      header: f.header,
    }));

    const data = entries.map((e) => {
      const row: Record<string, any> = {};
      enabledFields.forEach(f => {
        row[f.key] = getFieldValue(e, f.key);
      });
      return row;
    });

    const month = MONTHS[(payrollRun.month || 1) - 1];
    exportToCSV(data, `bank-sheet-${month}-${payrollRun.year}`, columns);
  };

  const generatePayslipData = (entry: PayrollEntry) => {
    return {
      employee: {
        name: `${entry.employee?.first_name || ""} ${entry.employee?.last_name || ""}`.trim(),
        employeeNumber: entry.employee?.employee_number || "N/A",
        department: entry.employee?.department?.name,
        designation: entry.employee?.designation?.name,
      },
      period: {
        month: payrollRun?.month || 1,
        year: payrollRun?.year || new Date().getFullYear(),
      },
      earnings: Array.isArray(entry.earnings) && entry.earnings.length > 0 
        ? entry.earnings 
        : [{ name: "Basic Salary", amount: entry.basic_salary || 0 }],
      deductions: Array.isArray(entry.deductions) && entry.deductions.length > 0 
        ? entry.deductions 
        : [],
      workingDays: entry.total_working_days || 26,
      daysWorked: entry.present_days || 0,
      leaveDays: entry.leave_days || 0,
      grossSalary: entry.gross_salary || 0,
      netSalary: entry.net_salary || 0,
      paymentDate: payrollRun?.pay_date,
      paymentMethod: entry.bank_name ? "Bank Transfer" : "Cash",
    };
  };

  const branding = {
    name: organizationName,
  };

  const periodLabel = payrollRun 
    ? `${MONTHS[(payrollRun.month || 1) - 1]} ${payrollRun.year}` 
    : "Payroll";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Employee Payslips - {periodLabel}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowTemplateDialog(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </Button>
                <Button variant="outline" size="sm" onClick={downloadBankSheet}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Download Bank Sheet
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or employee number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading employee payslips...</div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No employee payslips found for this payroll run
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Basic</TableHead>
                    <TableHead className="text-right">Gross</TableHead>
                    <TableHead className="text-right">Deductions</TableHead>
                    <TableHead className="text-right">Net Salary</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {entry.employee?.first_name} {entry.employee?.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {entry.employee?.employee_number}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {entry.employee?.department?.name || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(entry.basic_salary)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(entry.gross_salary)}
                      </TableCell>
                      <TableCell className="text-right text-destructive">
                        -{formatCurrency(entry.total_deductions)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-primary">
                        {formatCurrency(entry.net_salary)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedEntry(entry);
                              setShowPayslip(true);
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

            <div className="flex justify-between items-center text-sm text-muted-foreground pt-4 border-t">
              <span>Showing {filteredEntries.length} of {entries?.length || 0} employees</span>
              <span>
                Total Net: {formatCurrency(
                  filteredEntries.reduce((sum, e) => sum + (e.net_salary || 0), 0)
                )}
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Individual Payslip Preview Dialog */}
      <Dialog open={showPayslip} onOpenChange={setShowPayslip}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>
                Payslip - {selectedEntry?.employee?.first_name} {selectedEntry?.employee?.last_name}
              </span>
              <Button variant="outline" size="sm" onClick={() => handlePrint()}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div ref={printRef}>
              <PrintablePayslip
                data={generatePayslipData(selectedEntry)}
                branding={branding}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bank Sheet Template Configuration Dialog */}
      <BankSheetTemplateDialog
        open={showTemplateDialog}
        onOpenChange={setShowTemplateDialog}
        onSave={setTemplateFields}
      />
    </>
  );
}
