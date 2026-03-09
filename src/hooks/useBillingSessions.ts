import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type CounterType = 'reception' | 'ipd' | 'pharmacy' | 'opd' | 'er';
export type SessionStatus = 'open' | 'closed' | 'reconciled';
export type ShiftType = 'morning' | 'evening' | 'night';

export interface CashDenominations {
  note_5000?: number;
  note_1000?: number;
  note_500?: number;
  note_100?: number;
  note_50?: number;
  note_20?: number;
  note_10?: number;
  coins?: number;
  [key: string]: number | undefined;
}

export interface BillingSession {
  id: string;
  organization_id: string;
  branch_id: string;
  session_number: string;
  counter_type: CounterType;
  opened_by: string;
  opened_at: string;
  closed_by?: string;
  closed_at?: string;
  opening_cash: number;
  expected_cash: number;
  actual_cash?: number;
  cash_difference?: number;
  card_total: number;
  upi_total: number;
  other_total: number;
  total_collections: number;
  transaction_count: number;
  status: SessionStatus;
  notes?: string;
  shift?: ShiftType;
  cash_denominations?: CashDenominations;
  reconciled_by?: string;
  reconciled_at?: string;
  discrepancy_reason?: string;
  discrepancy_approved_by?: string;
  discrepancy_approved_at?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  opened_by_profile?: { full_name: string };
  closed_by_profile?: { full_name: string };
}

// Get current shift based on time
export function getCurrentShift(): ShiftType {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 14) return 'morning';
  if (hour >= 14 && hour < 22) return 'evening';
  return 'night';
}

// Calculate total from denominations
export function calculateDenominationTotal(denominations: CashDenominations): number {
  let total = 0;
  for (const [key, count] of Object.entries(denominations)) {
    if (!count || count <= 0) continue;
    if (key === 'coins') {
      total += count;
    } else if (key.startsWith('note_')) {
      const value = parseInt(key.replace('note_', ''), 10);
      if (!isNaN(value)) total += count * value;
    }
  }
  return total;
}

// Hook: Get active session for current user/counter
export function useActiveSession(counterType?: CounterType) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['billing-session', 'active', profile?.id, counterType],
    queryFn: async () => {
      let query = supabase
        .from('billing_sessions')
        .select(`
          *,
          opened_by_profile:profiles!billing_sessions_opened_by_fkey(full_name)
        `)
        .eq('status', 'open')
        .eq('opened_by', profile?.id);

      if (counterType) {
        query = query.eq('counter_type', counterType);
      }

      const { data, error } = await query.maybeSingle();

      if (error) throw error;
      return data as BillingSession | null;
    },
    enabled: !!profile?.id,
  });
}

// Hook: Get all sessions for branch (today by default)
export function useBranchSessions(branchId?: string, date?: string) {
  const { profile } = useAuth();
  const targetDate = date || new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: ['billing-sessions', branchId || profile?.branch_id, targetDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('billing_sessions')
        .select(`
          *,
          opened_by_profile:profiles!billing_sessions_opened_by_fkey(full_name),
          closed_by_profile:profiles!billing_sessions_closed_by_fkey(full_name)
        `)
        .eq('branch_id', branchId || profile?.branch_id)
        .gte('opened_at', `${targetDate}T00:00:00`)
        .lte('opened_at', `${targetDate}T23:59:59`)
        .order('opened_at', { ascending: false });

      if (error) throw error;
      return data as BillingSession[];
    },
    enabled: !!(branchId || profile?.branch_id),
  });
}

// Hook: Get session by ID
export function useSession(sessionId?: string) {
  return useQuery({
    queryKey: ['billing-session', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('billing_sessions')
        .select(`
          *,
          opened_by_profile:profiles!billing_sessions_opened_by_fkey(full_name),
          closed_by_profile:profiles!billing_sessions_closed_by_fkey(full_name)
        `)
        .eq('id', sessionId)
        .single();

      if (error) throw error;
      return data as BillingSession;
    },
    enabled: !!sessionId,
  });
}

// Hook: Open a new session
export function useOpenSession() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      counterType,
      openingCash,
      notes,
    }: {
      counterType: CounterType;
      openingCash: number;
      notes?: string;
    }) => {
      if (!profile?.organization_id || !profile?.branch_id) {
        throw new Error('User profile not loaded');
      }

      // Check for existing open session by this user
      const { data: existing } = await supabase
        .from('billing_sessions')
        .select('id, session_number')
        .eq('opened_by', profile.id)
        .eq('status', 'open')
        .maybeSingle();

      if (existing) {
        throw new Error(`You already have an open session: ${existing.session_number}`);
      }

      // Check if this counter already has an active session (by any user)
      const { data: counterSession } = await supabase
        .from('billing_sessions')
        .select('id, session_number')
        .eq('branch_id', profile.branch_id)
        .eq('counter_type', counterType)
        .eq('status', 'open')
        .maybeSingle();

      if (counterSession) {
        throw new Error(`This counter already has an active session: ${counterSession.session_number}`);
      }

      // Generate session number
      const { data: sessionNumber } = await supabase.rpc('generate_session_number', {
        p_org_id: profile.organization_id,
      });

      const shift = getCurrentShift();

      const { data, error } = await supabase
        .from('billing_sessions')
        .insert({
          organization_id: profile.organization_id,
          branch_id: profile.branch_id,
          session_number: sessionNumber,
          counter_type: counterType,
          opened_by: profile.id,
          opening_cash: openingCash,
          expected_cash: openingCash, // Starts with opening cash
          shift,
          notes,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-session'] });
      queryClient.invalidateQueries({ queryKey: ['billing-sessions'] });
      toast.success('Session opened successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to open session');
    },
  });
}

// Hook: Close a session
export function useCloseSession() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      sessionId,
      actualCash,
      cashDenominations,
      discrepancyReason,
      notes,
    }: {
      sessionId: string;
      actualCash: number;
      cashDenominations?: CashDenominations;
      discrepancyReason?: string;
      notes?: string;
    }) => {
      // Get session to calculate expected cash
      const { data: session, error: fetchError } = await supabase
        .from('billing_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (fetchError) throw fetchError;

      // Calculate expected cash: opening + cash payments
      const { data: payments } = await supabase
        .from('payments')
        .select('amount, payment_method:payment_methods(name)')
        .eq('billing_session_id', sessionId);

      let cashTotal = session.opening_cash || 0;
      let cardTotal = 0;
      let upiTotal = 0;
      let otherTotal = 0;

      payments?.forEach((p: any) => {
        const methodName = p.payment_method?.name?.toLowerCase() || '';
        if (methodName.includes('cash')) {
          cashTotal += Number(p.amount);
        } else if (methodName.includes('card') || methodName.includes('credit') || methodName.includes('debit')) {
          cardTotal += Number(p.amount);
        } else if (methodName.includes('upi') || methodName.includes('online')) {
          upiTotal += Number(p.amount);
        } else {
          otherTotal += Number(p.amount);
        }
      });

      const cashDifference = actualCash - cashTotal;
      const totalCollections = (payments || []).reduce((sum: number, p: any) => sum + Number(p.amount), 0);
      const transactionCount = payments?.length || 0;

      const { data, error } = await supabase
        .from('billing_sessions')
        .update({
          closed_by: profile?.id,
          closed_at: new Date().toISOString(),
          expected_cash: cashTotal,
          actual_cash: actualCash,
          cash_difference: cashDifference,
          card_total: cardTotal,
          upi_total: upiTotal,
          other_total: otherTotal,
          total_collections: totalCollections,
          transaction_count: transactionCount,
          cash_denominations: cashDenominations,
          discrepancy_reason: discrepancyReason,
          status: 'closed',
          notes: notes ? `${session.notes || ''}\n\nClosing Notes: ${notes}` : session.notes,
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-session'] });
      queryClient.invalidateQueries({ queryKey: ['billing-sessions'] });
      toast.success('Session closed successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to close session');
    },
  });
}

// Hook: Reconcile a session (manager approval for discrepancies)
export function useReconcileSession() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      sessionId,
      approved,
      notes,
    }: {
      sessionId: string;
      approved: boolean;
      notes?: string;
    }) => {
      const updates: any = {
        reconciled_by: profile?.id,
        reconciled_at: new Date().toISOString(),
        status: 'reconciled',
      };

      if (approved) {
        updates.discrepancy_approved_by = profile?.id;
        updates.discrepancy_approved_at = new Date().toISOString();
      }

      if (notes) {
        const { data: session } = await supabase
          .from('billing_sessions')
          .select('notes')
          .eq('id', sessionId)
          .single();

        updates.notes = `${session?.notes || ''}\n\nReconciliation Notes: ${notes}`;
      }

      const { data, error } = await supabase
        .from('billing_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-session'] });
      queryClient.invalidateQueries({ queryKey: ['billing-sessions'] });
      toast.success('Session reconciled');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reconcile session');
    },
  });
}

// Hook: Get session transactions
export function useSessionTransactions(sessionId?: string) {
  return useQuery({
    queryKey: ['session-transactions', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          payment_method:payment_methods(name),
          invoice:invoices(invoice_number, patient:patients(first_name, last_name))
        `)
        .eq('billing_session_id', sessionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!sessionId,
  });
}

// Hook: Get all sessions for branch with date range filtering
export function useAllBranchSessions(filters?: {
  dateFrom?: string;
  dateTo?: string;
  counterType?: CounterType;
  status?: SessionStatus;
}) {
  const { profile } = useAuth();
  const dateFrom = filters?.dateFrom || new Date().toISOString().split('T')[0];
  const dateTo = filters?.dateTo || dateFrom;

  return useQuery({
    queryKey: ['billing-sessions', 'all', profile?.branch_id, dateFrom, dateTo, filters?.counterType, filters?.status],
    queryFn: async () => {
      let query = supabase
        .from('billing_sessions')
        .select(`
          *,
          opened_by_profile:profiles!billing_sessions_opened_by_fkey(full_name),
          closed_by_profile:profiles!billing_sessions_closed_by_fkey(full_name)
        `)
        .eq('branch_id', profile?.branch_id)
        .gte('opened_at', `${dateFrom}T00:00:00`)
        .lte('opened_at', `${dateTo}T23:59:59`)
        .order('opened_at', { ascending: false });

      if (filters?.counterType) {
        query = query.eq('counter_type', filters.counterType);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as BillingSession[];
    },
    enabled: !!profile?.branch_id,
  });
}

// Hook: Get sessions with open status count
export function useOpenSessionsCount(branchId?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['open-sessions-count', branchId || profile?.branch_id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('billing_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('branch_id', branchId || profile?.branch_id)
        .eq('status', 'open');

      if (error) throw error;
      return count || 0;
    },
    enabled: !!(branchId || profile?.branch_id),
  });
}

// Hook: Get all unclosed (open) sessions for the branch, regardless of date
export function useUnclosedSessions() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['billing-sessions', 'unclosed', profile?.branch_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('billing_sessions')
        .select(`
          *,
          opened_by_profile:profiles!billing_sessions_opened_by_fkey(full_name),
          closed_by_profile:profiles!billing_sessions_closed_by_fkey(full_name)
        `)
        .eq('branch_id', profile?.branch_id)
        .eq('status', 'open')
        .order('opened_at', { ascending: true });

      if (error) throw error;
      return data as BillingSession[];
    },
    enabled: !!profile?.branch_id,
  });
}
