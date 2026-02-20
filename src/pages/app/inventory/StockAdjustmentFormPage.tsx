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
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { StoreSelector } from "@/components/inventory/StoreSelector";

export default function StockAdjustmentFormPage() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const queryClient = useQueryClient();

  const [itemId, setItemId] = useState("");
  const [storeId, setStoreId] = useState("");
  const [adjustmentType, setAdjustmentType] = useState("decrease");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [branchId, setBranchId] = useState("");

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

  const { data: items } = useQuery({
    queryKey: ["inventory-items-for-adj", profile?.organization_id],
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

  // Fetch current stock for selected item + store
  const { data: currentStockData } = useQuery({
    queryKey: ["current-stock-for-adj", itemId, storeId],
    queryFn: async () => {
      const { data } = await supabase
        .from("inventory_stock")
        .select("id, quantity")
        .eq("item_id", itemId)
        .eq("store_id", storeId);
      return data || [];
    },
    enabled: !!itemId && !!storeId,
  });

  const currentStock = currentStockData?.reduce((sum, s) => sum + (s.quantity || 0), 0) || 0;

  const createMutation = useMutation({
    mutationFn: async () => {
      const qty = parseFloat(quantity);
      const isIncrease = adjustmentType === "increase";
      const newQuantity = isIncrease ? currentStock + qty : Math.max(0, currentStock - qty);

      // Insert adjustment record with real values
      const { error } = await supabase
        .from("stock_adjustments")
        .insert({
          organization_id: profile!.organization_id!,
          branch_id: branchId,
          item_id: itemId,
          adjustment_type: adjustmentType,
          quantity: qty,
          previous_quantity: currentStock,
          new_quantity: newQuantity,
          reason,
          adjusted_by: user?.id,
        });
      if (error) throw error;

      // Update actual inventory_stock
      if (currentStockData && currentStockData.length > 0) {
        // Update the first stock record (simple approach)
        const stockRecord = currentStockData[0];
        const adjustedQty = isIncrease
          ? stockRecord.quantity + qty
          : Math.max(0, stockRecord.quantity - qty);

        const { error: stockError } = await supabase
          .from("inventory_stock")
          .update({ quantity: adjustedQty })
          .eq("id", stockRecord.id);
        if (stockError) throw stockError;
      } else if (isIncrease) {
        // No existing stock record, create one
        const { error: insertError } = await supabase
          .from("inventory_stock")
          .insert({
            item_id: itemId,
            branch_id: branchId,
            store_id: storeId,
            quantity: qty,
            unit_cost: 0,
            received_date: new Date().toISOString().split("T")[0],
            organization_id: profile!.organization_id!,
          });
        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-adjustments-page"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-stock"] });
      queryClient.invalidateQueries({ queryKey: ["current-stock-for-adj"] });
      toast.success("Stock adjustment created and stock updated");
      navigate("/app/inventory/stock-adjustments");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = () => {
    if (!branchId || !itemId || !storeId || !quantity || !reason) {
      toast.error("Please fill all required fields");
      return;
    }
    createMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Stock Adjustment"
        description="Create a manual stock adjustment"
      />

      <Button variant="outline" onClick={() => navigate("/app/inventory/stock-adjustments")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Adjustment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 max-w-lg">
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
            <Label>Warehouse/Store *</Label>
            <StoreSelector value={storeId} onChange={setStoreId} className="w-full" />
          </div>
          <div>
            <Label>Item *</Label>
            <Select value={itemId} onValueChange={setItemId}>
              <SelectTrigger>
                <SelectValue placeholder="Select item" />
              </SelectTrigger>
              <SelectContent>
                {items?.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.item_code} - {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {itemId && storeId && (
            <div className="rounded-md border p-3 bg-muted/50">
              <p className="text-sm text-muted-foreground">Current Stock in Selected Warehouse</p>
              <p className="text-lg font-bold">{currentStock}</p>
            </div>
          )}

          <div>
            <Label>Adjustment Type *</Label>
            <Select value={adjustmentType} onValueChange={setAdjustmentType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="increase">Increase</SelectItem>
                <SelectItem value="decrease">Decrease</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="damaged">Damaged</SelectItem>
                <SelectItem value="write_off">Write-Off</SelectItem>
                <SelectItem value="internal_usage">Internal Usage</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Quantity *</Label>
            <Input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
            />
          </div>
          <div>
            <Label>Reason *</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for adjustment..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => navigate("/app/inventory/stock-adjustments")}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Adjustment"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
