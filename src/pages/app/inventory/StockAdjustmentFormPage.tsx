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

export default function StockAdjustmentFormPage() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const queryClient = useQueryClient();

  const [itemId, setItemId] = useState("");
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

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("stock_adjustments")
        .insert({
          organization_id: profile!.organization_id!,
          branch_id: branchId,
          item_id: itemId,
          adjustment_type: adjustmentType,
          quantity: parseFloat(quantity),
          previous_quantity: 0,
          new_quantity: 0,
          reason,
          adjusted_by: user?.id,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-adjustments-page"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-stock"] });
      toast.success("Stock adjustment created");
      navigate("/app/inventory/stock-adjustments");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = () => {
    if (!branchId || !itemId || !quantity || !reason) {
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
