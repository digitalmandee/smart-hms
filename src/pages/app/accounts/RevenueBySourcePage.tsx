import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Download } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrencyFull as formatCurrency } from "@/lib/currency";
import { exportToCSV, formatCurrency as exportFmtCurrency } from "@/lib/exportUtils";
import { useTranslation } from "@/lib/i18n";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { PieChart, Pie, Cell as PieCell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const SOURCE_COLORS = ["#2563eb", "#16a34a", "#d97706", "#dc2626", "#7c3aed", "#6b7280"];

const CATEGORY_MAP: Record<string, string> = {
  consultation: "Consultation",
  lab: "Lab",
  imaging: "Imaging",
  pharmacy: "Pharmacy",
  ipd: "IPD",
};

export default function RevenueBySourcePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { profile } = useAuth();

  const [dateFrom, setDateFrom] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [dateTo, setDateTo] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));

  const { data: rawData, isLoading, refetch } = useQuery({
    queryKey: ["revenue-by-source", profile?.organization_id, dateFrom, dateTo],
    queryFn: async () => {
      // Fetch invoice items with service type info
      const { data, error } = await supabase
        .from("invoice_items")
        .select(`
          id, quantity, total_price,
          service_type:service_types(id, name, category),
          invoice:invoices!inner(id, invoice_date, status)
        `)
        .gte("invoice.invoice_date", dateFrom)
        .lte("invoice.invoice_date", dateTo)
        .in("invoice.status", ["paid", "partially_paid", "pending"]);
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  const sourceData = useMemo(() => {
    if (!rawData) return [];
    const grouped: Record<string, { count: number; amount: number }> = {};
    rawData.forEach((item: any) => {
      const cat = item.service_type?.category || "other";
      const label = CATEGORY_MAP[cat] || "Other";
      if (!grouped[label]) grouped[label] = { count: 0, amount: 0 };
      grouped[label].count += 1;
      grouped[label].amount += item.total_price || 0;
    });
    const totalAmount = Object.values(grouped).reduce((s, v) => s + v.amount, 0);
    return Object.entries(grouped)
      .map(([name, v]) => ({ name, ...v, percent: totalAmount > 0 ? Math.round((v.amount / totalAmount) * 100) : 0 }))
      .sort((a, b) => b.amount - a.amount);
  }, [rawData]);

  const totalRevenue = sourceData.reduce((s, v) => s + v.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("accounts.revenueBySource" as any, "Revenue by Source")}
        description="Breakdown of revenue by service category"
        breadcrumbs={[
          { label: "Accounts", href: "/app/accounts" },
          { label: "Reports", href: "/app/accounts/reports" },
          { label: "Revenue by Source" },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              exportToCSV(sourceData.map((s) => ({ source: s.name, count: s.count, amount: s.amount, percent: `${s.percent}%` })), "revenue-by-source", [
                { key: "source", header: "Source" },
                { key: "count", header: "Count" },
                { key: "amount", header: "Amount", format: (v: number) => exportFmtCurrency(v) },
                { key: "percent", header: "% of Total" },
              ]);
            }}>
              <Download className="h-4 w-4 mr-2" />Export
            </Button>
          </div>
        }
      />

      {/* Date Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="space-y-1">
              <Label>From</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>To</Label>
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
            {/* Pie Chart */}
            <Card>
              <CardHeader><CardTitle className="text-base">Distribution</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {sourceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={sourceData} dataKey="amount" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={(entry) => `${entry.name} (${entry.percent}%)`}>
                          {sourceData.map((_, idx) => (
                            <PieCell key={idx} fill={SOURCE_COLORS[idx % SOURCE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">No data for selected period</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader><CardTitle className="text-base">Summary</CardTitle></CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">{formatCurrency(totalRevenue)}</div>
                <p className="text-sm text-muted-foreground mb-4">Total Revenue ({dateFrom} — {dateTo})</p>
                <div className="space-y-3">
                  {sourceData.map((s, idx) => (
                    <div key={s.name} className="flex items-center justify-between">
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

          {/* Detail Table */}
          <Card>
            <CardHeader><CardTitle className="text-base">Detail</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">% of Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sourceData.map((s) => (
                    <TableRow key={s.name}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell className="text-right">{s.count}</TableCell>
                      <TableCell className="text-right">{formatCurrency(s.amount)}</TableCell>
                      <TableCell className="text-right">{s.percent}%</TableCell>
                    </TableRow>
                  ))}
                  {sourceData.length > 0 && (
                    <TableRow className="font-bold border-t-2">
                      <TableCell>Total</TableCell>
                      <TableCell className="text-right">{sourceData.reduce((s, v) => s + v.count, 0)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(totalRevenue)}</TableCell>
                      <TableCell className="text-right">100%</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {sourceData.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">No revenue data for the selected period.</div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
