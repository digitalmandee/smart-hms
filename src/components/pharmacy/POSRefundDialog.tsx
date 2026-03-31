import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { ReturnItemSelector, ReturnableItem, SelectedReturnItem } from "@/components/pharmacy/ReturnItemSelector";
import { RefundMethodSelector, RefundMethod } from "@/components/pharmacy/RefundMethodSelector";
import { useProcessReturn } from "@/hooks/usePharmacyReturns";

interface POSRefundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: {
    id: string;
    transaction_number: string;
    customer_name?: string | null;
    customer_phone?: string | null;
    total_amount: number;
    items: Array<{
      id: string;
      medicine_name: string;
      medicine_id?: string;
      inventory_id?: string;
      quantity: number;
      unit_price: number;
      total_price?: number;
      line_total?: number;
      batch_number?: string;
    }>;
  };
  onSuccess?: () => void;
}

export function POSRefundDialog({ open, onOpenChange, transaction, onSuccess }: POSRefundDialogProps) {
  const [selectedItems, setSelectedItems] = useState<SelectedReturnItem[]>([]);
  const [refundMethod, setRefundMethod] = useState<RefundMethod>("cash_refund");
  const [returnReason, setReturnReason] = useState("");
  const processReturnMutation = useProcessReturn();

  const dialogItems: ReturnableItem[] = (transaction?.items || []).map((item) => ({
    id: item.id,
    medicine_name: item.medicine_name,
    medicine_id: item.medicine_id,
    inventory_id: item.inventory_id,
    quantity: item.quantity,
    unit_price: Number(item.unit_price),
    total_price: Number(item.total_price || item.line_total || item.unit_price * item.quantity),
    batch_number: item.batch_number,
  }));

  const totalRefundAmount = selectedItems.reduce((sum, item) => sum + item.line_total, 0);

  const handleProcessReturn = () => {
    if (!returnReason.trim() || selectedItems.length === 0) return;

    processReturnMutation.mutate(
      {
        transactionId: transaction.id,
        reason: returnReason,
        selectedItems,
        refundMethod,
        totalRefundAmount,
        restockItems: true,
      },
      {
        onSuccess: () => {
          setSelectedItems([]);
          setRefundMethod("cash_refund");
          setReturnReason("");
          onOpenChange(false);
          onSuccess?.();
        },
      }
    );
  };

  const handleOpenChange = (val: boolean) => {
    if (!val) {
      setSelectedItems([]);
      setRefundMethod("cash_refund");
      setReturnReason("");
    }
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Process Refund — {transaction?.transaction_number}</DialogTitle>
          <DialogDescription>
            Select items to refund and choose the refund method
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {dialogItems.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No returnable items found for this transaction.
              </p>
            ) : (
              <>
                <ReturnItemSelector
                  items={dialogItems}
                  selectedItems={selectedItems}
                  onSelectionChange={setSelectedItems}
                />

                {selectedItems.length > 0 && (
                  <>
                    <RefundMethodSelector
                      value={refundMethod}
                      onChange={setRefundMethod}
                      refundAmount={totalRefundAmount}
                      patientName={transaction.customer_name || undefined}
                    />

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Return Reason *</label>
                      <Textarea
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value)}
                        placeholder="Enter reason for return..."
                        rows={2}
                      />
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleProcessReturn}
            disabled={
              selectedItems.length === 0 ||
              !returnReason.trim() ||
              processReturnMutation.isPending
            }
          >
            {processReturnMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Process Refund
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
