import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { CashDenominations } from "./useBillingSessions";

export type ClosingStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface DailyClosing {
  id: string;
  organization_id: string;
  branch_id: string;
  closing_date: string;
  closing_number: string;
  
  // Totals by payment method
  total_cash_collected: number;
  total_card_collected: number;
  total_upi_collected: number;
  total_other_collected: number;
  grand_total: number;
  
  // Transaction counts
  total_invoices: number;
  total_payments: number;
  total_sessions: number;
  
  // Department breakdown
  opd_collections: number;
  ipd_collections: number;
  pharmacy_sales: number;
  lab_collections: number;
  radiology_collections: number;
  er_collections: number;
  other_collections: number;
  
  // Receivables
  outstanding_receivables: number;
  new_credit_given: number;
  credit_recovered: number;
  
  // Cash reconciliation
  expected_cash: number;
  actual_cash?: number;
  cash_difference?: number;
  cash_denominations?: CashDenominations;
  
  // Workflow
  status: ClosingStatus;
  closed_by?: string;
  closed_at?: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  notes?: string;
  
  created_at: string;
  updated_at: string;
  
  // Joined
  closed_by_profile?: { full_name: string };
  approved_by_profile?: { full_name: string };
}

export interface DailyClosingSummary {
  date: string;
  sessions: {
    total: number;
    open: number;
    closed: number;
  };
  collections: {
    cash: number;
    card: number;
    upi: number;
    other: number;
    total: number;
  };
  expenses: {
    total: number;
    cash: number;
  };
  netCash: number;
  departments: {
    opd: number;
    ipd: number;
    pharmacy: number;
    lab: number;
    radiology: number;
    er: number;
    other: number;
  };
  invoices: {
    total: number;
    paid: number;
    pending: number;
    pendingAmount: number;
  };
  cashReconciliation: {
    expected: number;
    actual: number;
    difference: number;
  };
}

// Helper function to make database queries without deep type inference
async function fetchSessionsForDate(branchId: string, startOfDay: string, endOfDay: string) {
  const result = await (supabase as any)
    .from('billing_sessions')
    .select('id, status, expected_cash, actual_cash, card_total, upi_total, other_total, total_collections, opened_at')
    .eq('branch_id', branchId)
    .gte('opened_at', startOfDay)
    .lte('opened_at', endOfDay);
  
  return result.data || [];
}

async function fetchPaymentsForDate(branchId: string, startOfDay: string, endOfDay: string) {
  const result = await (supabase as any)
    .from('payments')
    .select('amount, payment_method_id, created_at, invoice_id')
    .eq('branch_id', branchId)
    .gte('created_at', startOfDay)
    .lte('created_at', endOfDay);
  
  return result.data || [];
}

async function fetchInvoiceItemsForDate(branchId: string, startOfDay: string, endOfDay: string) {
  const result = await (supabase as any)
    .from('invoice_items')
    .select('invoice_id, total_price, service_type:service_types(category)')
    .in('invoice_id', 
      (await (supabase as any)
        .from('invoices')
        .select('id')
        .eq('branch_id', branchId)
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay)
      ).data?.map((i: any) => i.id) || []
    );
  
  return result.data || [];
}

async function fetchInvoicesForDate(branchId: string, startOfDay: string, endOfDay: string) {
  const result = await (supabase as any)
    .from('invoices')
    .select('id, status, total_amount, paid_amount, created_at')
    .eq('branch_id', branchId)
    .gte('created_at', startOfDay)
    .lte('created_at', endOfDay);
  
  return result.data || [];
}

async function fetchPaymentMethods() {
  const result = await (supabase as any)
    .from('payment_methods')
    .select('id, name');
  
  return result.data || [];
}

async function fetchExpensesForDate(branchId: string, startOfDay: string, endOfDay: string) {
  const result = await (supabase as any)
    .from('expenses')
    .select('amount, payment_method_id')
    .eq('branch_id', branchId)
    .gte('created_at', startOfDay)
    .lte('created_at', endOfDay);
  
  return result.data || [];
}

// Hook: Get daily closing summary for a date
export function useDailyClosingSummary(date?: string) {
  const { profile } = useAuth();
  const targetDate = date || new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: ['daily-closing-summary', profile?.branch_id, targetDate],
    queryFn: async (): Promise<DailyClosingSummary> => {
      const branchId = profile?.branch_id;
      if (!branchId) throw new Error('No branch ID');
      
      const startOfDay = `${targetDate}T00:00:00`;
      const endOfDay = `${targetDate}T23:59:59`;

      // Fetch all data in parallel
      const [sessions, paymentsRaw, invoices, paymentMethods, invoiceItems, expensesRaw] = await Promise.all([
        fetchSessionsForDate(branchId, startOfDay, endOfDay),
        fetchPaymentsForDate(branchId, startOfDay, endOfDay),
        fetchInvoicesForDate(branchId, startOfDay, endOfDay),
        fetchPaymentMethods(),
        fetchInvoiceItemsForDate(branchId, startOfDay, endOfDay),
        fetchExpensesForDate(branchId, startOfDay, endOfDay),
      ]);
      
      const methodMap = new Map(paymentMethods.map((m: any) => [m.id, m.name?.toLowerCase() || '']));
      const payments = paymentsRaw as { amount: number; payment_method_id: string }[];

      // Calculate session stats
      const sessionStats = {
        total: sessions?.length || 0,
        open: sessions?.filter(s => s.status === 'open').length || 0,
        closed: sessions?.filter(s => s.status !== 'open').length || 0,
      };

      // Calculate payment totals by method using methodMap
      let cashTotal = 0, cardTotal = 0, upiTotal = 0, otherTotal = 0;

      payments?.forEach((p: any) => {
        const amount = Number(p.amount);
        const methodName = (methodMap.get(p.payment_method_id) || '') as string;

        if (methodName.includes('cash')) cashTotal += amount;
        else if (methodName.includes('card') || methodName.includes('credit') || methodName.includes('debit')) cardTotal += amount;
        else if (methodName.includes('upi') || methodName.includes('online')) upiTotal += amount;
        else otherTotal += amount;
      });

      // Department totals from invoice items via service_types.category
      let opdTotal = 0, ipdTotal = 0, pharmacyTotal = 0, labTotal = 0, radiologyTotal = 0, erTotal = 0, otherDeptTotal = 0;
      
      invoiceItems?.forEach((item: any) => {
        const amount = Number(item.total_price) || 0;
        const category = item.service_type?.category?.toLowerCase() || '';
        
        if (category.includes('opd') || category.includes('consultation')) opdTotal += amount;
        else if (category.includes('ipd') || category.includes('inpatient')) ipdTotal += amount;
        else if (category.includes('pharm')) pharmacyTotal += amount;
        else if (category.includes('lab') || category.includes('pathology')) labTotal += amount;
        else if (category.includes('radiology') || category.includes('imaging')) radiologyTotal += amount;
        else if (category.includes('emergency') || category.includes('er')) erTotal += amount;
        else otherDeptTotal += amount;
      });
      
      // If no items categorized, put grand total in other
      if (opdTotal + ipdTotal + pharmacyTotal + labTotal + radiologyTotal + erTotal + otherDeptTotal === 0) {
        otherDeptTotal = cashTotal + cardTotal + upiTotal + otherTotal;
      }

      // Calculate invoice stats
      const invoiceStats = {
        total: invoices?.length || 0,
        paid: invoices?.filter((i: any) => i.status === 'paid').length || 0,
        pending: invoices?.filter((i: any) => i.status !== 'paid').length || 0,
        pendingAmount: invoices
          ?.filter((i: any) => i.status !== 'paid')
          .reduce((sum: number, i: any) => sum + (Number(i.total_amount) - Number(i.paid_amount)), 0) || 0,
      };

      // Calculate cash reconciliation from closed sessions
      const closedSessions = sessions?.filter(s => s.status !== 'open') || [];
      const expectedCash = closedSessions.reduce((sum, s) => sum + (Number(s.expected_cash) || 0), 0);
      const actualCash = closedSessions.reduce((sum, s) => sum + (Number(s.actual_cash) || 0), 0);

      // Calculate expense totals
      let expenseTotal = 0, expenseCashTotal = 0;
      expensesRaw?.forEach((e: any) => {
        const amount = Number(e.amount);
        expenseTotal += amount;
        const methodName = e.payment_method_id ? (methodMap.get(e.payment_method_id) || '') as string : 'cash';
        if (methodName.includes('cash') || !e.payment_method_id) {
          expenseCashTotal += amount;
        }
      });

      return {
        date: targetDate,
        sessions: sessionStats,
        collections: {
          cash: cashTotal,
          card: cardTotal,
          upi: upiTotal,
          other: otherTotal,
          total: cashTotal + cardTotal + upiTotal + otherTotal,
        },
        expenses: {
          total: expenseTotal,
          cash: expenseCashTotal,
        },
        netCash: cashTotal - expenseCashTotal,
        departments: {
          opd: opdTotal,
          ipd: ipdTotal,
          pharmacy: pharmacyTotal,
          lab: labTotal,
          radiology: radiologyTotal,
          er: erTotal,
          other: otherDeptTotal,
        },
        invoices: invoiceStats,
        cashReconciliation: {
          expected: expectedCash,
          actual: actualCash,
          difference: actualCash - expectedCash,
        },
      };
    },
    enabled: !!profile?.branch_id,
  });
}

// Hook: Get existing daily closing record
export function useDailyClosing(date?: string) {
  const { profile } = useAuth();
  const targetDate = date || new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: ['daily-closing', profile?.branch_id, targetDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_closings')
        .select(`
          *,
          closed_by_profile:profiles!daily_closings_closed_by_fkey(full_name),
          approved_by_profile:profiles!daily_closings_approved_by_fkey(full_name)
        `)
        .eq('branch_id', profile?.branch_id)
        .eq('closing_date', targetDate)
        .maybeSingle();

      if (error) throw error;
      return data as DailyClosing | null;
    },
    enabled: !!profile?.branch_id,
  });
}

// Hook: Get daily closing history
export function useDailyClosingHistory(days: number = 30) {
  const { profile } = useAuth();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return useQuery({
    queryKey: ['daily-closing-history', profile?.branch_id, days],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_closings')
        .select(`
          *,
          closed_by_profile:profiles!daily_closings_closed_by_fkey(full_name),
          approved_by_profile:profiles!daily_closings_approved_by_fkey(full_name)
        `)
        .eq('branch_id', profile?.branch_id)
        .gte('closing_date', startDate.toISOString().split('T')[0])
        .order('closing_date', { ascending: false });

      if (error) throw error;
      return data as DailyClosing[];
    },
    enabled: !!profile?.branch_id,
  });
}

// Hook: Create or update daily closing
export function useCreateDailyClosing() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      date,
      summary,
      actualCash,
      cashDenominations,
      notes,
      submitForApproval,
    }: {
      date: string;
      summary: DailyClosingSummary;
      actualCash?: number;
      cashDenominations?: CashDenominations;
      notes?: string;
      submitForApproval?: boolean;
    }) => {
      if (!profile?.organization_id || !profile?.branch_id) {
        throw new Error('User profile not loaded');
      }

      // Check for existing closing
      const { data: existing } = await supabase
        .from('daily_closings')
        .select('id, status')
        .eq('branch_id', profile.branch_id)
        .eq('closing_date', date)
        .maybeSingle();

      const closingData: any = {
        organization_id: profile.organization_id,
        branch_id: profile.branch_id,
        closing_date: date,
        
        total_cash_collected: summary.collections.cash,
        total_card_collected: summary.collections.card,
        total_upi_collected: summary.collections.upi,
        total_other_collected: summary.collections.other,
        grand_total: summary.collections.total,
        
        total_invoices: summary.invoices.total,
        total_payments: summary.invoices.paid,
        total_sessions: summary.sessions.total,
        
        opd_collections: summary.departments.opd,
        ipd_collections: summary.departments.ipd,
        pharmacy_sales: summary.departments.pharmacy,
        lab_collections: summary.departments.lab,
        radiology_collections: summary.departments.radiology,
        er_collections: summary.departments.er,
        other_collections: summary.departments.other,
        
        outstanding_receivables: summary.invoices.pendingAmount,
        
        expected_cash: summary.cashReconciliation.expected,
        actual_cash: actualCash,
        cash_difference: actualCash ? actualCash - summary.cashReconciliation.expected : null,
        cash_denominations: cashDenominations as any,
        
        notes,
        status: submitForApproval ? 'submitted' : 'draft',
        closed_by: profile.id,
        closed_at: new Date().toISOString(),
      };

      if (existing) {
        if (existing.status === 'approved') {
          throw new Error('Cannot modify an approved daily closing');
        }

        const { data, error } = await supabase
          .from('daily_closings')
          .update(closingData)
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Generate closing number
        const { data: closingNumber } = await supabase.rpc('generate_closing_number', {
          p_org_id: profile.organization_id,
          p_branch_id: profile.branch_id,
          p_date: date,
        });

        const { data, error } = await supabase
          .from('daily_closings')
          .insert({
            ...closingData,
            closing_number: closingNumber,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['daily-closing'] });
      queryClient.invalidateQueries({ queryKey: ['daily-closing-history'] });
      toast.success(
        variables.submitForApproval
          ? 'Daily closing submitted for approval'
          : 'Daily closing saved as draft'
      );
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save daily closing');
    },
  });
}

// Hook: Approve daily closing
export function useApproveDailyClosing() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      closingId,
      approved,
      rejectionReason,
    }: {
      closingId: string;
      approved: boolean;
      rejectionReason?: string;
    }) => {
      const updates: any = {
        status: approved ? 'approved' : 'rejected',
      };

      if (approved) {
        updates.approved_by = profile?.id;
        updates.approved_at = new Date().toISOString();
      } else {
        updates.rejection_reason = rejectionReason;
      }

      const { data, error } = await supabase
        .from('daily_closings')
        .update(updates)
        .eq('id', closingId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['daily-closing'] });
      queryClient.invalidateQueries({ queryKey: ['daily-closing-history'] });
      toast.success(
        variables.approved
          ? 'Daily closing approved'
          : 'Daily closing rejected'
      );
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to process approval');
    },
  });
}
