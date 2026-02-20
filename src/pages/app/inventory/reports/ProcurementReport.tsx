import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const queryTable = (table: string): any => (supabase as any).from(table);

export default function ProcurementReport() {
  const { profile } = useAuth();

  const { data: pos } = useQuery({
    queryKey: ["procurement-pos", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await queryTable("purchase_orders")
        .select("*, vendor:vendors(name)")
        .eq("organization_id", profile!.organization_id)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as Array<{
        id: string; po_number: string; status: string; total_amount: number;
        created_at: string; vendor: { name: string } | null;
      }>;
    },
    enabled: !!profile?.organization_id,
  });

  const vendorTotals = (() => {
    const map: Record<string, number> = {};
    pos?.forEach((po) => {
      const name = po.vendor?.name || "Unknown";
      map[name] = (map[name] || 0) + (po.total_amount || 0);
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name: name.slice(0, 15), value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  })();

  const totalSpend = pos?.reduce((sum, po) => sum + (po.total_amount || 0), 0) || 0;
  const approvedCount = pos?.filter((po) => po.status === "approved" || po.status === "completed").length || 0;
  const fulfillmentRate = pos?.length ? Math.round((approvedCount / pos.length) * 100) : 0;

  return (
    <div className="p-6 space-y-4">
      <PageHeader title="Procurement Report" description="Purchase analysis by vendor and category"
        breadcrumbs={[{ label: "Inventory", href: "/app/inventory" }, { label: "Reports", href: "/app/inventory/reports" }, { label: "Procurement" }]}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total POs</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{pos?.length || 0}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Spend</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">Rs. {totalSpend.toLocaleString()}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Fulfillment Rate</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{fulfillmentRate}%</div></CardContent></Card>
      </div>
      {vendorTotals.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Top Vendors by Spend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={vendorTotals} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => `Rs. ${v.toLocaleString()}`} /><Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader><CardTitle>Recent Purchase Orders</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>PO #</TableHead><TableHead>Vendor</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
            <TableBody>
              {pos?.slice(0, 20).map((po) => (
                <TableRow key={po.id}>
                  <TableCell className="font-mono">{po.po_number}</TableCell>
                  <TableCell>{po.vendor?.name || "—"}</TableCell>
                  <TableCell><Badge variant="outline">{po.status}</Badge></TableCell>
                  <TableCell className="text-right">Rs. {(po.total_amount || 0).toLocaleString()}</TableCell>
                  <TableCell>{new Date(po.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {!pos?.length && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No purchase orders</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
