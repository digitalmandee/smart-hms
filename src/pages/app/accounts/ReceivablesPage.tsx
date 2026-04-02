import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, RefreshCw, Users, Building2, Clock, AlertTriangle, FileText } from "lucide-react";
import { formatCurrency as exportFmtCurrency } from "@/lib/exportUtils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart as RPieChart, Pie } from "recharts";
import { useTranslation } from "@/lib/i18n";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ReportExportButton } from "@/components/reports/ReportExportButton";
import { useAgingReport } from "@/hooks/useAgingReport";
import { format } from "date-fns";
import { formatCurrencyFull as formatCurrency } from "@/lib/currency";

const AGING_COLORS: Record<string, string> = {
  "Current": "bg-green-100 text-green-800",
  "1-30 Days": "bg-yellow-100 text-yellow-800",
  "31-60 Days": "bg-orange-100 text-orange-800",
  "61-90 Days": "bg-red-100 text-red-800",
  "90+ Days": "bg-red-200 text-red-900",
};

const CHART_COLORS = ["#22c55e", "#eab308", "#f97316", "#ef4444", "#991b1b"];

export default function ReceivablesPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "patient";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [agingFilter, setAgingFilter] = useState("all");
  const [insurerFilter, setInsurerFilter] = useState("all");
  const [claimStatusFilter, setClaimStatusFilter] = useState("all");

  const { data, isLoading, refetch } = useAgingReport();

  const arInvoices = data?.arInvoices || [];
  const insuranceClaims = data?.insuranceClaims || [];
  const departmentBreakdown = data?.departmentBreakdown || [];
  const topDefaulters = data?.topDefaulters || [];
  const summary = data?.summary || { totalAR: 0, totalInsuranceAR: 0, totalCreditApplied: 0, overdueAR: 0, highRiskAR: 0, highRiskCount: 0, topDefaulterAmount: 0 };
  const arBuckets = data?.arBuckets || { current: 0, days1_30: 0, days31_60: 0, days61_90: 0, days90_plus: 0 };

  // Filtered patient invoices
  const filteredAR = useMemo(() => {
    return arInvoices.filter(inv => {
      const matchSearch = !search || inv.patient_name.toLowerCase().includes(search.toLowerCase()) || inv.invoice_number.toLowerCase().includes(search.toLowerCase());
      const matchDept = deptFilter === "all" || inv.department === deptFilter;
      const matchAging = agingFilter === "all" || inv.aging_bucket === agingFilter;
      return matchSearch && matchDept && matchAging;
    });
  }, [arInvoices, search, deptFilter, agingFilter]);

  // Filtered insurance claims
  const filteredClaims = useMemo(() => {
    return insuranceClaims.filter(c => {
      const matchSearch = !search || c.claim_number.toLowerCase().includes(search.toLowerCase()) || c.patient_name.toLowerCase().includes(search.toLowerCase()) || c.insurer_name.toLowerCase().includes(search.toLowerCase());
      const matchInsurer = insurerFilter === "all" || c.insurer_name === insurerFilter;
      const matchStatus = claimStatusFilter === "all" || c.status === claimStatusFilter;
      const matchAging = agingFilter === "all" || c.aging_bucket === agingFilter;
      return matchSearch && matchInsurer && matchStatus && matchAging;
    });
  }, [insuranceClaims, search, insurerFilter, claimStatusFilter, agingFilter]);

  const uniqueDepts = [...new Set(arInvoices.map(i => i.department))].sort();
  const uniqueInsurers = [...new Set(insuranceClaims.map(c => c.insurer_name))].sort();
  const agingBuckets = ["Current", "1-30 Days", "31-60 Days", "61-90 Days", "90+ Days"];

  // Chart data
  const barChartData = [
    { name: "Current", amount: arBuckets.current, fill: CHART_COLORS[0] },
    { name: "1-30", amount: arBuckets.days1_30, fill: CHART_COLORS[1] },
    { name: "31-60", amount: arBuckets.days31_60, fill: CHART_COLORS[2] },
    { name: "61-90", amount: arBuckets.days61_90, fill: CHART_COLORS[3] },
    { name: "90+", amount: arBuckets.days90_plus, fill: CHART_COLORS[4] },
  ];

  const pieChartData = departmentBreakdown.map((d, i) => ({
    name: d.department,
    value: d.total,
    fill: ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"][i % 5],
  }));

  // Export columns
  const arColumns = [
    { key: "invoice_number", header: t("aging.invoiceNumber" as any, "Invoice #") },
    { key: "patient_name", header: t("aging.patient" as any, "Patient") },
    { key: "department", header: t("aging.department" as any, "Department") },
    { key: "invoice_date", header: t("aging.invoiceDate" as any, "Date"), format: (v: string) => v ? format(new Date(v), "dd MMM yyyy") : "-" },
    { key: "total_amount", header: t("aging.total" as any, "Total"), format: (v: number) => exportFmtCurrency(v), align: "right" as const },
    { key: "paid_amount", header: t("aging.paid" as any, "Paid"), format: (v: number) => exportFmtCurrency(v), align: "right" as const },
    { key: "credit_notes_total", header: t("aging.creditApplied" as any, "Credit Notes"), format: (v: number) => exportFmtCurrency(v), align: "right" as const },
    { key: "outstanding", header: t("aging.outstanding" as any, "Outstanding"), format: (v: number) => exportFmtCurrency(v), align: "right" as const },
    { key: "aging_bucket", header: t("aging.agingBucket" as any, "Aging") },
  ];

  const insuranceColumns = [
    { key: "claim_number", header: t("aging.claimNumber" as any, "Claim #") },
    { key: "insurer_name", header: t("aging.insurer" as any, "Insurer") },
    { key: "patient_name", header: t("aging.patient" as any, "Patient") },
    { key: "submission_date", header: t("aging.submissionDate" as any, "Submission Date"), format: (v: string) => v ? format(new Date(v), "dd MMM yyyy") : "-" },
    { key: "total_amount", header: t("aging.claimAmount" as any, "Claim Amount"), format: (v: number) => exportFmtCurrency(v), align: "right" as const },
    { key: "approved_amount", header: t("aging.approved" as any, "Approved"), format: (v: number) => exportFmtCurrency(v), align: "right" as const },
    { key: "paid_amount", header: t("aging.paid" as any, "Paid"), format: (v: number) => exportFmtCurrency(v), align: "right" as const },
    { key: "outstanding", header: t("aging.outstanding" as any, "Outstanding"), format: (v: number) => exportFmtCurrency(v), align: "right" as const },
    { key: "status", header: t("aging.status" as any, "Status") },
    { key: "aging_bucket", header: t("aging.agingBucket" as any, "Aging") },
  ];

  const deptColumns = [
    { key: "department", header: t("aging.department" as any, "Department") },
    { key: "current", header: t("aging.current" as any, "Current"), format: (v: number) => exportFmtCurrency(v), align: "right" as const },
    { key: "days1_30", header: t("aging.bucket_1_30" as any, "1-30 Days"), format: (v: number) => exportFmtCurrency(v), align: "right" as const },
    { key: "days31_60", header: t("aging.bucket_31_60" as any, "31-60 Days"), format: (v: number) => exportFmtCurrency(v), align: "right" as const },
    { key: "days61_90", header: t("aging.bucket_61_90" as any, "61-90 Days"), format: (v: number) => exportFmtCurrency(v), align: "right" as const },
    { key: "days90_plus", header: t("aging.bucket_90_plus" as any, "90+ Days"), format: (v: number) => exportFmtCurrency(v), align: "right" as const },
    { key: "total", header: t("aging.total" as any, "Total"), format: (v: number) => exportFmtCurrency(v), align: "right" as const },
    { key: "count", header: t("aging.invoiceCount" as any, "# Invoices") },
  ];

  const defaulterColumns = [
    { key: "patient_name", header: t("aging.patient" as any, "Patient") },
    { key: "total_invoices", header: t("aging.totalInvoices" as any, "Invoices") },
    { key: "total_outstanding", header: t("aging.totalOutstanding" as any, "Outstanding"), format: (v: number) => exportFmtCurrency(v), align: "right" as const },
    { key: "oldest_invoice_date", header: t("aging.oldestInvoice" as any, "Oldest Invoice"), format: (v: string) => v ? format(new Date(v), "dd MMM yyyy") : "-" },
    { key: "avg_days_outstanding", header: t("aging.avgDaysOutstanding" as any, "Avg Days") },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("aging.title" as any, "Accounts Receivable — Aging Report")}
        description={t("aging.subtitle" as any, "CFO-grade receivable tracking with department & insurance breakdown")}
        breadcrumbs={[
          { label: t("nav.accounts" as any, "Accounts"), href: "/app/accounts" },
          { label: t("aging.title" as any, "Accounts Receivable") },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("common.refresh" as any, "Refresh")}
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-24" /> : formatCurrency(summary.totalAR)}</div>
            <div className="text-sm text-muted-foreground">{t("aging.totalAROutstanding" as any, "Total AR Outstanding")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">{isLoading ? <Skeleton className="h-8 w-24" /> : formatCurrency(summary.totalAR)}</div>
            </div>
            <div className="text-sm text-muted-foreground">{t("aging.patientReceivables" as any, "Patient Receivables")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-600" />
              <div className="text-2xl font-bold text-purple-600">{isLoading ? <Skeleton className="h-8 w-24" /> : formatCurrency(summary.totalInsuranceAR)}</div>
            </div>
            <div className="text-sm text-muted-foreground">{t("aging.insuranceReceivables" as any, "Insurance Receivables")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div className="text-2xl font-bold text-orange-600">{isLoading ? <Skeleton className="h-8 w-24" /> : formatCurrency(summary.overdueAR)}</div>
            </div>
            <div className="text-sm text-muted-foreground">{t("aging.overdue" as any, "Overdue (>30 Days)")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              <div className="text-2xl font-bold text-green-600">{isLoading ? <Skeleton className="h-8 w-24" /> : formatCurrency(summary.totalCreditApplied)}</div>
            </div>
            <div className="text-sm text-muted-foreground">{t("aging.creditApplied" as any, "Credit Notes Applied")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div className="text-2xl font-bold text-red-600">{isLoading ? <Skeleton className="h-8 w-24" /> : formatCurrency(summary.highRiskAR)}</div>
            </div>
            <div className="text-sm text-muted-foreground">{t("aging.highRisk" as any, "High Risk (90+ Days)")}: {summary.highRiskCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      {!isLoading && arInvoices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-base">{t("aging.agingChart" as any, "Aging Summary")}</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} width={70} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                      {barChartData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          {pieChartData.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">{t("aging.departmentSplit" as any, "Department Split")}</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RPieChart>
                      <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {pieChartData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </RPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="patient">{t("aging.patientAging" as any, "Patient Aging")}</TabsTrigger>
          <TabsTrigger value="insurance">{t("aging.insuranceAging" as any, "Insurance Aging")}</TabsTrigger>
          <TabsTrigger value="department">{t("aging.departmentSummary" as any, "Department Summary")}</TabsTrigger>
          <TabsTrigger value="defaulters">{t("aging.topDefaulters" as any, "Top Defaulters")}</TabsTrigger>
        </TabsList>

        {/* Patient Aging Tab */}
        <TabsContent value="patient" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder={t("aging.searchPlaceholder" as any, "Search patient or invoice...")} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
                </div>
                <Select value={deptFilter} onValueChange={setDeptFilter}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Departments" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("common.all" as any, "All Departments")}</SelectItem>
                    {uniqueDepts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={agingFilter} onValueChange={setAgingFilter}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Aging" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("common.all" as any, "All Aging")}</SelectItem>
                    {agingBuckets.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
                <ReportExportButton data={filteredAR} filename="patient-aging" columns={arColumns} title="Patient Aging Report" />
              </div>

              {isLoading ? (
                <div className="space-y-2">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Aging</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Paid</TableHead>
                      <TableHead className="text-right">Credit Notes</TableHead>
                      <TableHead className="text-right">Outstanding</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAR.map(inv => (
                      <TableRow key={inv.id}>
                        <TableCell className="font-mono">{inv.invoice_number}</TableCell>
                        <TableCell>{inv.patient_name}</TableCell>
                        <TableCell><Badge variant="outline">{inv.department}</Badge></TableCell>
                        <TableCell>{format(new Date(inv.invoice_date), "dd MMM yyyy")}</TableCell>
                        <TableCell><Badge className={AGING_COLORS[inv.aging_bucket] || ""}>{inv.aging_bucket}</Badge></TableCell>
                        <TableCell className="text-right">{formatCurrency(inv.total_amount)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(inv.paid_amount)}</TableCell>
                        <TableCell className="text-right text-green-600">{inv.credit_notes_total > 0 ? `-${formatCurrency(inv.credit_notes_total)}` : "-"}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(inv.outstanding)}</TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/app/billing/invoices/${inv.id}`)}>View</Button>
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/app/billing/invoices/${inv.id}/pay`)}>Collect</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {!isLoading && filteredAR.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">No outstanding patient receivables found.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insurance Aging Tab */}
        <TabsContent value="insurance" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder={t("aging.searchClaims" as any, "Search claim, patient, insurer...")} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
                </div>
                <Select value={insurerFilter} onValueChange={setInsurerFilter}>
                  <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Insurers" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Insurers</SelectItem>
                    {uniqueInsurers.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={claimStatusFilter} onValueChange={setClaimStatusFilter}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="partially_paid">Partially Paid</SelectItem>
                  </SelectContent>
                </Select>
                <ReportExportButton data={filteredClaims} filename="insurance-aging" columns={insuranceColumns} title="Insurance Aging Report" />
              </div>

              {isLoading ? (
                <div className="space-y-2">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Claim #</TableHead>
                      <TableHead>Insurer</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Submission Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Aging</TableHead>
                      <TableHead className="text-right">Claim Amount</TableHead>
                      <TableHead className="text-right">Approved</TableHead>
                      <TableHead className="text-right">Paid</TableHead>
                      <TableHead className="text-right">Outstanding</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClaims.map(c => (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono">{c.claim_number}</TableCell>
                        <TableCell>{c.insurer_name}</TableCell>
                        <TableCell>{c.patient_name}</TableCell>
                        <TableCell>{c.submission_date ? format(new Date(c.submission_date), "dd MMM yyyy") : format(new Date(c.claim_date), "dd MMM yyyy")}</TableCell>
                        <TableCell>
                          <Badge variant={c.status === "approved" ? "default" : "secondary"}>
                            {c.status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        </TableCell>
                        <TableCell><Badge className={AGING_COLORS[c.aging_bucket] || ""}>{c.aging_bucket}</Badge></TableCell>
                        <TableCell className="text-right">{formatCurrency(c.total_amount)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(c.approved_amount)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(c.paid_amount)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(c.outstanding)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {!isLoading && filteredClaims.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">No outstanding insurance claims found.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Department Summary Tab */}
        <TabsContent value="department" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-end mb-4">
                <ReportExportButton data={departmentBreakdown} filename="department-aging" columns={deptColumns} title="Department Aging Summary" />
              </div>
              {isLoading ? (
                <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-right">Current</TableHead>
                      <TableHead className="text-right">1-30 Days</TableHead>
                      <TableHead className="text-right">31-60 Days</TableHead>
                      <TableHead className="text-right">61-90 Days</TableHead>
                      <TableHead className="text-right">90+ Days</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right"># Invoices</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departmentBreakdown.map(d => (
                      <TableRow key={d.department}>
                        <TableCell className="font-medium">{d.department}</TableCell>
                        <TableCell className="text-right">{formatCurrency(d.current)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(d.days1_30)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(d.days31_60)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(d.days61_90)}</TableCell>
                        <TableCell className="text-right text-red-600 font-medium">{formatCurrency(d.days90_plus)}</TableCell>
                        <TableCell className="text-right font-bold">{formatCurrency(d.total)}</TableCell>
                        <TableCell className="text-right">{d.count}</TableCell>
                      </TableRow>
                    ))}
                    {departmentBreakdown.length > 0 && (
                      <TableRow className="bg-muted/50 font-bold">
                        <TableCell>TOTAL</TableCell>
                        <TableCell className="text-right">{formatCurrency(departmentBreakdown.reduce((s, d) => s + d.current, 0))}</TableCell>
                        <TableCell className="text-right">{formatCurrency(departmentBreakdown.reduce((s, d) => s + d.days1_30, 0))}</TableCell>
                        <TableCell className="text-right">{formatCurrency(departmentBreakdown.reduce((s, d) => s + d.days31_60, 0))}</TableCell>
                        <TableCell className="text-right">{formatCurrency(departmentBreakdown.reduce((s, d) => s + d.days61_90, 0))}</TableCell>
                        <TableCell className="text-right text-red-600">{formatCurrency(departmentBreakdown.reduce((s, d) => s + d.days90_plus, 0))}</TableCell>
                        <TableCell className="text-right">{formatCurrency(departmentBreakdown.reduce((s, d) => s + d.total, 0))}</TableCell>
                        <TableCell className="text-right">{departmentBreakdown.reduce((s, d) => s + d.count, 0)}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
              {!isLoading && departmentBreakdown.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">No department data available.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Defaulters Tab */}
        <TabsContent value="defaulters" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-end mb-4">
                <ReportExportButton data={topDefaulters} filename="top-defaulters" columns={defaulterColumns} title="Top Defaulters Report" />
              </div>
              {isLoading ? (
                <div className="space-y-2">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead className="text-right">Invoices</TableHead>
                      <TableHead className="text-right">Outstanding</TableHead>
                      <TableHead>Oldest Invoice</TableHead>
                      <TableHead className="text-right">Avg Days</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topDefaulters.map((d, i) => (
                      <TableRow key={d.patient_id || i}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell className="font-medium">{d.patient_name}</TableCell>
                        <TableCell className="text-right">{d.total_invoices}</TableCell>
                        <TableCell className="text-right font-bold text-red-600">{formatCurrency(d.total_outstanding)}</TableCell>
                        <TableCell>{format(new Date(d.oldest_invoice_date), "dd MMM yyyy")}</TableCell>
                        <TableCell className="text-right">{d.avg_days_outstanding}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {!isLoading && topDefaulters.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">No defaulters found.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
