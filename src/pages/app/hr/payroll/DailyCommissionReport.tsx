import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ReportTable, Column } from "@/components/reports/ReportTable";
import { ReportExportButton } from "@/components/reports/ReportExportButton";
import { useDailyEarningsReport } from "@/hooks/useDoctorSettlements";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";
import { CalendarIcon, DollarSign, Users, TrendingUp, CheckCircle, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EarningRow {
  id: string;
  doctorName: string;
  employeeNumber: string;
  sourceType: string;
  sourceReference: string;
  patientName: string;
  grossAmount: number;
  sharePercent: number;
  shareAmount: number;
  isPaid: boolean;
}

const sourceTypeLabels: Record<string, string> = {
  consultation: "Consultation",
  ipd_visit: "IPD Visit",
  surgery: "Surgery",
  procedure: "Procedure",
};

export default function DailyCommissionReport() {
  const [date, setDate] = useState<Date>(new Date());
  const { data: earnings, isLoading } = useDailyEarningsReport(date);

  const rows: EarningRow[] = (earnings || []).map((e: any) => ({
    id: e.id,
    doctorName: e.doctor?.employee
      ? `${e.doctor.employee.first_name || ""} ${e.doctor.employee.last_name || ""}`.trim()
      : "Unknown",
    employeeNumber: e.doctor?.employee?.employee_number || "",
    sourceType: e.source_type,
    sourceReference: e.source_reference || "-",
    patientName: e.patient
      ? `${e.patient.first_name || ""} ${e.patient.last_name || ""}`.trim()
      : "-",
    grossAmount: Number(e.gross_amount) || 0,
    sharePercent: Number(e.doctor_share_percent) || 0,
    shareAmount: Number(e.doctor_share_amount) || 0,
    isPaid: e.is_paid,
  }));

  const totalEarnings = rows.reduce((sum, r) => sum + r.shareAmount, 0);
  const paidEarnings = rows.filter(r => r.isPaid).reduce((sum, r) => sum + r.shareAmount, 0);
  const unpaidEarnings = rows.filter(r => !r.isPaid).reduce((sum, r) => sum + r.shareAmount, 0);
  const uniqueDoctors = new Set(rows.map(r => r.doctorName)).size;

  const columns: Column<EarningRow>[] = [
    {
      key: "doctorName",
      header: "Doctor",
      cell: (row) => (
        <div>
          <p className="font-medium">{row.doctorName}</p>
          <p className="text-xs text-muted-foreground">{row.employeeNumber}</p>
        </div>
      ),
      sortable: true,
    },
    {
      key: "sourceType",
      header: "Source",
      cell: (row) => (
        <Badge variant="outline">
          {sourceTypeLabels[row.sourceType] || row.sourceType}
        </Badge>
      ),
      sortable: true,
    },
    {
      key: "sourceReference",
      header: "Reference",
      sortable: true,
    },
    {
      key: "patientName",
      header: "Patient",
      sortable: true,
    },
    {
      key: "grossAmount",
      header: "Gross Amount",
      cell: (row) => formatCurrency(row.grossAmount),
      className: "text-right",
      sortable: true,
    },
    {
      key: "sharePercent",
      header: "Share %",
      cell: (row) => `${row.sharePercent}%`,
      className: "text-center",
      sortable: true,
    },
    {
      key: "shareAmount",
      header: "Doctor Share",
      cell: (row) => (
        <span className="font-semibold text-primary">
          {formatCurrency(row.shareAmount)}
        </span>
      ),
      className: "text-right",
      sortable: true,
    },
    {
      key: "isPaid",
      header: "Status",
      cell: (row) => (
        <Badge variant={row.isPaid ? "default" : "secondary"}>
          {row.isPaid ? (
            <><CheckCircle className="h-3 w-3 mr-1" /> Paid</>
          ) : (
            <><Clock className="h-3 w-3 mr-1" /> Pending</>
          )}
        </Badge>
      ),
      className: "text-center",
      sortable: true,
    },
  ];

  const exportColumns = columns.map(c => ({
    key: c.key as string,
    header: c.header,
  }));

  const exportData = rows.map(r => ({
    ...r,
    sourceType: sourceTypeLabels[r.sourceType] || r.sourceType,
    grossAmount: r.grossAmount,
    shareAmount: r.shareAmount,
    isPaid: r.isPaid ? "Paid" : "Pending",
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Commission Report"
        description="View doctor earnings for a specific date"
        breadcrumbs={[
          { label: "HR", href: "/app/hr" },
          { label: "Payroll", href: "/app/hr/payroll" },
          { label: "Daily Commissions" },
        ]}
        actions={
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            <ReportExportButton
              data={exportData}
              columns={exportColumns}
              filename={`daily-commissions-${format(date, "yyyy-MM-dd")}`}
              title="Daily Commission Report"
              pdfOptions={{
                title: "Daily Commission Report",
                dateRange: { from: date, to: date },
              }}
            />
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">{formatCurrency(totalEarnings)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Paid</p>
                <p className="text-2xl font-bold">{formatCurrency(paidEarnings)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 rounded-full">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{formatCurrency(unpaidEarnings)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-full">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Doctors</p>
                <p className="text-2xl font-bold">{uniqueDoctors}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings for {format(date, "MMMM d, yyyy")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportTable
            data={rows}
            columns={columns}
            isLoading={isLoading}
            searchPlaceholder="Search by doctor, patient, or reference..."
            emptyMessage="No earnings recorded for this date"
            pageSize={20}
          />
        </CardContent>
      </Card>
    </div>
  );
}
