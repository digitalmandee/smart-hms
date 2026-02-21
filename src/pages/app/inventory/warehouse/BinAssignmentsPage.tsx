import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StoreSelector } from "@/components/inventory/StoreSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useBinAssignments } from "@/hooks/useWarehouseBins";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const queryTable = (table: string): any => (supabase as any).from(table);

function useItemNames(orgId?: string) {
  return useQuery({
    queryKey: ["inventory-items-names", orgId],
    queryFn: async () => {
      const { data, error } = await queryTable("inventory_items")
        .select("id, name, item_code, barcode")
        .eq("organization_id", orgId!);
      if (error) throw error;
      return data as { id: string; name: string; item_code: string; barcode: string | null }[];
    },
    enabled: !!orgId,
  });
}

export default function BinAssignmentsPage() {
  const [storeId, setStoreId] = useState("");
  const { profile } = useAuth();
  const { data: assignments, isLoading } = useBinAssignments(storeId);
  const { data: items } = useItemNames(profile?.organization_id);

  const getItemInfo = (itemId: string | null) => {
    if (!itemId || !items) return null;
    return items.find((i) => i.id === itemId);
  };

  return (
    <div className="p-6">
      <PageHeader title="Bin Assignments" description="View item-to-bin location assignments"
        breadcrumbs={[{ label: "Inventory", href: "/app/inventory" }, { label: "Bin Assignments" }]}
        actions={<StoreSelector value={storeId} onChange={setStoreId} showAll className="w-[220px]" />}
      />
      <Card>
        <CardHeader><CardTitle>Assignments {assignments?.length ? `(${assignments.length})` : ""}</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <p className="text-muted-foreground text-sm">Loading...</p> : (
            <Table>
              <TableHeader><TableRow><TableHead>Bin</TableHead><TableHead>Item Name</TableHead><TableHead>Item Code</TableHead><TableHead>Barcode</TableHead><TableHead>Quantity</TableHead><TableHead>Assigned At</TableHead></TableRow></TableHeader>
              <TableBody>
                {assignments?.map((a) => {
                  const item = getItemInfo(a.item_id);
                  return (
                    <TableRow key={a.id}>
                      <TableCell className="font-mono">{a.bin?.bin_code || "—"}</TableCell>
                      <TableCell>{item?.name || (a.medicine_id ? "Medicine" : "—")}</TableCell>
                      <TableCell className="font-mono text-sm">{item?.item_code || "—"}</TableCell>
                      <TableCell className="font-mono text-sm">{item?.barcode || "—"}</TableCell>
                      <TableCell>{a.quantity}</TableCell>
                      <TableCell>{new Date(a.assigned_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  );
                })}
                {!assignments?.length && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No assignments found</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
