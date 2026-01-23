import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { POSTransaction } from "@/hooks/usePOS";
import { SelectedReturnItem } from "@/components/pharmacy/ReturnItemSelector";
import { RefundMethod } from "@/components/pharmacy/RefundMethodSelector";
import { returnsLogger, inventoryOpsLogger } from "@/lib/logger";

// Helper for raw SQL queries to POS tables (bypasses type checking)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const queryPOSTable = (table: string): any => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).from(table);
};

export interface ReturnTransaction {
  id: string;
  transaction_number: string;
  customer_name: string | null;
  customer_phone: string | null;
  total_amount: number;
  created_at: string;
  status: string;
  items: ReturnItem[];
}

export interface ReturnItem {
  id: string;
  medicine_name: string;
  medicine_id?: string;
  inventory_id?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  batch_number?: string;
  returned_quantity?: number;
}

// Search transactions for return/refund
export function useSearchTransactionForReturn(query: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["search-transaction-return", query, profile?.branch_id],
    queryFn: async () => {
      if (!query || query.length < 3 || !profile?.branch_id) return [];

      const { data, error } = await queryPOSTable("pharmacy_pos_transactions")
        .select(`
          id,
          transaction_number,
          customer_name,
          customer_phone,
          total_amount,
          created_at,
          status,
          items:pharmacy_pos_items(id, medicine_name, medicine_id, inventory_id, quantity, unit_price, total_price, batch_number)
        `)
        .eq("branch_id", profile.branch_id)
        .in("status", ["completed", "credit"]) // Include credit sales too
        .or(`transaction_number.ilike.%${query}%,customer_name.ilike.%${query}%,customer_phone.ilike.%${query}%`)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as ReturnTransaction[];
    },
    enabled: !!query && query.length >= 3 && !!profile?.branch_id,
  });
}

// Fetch recent returns
export function useRecentReturns() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["recent-returns", profile?.branch_id],
    queryFn: async () => {
      if (!profile?.branch_id) return [];

      // For now, fetch voided/refunded transactions as "returns"
      const { data, error } = await queryPOSTable("pharmacy_pos_transactions")
        .select(`
          id,
          transaction_number,
          customer_name,
          customer_phone,
          total_amount,
          created_at,
          status,
          void_reason,
          voided_at
        `)
        .eq("branch_id", profile.branch_id)
        .in("status", ["voided", "refunded"])
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.branch_id,
  });
}

// Get returns stats
export function useReturnsStats() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["returns-stats", profile?.branch_id],
    queryFn: async () => {
      if (!profile?.branch_id) {
        return {
          todayReturns: 0,
          pendingApproval: 0,
          weeklyRefundTotal: 0,
          itemsRestocked: 0,
        };
      }

      const today = new Date().toISOString().split("T")[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      // Today's returns (voided/refunded)
      const { data: todayData } = await queryPOSTable("pharmacy_pos_transactions")
        .select("id, total_amount")
        .eq("branch_id", profile.branch_id)
        .in("status", ["voided", "refunded"])
        .gte("voided_at", `${today}T00:00:00`)
        .lte("voided_at", `${today}T23:59:59`);

      // This week's refunds
      const { data: weekData } = await queryPOSTable("pharmacy_pos_transactions")
        .select("id, total_amount")
        .eq("branch_id", profile.branch_id)
        .in("status", ["voided", "refunded"])
        .gte("voided_at", `${weekAgo}T00:00:00`);

      const todayReturns = todayData?.length || 0;
      const weeklyRefundTotal = weekData?.reduce((sum: number, t: any) => sum + (Number(t.total_amount) || 0), 0) || 0;

      return {
        todayReturns,
        pendingApproval: 0, // Placeholder - would need approval workflow table
        weeklyRefundTotal,
        itemsRestocked: todayReturns * 2, // Estimate
      };
    },
    enabled: !!profile?.branch_id,
  });
}

// Process return/refund with item-level selection
export function useProcessReturn() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      transactionId,
      reason,
      selectedItems,
      refundMethod,
      totalRefundAmount,
      restockItems = true,
    }: {
      transactionId: string;
      reason: string;
      selectedItems: SelectedReturnItem[];
      refundMethod: RefundMethod;
      totalRefundAmount: number;
      restockItems?: boolean;
    }) => {
      const operationTimer = returnsLogger.startOperation('processReturn');
      
      returnsLogger.info('Processing pharmacy return', {
        transactionId,
        itemCount: selectedItems.length,
        totalRefundAmount,
        refundMethod,
        restockItems,
        userId: profile?.id,
        branchId: profile?.branch_id,
      });

      if (!profile?.organization_id || !profile?.branch_id) {
        returnsLogger.error('User profile not found during return processing');
        throw new Error("User profile not found");
      }

      // Generate a unique return number
      const returnNumber = `RET-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      returnsLogger.debug('Generated return number', { returnNumber });

      // 1. Create pharmacy_return record using raw query helper
      returnsLogger.debug('Creating pharmacy_return record', { transactionId, returnNumber });
      const { data: returnRecord, error: returnError } = await queryPOSTable("pharmacy_returns")
        .insert({
          return_number: returnNumber,
          original_transaction_id: transactionId,
          return_type: refundMethod,
          total_refund_amount: totalRefundAmount,
          reason,
          processed_by: profile.id,
          branch_id: profile.branch_id,
          organization_id: profile.organization_id,
        })
        .select()
        .single();

      if (returnError) {
        returnsLogger.error('Failed to create pharmacy_return record', returnError, { transactionId });
        throw returnError;
      }
      
      returnsLogger.info('Created pharmacy_return record', { returnId: returnRecord.id, returnNumber });

      // 2. Create pharmacy_return_items for each returned item
      const returnItems = selectedItems.map(item => ({
        return_id: returnRecord.id,
        original_item_id: item.id,
        medicine_name: item.medicine_name,
        quantity_returned: item.return_quantity,
        unit_price: item.unit_price,
        line_total: item.line_total,
        restocked: restockItems,
        batch_number: item.batch_number,
      }));

      returnsLogger.debug('Inserting pharmacy_return_items', { itemCount: returnItems.length });
      const { error: itemsError } = await queryPOSTable("pharmacy_return_items")
        .insert(returnItems);

      if (itemsError) {
        returnsLogger.error('Failed to insert pharmacy_return_items', itemsError, { returnId: returnRecord.id });
        throw itemsError;
      }
      
      returnsLogger.info('Created pharmacy_return_items', { itemCount: returnItems.length });

      // 3. Get original transaction to check if full or partial refund
      const { data: originalTx } = await queryPOSTable("pharmacy_pos_transactions")
        .select("items:pharmacy_pos_items(id, quantity)")
        .eq("id", transactionId)
        .single();

      const originalItemCount = originalTx?.items?.length || 0;
      const returnedItemCount = selectedItems.length;
      const isFullRefund = returnedItemCount === originalItemCount && 
        selectedItems.every(si => {
          const orig = originalTx?.items?.find((oi: any) => oi.id === si.id);
          return orig && si.return_quantity === orig.quantity;
        });

      returnsLogger.debug('Refund type determined', { isFullRefund, originalItemCount, returnedItemCount });

      // 4. If full refund, mark transaction as refunded
      if (isFullRefund) {
        returnsLogger.info('Processing full refund - marking transaction as refunded', { transactionId });
        await queryPOSTable("pharmacy_pos_transactions")
          .update({
            status: "refunded",
            voided_at: new Date().toISOString(),
            voided_by: profile.id,
            void_reason: reason,
          })
          .eq("id", transactionId);
      }

      // 5. Restock inventory if requested
      if (restockItems) {
        returnsLogger.info('Starting inventory restock', { itemCount: selectedItems.length });
        let restockedCount = 0;
        
        for (const item of selectedItems) {
          inventoryOpsLogger.debug('Processing item for restock', {
            itemId: item.id,
            medicineName: item.medicine_name,
            inventoryId: item.inventory_id,
            medicineId: item.medicine_id,
            returnQuantity: item.return_quantity,
          });
          
          if (item.inventory_id) {
            // Get current inventory quantity
            const { data: inventory, error: invError } = await supabase
              .from("medicine_inventory")
              .select("id, quantity, medicine_id, batch_number")
              .eq("id", item.inventory_id)
              .single();

            if (invError) {
              inventoryOpsLogger.error('Failed to fetch inventory for restock', invError, {
                inventoryId: item.inventory_id,
                medicineName: item.medicine_name,
              });
            }

            if (!invError && inventory) {
              const previousStock = inventory.quantity || 0;
              const newStock = previousStock + item.return_quantity;

              inventoryOpsLogger.info('Updating inventory quantity', {
                inventoryId: item.inventory_id,
                medicineName: item.medicine_name,
                previousStock,
                returnQuantity: item.return_quantity,
                newStock,
              });

              // Update inventory - ADD quantity back
              const { error: updateError } = await supabase
                .from("medicine_inventory")
                .update({ quantity: newStock })
                .eq("id", item.inventory_id);

              if (updateError) {
                inventoryOpsLogger.error('Failed to update inventory quantity', updateError, {
                  inventoryId: item.inventory_id,
                });
              } else {
                restockedCount++;
              }

              // Log stock movement
              const { error: movementError } = await queryPOSTable("pharmacy_stock_movements").insert({
                organization_id: profile.organization_id,
                branch_id: profile.branch_id,
                medicine_id: item.medicine_id || inventory.medicine_id,
                inventory_id: item.inventory_id,
                movement_type: "return",
                quantity: item.return_quantity,
                previous_stock: previousStock,
                new_stock: newStock,
                reference_type: "pharmacy_return",
                reference_id: returnRecord.id,
                batch_number: item.batch_number || inventory.batch_number,
                unit_cost: item.unit_price,
                total_value: item.line_total,
                notes: `Return: ${reason}`,
                created_by: profile.id,
              });

              if (movementError) {
                inventoryOpsLogger.error('Failed to log stock movement', movementError, {
                  inventoryId: item.inventory_id,
                  returnId: returnRecord.id,
                });
              } else {
                inventoryOpsLogger.info('Stock movement logged successfully', {
                  inventoryId: item.inventory_id,
                  movementType: 'return',
                  quantity: item.return_quantity,
                });
              }
            }
          } else {
            inventoryOpsLogger.warn('Item missing inventory_id - cannot restock', {
              itemId: item.id,
              medicineName: item.medicine_name,
              medicineId: item.medicine_id,
            });
          }
        }
        
        returnsLogger.info('Inventory restock completed', { 
          totalItems: selectedItems.length, 
          restockedCount,
          skippedCount: selectedItems.length - restockedCount,
        });
      }

      // 6. TODO: Handle credit adjustments if refundMethod is add_credit or deduct_outstanding
      // This would update pharmacy_patient_credits table

      returnsLogger.info('Return processing completed successfully', {
        returnId: returnRecord.id,
        returnNumber,
        totalRefundAmount,
        itemCount: selectedItems.length,
      });

      return returnRecord;
    },
    onSuccess: (data, variables) => {
      returnsLogger.info('Return mutation succeeded', {
        returnId: data.id,
        itemCount: variables.selectedItems.length,
      });
      
      queryClient.invalidateQueries({ queryKey: ["pos-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["recent-returns"] });
      queryClient.invalidateQueries({ queryKey: ["returns-stats"] });
      queryClient.invalidateQueries({ queryKey: ["search-transaction-return"] });
      queryClient.invalidateQueries({ queryKey: ["medicine-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
      
      toast({
        title: "Return Processed",
        description: `${variables.selectedItems.length} item(s) returned successfully.`,
      });
    },
    onError: (error: Error, variables) => {
      returnsLogger.error('Return mutation failed', error, {
        transactionId: variables.transactionId,
        itemCount: variables.selectedItems.length,
        refundMethod: variables.refundMethod,
      });
      
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
