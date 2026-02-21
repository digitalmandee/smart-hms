import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReportExportButton } from "@/components/reports/ReportExportButton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Search, TrendingUp, Package, ArrowUpDown } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const queryTable = (table: string): any => (supabase as any).from(table);

export default function FastMovingReport() {
  const { profile } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const perPage = 20;

  const { data: fastMovers, isLoading } = useQuery({
    queryKey: ["fast-moving", profile?.organization_id],
    queryFn: async () => {
      // Get all GRN items (received)
      const { data: grnItems } = await queryTable("grn_items")
        .select("item_id, quantity_accepted, grn:goods_received_notes!inner(organization_id)")
        .eq("grn.organization_id", profile!.organization_id);

      // Get all requisition items (issued)
      const { data: reqItems } = await queryTable("stock_requisition_items")
        .select("item_id, quantity_approved, requisition:stock_requisitions!inner(organization_id)")
        .eq("requisition.organization_id", profile!.organization_id);

      // Get item details
      const { data: items } = await queryTable("inventory_items")
        .select("id, name, item_code")
        .eq("organization_id", profile!.organization_id);

      const itemMap: Record<string, { name: string; code: string; totalReceived: number; totalIssued: number }> = {};

      (items || []).forEach((item: any) => {
        itemMap[item.id] = { name: item.name, code: item.item_code, totalReceived: 0, totalIssued: 0 };
      });

      (grnItems || []).forEach((g: any) => {
        if (itemMap[g.item_id]) {
          itemMap[g.item_id].totalReceived += g.quantity_accepted || 0;
        }
      });

      (reqItems || []).forEach((r: any) => {
        if (itemMap[r.item_id]) {
          itemMap[r.item_id].totalIssued += r.quantity_approved || 0;
        }
      });

      return Object.entries(itemMap)
        .map(([id, data]) => ({
          id,
          ...data,
          totalMovement: data.totalReceived + data.totalIssued,
        }))
        .filter(item => item.totalMovement > 0)
        .sort((a, b) => b.totalMovement - a.totalMovement);
    },
    enabled: !!profile?.organization_id,
  });

  const filtered = fastMovers?.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.code.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const paged = filtered.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const chartData = (filtered || []).slice(0, 10).map(m => ({
    name: m.code.slice(0, 12),
    received: m.totalReceived,
    issued: m.totalIssued,
  }));

  const exportData = filtered.map(m => ({
    item_code: m.code,
    item_name: m.name,
    total_received: m.totalReceived,
    total_issued: m.totalIssued,
    total_movement: m.totalMovement,
  }));

  const exportColumns = [
    { key: "item_code", header: "Item Code" },
    { key: "item_name", header: "Item Name" },
    { key: "total_received", header: "Total Received" },
    { key: "total_issued", header: "Total Issued" },
    { key: "total_movement", header: "Total Movement" },
  ];

  return (
    <div className="p-6 space-y-4">
      <PageHeader
        title="Fast Moving Items Report"
        description="Top items by movement frequency"
        breadcrumbs={[
          { label: "Inventory", href: "/app/inventory" },
          { label: "Reports", href: "/app/inventory/reports" },
          { label: "Fast Moving" },
        ]}
        actions={
          <ReportExportButton data={exportData} columns={exportColumns} filename="fast-moving-items" title="Fast Moving Items Report" />
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><TrendingUp className="h-4 w-4" />Active Items</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{filtered.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><Package className="h-4 w-4" />Total Received</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{filtered.reduce((s, m) => s + m.totalReceived, 0).toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><ArrowUpDown className="h-4 w-4" />Total Issued</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{filtered.reduce((s, m) => s + m.totalIssued, 0).toLocaleString()}</div></CardContent>
        </Card>
      </div>

      {chartData.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Top 10 Items by Movement</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="received" fill="hsl(var(--primary))" name="Received" />
                <Bar dataKey="issued" fill="hsl(var(--destructive))" name="Issued" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Item Movement Details ({filtered.length})</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search items..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? <p className="text-muted-foreground">Loading...</p> : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Code</TableHead><TableHead>Item Name</TableHead>
                    <TableHead className="text-right">Received</TableHead>
                    <TableHead className="text-right">Issued</TableHead>
                    <TableHead className="text-right">Total Movement</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.map(m => (
                    <TableRow key={m.id}>
                      <TableCell className="font-mono">{m.code}</TableCell>
                      <TableCell>{m.name}</TableCell>
                      <TableCell className="text-right">{m.totalReceived}</TableCell>
                      <TableCell className="text-right">{m.totalIssued}</TableCell>
                      <TableCell className="text-right font-semibold">{m.totalMovement}</TableCell>
                    </TableRow>
                  ))}
                  {!paged.length && (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No movement data</TableCell></TableRow>
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
