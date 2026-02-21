import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReportExportButton } from "@/components/reports/ReportExportButton";
import { formatCurrency } from "@/lib/exportUtils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Search, Users, Clock, DollarSign, ShoppingCart } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const queryTable = (table: string): any => (supabase as any).from(table);

export default function VendorPerformanceReport() {
  const { profile } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const perPage = 20;

  const { data: vendors } = useQuery({
    queryKey: ["vendor-performance", profile?.organization_id],
    queryFn: async () => {
      const { data: pos, error } = await queryTable("purchase_orders")
        .select("id, total_amount, status, vendor_id, vendor:vendors(name, vendor_code), created_at")
        .eq("organization_id", profile!.organization_id)
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Group by vendor
      const vendorMap: Record<string, { name: string; code: string; poCount: number; totalSpend: number; statuses: string[] }> = {};
      (pos || []).forEach((po: any) => {
        const vid = po.vendor_id;
        if (!vid) return;
        if (!vendorMap[vid]) {
          vendorMap[vid] = {
            name: po.vendor?.name || "Unknown",
            code: po.vendor?.vendor_code || "—",
            poCount: 0,
            totalSpend: 0,
            statuses: [],
          };
        }
        vendorMap[vid].poCount++;
        vendorMap[vid].totalSpend += po.total_amount || 0;
        vendorMap[vid].statuses.push(po.status);
      });

      return Object.entries(vendorMap)
        .map(([id, v]) => ({
          id,
          ...v,
          completionRate: v.statuses.length > 0
            ? Math.round((v.statuses.filter(s => s === "completed" || s === "received").length / v.statuses.length) * 100)
            : 0,
        }))
        .sort((a, b) => b.totalSpend - a.totalSpend);
    },
    enabled: !!profile?.organization_id,
  });

  const filtered = vendors?.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.code.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const paged = filtered.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);
  const totalSpend = vendors?.reduce((s, v) => s + v.totalSpend, 0) || 0;
  const avgCompletion = vendors?.length ? Math.round(vendors.reduce((s, v) => s + v.completionRate, 0) / vendors.length) : 0;

  const chartData = (vendors || []).slice(0, 10).map(v => ({
    name: v.name.slice(0, 15),
    spend: v.totalSpend,
  }));

  const exportData = filtered.map(v => ({
    vendor_code: v.code,
    vendor_name: v.name,
    po_count: v.poCount,
    total_spend: v.totalSpend,
    completion_rate: v.completionRate,
  }));

  const exportColumns = [
    { key: "vendor_code", header: "Vendor Code" },
    { key: "vendor_name", header: "Vendor Name" },
    { key: "po_count", header: "PO Count" },
    { key: "total_spend", header: "Total Spend", format: (v: number) => formatCurrency(v) },
    { key: "completion_rate", header: "Completion %", format: (v: number) => `${v}%` },
  ];

  return (
    <div className="p-6 space-y-4">
      <PageHeader
        title="Vendor Performance Report"
        description="Analyze vendor delivery and spending metrics"
        breadcrumbs={[
          { label: "Inventory", href: "/app/inventory" },
          { label: "Reports", href: "/app/inventory/reports" },
          { label: "Vendor Performance" },
        ]}
        actions={
          <ReportExportButton data={exportData} columns={exportColumns} filename="vendor-performance" title="Vendor Performance Report" />
        }
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><Users className="h-4 w-4" />Total Vendors</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{vendors?.length || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><ShoppingCart className="h-4 w-4" />Total POs</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{vendors?.reduce((s, v) => s + v.poCount, 0) || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><DollarSign className="h-4 w-4" />Total Spend</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{formatCurrency(totalSpend)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><Clock className="h-4 w-4" />Avg Completion</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{avgCompletion}%</div></CardContent>
        </Card>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Top 10 Vendors by Spend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(v) => `Rs.${(v / 1000).toFixed(0)}K`} />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="spend" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Vendor Details ({filtered.length})</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search vendors..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead><TableHead>Vendor</TableHead>
                <TableHead className="text-right">POs</TableHead><TableHead className="text-right">Total Spend</TableHead>
                <TableHead className="text-right">Completion %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map(v => (
                <TableRow key={v.id}>
                  <TableCell className="font-mono">{v.code}</TableCell>
                  <TableCell>{v.name}</TableCell>
                  <TableCell className="text-right">{v.poCount}</TableCell>
                  <TableCell className="text-right">{formatCurrency(v.totalSpend)}</TableCell>
                  <TableCell className="text-right">{v.completionRate}%</TableCell>
                </TableRow>
              ))}
              {!paged.length && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No vendor data</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1 text-sm border rounded-md disabled:opacity-50">Previous</button>
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="px-3 py-1 text-sm border rounded-md disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
