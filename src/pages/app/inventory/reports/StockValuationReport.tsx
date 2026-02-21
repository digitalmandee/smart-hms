import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReportExportButton } from "@/components/reports/ReportExportButton";
import { formatCurrency } from "@/lib/exportUtils";
import { Search } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const queryTable = (table: string): any => (supabase as any).from(table);

export default function StockValuationReport() {
  const { profile } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const perPage = 25;

  const { data: stocks, isLoading } = useQuery({
    queryKey: ["stock-valuation", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await queryTable("inventory_stock")
        .select("*, item:inventory_items!inner(name, item_code, category_id, organization_id)")
        .eq("item.organization_id", profile!.organization_id)
        .gt("quantity", 0)
        .order("quantity", { ascending: false });
      if (error) throw error;
      return data as Array<{
        id: string; quantity: number; unit_cost: number;
        batch_number: string | null;
        item: { name: string; item_code: string; category_id: string | null; organization_id: string } | null;
      }>;
    },
    enabled: !!profile?.organization_id,
  });

  const filtered = stocks?.filter(s =>
    (s.item?.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.item?.item_code || "").toLowerCase().includes(search.toLowerCase())
  ) || [];

  const paged = filtered.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);
  const totalValue = filtered.reduce((sum, s) => sum + s.quantity * (s.unit_cost || 0), 0);

  const exportData = filtered.map((s) => ({
    item_code: s.item?.item_code || "",
    item_name: s.item?.name || "",
    batch: s.batch_number || "",
    quantity: s.quantity,
    unit_cost: s.unit_cost || 0,
    total_value: s.quantity * (s.unit_cost || 0),
  }));

  const exportColumns = [
    { key: "item_code", header: "Item Code" },
    { key: "item_name", header: "Item Name" },
    { key: "batch", header: "Batch" },
    { key: "quantity", header: "Qty" },
    { key: "unit_cost", header: "Unit Cost", format: (v: number) => formatCurrency(v) },
    { key: "total_value", header: "Total Value", format: (v: number) => formatCurrency(v) },
  ];

  return (
    <div className="p-6 space-y-4">
      <PageHeader title="Stock Valuation Report" description="Current inventory value by FIFO method"
        breadcrumbs={[{ label: "Inventory", href: "/app/inventory" }, { label: "Reports", href: "/app/inventory/reports" }, { label: "Valuation" }]}
        actions={
          <ReportExportButton data={exportData} columns={exportColumns} filename="stock-valuation" title="Stock Valuation Report" />
        }
      />
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Total Inventory Value: {formatCurrency(totalValue)}</CardTitle>
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
                    <TableHead>Item Code</TableHead><TableHead>Item Name</TableHead><TableHead>Batch</TableHead>
                    <TableHead className="text-right">Qty</TableHead><TableHead className="text-right">Unit Cost</TableHead>
                    <TableHead className="text-right">Total Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.map((s) => {
                    const value = s.quantity * (s.unit_cost || 0);
                    return (
                      <TableRow key={s.id}>
                        <TableCell className="font-mono">{s.item?.item_code || "—"}</TableCell>
                        <TableCell>{s.item?.name || "—"}</TableCell>
                        <TableCell>{s.batch_number || "—"}</TableCell>
                        <TableCell className="text-right">{s.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(s.unit_cost || 0)}</TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(value)}</TableCell>
                      </TableRow>
                    );
                  })}
                  {!paged.length && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No stock data</TableCell></TableRow>}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">Page {page + 1} of {totalPages} ({filtered.length} items)</p>
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
