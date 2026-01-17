import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Pause, 
  Play, 
  Trash2, 
  Clock, 
  User, 
  ShoppingCart 
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { 
  useHeldTransactions, 
  useRecallTransaction, 
  useDeleteHeldTransaction,
  HeldTransaction 
} from "@/hooks/useHeldTransactions";
import { CartItem } from "@/hooks/usePOS";

interface POSHeldTransactionsProps {
  onRecall: (items: CartItem[], customerName?: string, customerPhone?: string, patientId?: string) => void;
}

export function POSHeldTransactionsDialog({ onRecall }: POSHeldTransactionsProps) {
  const [open, setOpen] = useState(false);
  const { data: heldTransactions, isLoading } = useHeldTransactions();
  const recallMutation = useRecallTransaction();
  const deleteMutation = useDeleteHeldTransaction();

  const handleRecall = async (held: HeldTransaction) => {
    try {
      await recallMutation.mutateAsync(held.id);
      onRecall(
        held.cart_items,
        held.customer_name || undefined,
        held.customer_phone || undefined,
        held.patient_id || undefined
      );
      setOpen(false);
    } catch (error) {
      console.error("Failed to recall transaction:", error);
    }
  };

  const handleDelete = async (heldId: string) => {
    try {
      await deleteMutation.mutateAsync(heldId);
    } catch (error) {
      console.error("Failed to delete held transaction:", error);
    }
  };

  const activeCount = heldTransactions?.length || 0;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <Pause className="h-4 w-4" />
        Held
        {activeCount > 0 && (
          <Badge variant="secondary" className="ml-1">
            {activeCount}
          </Badge>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pause className="h-5 w-5" />
              Held Transactions
            </DialogTitle>
            <DialogDescription>
              Select a held transaction to recall and continue
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-96">
            {isLoading ? (
              <div className="space-y-3 p-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : heldTransactions && heldTransactions.length > 0 ? (
              <div className="space-y-3 p-2">
                {heldTransactions.map((held) => {
                  const itemCount = held.cart_items.length;
                  const total = held.cart_items.reduce(
                    (sum, item) => sum + (item.selling_price * item.quantity),
                    0
                  );

                  return (
                    <Card key={held.id} className="overflow-hidden">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(held.held_at), "dd MMM, HH:mm")}
                              </span>
                              {held.holder?.full_name && (
                                <span className="text-xs text-muted-foreground">
                                  by {held.holder.full_name}
                                </span>
                              )}
                            </div>

                            {(held.customer_name || held.patient) && (
                              <div className="flex items-center gap-1 text-sm mb-1">
                                <User className="h-3 w-3" />
                                {held.patient 
                                  ? `${held.patient.first_name} ${held.patient.last_name} (${held.patient.patient_number})`
                                  : held.customer_name
                                }
                              </div>
                            )}

                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                <ShoppingCart className="h-3 w-3 mr-1" />
                                {itemCount} items
                              </Badge>
                              <span className="font-semibold text-sm">
                                Rs. {total.toFixed(2)}
                              </span>
                            </div>

                            {held.notes && (
                              <p className="text-xs text-muted-foreground mt-1 truncate">
                                {held.notes}
                              </p>
                            )}
                          </div>

                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDelete(held.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                            <Button
                              variant="default"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleRecall(held)}
                              disabled={recallMutation.isPending}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Pause className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No held transactions</p>
              </div>
            )}
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
