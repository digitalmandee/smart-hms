import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Download } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useDepartmentRevenue } from "@/hooks/useDepartmentRevenue";
import { formatCurrencyFull as formatCurrency } from "@/lib/currency";
import { exportToCSV, formatCurrency as exportFmtCurrency } from "@/lib/exportUtils";
import { useTranslation } from "@/lib/i18n";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { PieChart, Pie, Cell as PieCell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const SOURCE_COLORS = ["#2563eb", "#16a34a", "#d97706", "#dc2626", "#7c3aed", "#6b7280"];

export default function RevenueBySourcePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [dateFrom, setDateFrom] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [dateTo, setDateTo] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));

  const { data, isLoading, refetch } = useDepartmentRevenue(dateFrom, dateTo);

  const sourceData = useMemo(() => {
    if (!data?.summary) return [];
    return data.summary.map((s) => ({
      name: s.departmentLabel,
      count: s.count,
      amount: s.revenue,
      percent: Math.round(s.percentage),
      department: s.department,
    }));
  }, [data]);

  const totalRevenue = data?.total || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("accounts.revenueBySource" as any, "Revenue by Source")}
        description={t("billing.revenueBySourceDesc" as any, "GL-sourced breakdown of revenue by service category")}
        breadcrumbs={[
          { label: t("nav.accounts" as any, "Accounts"), href: "/app/accounts" },
          { label: t("nav.reports" as any, "Reports"), href: "/app/accounts/reports" },
          { label: t("accounts.revenueBySource" as any, "Revenue by Source") },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />{t("common.refresh" as any, "Refresh")}
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              exportToCSV(sourceData.map((s) => ({ source: s.name, count: s.count, amount: s.amount, percent: `${s.percent}%` })), "revenue-by-source", [
                { key: "source", header: "Source" },
                { key: "count", header: "Count" },
                { key: "amount", header: "Amount", format: (v: number) => exportFmtCurrency(v) },
                { key: "percent", header: "% of Total" },
              ]);
            }}>
              <Download className="h-4 w-4 mr-2" />{t("common.export", "Export")}
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="space-y-1">
              <Label>{t("common.from" as any, "From")}</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>{t("common.to" as any, "To")}</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">{t("common.distribution" as any, "Distribution")}</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {sourceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sourceData}
                          dataKey="amount"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={(entry) => `${entry.name} (${entry.percent}%)`}
                          onClick={(_, idx) => {
                            const dept = sourceData[idx]?.department;
                            if (dept) navigate(`/app/accounts/department-revenue?department=${dept}`);
                          }}
                          className="cursor-pointer"
                        >
                          {sourceData.map((_, idx) => (
                            <PieCell key={idx} fill={SOURCE_COLORS[idx % SOURCE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      {t("common.noData" as any, "No data for selected period")}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">{t("common.summary" as any, "Summary")}</CardTitle></CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">{formatCurrency(totalRevenue)}</div>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("billing.totalRevenue" as any, "Total Revenue")} ({dateFrom} — {dateTo})
                </p>
                <div className="space-y-3">
                  {sourceData.map((s, idx) => (
                    <div
                      key={s.name}
                      className="flex items-center justify-between cursor-pointer hover:bg-muted/50 rounded p-1 -mx-1"
                      onClick={() => navigate(`/app/accounts/department-revenue?department=${s.department}`)}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: SOURCE_COLORS[idx % SOURCE_COLORS.length] }} />
                        <span className="text-sm">{s.name}</span>
                      </div>
                      <span className="text-sm font-medium">{formatCurrency(s.amount)} ({s.percent}%)</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">{t("common.detail" as any, "Detail")}</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("common.source" as any, "Source")}</TableHead>
                    <TableHead className="text-right">{t("common.count" as any, "Count")}</TableHead>
                    <TableHead className="text-right">{t("common.amount" as any, "Amount")}</TableHead>
                    <TableHead className="text-right">% {t("common.ofTotal" as any, "of Total")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sourceData.map((s) => (
                    <TableRow
                      key={s.name}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/app/accounts/department-revenue?department=${s.department}`)}
                    >
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell className="text-right">{s.count}</TableCell>
                      <TableCell className="text-right">{formatCurrency(s.amount)}</TableCell>
                      <TableCell className="text-right">{s.percent}%</TableCell>
                    </TableRow>
                  ))}
                  {sourceData.length > 0 && (
                    <TableRow className="font-bold border-t-2">
                      <TableCell>{t("common.total" as any, "Total")}</TableCell>
                      <TableCell className="text-right">{sourceData.reduce((s, v) => s + v.count, 0)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(totalRevenue)}</TableCell>
                      <TableCell className="text-right">100%</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {sourceData.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {t("common.noData" as any, "No revenue data for the selected period.")}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
