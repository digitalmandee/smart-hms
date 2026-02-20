import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StoreSelector } from "@/components/inventory/StoreSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useBinAssignments } from "@/hooks/useWarehouseBins";

export default function BinAssignmentsPage() {
  const [storeId, setStoreId] = useState("");
  const { data: assignments, isLoading } = useBinAssignments(storeId);

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
              <TableHeader><TableRow><TableHead>Bin</TableHead><TableHead>Item ID</TableHead><TableHead>Quantity</TableHead><TableHead>Assigned At</TableHead></TableRow></TableHeader>
              <TableBody>
                {assignments?.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-mono">{a.bin?.bin_code || "—"}</TableCell>
                    <TableCell>{a.item_id || a.medicine_id || "—"}</TableCell>
                    <TableCell>{a.quantity}</TableCell>
                    <TableCell>{new Date(a.assigned_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {!assignments?.length && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No assignments found</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
