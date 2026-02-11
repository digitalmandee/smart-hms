import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/PageHeader";
import { StoreSelector } from "@/components/inventory/StoreSelector";
import { ArrowLeft, Save, Plus, Trash2, Package, Loader2 } from "lucide-react";
import { useInventoryItems } from "@/hooks/useInventory";
import { useCreateTransfer } from "@/hooks/useStoreTransfers";
import { useAuth } from "@/contexts/AuthContext";

interface LocalTransferItem {
  id: string;
  item_id: string;
  item_name: string;
  quantity_requested: number;
  unit: string;
}

export default function TransferFormPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: items } = useInventoryItems();
  const createTransfer = useCreateTransfer();

  const [fromStore, setFromStore] = useState("");
  const [toStore, setToStore] = useState("");
  const [notes, setNotes] = useState("");
  const [transferItems, setTransferItems] = useState<LocalTransferItem[]>([]);

  const addItem = () => {
    setTransferItems((prev) => [...prev, { id: crypto.randomUUID(), item_id: "", item_name: "", quantity_requested: 1, unit: "" }]);
  };

  const removeItem = (id: string) => setTransferItems((prev) => prev.filter((i) => i.id !== id));

  const updateItem = (id: string, field: keyof LocalTransferItem, value: string | number) => {
    setTransferItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (field === "item_id") {
          const sel = items?.find((i) => i.id === value);
          return { ...item, item_id: value as string, item_name: sel?.name || "", unit: sel?.unit_of_measure || "" };
        }
        return { ...item, [field]: value };
      })
    );
  };

  const onSubmit = async () => {
    if (!fromStore || !toStore || fromStore === toStore) return;
    const valid = transferItems.filter((i) => i.item_id && i.quantity_requested > 0);
    if (valid.length === 0) return;

    try {
      const result = await createTransfer.mutateAsync({
        from_store_id: fromStore,
        to_store_id: toStore,
        notes,
        items: valid.map((i) => ({
          item_id: i.item_id,
          quantity_requested: i.quantity_requested,
          quantity_sent: 0,
          quantity_received: 0,
        })),
      });
      navigate(`/app/inventory/transfers/${result.id}`);
    } catch { /* handled */ }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="New Inter-Store Transfer" description="Transfer stock between warehouses" />
      <Button variant="outline" onClick={() => navigate("/app/inventory/transfers")}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card>
        <CardHeader><CardTitle>Transfer Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>From Warehouse *</Label>
            <StoreSelector branchId={profile?.branch_id || undefined} value={fromStore || "all"} onChange={(v) => setFromStore(v === "all" ? "" : v)} placeholder="Source warehouse" />
          </div>
          <div>
            <Label>To Warehouse *</Label>
            <StoreSelector branchId={profile?.branch_id || undefined} value={toStore || "all"} onChange={(v) => setToStore(v === "all" ? "" : v)} placeholder="Destination warehouse" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" /> Items</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addItem}><Plus className="mr-2 h-4 w-4" /> Add Item</Button>
        </CardHeader>
        <CardContent>
          {transferItems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Item *</TableHead>
                  <TableHead className="w-32">Quantity *</TableHead>
                  <TableHead className="w-24">Unit</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transferItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Select value={item.item_id} onValueChange={(v) => updateItem(item.id, "item_id", v)}>
                        <SelectTrigger><SelectValue placeholder="Select item" /></SelectTrigger>
                        <SelectContent>
                          {items?.map((inv) => (
                            <SelectItem key={inv.id} value={inv.id}>{inv.item_code} - {inv.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input type="number" min="1" value={item.quantity_requested} onChange={(e) => updateItem(item.id, "quantity_requested", Number(e.target.value))} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.unit || "—"}</TableCell>
                    <TableCell>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No items added. Click "Add Item" to start.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
        <CardContent>
          <Textarea placeholder="Transfer notes..." value={notes} onChange={(e) => setNotes(e.target.value)} />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate("/app/inventory/transfers")}>Cancel</Button>
        <Button onClick={onSubmit} disabled={createTransfer.isPending || !fromStore || !toStore || fromStore === toStore || transferItems.length === 0}>
          {createTransfer.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" /> Create Transfer
        </Button>
      </div>
    </div>
  );
}
