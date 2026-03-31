import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { SelectedReturnItem } from "@/components/pharmacy/ReturnItemSelector";
import { RefundMethod } from "@/components/pharmacy/RefundMethodSelector";
import { returnsLogger } from "@/lib/logger";

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

export interface DispensedPrescriptionResult {
  id: string;
  prescription_number: string;
  patient_name: string;
  patient_mrn: string;
  dispensed_at: string;
  source: "opd" | "ipd";
  items: DispensedItem[];
}

export interface DispensedItem {
  id: string;
  medicine_name: string;
  medicine_id: string;
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
        .in("status", ["completed", "credit"])
        .or(`transaction_number.ilike.%${query}%,customer_name.ilike.%${query}%,customer_phone.ilike.%${query}%`)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as ReturnTransaction[];
    },
    enabled: !!query && query.length >= 3 && !!profile?.branch_id,
  });
}

// Search dispensed prescriptions for return (OPD/IPD)
export function useSearchDispensedPrescriptions(query: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["search-dispensed-prescriptions", query, profile?.branch_id],
    queryFn: async () => {
      if (!query || query.length < 3 || !profile?.branch_id) return [];

      // Search prescriptions that have been dispensed
      const { data, error } = await supabase
        .from("prescriptions")
        .select(`
          id,
          prescription_number,
          status,
          created_at,
          patient:patients(id, first_name, last_name, patient_number),
          consultation:consultations(id, admission_id),
          items:prescription_items(
            id, medicine_name, medicine_id, quantity, is_dispensed
          )
        `)
        .eq("branch_id", profile.branch_id)
        .in("status", ["dispensed", "partially_dispensed"])
        .or(`prescription_number.ilike.%${query}%`)
        .order("created_at", { ascending: false })
        .limit(30);

      if (error) {
        // Try patient name/MRN search separately
        const { data: patients } = await supabase
          .from("patients")
          .select("id")
          .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,patient_number.ilike.%${query}%`)
          .limit(10);

        if (patients && patients.length > 0) {
          const patientIds = patients.map(p => p.id);
          const { data: rxData, error: rxError } = await supabase
            .from("prescriptions")
            .select(`
              id,
              prescription_number,
              status,
              created_at,
              patient:patients(id, first_name, last_name, patient_number),
              consultation:consultations(id, admission_id),
              items:prescription_items(
                id, medicine_name, medicine_id, quantity, is_dispensed
              )
            `)
            .eq("branch_id", profile.branch_id)
            .in("status", ["dispensed", "partially_dispensed"])
            .in("patient_id", patientIds)
            .order("created_at", { ascending: false })
            .limit(30);

          if (rxError) throw rxError;
          return await mapPrescriptionResults(rxData, profile.branch_id);
        }
        throw error;
      }

      return await mapPrescriptionResults(data, profile.branch_id);
    },
    enabled: !!query && query.length >= 3 && !!profile?.branch_id,
  });
}

async function mapPrescriptionResults(data: any[], branchId: string): Promise<DispensedPrescriptionResult[]> {
  if (!data || data.length === 0) return [];

  // Collect all medicine_ids to do a bulk price lookup
  const allMedicineIds = new Set<string>();
  data.forEach((rx: any) => {
    (rx.items || []).forEach((item: any) => {
      if (item.medicine_id) allMedicineIds.add(item.medicine_id);
    });
  });

  // Bulk fetch prices from medicine_inventory
  let priceMap: Record<string, { selling_price: number; id: string }> = {};
  if (allMedicineIds.size > 0) {
    const { data: invData } = await supabase
      .from("medicine_inventory")
      .select("id, medicine_id, selling_price")
      .in("medicine_id", Array.from(allMedicineIds))
      .eq("branch_id", branchId)
      .gt("quantity", 0)
      .order("created_at", { ascending: false });

    if (invData) {
      // Keep first (latest) per medicine_id
      invData.forEach((inv: any) => {
        if (!priceMap[inv.medicine_id]) {
          priceMap[inv.medicine_id] = { selling_price: inv.selling_price || 0, id: inv.id };
        }
      });
    }
  }

  return data.map((rx: any) => {
    const patient = rx.patient;
    const fullName = patient
      ? `${patient.first_name || ""} ${patient.last_name || ""}`.trim()
      : "Unknown";

    return {
      id: rx.id,
      prescription_number: rx.prescription_number || "N/A",
      patient_name: fullName,
      patient_mrn: patient?.patient_number || "",
      dispensed_at: rx.created_at,
      source: rx.consultation?.admission_id ? "ipd" as const : "opd" as const,
      items: (rx.items || [])
        .filter((item: any) => item.is_dispensed || item.quantity > 0)
        .map((item: any) => {
          const inv = priceMap[item.medicine_id] || { selling_price: 0, id: undefined };
          const unitPrice = inv.selling_price;
          return {
            id: item.id,
            medicine_name: item.medicine_name,
            medicine_id: item.medicine_id,
            inventory_id: inv.id,
            quantity: item.quantity,
            unit_price: unitPrice,
            total_price: unitPrice * (item.quantity || 0),
            batch_number: undefined,
          };
        }),
    };
  });
}

// Fetch recent returns from pharmacy_returns table
export function useRecentReturns() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["recent-returns", profile?.branch_id],
    queryFn: async () => {
      if (!profile?.branch_id) return [];

      const { data, error } = await queryPOSTable("pharmacy_returns")
        .select(`
          id,
          return_number,
          return_type,
          total_refund_amount,
          reason,
          created_at,
          original_transaction_id,
          items:pharmacy_return_items(id, medicine_name, quantity_returned, restocked)
        `)
        .eq("branch_id", profile.branch_id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        // Fallback to voided POS transactions
        const { data: fallback, error: fbError } = await queryPOSTable("pharmacy_pos_transactions")
          .select(`id, transaction_number, customer_name, total_amount, created_at, status, void_reason, voided_at`)
          .eq("branch_id", profile.branch_id)
          .in("status", ["voided", "refunded"])
          .order("created_at", { ascending: false })
          .limit(50);
        if (fbError) throw fbError;
        return (fallback || []).map((t: any) => ({
          id: t.id,
          return_number: t.transaction_number,
          return_type: t.status === "refunded" ? "cash_refund" : "voided",
          total_refund_amount: t.total_amount,
          reason: t.void_reason || "-",
          created_at: t.voided_at || t.created_at,
          items_count: 0,
          items_restocked: 0,
        }));
      }

      return (data || []).map((r: any) => ({
        id: r.id,
        return_number: r.return_number,
        return_type: r.return_type,
        total_refund_amount: r.total_refund_amount,
        reason: r.reason,
        created_at: r.created_at,
        items_count: r.items?.length || 0,
        items_restocked: r.items?.filter((i: any) => i.restocked).length || 0,
      }));
    },
    enabled: !!profile?.branch_id,
  });
}

// Get returns stats from pharmacy_returns table
export function useReturnsStats() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["returns-stats", profile?.branch_id],
    queryFn: async () => {
      if (!profile?.branch_id) {
        return { todayReturns: 0, pendingApproval: 0, weeklyRefundTotal: 0, itemsRestocked: 0 };
      }

      const today = new Date().toISOString().split("T")[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      // Today's returns from pharmacy_returns
      const { data: todayData } = await queryPOSTable("pharmacy_returns")
        .select("id, total_refund_amount")
        .eq("branch_id", profile.branch_id)
        .gte("created_at", `${today}T00:00:00`)
        .lte("created_at", `${today}T23:59:59`);

      // This week's refunds
      const { data: weekData } = await queryPOSTable("pharmacy_returns")
        .select("id, total_refund_amount")
        .eq("branch_id", profile.branch_id)
        .gte("created_at", `${weekAgo}T00:00:00`);

      // Today's restocked items
      const { data: todayItems } = await queryPOSTable("pharmacy_return_items")
        .select("id, return_id, restocked")
        .eq("restocked", true);

      const todayReturns = todayData?.length || 0;
      const weeklyRefundTotal = weekData?.reduce((sum: number, t: any) => sum + (Number(t.total_refund_amount) || 0), 0) || 0;

      // Count restocked items from today's returns
      const todayReturnIds = new Set((todayData || []).map((r: any) => r.id));
      const itemsRestocked = (todayItems || []).filter((i: any) => todayReturnIds.has(i.return_id)).length;

      return {
        todayReturns,
        pendingApproval: 0,
        weeklyRefundTotal,
        itemsRestocked,
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
      prescriptionId,
      reason,
      selectedItems,
      refundMethod,
      totalRefundAmount,
      restockItems = true,
    }: {
      transactionId?: string;
      prescriptionId?: string;
      reason: string;
      selectedItems: SelectedReturnItem[];
      refundMethod: RefundMethod;
      totalRefundAmount: number;
      restockItems?: boolean;
    }) => {
      returnsLogger.startOperation('processReturn');
      
      returnsLogger.info('Processing pharmacy return', {
        transactionId,
        prescriptionId,
        itemCount: selectedItems.length,
        totalRefundAmount,
        refundMethod,
        restockItems,
      });

      if (!profile?.organization_id || !profile?.branch_id) {
        throw new Error("User profile not found");
      }

      const returnNumber = `RET-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      // 1. Create pharmacy_return record
      const { data: returnRecord, error: returnError } = await queryPOSTable("pharmacy_returns")
        .insert({
          return_number: returnNumber,
          original_transaction_id: transactionId || null,
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
        returnsLogger.error('Failed to create pharmacy_return record', returnError);
        throw returnError;
      }

      // 2. Create pharmacy_return_items
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

      const { error: itemsError } = await queryPOSTable("pharmacy_return_items")
        .insert(returnItems);

      if (itemsError) {
        returnsLogger.error('Failed to insert pharmacy_return_items', itemsError);
        throw itemsError;
      }

      // 3. Handle POS transaction status update (full refund check)
      if (transactionId) {
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

        if (isFullRefund) {
          await queryPOSTable("pharmacy_pos_transactions")
            .update({
              status: "refunded",
              voided_at: new Date().toISOString(),
              voided_by: profile.id,
              void_reason: reason,
            })
            .eq("id", transactionId);
        }
      }

      // 4. Restock inventory if requested
      if (restockItems) {
        for (const item of selectedItems) {
          if (item.inventory_id) {
            const { data: inventory, error: invError } = await supabase
              .from("medicine_inventory")
              .select("id, quantity, medicine_id, batch_number")
              .eq("id", item.inventory_id)
              .single();

            if (!invError && inventory) {
              const previousStock = inventory.quantity || 0;
              const newStock = previousStock + item.return_quantity;

              await supabase
                .from("medicine_inventory")
                .update({ quantity: newStock })
                .eq("id", item.inventory_id);

              await queryPOSTable("pharmacy_stock_movements").insert({
                organization_id: profile.organization_id,
                branch_id: profile.branch_id,
                medicine_id: item.medicine_id || inventory.medicine_id,
                inventory_id: item.inventory_id,
                movement_type: "return",
                quantity: item.return_quantity,
                previous_stock: previousStock,
                new_stock: newStock,
                reference_type: prescriptionId ? "prescription_return" : "pharmacy_return",
                reference_id: returnRecord.id,
                batch_number: item.batch_number || inventory.batch_number,
                unit_cost: item.unit_price,
                total_value: item.line_total,
                notes: `Return: ${reason}`,
                created_by: profile.id,
              });
            }
          } else if (item.medicine_id) {
            // Try to find inventory by medicine_id + branch
            const { data: invItems } = await supabase
              .from("medicine_inventory")
              .select("id, quantity, batch_number")
              .eq("medicine_id", item.medicine_id)
              .eq("branch_id", profile.branch_id)
              .order("created_at", { ascending: false })
              .limit(1);

            if (invItems && invItems.length > 0) {
              const inv = invItems[0];
              const previousStock = inv.quantity || 0;
              const newStock = previousStock + item.return_quantity;

              await supabase
                .from("medicine_inventory")
                .update({ quantity: newStock })
                .eq("id", inv.id);

              await queryPOSTable("pharmacy_stock_movements").insert({
                organization_id: profile.organization_id,
                branch_id: profile.branch_id,
                medicine_id: item.medicine_id,
                inventory_id: inv.id,
                movement_type: "return",
                quantity: item.return_quantity,
                previous_stock: previousStock,
                new_stock: newStock,
                reference_type: prescriptionId ? "prescription_return" : "pharmacy_return",
                reference_id: returnRecord.id,
                batch_number: item.batch_number || inv.batch_number,
                unit_cost: item.unit_price,
                total_value: item.line_total,
                notes: `Return: ${reason}`,
                created_by: profile.id,
              });
            }
          }
        }
      }

      returnsLogger.info('Return processing completed', { returnId: returnRecord.id, returnNumber });
      return returnRecord;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pos-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["recent-returns"] });
      queryClient.invalidateQueries({ queryKey: ["returns-stats"] });
      queryClient.invalidateQueries({ queryKey: ["search-transaction-return"] });
      queryClient.invalidateQueries({ queryKey: ["search-dispensed-prescriptions"] });
      queryClient.invalidateQueries({ queryKey: ["medicine-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
      
      toast({
        title: "Return Processed",
        description: `${variables.selectedItems.length} item(s) returned successfully.`,
      });
    },
    onError: (error: Error) => {
      returnsLogger.error('Return mutation failed', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
