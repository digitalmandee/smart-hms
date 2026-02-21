import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReportExportButton } from "@/components/reports/ReportExportButton";
import { formatCurrency } from "@/lib/exportUtils";
import { Search, Package, DollarSign, AlertTriangle } from "lucide-react";
import { format, subDays } from "date-fns";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const queryTable = (table: string): any => (supabase as any).from(table);

export default function DeadStockReport() {
  const { profile } = useAuth();
  const [days, setDays] = useState("90");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const perPage = 20;

  const cutoffDate = format(subDays(new Date(), Number(days)), "yyyy-MM-dd");

  const { data: deadStock, isLoading } = useQuery({
    queryKey: ["dead-stock", profile?.organization_id, days],
    queryFn: async () => {
      // Get all stock items
      const { data: stocks, error } = await queryTable("inventory_stock")
        .select("id, item_id, quantity, unit_cost, store_id, item:inventory_items!inner(name, item_code, organization_id), store:stores(name)")
        .eq("item.organization_id", profile!.organization_id)
        .gt("quantity", 0);
      if (error) throw error;

      // Get items with recent GRN activity
      const { data: recentGrns } = await queryTable("grn_items")
        .select("item_id, grn:goods_received_notes!inner(received_date, organization_id)")
        .eq("grn.organization_id", profile!.organization_id)
        .gte("grn.received_date", cutoffDate);

      // Get items with recent requisition activity
      const { data: recentReqs } = await queryTable("stock_requisition_items")
        .select("item_id, requisition:stock_requisitions!inner(created_at, organization_id)")
        .eq("requisition.organization_id", profile!.organization_id)
        .gte("requisition.created_at", cutoffDate);

      const activeItemIds = new Set([
        ...(recentGrns || []).map((g: any) => g.item_id),
        ...(recentReqs || []).map((r: any) => r.item_id),
      ]);

      return (stocks || [])
        .filter((s: any) => !activeItemIds.has(s.item_id))
        .map((s: any) => ({
          id: s.id,
          itemCode: s.item?.item_code || "—",
          itemName: s.item?.name || "—",
          store: s.store?.name || "—",
          quantity: s.quantity,
          unitCost: s.unit_cost || 0,
          value: s.quantity * (s.unit_cost || 0),
        }))
        .sort((a: any, b: any) => b.value - a.value);
    },
    enabled: !!profile?.organization_id,
  });

  const filtered = deadStock?.filter((s: any) =>
    s.itemName.toLowerCase().includes(search.toLowerCase()) ||
    s.itemCode.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const paged = filtered.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);
  const totalValue = filtered.reduce((s: number, i: any) => s + i.value, 0);
  const totalItems = filtered.length;

  const exportData = filtered.map((s: any) => ({
    item_code: s.itemCode,
    item_name: s.itemName,
    store: s.store,
    quantity: s.quantity,
    unit_cost: s.unitCost,
    total_value: s.value,
  }));

  const exportColumns = [
    { key: "item_code", header: "Item Code" },
    { key: "item_name", header: "Item Name" },
    { key: "store", header: "Store" },
    { key: "quantity", header: "Qty" },
    { key: "unit_cost", header: "Unit Cost", format: (v: number) => formatCurrency(v) },
    { key: "total_value", header: "Total Value", format: (v: number) => formatCurrency(v) },
  ];

  return (
    <div className="p-6 space-y-4">
      <PageHeader
        title="Dead Stock Report"
        description={`Items with no movement in last ${days} days`}
        breadcrumbs={[
          { label: "Inventory", href: "/app/inventory" },
          { label: "Reports", href: "/app/inventory/reports" },
          { label: "Dead Stock" },
        ]}
        actions={
          <div className="flex gap-2">
            <Select value={days} onValueChange={(v) => { setDays(v); setPage(0); }}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="60">Last 60 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="180">Last 180 days</SelectItem>
              </SelectContent>
            </Select>
            <ReportExportButton data={exportData} columns={exportColumns} filename="dead-stock" title="Dead Stock Report" />
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-900 dark:bg-orange-950/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Dead Stock Items</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-orange-600">{totalItems}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><DollarSign className="h-4 w-4" />Dead Stock Value</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{formatCurrency(totalValue)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><Package className="h-4 w-4" />No Movement Since</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{cutoffDate}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Dead Stock Items</CardTitle>
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
                    <TableHead>Store</TableHead><TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Cost</TableHead><TableHead className="text-right">Total Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.map((s: any) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono">{s.itemCode}</TableCell>
                      <TableCell>{s.itemName}</TableCell>
                      <TableCell>{s.store}</TableCell>
                      <TableCell className="text-right">{s.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(s.unitCost)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(s.value)}</TableCell>
                    </TableRow>
                  ))}
                  {!paged.length && (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No dead stock found</TableCell></TableRow>
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
