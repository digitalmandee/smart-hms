import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "@/lib/i18n";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileSpreadsheet, Download, Calendar, Building2, Settings2 } from "lucide-react";
import { usePayrollRuns, usePayrollDetails } from "@/hooks/usePayroll";
import { BankSheetTemplateDialog, useBankSheetTemplate } from "@/components/hr/BankSheetTemplateDialog";
import { format } from "date-fns";
import { exportToCSV } from "@/lib/exportUtils";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function BankSheetPage() {
  const { t } = useTranslation();
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [downloadRunId, setDownloadRunId] = useState<string>("");
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);

  const { data: payrollRuns, isLoading } = usePayrollRuns();
  const { data: downloadEntries } = usePayrollDetails(downloadRunId);
  const { fields: templateFields, setFields } = useBankSheetTemplate();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString());

  // Find the most recent year with completed payroll runs
  const mostRecentYear = useMemo(() => {
    const completedRuns = payrollRuns?.filter((r: any) => r.status === "completed");
    if (completedRuns?.length > 0) {
      const sorted = [...completedRuns].sort((a: any, b: any) => {
        if (b.year !== a.year) return b.year - a.year;
        return b.month - a.month;
      });
      return sorted[0].year.toString();
    }
    return currentYear.toString();
  }, [payrollRuns, currentYear]);

  // Set initial year to most recent with data
  useEffect(() => {
    if (mostRecentYear && !selectedYear) {
      setSelectedYear(mostRecentYear);
    }
  }, [mostRecentYear, selectedYear]);

  const completedRuns = payrollRuns?.filter((run: any) => {
    if (run.status !== "completed") return false;
    if (run.year?.toString() !== selectedYear) return false;
    if (selectedMonth !== "all" && run.month?.toString() !== selectedMonth) return false;
    return true;
  });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(amount);

  const getFieldValue = (e: any, key: string) => {
    switch (key) {
      case "employeeName": return `${e.employee?.first_name || ""} ${e.employee?.last_name || ""}`.trim();
      case "employeeNumber": return e.employee?.employee_number || "N/A";
      case "department": return e.employee?.department?.name || "N/A";
      case "designation": return e.employee?.designation?.name || "N/A";
      case "bankName": return e.bank_name || "N/A";
      case "branchCode": return "N/A";
      case "accountNumber": return e.account_number || "N/A";
      case "iban": return "N/A";
      case "basicSalary": return e.basic_salary || 0;
      case "grossSalary": return e.gross_salary || 0;
      case "deductions": return e.total_deductions || 0;
      case "netSalary": return e.net_salary || 0;
      default: return "N/A";
    }
  };

  const handleDownload = (run: any) => {
    setDownloadRunId(run.id);
  };

  // Process download when entries are loaded
  useEffect(() => {
    if (downloadRunId && downloadEntries?.length) {
      const run = payrollRuns?.find((r: any) => r.id === downloadRunId);
      if (!run) return;

      const enabledFields = templateFields.filter(f => f.enabled);
      const columns = enabledFields.map(f => ({
        key: f.key,
        header: f.header,
      }));

      const data = downloadEntries.map((e: any) => {
        const row: Record<string, any> = {};
        enabledFields.forEach(f => {
          row[f.key] = getFieldValue(e, f.key);
        });
        return row;
      });

      const month = MONTHS[(run.month || 1) - 1];
      exportToCSV(data, `bank-sheet-${month}-${run.year}`, columns);
      setDownloadRunId("");
    }
  }, [downloadRunId, downloadEntries, payrollRuns, templateFields]);

  const handleTemplateSave = (fields: any[]) => {
    setFields(fields);
    setIsTemplateDialogOpen(false);
  };

  // Calculate totals
  const totals = useMemo(() => {
    if (!completedRuns) return { runs: 0, employees: 0, amount: 0 };
    return completedRuns.reduce((acc: any, run: any) => ({
      runs: acc.runs + 1,
      employees: acc.employees + (run.total_employees || 0),
      amount: acc.amount + (run.total_net || 0),
    }), { runs: 0, employees: 0, amount: 0 });
  }, [completedRuns]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bank Transfer Sheets"
        description="Download bank transfer files for completed payroll runs"
        breadcrumbs={[
          { label: t('nav.hr' as any), href: "/app/hr" },
          { label: "Payroll", href: "/app/hr/payroll" },
          { label: "Bank Sheets" },
        ]}
        actions={
          <Button variant="outline" onClick={() => setIsTemplateDialogOpen(true)}>
            <Settings2 className="h-4 w-4 mr-2" />
            Configure Template
          </Button>
        }
      />

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payroll Runs</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.runs}</div>
            <p className="text-xs text-muted-foreground">
              Completed runs in {selectedYear}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.employees}</div>
            <p className="text-xs text-muted-foreground">
              Across all payroll runs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Net Amount</CardTitle>
            <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.amount)}</div>
            <p className="text-xs text-muted-foreground">
              For bank transfers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Completed Payroll Runs
            </CardTitle>
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
            <div className="text-center py-8 text-muted-foreground">
              Loading payroll runs...
            </div>
          ) : !completedRuns?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileSpreadsheet className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No completed payroll runs found for the selected period</p>
              <p className="text-sm mt-1">
                Process payroll first to generate bank sheets
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Net Amount</TableHead>
                  <TableHead>Pay Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Download</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedRuns.map((run: any) => (
                  <TableRow key={run.id}>
                    <TableCell className="font-medium">
                      {MONTHS[(run.month || 1) - 1]} {run.year}
                    </TableCell>
                    <TableCell>{run.total_employees || 0}</TableCell>
                    <TableCell className="font-medium text-primary">
                      {formatCurrency(run.total_net || 0)}
                    </TableCell>
                    <TableCell>
                      {run.pay_date ? format(new Date(run.pay_date), "dd MMM yyyy") : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">Completed</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => handleDownload(run)}
                        disabled={downloadRunId === run.id}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {downloadRunId === run.id ? "Preparing..." : "Download CSV"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Template Configuration Dialog */}
      <BankSheetTemplateDialog
        open={isTemplateDialogOpen}
        onOpenChange={setIsTemplateDialogOpen}
        onSave={handleTemplateSave}
      />
    </div>
  );
}
