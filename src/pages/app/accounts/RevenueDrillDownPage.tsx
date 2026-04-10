import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, FileText, TrendingUp, Users, Stethoscope, ExternalLink, Download } from "lucide-react";
import { format } from "date-fns";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useRevenueDrillDown, useRevenueAccounts } from "@/hooks/useRevenueDrillDown";
import { useDoctors } from "@/hooks/useDoctors";
import { DepartmentFilter, DepartmentType } from "@/components/reports/DepartmentFilter";
import { ReportExportButton } from "@/components/reports/ReportExportButton";

export default function RevenueDrillDownPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { formatCurrency } = useCurrencyFormatter();

  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentType>("all");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const { data: revenueAccounts = [] } = useRevenueAccounts();
  const { data: doctors = [] } = useDoctors();
  const { data: drillDownData = [], isLoading } = useRevenueDrillDown({
    accountId: selectedAccountId,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    doctorId: selectedDoctorId !== "all" ? selectedDoctorId : undefined,
    departmentId: selectedDepartment !== "all" ? selectedDepartment : undefined,
  });

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Summary stats
  const stats = useMemo(() => {
    const totalRevenue = drillDownData.reduce((sum: number, l: any) => sum + (l.credit_amount || 0), 0);
    const uniqueInvoices = new Set(drillDownData.filter((l: any) => l.invoice).map((l: any) => l.invoice.id)).size;
    const uniquePatients = new Set(drillDownData.filter((l: any) => l.invoice?.patient).map((l: any) => l.invoice.patient.id)).size;
    const doctorTotals: Record<string, { name: string; total: number }> = {};
    drillDownData.forEach((l: any) => {
      if (l.invoice?.doctor) {
        const docId = l.invoice.doctor.id;
        if (!doctorTotals[docId]) doctorTotals[docId] = { name: l.invoice.doctor.name, total: 0 };
        doctorTotals[docId].total += l.credit_amount || 0;
      }
    });
    const topDoctors = Object.values(doctorTotals).sort((a, b) => b.total - a.total).slice(0, 5);
    return { totalRevenue, uniqueInvoices, uniquePatients, topDoctors };
  }, [drillDownData]);

  // Export data
  const exportData = useMemo(() => {
    return drillDownData.map((entry: any) => ({
      date: entry.journal_entry?.entry_date || "",
      entry_number: entry.journal_entry?.entry_number || "",
      invoice_number: entry.invoice?.invoice_number || "",
      patient: entry.invoice?.patient ? `${entry.invoice.patient.first_name} ${entry.invoice.patient.last_name}` : "",
      doctor: entry.invoice?.doctor?.name || "",
      amount: entry.credit_amount || 0,
    }));
  }, [drillDownData]);

  const exportColumns = [
    { key: "date", header: t("common.date" as any, "Date") },
    { key: "entry_number", header: t("finance.entry_number" as any, "Entry #") },
    { key: "invoice_number", header: t("finance.invoice" as any, "Invoice") },
    { key: "patient", header: t("finance.patient" as any, "Patient") },
    { key: "doctor", header: t("finance.doctor" as any, "Doctor") },
    { key: "amount", header: t("finance.amount" as any, "Amount"), format: (v: any) => String(v), align: "right" as const },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("finance.revenue_drilldown" as any, "Revenue Drill-Down")}
        description={t("finance.revenue_drilldown_desc" as any, "Trace GL revenue entries to invoices, doctors, and patients")}
        breadcrumbs={[
          { label: t("nav.accounts" as any, "Accounts"), href: "/app/accounts" },
          { label: t("finance.reports" as any, "Reports"), href: "/app/accounts/reports" },
          { label: t("finance.revenue_drilldown" as any, "Revenue Drill-Down") },
        ]}
        actions={
          <ReportExportButton
            data={exportData}
            filename="revenue-drilldown"
            columns={exportColumns}
            title={t("finance.revenue_drilldown" as any, "Revenue Drill-Down")}
            pdfOptions={{
              title: t("finance.revenue_drilldown" as any, "Revenue Drill-Down"),
              orientation: "landscape",
            }}
            disabled={drillDownData.length === 0}
          />
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <div className="md:col-span-2">
              <Label>{t("finance.revenue_account" as any, "Revenue Account")}</Label>
              <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                <SelectTrigger><SelectValue placeholder="Select revenue account" /></SelectTrigger>
                <SelectContent>
                  {revenueAccounts.map((acc: any) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      <span className="font-mono text-xs text-muted-foreground mr-2">{acc.account_number}</span>
                      {acc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("common.from" as any, "From")}</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div>
              <Label>{t("common.to" as any, "To")}</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <div>
              <Label>{t("finance.doctor" as any, "Doctor")}</Label>
              <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                <SelectTrigger><SelectValue placeholder="All Doctors" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.all" as any, "All Doctors")}</SelectItem>
                  {doctors.map((doc: any) => (
                    <SelectItem key={doc.id} value={doc.id}>{doc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("finance.department" as any, "Department")}</Label>
              <DepartmentFilter value={selectedDepartment} onChange={setSelectedDepartment} showLabel={false} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {selectedAccountId && drillDownData.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">{t("finance.total_revenue" as any, "Total Revenue")}</p>
                  <p className="text-xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">{t("finance.invoices" as any, "Invoices")}</p>
                  <p className="text-xl font-bold">{stats.uniqueInvoices}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">{t("finance.patients" as any, "Patients")}</p>
                  <p className="text-xl font-bold">{stats.uniquePatients}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">{t("finance.top_doctor" as any, "Top Doctor")}</p>
                  <p className="text-lg font-bold truncate">{stats.topDoctors[0]?.name || "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Doctors Card */}
      {stats.topDoctors.length > 1 && (
        <Card>
          <CardHeader><CardTitle className="text-base">{t("finance.top_earning_doctors" as any, "Top Earning Doctors")}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.topDoctors.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm">{idx + 1}. {doc.name}</span>
                  <Badge variant="outline">{formatCurrency(doc.total)}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Drill-Down Table */}
      {selectedAccountId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("finance.revenue_entries" as any, "Revenue Entries")}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : drillDownData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No entries found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>{t("common.date" as any, "Date")}</TableHead>
                    <TableHead>{t("finance.entry_number" as any, "Entry #")}</TableHead>
                    <TableHead>{t("finance.invoice" as any, "Invoice")}</TableHead>
                    <TableHead>{t("finance.patient" as any, "Patient")}</TableHead>
                    <TableHead>{t("finance.doctor" as any, "Doctor")}</TableHead>
                    <TableHead className="text-right">{t("finance.amount" as any, "Amount")}</TableHead>
                    <TableHead className="w-8"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drillDownData.map((entry: any) => {
                    const isExpanded = expandedRows.has(entry.id);
                    return (
                      <Collapsible key={entry.id} open={isExpanded} onOpenChange={() => toggleRow(entry.id)} asChild>
                        <>
                          <CollapsibleTrigger asChild>
                            <TableRow className="cursor-pointer hover:bg-muted/50">
                              <TableCell>
                                {entry.invoiceItems?.length > 0 && (
                                  isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                                )}
                              </TableCell>
                              <TableCell>
                                {entry.journal_entry?.entry_date
                                  ? format(new Date(entry.journal_entry.entry_date), "dd MMM yyyy")
                                  : "—"}
                              </TableCell>
                              <TableCell className="font-mono text-sm">{entry.journal_entry?.entry_number || "—"}</TableCell>
                              <TableCell>
                                {entry.invoice ? (
                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="p-0 h-auto"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/app/billing/invoices/${entry.invoice.id}`);
                                    }}
                                  >
                                    {entry.invoice.invoice_number}
                                  </Button>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {entry.invoice?.patient
                                  ? `${entry.invoice.patient.first_name} ${entry.invoice.patient.last_name}`
                                  : "—"}
                              </TableCell>
                              <TableCell>{entry.invoice?.doctor?.name || "—"}</TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrency(entry.credit_amount || 0)}
                              </TableCell>
                              <TableCell>
                                {entry.invoice && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/app/billing/invoices/${entry.invoice.id}`);
                                    }}
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          </CollapsibleTrigger>
                          <CollapsibleContent asChild>
                            <>
                              {entry.invoiceItems?.map((item: any) => (
                                <TableRow key={item.id} className="bg-muted/30">
                                  <TableCell></TableCell>
                                  <TableCell colSpan={2} className="text-sm pl-8">
                                    <Badge variant="outline" className="text-xs mr-2">
                                      {item.service_type?.category || "Item"}
                                    </Badge>
                                    {item.item_name}
                                  </TableCell>
                                  <TableCell className="text-sm">
                                    Qty: {item.quantity} × {formatCurrency(item.unit_price)}
                                  </TableCell>
                                  <TableCell colSpan={2} className="text-sm text-muted-foreground">
                                    {item.service_type?.name || ""}
                                  </TableCell>
                                  <TableCell className="text-right text-sm">{formatCurrency(item.total_price)}</TableCell>
                                  <TableCell></TableCell>
                                </TableRow>
                              ))}
                            </>
                          </CollapsibleContent>
                        </>
                      </Collapsible>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
