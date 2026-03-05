import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import { ReportExportButton } from "@/components/reports/ReportExportButton";
import { useNphiesAnalytics } from "@/hooks/useNphiesAnalytics";
import { useTranslation } from "@/lib/i18n";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  FileText, CheckCircle, XCircle, Clock, DollarSign, TrendingUp, Calendar,
} from "lucide-react";
import { format, subMonths } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import type { NphiesClaim } from "@/hooks/useNphiesAnalytics";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];

function StatusBadge({ status }: { status: string | null }) {
  if (!status) return <Badge variant="outline">—</Badge>;
  const map: Record<string, { variant: "default" | "destructive" | "secondary" | "outline"; label: string }> = {
    accepted: { variant: "default", label: "Approved" },
    rejected: { variant: "destructive", label: "Rejected" },
    pending: { variant: "secondary", label: "Pending" },
    submitted: { variant: "outline", label: "Submitted" },
    partially_approved: { variant: "secondary", label: "Partial" },
  };
  const m = map[status] || { variant: "outline" as const, label: status };
  return <Badge variant={m.variant}>{m.label}</Badge>;
}

export default function NphiesAnalyticsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [dateFrom, setDateFrom] = useState<Date | undefined>(subMonths(new Date(), 12));
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date());

  const { data, isLoading } = useNphiesAnalytics(dateFrom, dateTo);
  const summary = data?.summary;
  const claims = data?.claims || [];
  const monthlyTrends = data?.monthlyTrends || [];
  const payerBreakdown = data?.payerBreakdown || [];

  const columns: ColumnDef<NphiesClaim>[] = useMemo(() => [
    { accessorKey: "claim_number", header: t("nphies.nphiesClaimId" as any, "Claim #") },
    { accessorKey: "patient_name", header: t("common.name") },
    { accessorKey: "payer_name", header: t("nphiesAnalytics.payer" as any, "Payer") },
    {
      accessorKey: "claim_date",
      header: t("common.date"),
      cell: ({ row }) => format(new Date(row.original.claim_date), "dd MMM yyyy"),
    },
    {
      accessorKey: "total_amount",
      header: t("common.amount"),
      cell: ({ row }) => `SAR ${row.original.total_amount.toLocaleString()}`,
    },
    {
      accessorKey: "approved_amount",
      header: t("nphies.totalApproved" as any, "Approved"),
      cell: ({ row }) => `SAR ${row.original.approved_amount.toLocaleString()}`,
    },
    {
      accessorKey: "nphies_status",
      header: t("nphies.nphiesStatus" as any, "Status"),
      cell: ({ row }) => <StatusBadge status={row.original.nphies_status} />,
    },
  ], [t]);

  const exportColumns = [
    { key: "claim_number", header: "Claim #" },
    { key: "patient_name", header: "Patient" },
    { key: "payer_name", header: "Payer" },
    { key: "claim_date", header: "Date" },
    { key: "total_amount", header: "Amount (SAR)", format: (v: any) => v?.toLocaleString() },
    { key: "approved_amount", header: "Approved (SAR)", format: (v: any) => v?.toLocaleString() },
    { key: "nphies_status", header: "NPHIES Status" },
  ];

  const payerExportColumns = [
    { key: "payerName", header: "Payer" },
    { key: "totalClaims", header: "Claims" },
    { key: "approved", header: "Approved" },
    { key: "rejected", header: "Rejected" },
    { key: "pending", header: "Pending" },
    { key: "approvalRate", header: "Approval %", format: (v: any) => `${v}%` },
    { key: "totalAmount", header: "Total (SAR)", format: (v: any) => v?.toLocaleString() },
    { key: "approvedAmount", header: "Approved (SAR)", format: (v: any) => v?.toLocaleString() },
  ];

  const pieData = payerBreakdown.map((p, i) => ({
    name: p.payerName,
    value: p.totalClaims,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const chartConfig = {
    submitted: { label: t("nphiesAnalytics.submitted" as any, "Submitted"), color: CHART_COLORS[3] },
    approved: { label: t("nphies.claimAccepted" as any, "Approved"), color: CHART_COLORS[0] },
    rejected: { label: t("nphies.claimRejected" as any, "Rejected"), color: CHART_COLORS[1] },
    pending: { label: t("nphies.pendingReview" as any, "Pending"), color: CHART_COLORS[2] },
  };

  const payerChartConfig = Object.fromEntries(
    payerBreakdown.map((p, i) => [p.payerId, { label: p.payerName, color: CHART_COLORS[i % CHART_COLORS.length] }])
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title={t("nphiesAnalytics.title" as any, "NPHIES Analytics")}
        description={t("nphiesAnalytics.description" as any, "Detailed insurance claims analytics and reporting")}
        breadcrumbs={[
          { label: t("nav.billing"), href: "/app/billing" },
          { label: t("nphiesAnalytics.title" as any, "NPHIES Analytics") },
        ]}
        actions={
          <ReportExportButton
            data={claims}
            filename="nphies-analytics"
            columns={exportColumns}
            title="NPHIES Analytics Report"
            pdfOptions={{
              title: "NPHIES Analytics Report",
              subtitle: dateFrom && dateTo ? `${format(dateFrom, "dd MMM yyyy")} — ${format(dateTo, "dd MMM yyyy")}` : undefined,
              orientation: "landscape",
            }}
          />
        }
      />

      {/* Date range filter */}
      <Card>
        <CardContent className="pt-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{t("nphiesAnalytics.dateRange" as any, "Date Range")}:</span>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn("w-[150px] justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}>
                {dateFrom ? format(dateFrom, "dd MMM yyyy") : "From"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0"><CalendarComponent mode="single" selected={dateFrom} onSelect={setDateFrom} /></PopoverContent>
          </Popover>
          <span className="text-muted-foreground">—</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn("w-[150px] justify-start text-left font-normal", !dateTo && "text-muted-foreground")}>
                {dateTo ? format(dateTo, "dd MMM yyyy") : "To"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0"><CalendarComponent mode="single" selected={dateTo} onSelect={setDateTo} /></PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <FileText className="h-4 w-4" />
              {t("nphiesAnalytics.totalClaims" as any, "Total Claims")}
            </div>
            <p className="text-2xl font-bold mt-1">{summary?.totalClaims ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <CheckCircle className="h-4 w-4 text-chart-1" />
              {t("nphies.claimAccepted" as any, "Approved")}
            </div>
            <p className="text-2xl font-bold mt-1 text-chart-1">{summary?.approved ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <XCircle className="h-4 w-4 text-chart-2" />
              {t("nphies.claimRejected" as any, "Rejected")}
            </div>
            <p className="text-2xl font-bold mt-1 text-chart-2">{summary?.rejected ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <DollarSign className="h-4 w-4 text-primary" />
              {t("nphies.totalApproved" as any, "Total Approved")}
            </div>
            <p className="text-2xl font-bold mt-1 text-primary">SAR {(summary?.approvedAmount ?? 0).toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional stats row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Clock className="h-4 w-4 text-chart-3" />
              {t("nphies.pendingReview" as any, "Pending")}
            </div>
            <p className="text-2xl font-bold mt-1">{summary?.pending ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <TrendingUp className="h-4 w-4" />
              {t("nphiesAnalytics.avgProcessing" as any, "Avg Processing")}
            </div>
            <p className="text-2xl font-bold mt-1">{summary?.avgProcessingDays ?? 0} {t("nphiesAnalytics.days" as any, "days")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <DollarSign className="h-4 w-4" />
              {t("nphiesAnalytics.totalSubmitted" as any, "Total Submitted")}
            </div>
            <p className="text-2xl font-bold mt-1">SAR {(summary?.totalAmount ?? 0).toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="claims">
        <TabsList>
          <TabsTrigger value="claims">{t("nphiesAnalytics.claimsHistory" as any, "Claims History")}</TabsTrigger>
          <TabsTrigger value="trends">{t("nphiesAnalytics.monthlyTrends" as any, "Monthly Trends")}</TabsTrigger>
          <TabsTrigger value="payers">{t("nphiesAnalytics.payerBreakdown" as any, "Payer Breakdown")}</TabsTrigger>
        </TabsList>

        <TabsContent value="claims">
          <Card>
            <CardContent className="pt-4">
              <DataTable
                columns={columns}
                data={claims}
                searchKey="patient_name"
                searchPlaceholder={t("nphiesAnalytics.searchPatient" as any, "Search by patient...")}
                isLoading={isLoading}
                onRowClick={(row) => navigate(`/app/billing/claims/${row.id}`)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>{t("nphiesAnalytics.monthlyTrends" as any, "Monthly Trends")}</CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyTrends.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[350px] w-full">
                  <BarChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                    <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="submitted" fill={CHART_COLORS[3]} name="Submitted" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="approved" fill={CHART_COLORS[0]} name="Approved" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="rejected" fill={CHART_COLORS[1]} name="Rejected" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  {t("nphies.noClaimsYet" as any, "No data available")}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payers">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Payer pie chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("nphiesAnalytics.claimsByPayer" as any, "Claims by Payer")}</CardTitle>
              </CardHeader>
              <CardContent>
                {pieData.length > 0 ? (
                  <ChartContainer config={payerChartConfig} className="h-[280px] w-full">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" nameKey="name" label>
                        {pieData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                    {t("nphies.noClaimsYet" as any, "No data")}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payer table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">{t("nphiesAnalytics.payerBreakdown" as any, "Payer Breakdown")}</CardTitle>
                <ReportExportButton
                  data={payerBreakdown}
                  filename="nphies-payer-breakdown"
                  columns={payerExportColumns}
                  title="Payer Breakdown"
                  pdfOptions={{ title: "NPHIES Payer Breakdown" }}
                />
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("nphiesAnalytics.payer" as any, "Payer")}</TableHead>
                        <TableHead className="text-center">{t("nphiesAnalytics.totalClaims" as any, "Claims")}</TableHead>
                        <TableHead className="text-center">{t("nphiesAnalytics.approvalRate" as any, "Approval %")}</TableHead>
                        <TableHead className="text-right">{t("nphies.totalApproved" as any, "Approved")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payerBreakdown.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            {t("common.noResults" as any, "No results")}
                          </TableCell>
                        </TableRow>
                      ) : payerBreakdown.map(p => (
                        <TableRow key={p.payerId}>
                          <TableCell className="font-medium">{p.payerName}</TableCell>
                          <TableCell className="text-center">{p.totalClaims}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant={p.approvalRate >= 80 ? "default" : p.approvalRate >= 50 ? "secondary" : "destructive"}>
                              {p.approvalRate}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">SAR {p.approvedAmount.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
