import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAdjustStock, InventoryWithMedicine } from "@/hooks/usePharmacy";

interface InventoryAdjustmentModalProps {
  inventory: InventoryWithMedicine | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InventoryAdjustmentModal({ inventory, open, onOpenChange }: InventoryAdjustmentModalProps) {
  const [newQuantity, setNewQuantity] = useState<number>(inventory?.quantity || 0);
  const [reason, setReason] = useState("");
  const adjustStock = useAdjustStock();

  const handleSubmit = () => {
    if (!inventory) return;

    adjustStock.mutate(
      {
        inventoryId: inventory.id,
        newQuantity,
        reason,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setReason("");
        },
      }
    );
  };

  if (!inventory) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
          <DialogDescription>
            Adjust the quantity for {inventory.medicine?.name}
            {inventory.batch_number && ` (Batch: ${inventory.batch_number})`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Current Quantity</Label>
            <p className="text-lg font-semibold">{inventory.quantity}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newQuantity">New Quantity</Label>
            <Input
              id="newQuantity"
              type="number"
              min={0}
              value={newQuantity}
              onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Adjustment</Label>
            <Textarea
              id="reason"
              placeholder="e.g., Damaged items, Stock count correction, Expired..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={adjustStock.isPending}>
            {adjustStock.isPending ? "Saving..." : "Save Adjustment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
