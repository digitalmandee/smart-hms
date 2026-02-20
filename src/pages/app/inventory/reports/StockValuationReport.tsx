import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Download } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const queryTable = (table: string): any => (supabase as any).from(table);

export default function StockValuationReport() {
  const { profile } = useAuth();

  const { data: stocks, isLoading } = useQuery({
    queryKey: ["stock-valuation", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await queryTable("store_stock")
        .select("*, item:inventory_items(name, item_code, category_id)")
        .eq("organization_id", profile!.organization_id)
        .gt("quantity", 0)
        .order("quantity", { ascending: false });
      if (error) throw error;
      return data as Array<{
        id: string; quantity: number; unit_cost: number; total_value: number;
        batch_number: string | null;
        item: { name: string; item_code: string; category_id: string | null } | null;
      }>;
    },
    enabled: !!profile?.organization_id,
  });

  const totalValue = stocks?.reduce((sum, s) => sum + (s.total_value || s.quantity * (s.unit_cost || 0)), 0) || 0;

  const exportCSV = () => {
    if (!stocks) return;
    const rows = [["Item Code", "Item Name", "Batch", "Qty", "Unit Cost", "Total Value"]];
    stocks.forEach((s) => {
      rows.push([
        s.item?.item_code || "", s.item?.name || "", s.batch_number || "",
        String(s.quantity), String(s.unit_cost || 0), String(s.total_value || s.quantity * (s.unit_cost || 0)),
      ]);
    });
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "stock-valuation.csv"; a.click();
  };

  return (
    <div className="p-6 space-y-4">
      <PageHeader title="Stock Valuation Report" description="Current inventory value by FIFO method"
        breadcrumbs={[{ label: "Inventory", href: "/app/inventory" }, { label: "Reports", href: "/app/inventory/reports" }, { label: "Valuation" }]}
        actions={<Button variant="outline" onClick={exportCSV}><Download className="h-4 w-4 mr-2" />Export CSV</Button>}
      />
      <Card>
        <CardHeader><CardTitle>Total Inventory Value: Rs. {totalValue.toLocaleString()}</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <p className="text-muted-foreground">Loading...</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Code</TableHead><TableHead>Item Name</TableHead><TableHead>Batch</TableHead>
                  <TableHead className="text-right">Qty</TableHead><TableHead className="text-right">Unit Cost</TableHead>
                  <TableHead className="text-right">Total Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stocks?.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono">{s.item?.item_code || "—"}</TableCell>
                    <TableCell>{s.item?.name || "—"}</TableCell>
                    <TableCell>{s.batch_number || "—"}</TableCell>
                    <TableCell className="text-right">{s.quantity}</TableCell>
                    <TableCell className="text-right">Rs. {(s.unit_cost || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-right font-semibold">Rs. {(s.total_value || s.quantity * (s.unit_cost || 0)).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                {!stocks?.length && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No stock data</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
