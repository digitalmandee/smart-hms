import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useCallback } from "react";

// Types - These tables are new and not yet in generated types
export interface POSSession {
  id: string;
  organization_id: string;
  branch_id: string;
  terminal_name: string;
  opened_by: string;
  opened_at: string;
  closed_at: string | null;
  closed_by: string | null;
  opening_balance: number;
  closing_balance: number | null;
  expected_balance: number | null;
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
  session_id: string;
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
  payment_status: "pending" | "paid" | "voided" | "refunded";
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

// Active Session
export function useActiveSession(branchId?: string) {
  const { profile } = useAuth();
  const targetBranchId = branchId || profile?.branch_id;

  return useQuery({
    queryKey: ["pos-active-session", targetBranchId],
    queryFn: async () => {
      if (!targetBranchId) return null;

      const { data, error } = await queryPOSTable("pharmacy_pos_sessions")
        .select("*, opener:profiles!pharmacy_pos_sessions_opened_by_fkey(full_name)")
        .eq("branch_id", targetBranchId)
        .eq("status", "open")
        .maybeSingle();

      if (error) throw error;
      return data as POSSession | null;
    },
    enabled: !!targetBranchId,
  });
}

// All Sessions
export function usePOSSessions(branchId?: string) {
  const { profile } = useAuth();
  const targetBranchId = branchId || profile?.branch_id;

  return useQuery({
    queryKey: ["pos-sessions", targetBranchId],
    queryFn: async () => {
      if (!targetBranchId) return [];

      const { data, error } = await queryPOSTable("pharmacy_pos_sessions")
        .select(`
          *,
          opener:profiles!pharmacy_pos_sessions_opened_by_fkey(full_name),
          closer:profiles!pharmacy_pos_sessions_closed_by_fkey(full_name)
        `)
        .eq("branch_id", targetBranchId)
        .order("opened_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as POSSession[];
    },
    enabled: !!targetBranchId,
  });
}

// Open Session
export function useOpenSession() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      openingBalance,
      terminalName = "Main Counter",
    }: {
      openingBalance: number;
      terminalName?: string;
    }) => {
      if (!profile?.organization_id || !profile?.branch_id) {
        throw new Error("No organization or branch context");
      }

      // Check if there's already an open session
      const { data: existing } = await queryPOSTable("pharmacy_pos_sessions")
        .select("id")
        .eq("branch_id", profile.branch_id)
        .eq("status", "open")
        .maybeSingle();

      if (existing) {
        throw new Error("There is already an open session for this counter");
      }

      const { data, error } = await queryPOSTable("pharmacy_pos_sessions")
        .insert({
          organization_id: profile.organization_id,
          branch_id: profile.branch_id,
          opened_by: profile.id,
          opening_balance: openingBalance,
          expected_balance: openingBalance,
          terminal_name: terminalName,
          status: "open",
        })
        .select()
        .single();

      if (error) throw error;
      return data as POSSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-active-session"] });
      queryClient.invalidateQueries({ queryKey: ["pos-sessions"] });
      toast({
        title: "Session Opened",
        description: "POS session has been started successfully.",
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

// Close Session
export function useCloseSession() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      sessionId,
      closingBalance,
      notes,
    }: {
      sessionId: string;
      closingBalance: number;
      notes?: string;
    }) => {
      // Get session to calculate difference
      const { data: session, error: fetchError } = await queryPOSTable("pharmacy_pos_sessions")
        .select("expected_balance")
        .eq("id", sessionId)
        .single();

      if (fetchError) throw fetchError;

      const cashDifference = closingBalance - (session?.expected_balance || 0);

      const { data, error } = await queryPOSTable("pharmacy_pos_sessions")
        .update({
          closed_at: new Date().toISOString(),
          closed_by: profile?.id,
          closing_balance: closingBalance,
          cash_difference: cashDifference,
          notes,
          status: "closed",
        })
        .eq("id", sessionId)
        .select()
        .single();

      if (error) throw error;
      return data as POSSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-active-session"] });
      queryClient.invalidateQueries({ queryKey: ["pos-sessions"] });
      toast({
        title: "Session Closed",
        description: "POS session has been closed successfully.",
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
        query = query.eq("payment_status", filters.status);
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

// Create Transaction
export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      sessionId,
      items,
      payments,
      customerName,
      customerPhone,
      discountAmount = 0,
      notes,
    }: {
      sessionId: string;
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

      // Create transaction
      const { data: transaction, error: txError } = await queryPOSTable("pharmacy_pos_transactions")
        .insert({
          organization_id: profile.organization_id,
          branch_id: profile.branch_id,
          session_id: sessionId,
          customer_name: customerName || null,
          customer_phone: customerPhone || null,
          subtotal,
          discount_amount: discountAmount,
          discount_percent: 0,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          amount_paid: amountPaid,
          change_amount: changeAmount,
          payment_status: "paid",
          notes: notes || null,
          created_by: profile.id,
        })
        .select()
        .single();

      if (txError) throw txError;

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

      if (itemsError) throw itemsError;

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

      if (paymentsError) throw paymentsError;

      return transaction as POSTransaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["pos-active-session"] });
      queryClient.invalidateQueries({ queryKey: ["medicine-inventory"] });
      toast({
        title: "Sale Completed",
        description: "Transaction has been recorded successfully.",
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
      const { data, error } = await queryPOSTable("pharmacy_pos_transactions")
        .update({
          payment_status: "voided",
          voided_at: new Date().toISOString(),
          voided_by: profile?.id,
          void_reason: reason,
        })
        .eq("id", transactionId)
        .select()
        .single();

      if (error) throw error;
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

// POS Dashboard Stats
export function usePOSDashboardStats(branchId?: string) {
  const { profile } = useAuth();
  const targetBranchId = branchId || profile?.branch_id;

  return useQuery({
    queryKey: ["pos-dashboard-stats", targetBranchId],
    queryFn: async () => {
      if (!targetBranchId) return null;

      const today = new Date().toISOString().split("T")[0];

      // Get today's transactions
      const { data: transactions, error: txError } = await queryPOSTable("pharmacy_pos_transactions")
        .select("total_amount, payment_status")
        .eq("branch_id", targetBranchId)
        .gte("created_at", `${today}T00:00:00`)
        .lte("created_at", `${today}T23:59:59`);

      if (txError) throw txError;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const paidTransactions = (transactions as any[])?.filter((t) => t.payment_status === "paid") || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const totalSales = paidTransactions.reduce((sum, t: any) => sum + Number(t.total_amount), 0);
      const transactionCount = paidTransactions.length;

      // Get active session
      const { data: session } = await queryPOSTable("pharmacy_pos_sessions")
        .select("id, opening_balance, expected_balance")
        .eq("branch_id", targetBranchId)
        .eq("status", "open")
        .maybeSingle();

      return {
        todaySales: totalSales,
        transactionCount,
        averageTransaction: transactionCount > 0 ? totalSales / transactionCount : 0,
        hasActiveSession: !!session,
        sessionBalance: session?.expected_balance || 0,
      };
    },
    enabled: !!targetBranchId,
  });
}

// Cart Hook (Client-side state management)
export function usePOSCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.inventory_id === item.inventory_id && i.medicine_id === item.medicine_id
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        const existing = updated[existingIndex];
        const newQty = existing.quantity + item.quantity;
        
        if (newQty <= item.available_quantity) {
          updated[existingIndex] = { ...existing, quantity: newQty };
        }
        return updated;
      }

      return [...prev, item];
    });
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, quantity: Math.min(quantity, item.available_quantity) }
          : item
      )
    );
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setDiscountPercent(0);
    setCustomerName("");
    setCustomerPhone("");
  }, []);

  const subtotal = items.reduce(
    (sum, item) => sum + item.selling_price * item.quantity * (1 - item.discount_percent / 100),
    0
  );
  const discountAmount = subtotal * (discountPercent / 100);
  const taxAmount = items.reduce(
    (sum, item) =>
      sum + item.selling_price * item.quantity * (item.tax_percent / 100),
    0
  );
  const total = subtotal - discountAmount + taxAmount;

  return {
    items,
    discountPercent,
    customerName,
    customerPhone,
    subtotal,
    discountAmount,
    taxAmount,
    total,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    setDiscountPercent,
    setCustomerName,
    setCustomerPhone,
  };
}
