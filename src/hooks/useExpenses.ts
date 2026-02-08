import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type ExpenseCategory = 'petty_cash' | 'refund' | 'staff_advance' | 'misc' | 'other';

export interface Expense {
  id: string;
  organization_id: string;
  branch_id: string;
  billing_session_id: string | null;
  expense_number: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  paid_to: string | null;
  payment_method_id: string | null;
  reference_number: string | null;
  approved_by: string | null;
  approved_at: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  // Joined
  created_by_profile?: { full_name: string };
  approved_by_profile?: { full_name: string };
  payment_method?: { name: string; code: string };
}

export interface CreateExpenseInput {
  amount: number;
  category: ExpenseCategory;
  description: string;
  paidTo?: string;
  paymentMethodId?: string;
  referenceNumber?: string;
  notes?: string;
  billingSessionId?: string;
}

// Hook: Get expenses for a specific session
export function useSessionExpenses(sessionId?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['session-expenses', sessionId],
    queryFn: async (): Promise<Expense[]> => {
      if (!sessionId) return [];
      
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          created_by_profile:profiles!expenses_created_by_fkey(full_name),
          approved_by_profile:profiles!expenses_approved_by_fkey(full_name),
          payment_method:payment_methods(name, code)
        `)
        .eq('billing_session_id', sessionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Expense[];
    },
    enabled: !!sessionId && !!profile?.organization_id,
  });
}

// Hook: Get expenses for a branch on a specific date
export function useBranchExpenses(branchId?: string, date?: string) {
  const { profile } = useAuth();
  const targetBranch = branchId || profile?.branch_id;
  const targetDate = date || new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: ['branch-expenses', targetBranch, targetDate],
    queryFn: async (): Promise<Expense[]> => {
      if (!targetBranch) return [];
      
      const startOfDay = `${targetDate}T00:00:00`;
      const endOfDay = `${targetDate}T23:59:59`;

      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          created_by_profile:profiles!expenses_created_by_fkey(full_name),
          approved_by_profile:profiles!expenses_approved_by_fkey(full_name),
          payment_method:payment_methods(name, code)
        `)
        .eq('branch_id', targetBranch)
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Expense[];
    },
    enabled: !!targetBranch && !!profile?.organization_id,
  });
}

// Hook: Get expenses for organization on a specific date
export function useOrganizationExpenses(date?: string) {
  const { profile } = useAuth();
  const targetDate = date || new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: ['organization-expenses', profile?.organization_id, targetDate],
    queryFn: async (): Promise<Expense[]> => {
      if (!profile?.organization_id) return [];
      
      const startOfDay = `${targetDate}T00:00:00`;
      const endOfDay = `${targetDate}T23:59:59`;

      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          created_by_profile:profiles!expenses_created_by_fkey(full_name),
          approved_by_profile:profiles!expenses_approved_by_fkey(full_name),
          payment_method:payment_methods(name, code)
        `)
        .eq('organization_id', profile.organization_id)
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Expense[];
    },
    enabled: !!profile?.organization_id,
  });
}

// Hook: Create a new expense
export function useCreateExpense() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateExpenseInput) => {
      if (!profile?.organization_id || !profile?.branch_id) {
        throw new Error('User profile not loaded');
      }

      // Generate expense number
      const { data: expenseNumber, error: rpcError } = await supabase.rpc(
        'generate_expense_number',
        { p_org_id: profile.organization_id }
      );

      if (rpcError) {
        console.error('Error generating expense number:', rpcError);
        // Fallback to manual generation
        const fallbackNumber = `EXP-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
        
        const { data, error } = await supabase
          .from('expenses')
          .insert({
            organization_id: profile.organization_id,
            branch_id: profile.branch_id,
            billing_session_id: input.billingSessionId || null,
            expense_number: fallbackNumber,
            amount: input.amount,
            category: input.category,
            description: input.description,
            paid_to: input.paidTo || null,
            payment_method_id: input.paymentMethodId || null,
            reference_number: input.referenceNumber || null,
            notes: input.notes || null,
            created_by: profile.id,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }

      const { data, error } = await supabase
        .from('expenses')
        .insert({
          organization_id: profile.organization_id,
          branch_id: profile.branch_id,
          billing_session_id: input.billingSessionId || null,
          expense_number: expenseNumber,
          amount: input.amount,
          category: input.category,
          description: input.description,
          paid_to: input.paidTo || null,
          payment_method_id: input.paymentMethodId || null,
          reference_number: input.referenceNumber || null,
          notes: input.notes || null,
          created_by: profile.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['session-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['branch-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['organization-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['day-end-summary'] });
      toast.success(`Expense of Rs. ${variables.amount.toLocaleString()} recorded`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to record expense');
    },
  });
}

// Hook: Approve an expense
export function useApproveExpense() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (expenseId: string) => {
      if (!profile?.id) {
        throw new Error('User not logged in');
      }

      const { data, error } = await supabase
        .from('expenses')
        .update({
          approved_by: profile.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', expenseId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['branch-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['organization-expenses'] });
      toast.success('Expense approved');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to approve expense');
    },
  });
}

// Category display labels
export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  petty_cash: 'Petty Cash',
  refund: 'Refund',
  staff_advance: 'Staff Advance',
  misc: 'Miscellaneous',
  other: 'Other',
};
