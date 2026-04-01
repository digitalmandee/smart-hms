import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Types
export interface AccountType {
  id: string;
  organization_id: string;
  name: string;
  code: string;
  category: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parent_type_id: string | null;
  is_debit_normal: boolean;
  sort_order: number;
  is_system: boolean;
  created_at: string;
}

export interface Account {
  id: string;
  organization_id: string;
  branch_id: string | null;
  account_number: string;
  name: string;
  account_type_id: string;
  parent_account_id: string | null;
  description: string | null;
  is_active: boolean;
  is_system: boolean;
  opening_balance: number;
  opening_balance_date: string | null;
  current_balance: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  account_level: number;
  is_header: boolean;
  account_type?: AccountType;
  parent_account?: Account | null;
  children?: Account[];
}

export interface FiscalYear {
  id: string;
  organization_id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  is_closed: boolean;
  closed_at: string | null;
  closed_by: string | null;
  created_at: string;
}

// Account Types Hooks
export function useAccountTypes() {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["account-types", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("account_types")
        .select("*")
        .order("sort_order", { ascending: true });
      
      if (error) throw error;
      return data as AccountType[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateAccountType() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: Omit<AccountType, "id" | "organization_id" | "created_at">) => {
      const { data: result, error } = await supabase
        .from("account_types")
        .insert({
          ...data,
          organization_id: profile?.organization_id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account-types"] });
      toast.success("Account type created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create account type: ${error.message}`);
    },
  });
}

export function useUpdateAccountType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<Omit<AccountType, "id" | "organization_id" | "created_at">>) => {
      const { data: result, error } = await supabase
        .from("account_types")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account-types"] });
      toast.success("Account type updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update account type: ${error.message}`);
    },
  });
}

export function useDeleteAccountType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("account_types")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account-types"] });
      toast.success("Account type deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete account type: ${error.message}`);
    },
  });
}

// Accounts (Chart of Accounts) Hooks
export function useAccounts(filters?: { isActive?: boolean; category?: string; search?: string }) {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["accounts", profile?.organization_id, filters],
    queryFn: async () => {
      let query = supabase
        .from("accounts")
        .select(`
          *,
          account_type:account_types(*)
        `)
        .order("account_number", { ascending: true });
      
      if (filters?.isActive !== undefined) {
        query = query.eq("is_active", filters.isActive);
      }
      
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,account_number.ilike.%${filters.search}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Filter by category if specified
      let accounts = data as unknown as Account[];
      if (filters?.category) {
        accounts = accounts.filter(a => a.account_type?.category === filters.category);
      }
      
      return accounts;
    },
    enabled: !!profile?.organization_id,
  });
}

export function useAccountsTree(filters?: { isActive?: boolean }) {
  const { data: accounts, ...rest } = useAccounts(filters);
  
  // Build tree structure
  const buildTree = (accounts: Account[]): Account[] => {
    const accountMap = new Map<string, Account>();
    const roots: Account[] = [];
    
    // First pass: create map
    accounts.forEach(account => {
      accountMap.set(account.id, { ...account, children: [] });
    });
    
    // Second pass: build tree
    accounts.forEach(account => {
      const node = accountMap.get(account.id)!;
      if (account.parent_account_id) {
        const parent = accountMap.get(account.parent_account_id);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });
    
    return roots;
  };
  
  return {
    ...rest,
    data: accounts ? buildTree(accounts) : undefined,
    flatData: accounts,
  };
}

export function useAccount(id: string | undefined) {
  return useQuery({
    queryKey: ["account", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("accounts")
        .select(`
          *,
          account_type:account_types(*)
        `)
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data as unknown as Account;
    },
    enabled: !!id,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      account_number: string;
      name: string;
      account_type_id: string;
      parent_account_id?: string | null;
      branch_id?: string | null;
      description?: string | null;
      opening_balance?: number;
      opening_balance_date?: string | null;
      is_active?: boolean;
      account_level?: number;
      is_header?: boolean;
    }) => {
      const { data: result, error } = await supabase
        .from("accounts")
        .insert({
          ...data,
          organization_id: profile?.organization_id,
          created_by: profile?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Account created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create account: ${error.message}`);
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: {
      id: string;
      account_number?: string;
      name?: string;
      account_type_id?: string;
      parent_account_id?: string | null;
      branch_id?: string | null;
      description?: string | null;
      opening_balance?: number;
      opening_balance_date?: string | null;
      is_active?: boolean;
      account_level?: number;
      is_header?: boolean;
    }) => {
      const { data: result, error } = await supabase
        .from("accounts")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["account"] });
      toast.success("Account updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update account: ${error.message}`);
    },
  });
}

export function useToggleAccountStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from("accounts")
        .update({ is_active })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { is_active }) => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success(`Account ${is_active ? 'activated' : 'deactivated'} successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update account status: ${error.message}`);
    },
  });
}

// Fiscal Years Hooks
export function useFiscalYears() {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["fiscal-years", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fiscal_years")
        .select("*")
        .order("start_date", { ascending: false });
      
      if (error) throw error;
      return data as FiscalYear[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCurrentFiscalYear() {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["fiscal-year-current", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fiscal_years")
        .select("*")
        .eq("is_current", true)
        .maybeSingle();
      
      if (error) throw error;
      return data as FiscalYear | null;
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateFiscalYear() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      start_date: string;
      end_date: string;
      is_current?: boolean;
    }) => {
      // If setting as current, unset other current years
      if (data.is_current) {
        await supabase
          .from("fiscal_years")
          .update({ is_current: false })
          .eq("organization_id", profile?.organization_id);
      }
      
      const { data: result, error } = await supabase
        .from("fiscal_years")
        .insert({
          ...data,
          organization_id: profile?.organization_id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fiscal-years"] });
      queryClient.invalidateQueries({ queryKey: ["fiscal-year-current"] });
      toast.success("Fiscal year created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create fiscal year: ${error.message}`);
    },
  });
}

// Account Balance Query
export function useAccountBalance(accountId: string | undefined) {
  return useQuery({
    queryKey: ["account-balance", accountId],
    queryFn: async () => {
      if (!accountId) return null;
      
      const { data, error } = await supabase
        .from("accounts")
        .select("current_balance, opening_balance")
        .eq("id", accountId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!accountId,
  });
}

// Account Ledger (transactions for an account or multiple accounts)
export function useAccountLedger(
  accountId: string | string[] | undefined,
  dateRange?: { from: string; to: string }
) {
  const ids = Array.isArray(accountId) ? accountId : accountId ? [accountId] : [];

  return useQuery({
    queryKey: ["account-ledger", ids, dateRange],
    queryFn: async () => {
      if (ids.length === 0) return [];
      
      let query = supabase
        .from("journal_entry_lines")
        .select(`
          *,
          account:accounts(id, name, account_number),
          journal_entry:journal_entries(
            id,
            entry_number,
            entry_date,
            description,
            reference_type,
            reference_id,
            is_posted
          )
        `)
        .order("created_at", { ascending: true });

      if (ids.length === 1) {
        query = query.eq("account_id", ids[0]);
      } else {
        query = query.in("account_id", ids);
      }
      
      if (dateRange?.from) {
        query = query.gte("journal_entry.entry_date", dateRange.from);
      }
      if (dateRange?.to) {
        query = query.lte("journal_entry.entry_date", dateRange.to);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
    enabled: ids.length > 0,
  });
}
