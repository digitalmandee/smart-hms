import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ReportExportButton } from "@/components/reports/ReportExportButton";
import { formatCurrency } from "@/lib/exportUtils";
import { Search } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const queryTable = (table: string): any => (supabase as any).from(table);

export default function ProcurementReport() {
  const { profile } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const perPage = 20;

  const { data: pos } = useQuery({
    queryKey: ["procurement-pos", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await queryTable("purchase_orders")
        .select("*, vendor:vendors(name)")
        .eq("organization_id", profile!.organization_id)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as Array<{
        id: string; po_number: string; status: string; total_amount: number;
        created_at: string; vendor: { name: string } | null;
      }>;
    },
    enabled: !!profile?.organization_id,
  });

  const filtered = pos?.filter(po =>
    po.po_number.toLowerCase().includes(search.toLowerCase()) ||
    (po.vendor?.name || "").toLowerCase().includes(search.toLowerCase())
  ) || [];

  const paged = filtered.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const vendorTotals = (() => {
    const map: Record<string, number> = {};
    filtered.forEach((po) => {
      const name = po.vendor?.name || "Unknown";
      map[name] = (map[name] || 0) + (po.total_amount || 0);
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name: name.slice(0, 15), value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  })();

  const totalSpend = filtered.reduce((sum, po) => sum + (po.total_amount || 0), 0);
  const approvedCount = filtered.filter((po) => po.status === "approved" || po.status === "completed").length;
  const fulfillmentRate = filtered.length ? Math.round((approvedCount / filtered.length) * 100) : 0;

  const exportData = filtered.map(po => ({
    po_number: po.po_number,
    vendor: po.vendor?.name || "—",
    status: po.status,
    amount: po.total_amount || 0,
    date: new Date(po.created_at).toLocaleDateString(),
  }));

  const exportColumns = [
    { key: "po_number", header: "PO #" },
    { key: "vendor", header: "Vendor" },
    { key: "status", header: "Status" },
    { key: "amount", header: "Amount", format: (v: number) => formatCurrency(v) },
    { key: "date", header: "Date" },
  ];

  return (
    <div className="p-6 space-y-4">
      <PageHeader title="Procurement Report" description="Purchase analysis by vendor and category"
        breadcrumbs={[{ label: "Inventory", href: "/app/inventory" }, { label: "Reports", href: "/app/inventory/reports" }, { label: "Procurement" }]}
        actions={
          <ReportExportButton data={exportData} columns={exportColumns} filename="procurement-report" title="Procurement Report" />
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total POs</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{filtered.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Spend</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(totalSpend)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Fulfillment Rate</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{fulfillmentRate}%</div></CardContent></Card>
      </div>
      {vendorTotals.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Top Vendors by Spend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={vendorTotals} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} /><Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Purchase Orders ({filtered.length})</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search POs..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>PO #</TableHead><TableHead>Vendor</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
            <TableBody>
              {paged.map((po) => (
                <TableRow key={po.id}>
                  <TableCell className="font-mono">{po.po_number}</TableCell>
                  <TableCell>{po.vendor?.name || "—"}</TableCell>
                  <TableCell><Badge variant="outline">{po.status}</Badge></TableCell>
                  <TableCell className="text-right">{formatCurrency(po.total_amount || 0)}</TableCell>
                  <TableCell>{new Date(po.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {!paged.length && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No purchase orders</TableCell></TableRow>}
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
