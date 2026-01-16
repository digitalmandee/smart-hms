import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Types
export interface TrialBalanceRow {
  account_id: string;
  account_number: string;
  account_name: string;
  account_type: string;
  category: string;
  debit: number;
  credit: number;
}

export interface ProfitLossSection {
  title: string;
  items: {
    account_id: string;
    account_name: string;
    amount: number;
  }[];
  total: number;
}

export interface BalanceSheetSection {
  title: string;
  items: {
    account_id: string;
    account_name: string;
    amount: number;
  }[];
  total: number;
}

export interface CashFlowItem {
  description: string;
  amount: number;
  category: "operating" | "investing" | "financing";
}

// =====================
// Trial Balance
// =====================

export function useTrialBalance(startDate?: string, endDate?: string) {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["trial-balance", profile?.organization_id, startDate, endDate],
    queryFn: async () => {
      // Fetch accounts with their types
      const { data: accounts, error: accountsError } = await supabase
        .from("accounts")
        .select(`
          id,
          account_number,
          name,
          current_balance,
          account_type:account_types(
            name,
            category,
            is_debit_normal
          )
        `)
        .eq("is_active", true)
        .order("account_number");

      if (accountsError) throw accountsError;

      // Build trial balance
      const trialBalance: TrialBalanceRow[] = (accounts || []).map(account => {
        const balance = Number(account.current_balance) || 0;
        const isDebitNormal = account.account_type?.is_debit_normal ?? true;
        
        return {
          account_id: account.id,
          account_number: account.account_number,
          account_name: account.name,
          account_type: account.account_type?.name || "Unknown",
          category: account.account_type?.category || "Unknown",
          debit: isDebitNormal ? (balance >= 0 ? balance : 0) : (balance < 0 ? Math.abs(balance) : 0),
          credit: isDebitNormal ? (balance < 0 ? Math.abs(balance) : 0) : (balance >= 0 ? balance : 0),
        };
      });

      const totalDebits = trialBalance.reduce((sum, row) => sum + row.debit, 0);
      const totalCredits = trialBalance.reduce((sum, row) => sum + row.credit, 0);

      return {
        rows: trialBalance,
        totalDebits,
        totalCredits,
        isBalanced: Math.abs(totalDebits - totalCredits) < 0.01,
      };
    },
    enabled: !!profile?.organization_id,
  });
}

// =====================
// Profit & Loss Statement
// =====================

export function useProfitLoss(startDate?: string, endDate?: string) {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["profit-loss", profile?.organization_id, startDate, endDate],
    queryFn: async () => {
      // Fetch revenue and expense accounts
      const { data: accounts, error } = await supabase
        .from("accounts")
        .select(`
          id,
          name,
          current_balance,
          account_type:account_types(
            name,
            category
          )
        `)
        .eq("is_active", true)
        .in("account_type.category", ["revenue", "expense"])
        .order("account_number");

      if (error) throw error;

      const revenueAccounts = (accounts || []).filter(
        a => a.account_type?.category === "revenue"
      );
      const expenseAccounts = (accounts || []).filter(
        a => a.account_type?.category === "expense"
      );

      const revenue: ProfitLossSection = {
        title: "Revenue",
        items: revenueAccounts.map(a => ({
          account_id: a.id,
          account_name: a.name,
          amount: Math.abs(Number(a.current_balance) || 0),
        })),
        total: revenueAccounts.reduce((sum, a) => sum + Math.abs(Number(a.current_balance) || 0), 0),
      };

      const expenses: ProfitLossSection = {
        title: "Expenses",
        items: expenseAccounts.map(a => ({
          account_id: a.id,
          account_name: a.name,
          amount: Math.abs(Number(a.current_balance) || 0),
        })),
        total: expenseAccounts.reduce((sum, a) => sum + Math.abs(Number(a.current_balance) || 0), 0),
      };

      const netIncome = revenue.total - expenses.total;

      return {
        revenue,
        expenses,
        grossProfit: revenue.total,
        operatingExpenses: expenses.total,
        netIncome,
        isProfit: netIncome >= 0,
      };
    },
    enabled: !!profile?.organization_id,
  });
}

// =====================
// Balance Sheet
// =====================

export function useBalanceSheet(asOfDate?: string) {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["balance-sheet", profile?.organization_id, asOfDate],
    queryFn: async () => {
      // Fetch asset, liability, and equity accounts
      const { data: accounts, error } = await supabase
        .from("accounts")
        .select(`
          id,
          name,
          current_balance,
          account_type:account_types(
            name,
            category
          )
        `)
        .eq("is_active", true)
        .order("account_number");

      if (error) throw error;

      const assetAccounts = (accounts || []).filter(
        a => a.account_type?.category === "asset"
      );
      const liabilityAccounts = (accounts || []).filter(
        a => a.account_type?.category === "liability"
      );
      const equityAccounts = (accounts || []).filter(
        a => a.account_type?.category === "equity"
      );

      const assets: BalanceSheetSection = {
        title: "Assets",
        items: assetAccounts.map(a => ({
          account_id: a.id,
          account_name: a.name,
          amount: Number(a.current_balance) || 0,
        })),
        total: assetAccounts.reduce((sum, a) => sum + (Number(a.current_balance) || 0), 0),
      };

      const liabilities: BalanceSheetSection = {
        title: "Liabilities",
        items: liabilityAccounts.map(a => ({
          account_id: a.id,
          account_name: a.name,
          amount: Math.abs(Number(a.current_balance) || 0),
        })),
        total: liabilityAccounts.reduce((sum, a) => sum + Math.abs(Number(a.current_balance) || 0), 0),
      };

      const equity: BalanceSheetSection = {
        title: "Equity",
        items: equityAccounts.map(a => ({
          account_id: a.id,
          account_name: a.name,
          amount: Math.abs(Number(a.current_balance) || 0),
        })),
        total: equityAccounts.reduce((sum, a) => sum + Math.abs(Number(a.current_balance) || 0), 0),
      };

      const totalLiabilitiesAndEquity = liabilities.total + equity.total;
      const isBalanced = Math.abs(assets.total - totalLiabilitiesAndEquity) < 0.01;

      return {
        assets,
        liabilities,
        equity,
        totalAssets: assets.total,
        totalLiabilitiesAndEquity,
        isBalanced,
      };
    },
    enabled: !!profile?.organization_id,
  });
}

// =====================
// Cash Flow Statement
// =====================

export function useCashFlow(startDate?: string, endDate?: string) {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["cash-flow", profile?.organization_id, startDate, endDate],
    queryFn: async () => {
      // Simplified cash flow - in real implementation, would calculate from journal entries
      const { data: payments, error: paymentsError } = await supabase
        .from("payments")
        .select("amount, payment_date")
        .order("payment_date", { ascending: false })
        .limit(100);

      if (paymentsError) throw paymentsError;

      const totalCollections = (payments || []).reduce((sum, p) => sum + Number(p.amount), 0);

      const operating: CashFlowItem[] = [
        { description: "Collections from Patients", amount: totalCollections, category: "operating" },
        { description: "Payments to Suppliers", amount: 0, category: "operating" },
        { description: "Salaries & Wages", amount: 0, category: "operating" },
      ];

      const investing: CashFlowItem[] = [
        { description: "Equipment Purchases", amount: 0, category: "investing" },
        { description: "Equipment Sales", amount: 0, category: "investing" },
      ];

      const financing: CashFlowItem[] = [
        { description: "Loan Receipts", amount: 0, category: "financing" },
        { description: "Loan Repayments", amount: 0, category: "financing" },
      ];

      const operatingTotal = operating.reduce((sum, i) => sum + i.amount, 0);
      const investingTotal = investing.reduce((sum, i) => sum + i.amount, 0);
      const financingTotal = financing.reduce((sum, i) => sum + i.amount, 0);

      return {
        operating,
        investing,
        financing,
        operatingTotal,
        investingTotal,
        financingTotal,
        netCashFlow: operatingTotal + investingTotal + financingTotal,
      };
    },
    enabled: !!profile?.organization_id,
  });
}

// =====================
// Financial Summary
// =====================

export function useFinancialSummary() {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["financial-summary", profile?.organization_id],
    queryFn: async () => {
      // Get total revenue from invoices
      const { data: invoices, error: invoicesError } = await supabase
        .from("invoices")
        .select("total_amount, paid_amount, status");

      if (invoicesError) throw invoicesError;

      // Get total payments
      const { data: payments, error: paymentsError } = await supabase
        .from("payments")
        .select("amount");

      if (paymentsError) throw paymentsError;

      const totalRevenue = (invoices || []).reduce((sum, i) => sum + Number(i.total_amount), 0);
      const totalCollected = (payments || []).reduce((sum, p) => sum + Number(p.amount), 0);
      const totalOutstanding = totalRevenue - totalCollected;

      return {
        totalRevenue,
        totalCollected,
        totalOutstanding,
        collectionRate: totalRevenue > 0 ? (totalCollected / totalRevenue) * 100 : 0,
      };
    },
    enabled: !!profile?.organization_id,
  });
}
