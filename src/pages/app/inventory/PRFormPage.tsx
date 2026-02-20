import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/PageHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useCreatePurchaseRequest, type PurchaseRequestItem } from "@/hooks/usePurchaseRequests";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function PRFormPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const createMutation = useCreatePurchaseRequest();

  const [department, setDepartment] = useState("");
  const [priority, setPriority] = useState("0");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<PurchaseRequestItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState("");

  const { data: branches } = useQuery({
    queryKey: ["branches", profile?.organization_id],
    queryFn: async () => {
      const { data } = await supabase
        .from("branches")
        .select("id, name")
        .eq("organization_id", profile!.organization_id!);
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  const [branchId, setBranchId] = useState("");

  const { data: inventoryItems } = useQuery({
    queryKey: ["inventory-items-for-pr", profile?.organization_id],
    queryFn: async () => {
      const { data } = await supabase
        .from("inventory_items")
        .select("id, item_code, name, unit_of_measure, reorder_level")
        .eq("organization_id", profile!.organization_id!)
        .eq("is_active", true)
        .order("name");
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  const addItem = () => {
    if (!selectedItemId) return;
    const found = inventoryItems?.find((i) => i.id === selectedItemId);
    if (!found) return;
    if (items.some((i) => i.item_id === selectedItemId)) {
      toast.error("Item already added");
      return;
    }

    setItems([
      ...items,
      {
        item_id: found.id,
        quantity_requested: 1,
        current_stock: 0,
        reorder_level: found.reorder_level || 0,
        estimated_unit_cost: 0,
        item: {
          id: found.id,
          item_code: found.item_code,
          name: found.name,
          unit_of_measure: found.unit_of_measure,
        },
      },
    ]);
    setSelectedItemId("");
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: number) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    setItems(updated);
  };

  const handleSubmit = async () => {
    if (!branchId) {
      toast.error("Please select a branch");
      return;
    }
    if (items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    try {
      const pr = await createMutation.mutateAsync({
        branch_id: branchId,
        department: department || undefined,
        priority: parseInt(priority),
        notes: notes || undefined,
        items,
      });
      navigate(`/app/inventory/purchase-requests/${pr.id}`);
    } catch {
      // handled by mutation
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Purchase Request"
        description="Create a new purchase request for items"
      />

      <Button variant="outline" onClick={() => navigate("/app/inventory/purchase-requests")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Branch *</Label>
              <Select value={branchId} onValueChange={setBranchId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches?.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Department</Label>
              <Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Pharmacy, Surgery" />
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Normal</SelectItem>
                  <SelectItem value="1">Medium</SelectItem>
                  <SelectItem value="2">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Select value={selectedItemId} onValueChange={setSelectedItemId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select item to add" />
              </SelectTrigger>
              <SelectContent>
                {inventoryItems?.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.item_code} - {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={addItem} disabled={!selectedItemId}>
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="w-32">Qty Requested</TableHead>
                <TableHead className="w-32">Est. Unit Cost</TableHead>
                <TableHead className="w-32">Reorder Level</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.item?.name}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity_requested}
                      onChange={(e) => updateItem(index, "quantity_requested", parseFloat(e.target.value) || 0)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={item.estimated_unit_cost}
                      onChange={(e) => updateItem(index, "estimated_unit_cost", parseFloat(e.target.value) || 0)}
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.reorder_level}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => removeItem(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No items added yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate("/app/inventory/purchase-requests")}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={createMutation.isPending}>
          {createMutation.isPending ? "Creating..." : "Create Purchase Request"}
        </Button>
      </div>
    </div>
  );
}
