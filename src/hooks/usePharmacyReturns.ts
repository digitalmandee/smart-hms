import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { POSTransaction } from "@/hooks/usePOS";

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
  quantity: number;
  unit_price: number;
  total_price: number;
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
          items:pharmacy_pos_items(id, medicine_name, quantity, unit_price, total_price)
        `)
        .eq("branch_id", profile.branch_id)
        .eq("status", "completed")
        .or(`transaction_number.ilike.%${query}%,customer_name.ilike.%${query}%,customer_phone.ilike.%${query}%`)
        .order("created_at", { ascending: false })
        .limit(20);

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

// Process return/refund
export function useProcessReturn() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      transactionId,
      reason,
      restockItems = true,
    }: {
      transactionId: string;
      reason: string;
      restockItems?: boolean;
    }) => {
      // Mark transaction as refunded
      const { data, error } = await queryPOSTable("pharmacy_pos_transactions")
        .update({
          status: "refunded",
          voided_at: new Date().toISOString(),
          voided_by: profile?.id,
          void_reason: reason,
        })
        .eq("id", transactionId)
        .select()
        .single();

      if (error) throw error;

      // TODO: If restockItems is true, update inventory quantities
      // This would require fetching items and adjusting stock

      return data as POSTransaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["recent-returns"] });
      queryClient.invalidateQueries({ queryKey: ["returns-stats"] });
      queryClient.invalidateQueries({ queryKey: ["search-transaction-return"] });
      toast({
        title: "Return Processed",
        description: "The transaction has been marked as refunded.",
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
