import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAdjustStock, InventoryWithMedicine } from "@/hooks/usePharmacy";
import { useTranslation } from "@/lib/i18n";

interface InventoryAdjustmentModalProps {
  inventory: InventoryWithMedicine | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InventoryAdjustmentModal({ inventory, open, onOpenChange }: InventoryAdjustmentModalProps) {
  const [newQuantity, setNewQuantity] = useState<number>(inventory?.quantity || 0);
  const [reason, setReason] = useState("");
  const adjustStock = useAdjustStock();
  const { t } = useTranslation();

  const handleSubmit = () => {
    if (!inventory) return;
    adjustStock.mutate({ inventoryId: inventory.id, newQuantity, reason }, {
      onSuccess: () => { onOpenChange(false); setReason(""); },
    });
  };

  if (!inventory) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('pharmacy.adjustStock' as any)}</DialogTitle>
          <DialogDescription>
            {t('pharmacy.adjustQuantityFor' as any)} {inventory.medicine?.name}
            {inventory.batch_number && ` (${t('pharmacy.batch' as any)}: ${inventory.batch_number})`}
            {(inventory as any).store?.name && (
              <span className="block text-xs mt-1">{t('pharmacy.warehouse' as any)}: {(inventory as any).store.name}</span>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>{t('pharmacy.currentQuantity' as any)}</Label>
            <p className="text-lg font-semibold">{inventory.quantity}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="newQuantity">{t('pharmacy.newQuantity' as any)}</Label>
            <Input id="newQuantity" type="number" min={0} value={newQuantity} onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">{t('pharmacy.reasonForAdjustment' as any)}</Label>
            <Textarea id="reason" placeholder={t('pharmacy.adjustmentReasonPlaceholder' as any)} value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel' as any)}</Button>
          <Button onClick={handleSubmit} disabled={adjustStock.isPending}>
            {adjustStock.isPending ? t('common.saving' as any) : t('pharmacy.saveAdjustment' as any)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
