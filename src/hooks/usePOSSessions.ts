import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { POSSession, POSTransaction } from "@/hooks/usePOS";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const queryPOSTable = (table: string): any => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).from(table);
};

export function useCurrentPOSSession() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["pos-current-session", profile?.branch_id, profile?.id],
    queryFn: async () => {
      if (!profile?.branch_id || !profile?.id) return null;

      const { data, error } = await queryPOSTable("pharmacy_pos_sessions")
        .select(`
          *,
          opener:profiles!pharmacy_pos_sessions_opened_by_fkey(full_name)
        `)
        .eq("branch_id", profile.branch_id)
        .eq("opened_by", profile.id)
        .eq("status", "open")
        .order("opened_at", { ascending: false })
        .limit(1);

      if (error) throw error;
      return (data && data.length > 0 ? data[0] : null) as POSSession | null;
    },
    enabled: !!profile?.branch_id && !!profile?.id,
  });
}

export function useOpenSession() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({ openingBalance }: { openingBalance: number }) => {
      if (!profile?.organization_id || !profile?.branch_id) {
        throw new Error("No organization or branch context");
      }

      // Generate session number
      const sessionNumber = `PSES-${Date.now().toString(36).toUpperCase()}`;

      const { data, error } = await queryPOSTable("pharmacy_pos_sessions")
        .insert({
          organization_id: profile.organization_id,
          branch_id: profile.branch_id,
          session_number: sessionNumber,
          opened_by: profile.id,
          opening_balance: openingBalance,
          status: "open",
        })
        .select(`
          *,
          opener:profiles!pharmacy_pos_sessions_opened_by_fkey(full_name)
        `)
        .single();

      if (error) throw error;
      return data as POSSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-current-session"] });
      queryClient.invalidateQueries({ queryKey: ["pos-sessions"] });
      toast({ title: "Register Opened", description: "POS session started successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

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
      if (!profile?.id) throw new Error("Not authenticated");

      // Fetch transactions for this session to calculate totals
      const { data: transactions } = await queryPOSTable("pharmacy_pos_transactions")
        .select("*, payments:pharmacy_pos_payments(*)")
        .eq("session_id", sessionId);

      const txns = (transactions || []) as POSTransaction[];
      const completedTxns = txns.filter(t => t.status === "completed");
      const totalSales = completedTxns.reduce((s, t) => s + Number(t.total_amount), 0);
      const totalTransactions = completedTxns.length;

      // Calculate cash sales from payments
      const cashSales = completedTxns.reduce((sum, t) => {
        const cashPayments = (t.payments || []).filter(p => p.payment_method === "cash");
        return sum + cashPayments.reduce((s, p) => s + Number(p.amount), 0);
      }, 0);

      // Fetch session opening balance
      const { data: session } = await queryPOSTable("pharmacy_pos_sessions")
        .select("opening_balance")
        .eq("id", sessionId)
        .single();

      const openingBalance = session?.opening_balance || 0;
      const expectedCash = openingBalance + cashSales;
      const cashDifference = closingBalance - expectedCash;

      const { data, error } = await queryPOSTable("pharmacy_pos_sessions")
        .update({
          closed_by: profile.id,
          closed_at: new Date().toISOString(),
          closing_balance: closingBalance,
          expected_cash: expectedCash,
          cash_difference: cashDifference,
          total_sales: totalSales,
          total_transactions: totalTransactions,
          status: "closed",
          notes: notes || null,
        })
        .eq("id", sessionId)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data as POSSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-current-session"] });
      queryClient.invalidateQueries({ queryKey: ["pos-sessions"] });
      toast({ title: "Register Closed", description: "POS session closed successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function usePOSSessionHistory(branchId?: string) {
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
        .limit(100);

      if (error) throw error;
      return data as POSSession[];
    },
    enabled: !!targetBranchId,
  });
}

export function usePOSSessionDetail(sessionId: string | undefined) {
  return useQuery({
    queryKey: ["pos-session-detail", sessionId],
    queryFn: async () => {
      if (!sessionId) return null;

      const { data: session, error: sessionError } = await queryPOSTable("pharmacy_pos_sessions")
        .select(`
          *,
          opener:profiles!pharmacy_pos_sessions_opened_by_fkey(full_name),
          closer:profiles!pharmacy_pos_sessions_closed_by_fkey(full_name)
        `)
        .eq("id", sessionId)
        .single();

      if (sessionError) throw sessionError;

      // Fetch linked transactions
      const { data: transactions, error: txError } = await queryPOSTable("pharmacy_pos_transactions")
        .select(`
          *,
          creator:profiles!pharmacy_pos_transactions_created_by_fkey(full_name),
          payments:pharmacy_pos_payments(*)
        `)
        .eq("session_id", sessionId)
        .order("created_at", { ascending: false });

      if (txError) throw txError;

      return {
        session: session as POSSession,
        transactions: (transactions || []) as POSTransaction[],
      };
    },
    enabled: !!sessionId,
  });
}
