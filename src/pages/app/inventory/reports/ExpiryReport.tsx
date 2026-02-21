import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { addDays, format } from "date-fns";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const queryTable = (table: string): any => (supabase as any).from(table);

export default function ExpiryReport() {
  const { profile } = useAuth();
  const [days, setDays] = useState("30");

  const cutoff = format(addDays(new Date(), Number(days)), "yyyy-MM-dd");

  const { data: stocks, isLoading } = useQuery({
    queryKey: ["expiry-report", profile?.organization_id, days],
    queryFn: async () => {
      const { data, error } = await queryTable("inventory_stock")
        .select("*, item:inventory_items!inner(name, item_code, organization_id), store:stores(name)")
        .eq("item.organization_id", profile!.organization_id)
        .gt("quantity", 0)
        .not("expiry_date", "is", null)
        .lte("expiry_date", cutoff)
        .order("expiry_date");
      if (error) throw error;
      return data as Array<{
        id: string; quantity: number; batch_number: string | null; expiry_date: string;
        item: { name: string; item_code: string; organization_id: string } | null;
        store: { name: string } | null;
      }>;
    },
    enabled: !!profile?.organization_id,
  });

  const getUrgency = (expiryDate: string) => {
    const diff = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff <= 0) return { label: "Expired", variant: "destructive" as const };
    if (diff <= 30) return { label: `${diff}d`, variant: "destructive" as const };
    if (diff <= 60) return { label: `${diff}d`, variant: "default" as const };
    return { label: `${diff}d`, variant: "outline" as const };
  };

  return (
    <div className="p-6 space-y-4">
      <PageHeader title="Expiry Report" description="Items expiring soon"
        breadcrumbs={[{ label: "Inventory", href: "/app/inventory" }, { label: "Reports", href: "/app/inventory/reports" }, { label: "Expiry" }]}
        actions={
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Within 30 days</SelectItem>
              <SelectItem value="60">Within 60 days</SelectItem>
              <SelectItem value="90">Within 90 days</SelectItem>
              <SelectItem value="180">Within 180 days</SelectItem>
            </SelectContent>
          </Select>
        }
      />
      <Card>
        <CardHeader><CardTitle>Expiring Items ({stocks?.length || 0})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <p className="text-muted-foreground">Loading...</p> : (
            <Table>
              <TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Batch</TableHead><TableHead>Store</TableHead><TableHead className="text-right">Qty</TableHead><TableHead>Expiry</TableHead><TableHead>Urgency</TableHead></TableRow></TableHeader>
              <TableBody>
                {stocks?.map((s) => {
                  const urgency = getUrgency(s.expiry_date);
                  return (
                    <TableRow key={s.id}>
                      <TableCell>{s.item?.name || "—"}</TableCell>
                      <TableCell className="font-mono">{s.batch_number || "—"}</TableCell>
                      <TableCell>{s.store?.name || "—"}</TableCell>
                      <TableCell className="text-right">{s.quantity}</TableCell>
                      <TableCell>{s.expiry_date}</TableCell>
                      <TableCell><Badge variant={urgency.variant}>{urgency.label}</Badge></TableCell>
                    </TableRow>
                  );
                })}
                {!stocks?.length && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No expiring items</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
