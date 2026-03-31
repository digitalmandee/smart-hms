import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { posLogger } from "@/lib/logger";

// Types - These tables are new and not yet in generated types
export interface POSSession {
  id: string;
  organization_id: string;
  branch_id: string;
  session_number: string;
  opened_by: string;
  opened_at: string;
  closed_at: string | null;
  closed_by: string | null;
  opening_balance: number;
  closing_balance: number | null;
  expected_cash: number | null;
  cash_difference: number | null;
  total_sales: number | null;
  total_transactions: number | null;
  notes: string | null;
  status: "open" | "closed";
  opener?: { full_name: string };
  closer?: { full_name: string } | null;
}

export interface POSTransaction {
  id: string;
  organization_id: string;
  branch_id: string;
  session_id: string | null;
  transaction_number: string;
  customer_name: string | null;
  customer_phone: string | null;
  subtotal: number;
  discount_amount: number;
  discount_percent: number;
  tax_amount: number;
  total_amount: number;
  amount_paid: number;
  change_amount: number;
  status: "completed" | "voided" | "refunded";
  voided_at: string | null;
  voided_by: string | null;
  void_reason: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  items?: POSItem[];
  payments?: POSPayment[];
  creator?: { full_name: string };
}

export interface POSItem {
  id: string;
  transaction_id: string;
  inventory_id: string | null;
  medicine_id: string | null;
  medicine_name: string;
  batch_number: string | null;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  discount_amount: number;
  tax_percent: number;
  tax_amount: number;
  total_price: number;
  line_total: number;
}

export interface POSPayment {
  id: string;
  transaction_id: string;
  payment_method: "cash" | "card" | "jazzcash" | "easypaisa" | "bank_transfer" | "other";
  amount: number;
  reference_number: string | null;
  notes: string | null;
}

export interface CartItem {
  id: string;
  inventory_id: string | null;
  medicine_id: string | null;
  medicine_name: string;
  batch_number: string | null;
  quantity: number;
  unit_price: number;
  selling_price: number;
  available_quantity: number;
  discount_percent: number;
  tax_percent: number;
  prescription_id?: string;
  prescription_item_id?: string;
}

export interface PaymentEntry {
  payment_method: "cash" | "card" | "jazzcash" | "easypaisa" | "bank_transfer" | "other";
  amount: number;
  reference_number?: string;
  notes?: string;
}

// Helper for raw SQL queries to new tables (bypasses type checking)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const queryPOSTable = (table: string): any => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).from(table);
};

// Transactions
export function usePOSTransactions(branchId?: string, filters?: { date?: string; status?: string }) {
  const { profile } = useAuth();
  const targetBranchId = branchId || profile?.branch_id;

  return useQuery({
    queryKey: ["pos-transactions", targetBranchId, filters],
    queryFn: async () => {
      if (!targetBranchId) return [];

      let query = queryPOSTable("pharmacy_pos_transactions")
        .select(`
          *,
          creator:profiles!pharmacy_pos_transactions_created_by_fkey(full_name)
        `)
        .eq("branch_id", targetBranchId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (filters?.date) {
        query = query.gte("created_at", `${filters.date}T00:00:00`).lte("created_at", `${filters.date}T23:59:59`);
      }

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as POSTransaction[];
    },
    enabled: !!targetBranchId,
  });
}

// Single Transaction
export function usePOSTransaction(transactionId: string | undefined) {
  return useQuery({
    queryKey: ["pos-transaction", transactionId],
    queryFn: async () => {
      if (!transactionId) return null;

      const { data, error } = await queryPOSTable("pharmacy_pos_transactions")
        .select(`
          *,
          creator:profiles!pharmacy_pos_transactions_created_by_fkey(full_name),
          items:pharmacy_pos_items(*),
          payments:pharmacy_pos_payments(*)
        `)
        .eq("id", transactionId)
        .single();

      if (error) throw error;
      return data as POSTransaction;
    },
    enabled: !!transactionId,
  });
}

// Create Transaction (session-free)
export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      items,
      payments,
      customerName,
      customerPhone,
      discountAmount = 0,
      notes,
      patientId,
      isCredit,
      dueDate,
      sessionId,
    }: {
      items: CartItem[];
      payments: PaymentEntry[];
      customerName?: string;
      customerPhone?: string;
      discountAmount?: number;
      notes?: string;
      patientId?: string;
      isCredit?: boolean;
      dueDate?: string;
      sessionId?: string;
    }) => {
      if (!profile?.organization_id || !profile?.branch_id) {
        throw new Error("No organization or branch context");
      }

      posLogger.info("Creating POS transaction", { 
        itemsCount: items.length,
        paymentMethods: payments.map(p => p.payment_method),
        customerName: customerName || 'Walk-in',
        discountAmount
      });

      // Calculate totals
      const subtotal = items.reduce((sum, item) => {
        const lineSubtotal = item.quantity * item.selling_price;
        const lineDiscount = lineSubtotal * (item.discount_percent / 100);
        return sum + (lineSubtotal - lineDiscount);
      }, 0);
      const taxAmount = items.reduce((sum, item) => {
        const lineSubtotal = item.quantity * item.selling_price;
        const lineDiscount = lineSubtotal * (item.discount_percent / 100);
        const taxableAmount = lineSubtotal - lineDiscount;
        return sum + (taxableAmount * (item.tax_percent / 100));
      }, 0);
      const totalAmount = subtotal + taxAmount - discountAmount;
      const amountPaid = payments.reduce((sum, p) => sum + p.amount, 0);
      const changeAmount = Math.max(0, amountPaid - totalAmount);

      posLogger.debug("Transaction totals calculated", { subtotal, taxAmount, totalAmount, amountPaid, changeAmount });

      // Derive store_id from first cart item's inventory
      let transactionStoreId: string | null = null;
      const firstInventoryItem = items.find(i => i.inventory_id);
      if (firstInventoryItem?.inventory_id) {
        const { data: invLookup } = await supabase
          .from("medicine_inventory")
          .select("store_id")
          .eq("id", firstInventoryItem.inventory_id)
          .single();
        transactionStoreId = invLookup?.store_id || null;
      }

      // Create transaction with optional session_id
      const { data: transaction, error: txError } = await queryPOSTable("pharmacy_pos_transactions")
        .insert({
          organization_id: profile.organization_id,
          branch_id: profile.branch_id,
          session_id: sessionId || null,
          store_id: transactionStoreId,
          customer_name: customerName || null,
          customer_phone: customerPhone || null,
          patient_id: patientId || null,
          subtotal,
          discount_amount: discountAmount,
          discount_percent: 0,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          amount_paid: isCredit ? 0 : amountPaid,
          change_amount: isCredit ? 0 : changeAmount,
          status: isCredit ? "credit" : "completed",
          due_date: dueDate || null,
          notes: notes || null,
          created_by: profile.id,
        })
        .select()
        .single();

      if (txError) {
        posLogger.error("Failed to create transaction", txError);
        throw txError;
      }

      posLogger.debug("Transaction record created", { transactionId: transaction.id });

      // Insert items
      const itemsToInsert = items.map((item) => {
        const lineSubtotal = item.quantity * item.selling_price;
        const lineDiscount = lineSubtotal * (item.discount_percent / 100);
        const totalPrice = lineSubtotal - lineDiscount;
        const lineTax = totalPrice * (item.tax_percent / 100);
        
        return {
          transaction_id: transaction.id,
          inventory_id: item.inventory_id,
          medicine_id: item.medicine_id,
          medicine_name: item.medicine_name,
          batch_number: item.batch_number,
          quantity: item.quantity,
          unit_price: item.selling_price,
          discount_percent: item.discount_percent,
          discount_amount: lineDiscount,
          tax_percent: item.tax_percent,
          tax_amount: lineTax,
          total_price: totalPrice,
          line_total: totalPrice,
        };
      });

      const { error: itemsError } = await queryPOSTable("pharmacy_pos_items")
        .insert(itemsToInsert);

      if (itemsError) {
        posLogger.error("Failed to insert transaction items", itemsError, { transactionId: transaction.id });
        throw itemsError;
      }

      // Deduct inventory and log stock movements
      for (const item of items) {
        if (item.inventory_id && item.quantity > 0) {
          // Get current inventory
          const { data: inventory, error: invError } = await supabase
            .from("medicine_inventory")
            .select("id, quantity, medicine_id, batch_number, selling_price, store_id")
            .eq("id", item.inventory_id)
            .single();

          if (invError) {
            posLogger.error("Failed to fetch inventory for deduction", invError, { inventoryId: item.inventory_id });
            continue;
          }

          const previousStock = inventory.quantity || 0;
          const newStock = Math.max(0, previousStock - item.quantity);

          // Update inventory
          const { error: updateError } = await supabase
            .from("medicine_inventory")
            .update({ quantity: newStock })
            .eq("id", item.inventory_id);

          if (updateError) {
            posLogger.error("Failed to deduct inventory", updateError, { inventoryId: item.inventory_id });
            continue;
          }

          // Log stock movement
          await queryPOSTable("pharmacy_stock_movements").insert({
            organization_id: profile.organization_id,
            branch_id: profile.branch_id,
            store_id: inventory.store_id || null,
            medicine_id: item.medicine_id,
            inventory_id: item.inventory_id,
            movement_type: "sale",
            quantity: -item.quantity,
            previous_stock: previousStock,
            new_stock: newStock,
            reference_type: "pos_transaction",
            reference_id: transaction.id,
            reference_number: transaction.transaction_number,
            batch_number: inventory.batch_number,
            unit_cost: item.unit_price,
            total_value: item.quantity * item.unit_price,
            notes: "POS Sale",
            created_by: profile.id,
          });

          posLogger.debug("Stock deducted", { 
            inventoryId: item.inventory_id, 
            previousStock, 
            newStock, 
            deducted: item.quantity 
          });
        }
      }

      // Insert payments
      const paymentsToInsert = payments.map((payment) => ({
        transaction_id: transaction.id,
        payment_method: payment.payment_method,
        amount: payment.amount,
        reference_number: payment.reference_number || null,
      }));

      const { error: paymentsError } = await queryPOSTable("pharmacy_pos_payments")
        .insert(paymentsToInsert);

      if (paymentsError) {
        posLogger.error("Failed to insert payments", paymentsError, { transactionId: transaction.id });
        throw paymentsError;
      }

      // Auto-mark prescription items as dispensed
      const prescriptionItemIds = items
        .filter(i => i.prescription_item_id)
        .map(i => i.prescription_item_id);

      if (prescriptionItemIds.length > 0) {
        posLogger.info("Marking prescription items as dispensed", { count: prescriptionItemIds.length });
        await supabase
          .from("prescription_items")
          .update({ is_dispensed: true })
          .in("id", prescriptionItemIds);
      }

      posLogger.info("POS transaction completed", { 
        transactionNumber: transaction.transaction_number,
        totalAmount,
        itemsCount: items.length,
        paymentMethod: payments[0]?.payment_method,
        prescriptionItemsDispensed: prescriptionItemIds.length,
        isCredit
      });

      // If credit sale, create a pharmacy credit record
      if (isCredit && patientId) {
        await queryPOSTable("pharmacy_patient_credits").insert({
          organization_id: profile.organization_id,
          branch_id: profile.branch_id,
          patient_id: patientId,
          transaction_id: transaction.id,
          amount: totalAmount,
          paid_amount: 0,
          status: "pending",
          due_date: dueDate || null,
          notes: `POS Credit Sale - ${transaction.transaction_number}`,
          created_by: profile.id,
        });
        posLogger.info("Pharmacy credit record created", { 
          patientId, 
          transactionNumber: transaction.transaction_number,
          amount: totalAmount 
        });
      }

      // Return transaction with items and payments attached for receipt display
      const fullTransaction: POSTransaction = {
        ...transaction,
        items: itemsToInsert.map((item, index) => ({
          id: `temp-${index}`,
          ...item,
        })) as POSItem[],
        payments: paymentsToInsert.map((payment, index) => ({
          id: `temp-${index}`,
          ...payment,
        })) as POSPayment[],
      };

      return fullTransaction;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pos-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["medicine-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["pharmacy-credits"] });
      toast({
        title: variables.isCredit ? "Credit Sale Recorded" : "Sale Completed",
        description: variables.isCredit 
          ? "Credit sale has been recorded. Payment can be collected later."
          : "Transaction has been recorded successfully.",
      });
    },
    onError: (error: Error) => {
      posLogger.error("Transaction failed", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Void Transaction
export function useVoidTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      transactionId,
      reason,
    }: {
      transactionId: string;
      reason: string;
    }) => {
      posLogger.warn("Voiding transaction", { transactionId, reason });

      const { data, error } = await queryPOSTable("pharmacy_pos_transactions")
        .update({
          status: "voided",
          voided_at: new Date().toISOString(),
          voided_by: profile?.id,
          void_reason: reason,
        })
        .eq("id", transactionId)
        .select()
        .single();

      if (error) {
        posLogger.error("Failed to void transaction", error, { transactionId });
        throw error;
      }

      posLogger.info("Transaction voided", { 
        transactionNumber: data.transaction_number,
        reason 
      });

      return data as POSTransaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["pos-transaction"] });
      toast({
        title: "Transaction Voided",
        description: "The transaction has been voided.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Dashboard Stats
export function usePOSDashboardStats(branchId?: string) {
  const { profile } = useAuth();
  const targetBranchId = branchId || profile?.branch_id;

  return useQuery({
    queryKey: ["pos-dashboard-stats", targetBranchId],
    queryFn: async () => {
      if (!targetBranchId) {
        return {
          todaySales: 0,
          todayTransactions: 0,
        };
      }

      const today = new Date().toISOString().split("T")[0];

      const { data: transactions } = await queryPOSTable("pharmacy_pos_transactions")
        .select("total_amount")
        .eq("branch_id", targetBranchId)
        .eq("status", "completed")
        .gte("created_at", `${today}T00:00:00`)
        .lte("created_at", `${today}T23:59:59`);

      const todaySales = transactions?.reduce((sum: number, t: any) => sum + (t.total_amount || 0), 0) || 0;
      const todayTransactions = transactions?.length || 0;

      return {
        todaySales,
        todayTransactions,
      };
    },
    enabled: !!targetBranchId,
  });
}

// Post to Patient Profile (for admitted patients - charges to IPD)
export function usePostToPatientProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      admissionId,
      items,
      notes,
    }: {
      admissionId: string;
      items: CartItem[];
      notes?: string;
    }) => {
      if (!profile?.organization_id || !profile?.branch_id) {
        throw new Error("No organization or branch context");
      }

      posLogger.info("Posting items to patient profile", { 
        admissionId,
        itemsCount: items.length,
      });

      const today = new Date().toISOString().split("T")[0];
      const chargesInsert = items.map((item) => {
        const lineSubtotal = item.quantity * item.selling_price;
        const lineDiscount = lineSubtotal * (item.discount_percent / 100);
        const totalAmount = lineSubtotal - lineDiscount;

        return {
          admission_id: admissionId,
          charge_date: today,
          charge_type: "medication",
          description: `Pharmacy: ${item.medicine_name}${item.batch_number ? ` (Batch: ${item.batch_number})` : ""}`,
          quantity: item.quantity,
          unit_price: item.selling_price,
          total_amount: totalAmount,
          is_billed: false,
          notes: notes || null,
        };
      });

      const { error: chargesError } = await supabase
        .from("ipd_charges")
        .insert(chargesInsert);

      if (chargesError) {
        posLogger.error("Failed to post charges to patient profile", chargesError);
        throw chargesError;
      }

      // Deduct inventory and log stock movements
      for (const item of items) {
        if (item.inventory_id && item.quantity > 0) {
          // Get current inventory
          const { data: inventory, error: invError } = await supabase
            .from("medicine_inventory")
            .select("id, quantity, medicine_id, batch_number, selling_price")
            .eq("id", item.inventory_id)
            .single();

          if (invError) {
            posLogger.error("Failed to fetch inventory for IPD deduction", invError, { inventoryId: item.inventory_id });
            continue;
          }

          const previousStock = inventory.quantity || 0;
          const newStock = Math.max(0, previousStock - item.quantity);

          // Update inventory
          const { error: updateError } = await supabase
            .from("medicine_inventory")
            .update({ quantity: newStock })
            .eq("id", item.inventory_id);

          if (updateError) {
            posLogger.error("Failed to deduct inventory for IPD", updateError, { inventoryId: item.inventory_id });
            continue;
          }

          // Log stock movement
          await queryPOSTable("pharmacy_stock_movements").insert({
            organization_id: profile.organization_id,
            branch_id: profile.branch_id,
            medicine_id: item.medicine_id,
            inventory_id: item.inventory_id,
            movement_type: "dispense",
            quantity: -item.quantity,
            previous_stock: previousStock,
            new_stock: newStock,
            reference_type: "ipd_charge",
            reference_id: admissionId,
            reference_number: null,
            batch_number: inventory.batch_number,
            unit_cost: item.selling_price,
            total_value: item.quantity * item.selling_price,
            notes: "IPD Patient Dispense",
            created_by: profile.id,
          });

          posLogger.debug("IPD stock deducted", { 
            inventoryId: item.inventory_id, 
            previousStock, 
            newStock, 
            deducted: item.quantity 
          });
        }
      }

      // Auto-mark prescription items as dispensed
      const prescriptionItemIds = items
        .filter(i => i.prescription_item_id)
        .map(i => i.prescription_item_id);

      if (prescriptionItemIds.length > 0) {
        posLogger.info("Marking prescription items as dispensed", { count: prescriptionItemIds.length });
        await supabase
          .from("prescription_items")
          .update({ is_dispensed: true })
          .in("id", prescriptionItemIds);
      }

      posLogger.info("Items posted to patient profile", { 
        admissionId,
        chargesCount: chargesInsert.length,
        totalAmount: chargesInsert.reduce((sum, c) => sum + c.total_amount, 0),
      });

      return { success: true, chargesCount: chargesInsert.length };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["ipd-charges"] });
      queryClient.invalidateQueries({ queryKey: ["admission-financials"] });
      queryClient.invalidateQueries({ queryKey: ["medicine-inventory"] });
      toast({
        title: "Posted to Profile",
        description: `${result.chargesCount} item(s) added to patient's IPD charges for billing at discharge.`,
      });
    },
    onError: (error: Error) => {
      posLogger.error("Failed to post to profile", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
