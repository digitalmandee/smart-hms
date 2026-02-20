import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StoreSelector } from "@/components/inventory/StoreSelector";
import { useCreatePickList } from "@/hooks/usePickingPackingMutations";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PickItem {
  key: string;
  item_id: string;
  quantity_required: number;
  batch_number: string;
  pick_sequence: number;
}

export default function PickListFormPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const createPickList = useCreatePickList();
  const [storeId, setStoreId] = useState("");
  const [strategy, setStrategy] = useState("fifo");
  const [priority, setPriority] = useState(1);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<PickItem[]>([
    { key: crypto.randomUUID(), item_id: "", quantity_required: 1, batch_number: "", pick_sequence: 1 },
  ]);

  const { data: inventoryItems } = useQuery({
    queryKey: ["inventory-items-for-pick", profile?.organization_id],
    queryFn: async () => {
      const { data } = await supabase
        .from("inventory_items")
        .select("id, item_code, name, unit_of_measure")
        .eq("organization_id", profile!.organization_id!)
        .eq("is_active", true)
        .order("name");
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  const addItem = () => {
    setItems([...items, {
      key: crypto.randomUUID(),
      item_id: "",
      quantity_required: 1,
      batch_number: "",
      pick_sequence: items.length + 1,
    }]);
  };

  const removeItem = (key: string) => {
    setItems(items.filter((i) => i.key !== key));
  };

  const updateItem = (key: string, field: keyof PickItem, value: string | number) => {
    setItems(items.map((i) => i.key === key ? { ...i, [field]: value } : i));
  };

  const handleSubmit = async () => {
    if (!storeId) return;
    await createPickList.mutateAsync({
      store_id: storeId,
      pick_strategy: strategy,
      priority,
      notes: notes || undefined,
      items: items.map((i) => ({
        item_id: i.item_id || undefined,
        quantity_required: i.quantity_required,
        batch_number: i.batch_number || undefined,
        pick_sequence: i.pick_sequence,
      })),
    });
    navigate("/app/inventory/picking");
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Create Pick List"
        breadcrumbs={[
          { label: "Inventory", href: "/app/inventory" },
          { label: "Pick Lists", href: "/app/inventory/picking" },
          { label: "New" },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate("/app/inventory/picking")}>
            <ArrowLeft className="h-4 w-4 mr-2" />Back
          </Button>
        }
      />
      <div className="grid gap-4">
        <Card>
          <CardHeader><CardTitle>Pick List Details</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Warehouse *</Label>
              <StoreSelector value={storeId} onChange={setStoreId} className="w-full" />
            </div>
            <div className="space-y-2">
              <Label>Pick Strategy</Label>
              <Select value={strategy} onValueChange={setStrategy}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fifo">FIFO</SelectItem>
                  <SelectItem value="fefo">FEFO</SelectItem>
                  <SelectItem value="zone">Zone-Based</SelectItem>
                  <SelectItem value="wave">Wave Pick</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={String(priority)} onValueChange={(v) => setPriority(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Low</SelectItem>
                  <SelectItem value="2">2 - Medium</SelectItem>
                  <SelectItem value="3">3 - High</SelectItem>
                  <SelectItem value="4">4 - Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
              <Label>Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={1} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Items</CardTitle>
            <Button variant="outline" size="sm" onClick={addItem}>
              <Plus className="h-4 w-4 mr-1" />Add Item
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Seq</TableHead>
                  <TableHead className="min-w-[200px]">Item *</TableHead>
                  <TableHead>Qty Required</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.key}>
                    <TableCell>
                      <Input type="number" min={1} value={item.pick_sequence}
                        onChange={(e) => updateItem(item.key, "pick_sequence", Number(e.target.value))}
                        className="w-20" />
                    </TableCell>
                    <TableCell>
                      <Select value={item.item_id} onValueChange={(v) => updateItem(item.key, "item_id", v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select item" />
                        </SelectTrigger>
                        <SelectContent>
                          {inventoryItems?.map((inv) => (
                            <SelectItem key={inv.id} value={inv.id}>
                              {inv.item_code} - {inv.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input type="number" min={1} value={item.quantity_required}
                        onChange={(e) => updateItem(item.key, "quantity_required", Number(e.target.value))}
                        className="w-24" />
                    </TableCell>
                    <TableCell>
                      <Input value={item.batch_number} placeholder="Optional"
                        onChange={(e) => updateItem(item.key, "batch_number", e.target.value)} />
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
          <Button variant="outline" onClick={() => navigate("/app/inventory/picking")}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!storeId || createPickList.isPending}>
            {createPickList.isPending ? "Creating..." : "Create Pick List"}
          </Button>
        </div>
      </div>
    </div>
  );
}
