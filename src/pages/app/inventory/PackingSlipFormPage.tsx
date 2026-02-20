import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StoreSelector } from "@/components/inventory/StoreSelector";
import { useCreatePackingSlip } from "@/hooks/usePickingPackingMutations";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface PackItem {
  key: string;
  quantity: number;
  batch_number: string;
  box_number: number;
  notes: string;
}

export default function PackingSlipFormPage() {
  const navigate = useNavigate();
  const createSlip = useCreatePackingSlip();
  const [storeId, setStoreId] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<PackItem[]>([
    { key: crypto.randomUUID(), quantity: 1, batch_number: "", box_number: 1, notes: "" },
  ]);

  const addItem = () => {
    setItems([...items, {
      key: crypto.randomUUID(), quantity: 1, batch_number: "", box_number: 1, notes: "",
    }]);
  };

  const removeItem = (key: string) => setItems(items.filter((i) => i.key !== key));

  const updateItem = (key: string, field: keyof PackItem, value: string | number) => {
    setItems(items.map((i) => i.key === key ? { ...i, [field]: value } : i));
  };

  const handleSubmit = async () => {
    if (!storeId) return;
    await createSlip.mutateAsync({
      store_id: storeId,
      notes: notes || undefined,
      items: items.map((i) => ({
        quantity: i.quantity,
        batch_number: i.batch_number || undefined,
        box_number: i.box_number,
        notes: i.notes || undefined,
      })),
    });
    navigate("/app/inventory/packing");
  };

  return (
    <div className="p-6">
      <PageHeader title="Create Packing Slip"
        breadcrumbs={[
          { label: "Inventory", href: "/app/inventory" },
          { label: "Packing Slips", href: "/app/inventory/packing" },
          { label: "New" },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate("/app/inventory/packing")}>
            <ArrowLeft className="h-4 w-4 mr-2" />Back
          </Button>
        }
      />
      <div className="grid gap-4">
        <Card>
          <CardHeader><CardTitle>Packing Slip Details</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Warehouse *</Label>
              <StoreSelector value={storeId} onChange={setStoreId} className="w-full" />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={1} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Items</CardTitle>
            <Button variant="outline" size="sm" onClick={addItem}><Plus className="h-4 w-4 mr-1" />Add Item</Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Box #</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.key}>
                    <TableCell>
                      <Input type="number" min={1} value={item.box_number} className="w-20"
                        onChange={(e) => updateItem(item.key, "box_number", Number(e.target.value))} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" min={1} value={item.quantity} className="w-24"
                        onChange={(e) => updateItem(item.key, "quantity", Number(e.target.value))} />
                    </TableCell>
                    <TableCell>
                      <Input value={item.batch_number} placeholder="Optional"
                        onChange={(e) => updateItem(item.key, "batch_number", e.target.value)} />
                    </TableCell>
                    <TableCell>
                      <Input value={item.notes} placeholder="Optional"
                        onChange={(e) => updateItem(item.key, "notes", e.target.value)} />
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => removeItem(item.key)} disabled={items.length === 1}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => navigate("/app/inventory/packing")}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!storeId || createSlip.isPending}>
            {createSlip.isPending ? "Creating..." : "Create Packing Slip"}
          </Button>
        </div>
      </div>
    </div>
  );
}
