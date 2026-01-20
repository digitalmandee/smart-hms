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
  status: "pending" | "paid" | "voided" | "refunded";
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
    }: {
      items: CartItem[];
      payments: PaymentEntry[];
      customerName?: string;
      customerPhone?: string;
      discountAmount?: number;
      notes?: string;
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
        const lineSubtotal = item.quantity * item.unit_price;
        const lineDiscount = lineSubtotal * (item.discount_percent / 100);
        return sum + (lineSubtotal - lineDiscount);
      }, 0);
      const taxAmount = items.reduce((sum, item) => {
        const lineSubtotal = item.quantity * item.unit_price;
        const lineDiscount = lineSubtotal * (item.discount_percent / 100);
        const taxableAmount = lineSubtotal - lineDiscount;
        return sum + (taxableAmount * (item.tax_percent / 100));
      }, 0);
      const totalAmount = subtotal + taxAmount - discountAmount;
      const amountPaid = payments.reduce((sum, p) => sum + p.amount, 0);
      const changeAmount = Math.max(0, amountPaid - totalAmount);

      posLogger.debug("Transaction totals calculated", { subtotal, taxAmount, totalAmount, amountPaid, changeAmount });

      // Create transaction (session_id is now optional/null)
      const { data: transaction, error: txError } = await queryPOSTable("pharmacy_pos_transactions")
        .insert({
          organization_id: profile.organization_id,
          branch_id: profile.branch_id,
          session_id: null, // No session required
          customer_name: customerName || null,
          customer_phone: customerPhone || null,
          subtotal,
          discount_amount: discountAmount,
          discount_percent: 0,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          amount_paid: amountPaid,
          change_amount: changeAmount,
          status: "paid",
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
      const itemsToInsert = items.map((item) => ({
        transaction_id: transaction.id,
        inventory_id: item.inventory_id,
        medicine_id: item.medicine_id,
        medicine_name: item.medicine_name,
        batch_number: item.batch_number,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_percent: item.discount_percent,
        discount_amount: item.quantity * item.unit_price * (item.discount_percent / 100),
        tax_percent: item.tax_percent,
        tax_amount: item.quantity * item.unit_price * (item.tax_percent / 100),
        line_total: item.quantity * item.unit_price * (1 - item.discount_percent / 100),
      }));

      const { error: itemsError } = await queryPOSTable("pharmacy_pos_items")
        .insert(itemsToInsert);

      if (itemsError) {
        posLogger.error("Failed to insert transaction items", itemsError, { transactionId: transaction.id });
        throw itemsError;
      }

      // Insert payments
      const paymentsToInsert = payments.map((payment) => ({
        transaction_id: transaction.id,
        payment_method: payment.payment_method,
        amount: payment.amount,
        reference_number: payment.reference_number || null,
        notes: payment.notes || null,
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
        prescriptionItemsDispensed: prescriptionItemIds.length
      });

      return transaction as POSTransaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["medicine-inventory"] });
      toast({
        title: "Sale Completed",
        description: "Transaction has been recorded successfully.",
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
        .eq("status", "paid")
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
