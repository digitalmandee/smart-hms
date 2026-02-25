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
          opening_balance,
          current_balance,
          account_type:account_types(
            name,
            category,
            is_debit_normal
          )
        `)
        .eq("is_active", true)
        .eq("is_header", false)
        .order("account_number");

      if (accountsError) throw accountsError;

      // If date range provided, calculate balances from journal entry lines
      let journalTotals: Record<string, { debit: number; credit: number }> = {};
      
      if (startDate && endDate) {
        const { data: lines, error: linesError } = await supabase
          .from("journal_entry_lines")
          .select(`
            account_id,
            debit_amount,
            credit_amount,
            journal_entry:journal_entries!inner(
              entry_date,
              is_posted
            )
          `)
          .eq("journal_entry.is_posted", true)
          .gte("journal_entry.entry_date", startDate)
          .lte("journal_entry.entry_date", endDate);

        if (linesError) throw linesError;

        for (const line of lines || []) {
          if (!journalTotals[line.account_id]) {
            journalTotals[line.account_id] = { debit: 0, credit: 0 };
          }
          journalTotals[line.account_id].debit += Number(line.debit_amount) || 0;
          journalTotals[line.account_id].credit += Number(line.credit_amount) || 0;
        }
      }

      // Build trial balance
      const useDateFilter = !!(startDate && endDate);
      
      const trialBalance: TrialBalanceRow[] = (accounts || []).map(account => {
        const isDebitNormal = account.account_type?.is_debit_normal ?? true;
        
        let balance: number;
        if (useDateFilter) {
          const totals = journalTotals[account.id] || { debit: 0, credit: 0 };
          // Period balance = net movement within date range
          balance = isDebitNormal
            ? totals.debit - totals.credit
            : totals.credit - totals.debit;
        } else {
          balance = Number(account.current_balance) || 0;
        }
        
        return {
          account_id: account.id,
          account_number: account.account_number,
          account_name: account.name,
          account_type: account.account_type?.name || "Unknown",
          category: account.account_type?.category || "Unknown",
          debit: isDebitNormal ? (balance >= 0 ? balance : 0) : (balance < 0 ? Math.abs(balance) : 0),
          credit: isDebitNormal ? (balance < 0 ? Math.abs(balance) : 0) : (balance >= 0 ? balance : 0),
        };
      }).filter(row => row.debit !== 0 || row.credit !== 0 || !useDateFilter);

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
            category,
            is_debit_normal
          )
        `)
        .eq("is_active", true)
        .eq("is_header", false)
        .order("account_number");

      if (error) throw error;

      // If date range provided, calculate from journal entries
      let journalTotals: Record<string, { debit: number; credit: number }> = {};
      const useDateFilter = !!(startDate && endDate);
      
      if (useDateFilter) {
        const { data: lines, error: linesError } = await supabase
          .from("journal_entry_lines")
          .select(`
            account_id,
            debit_amount,
            credit_amount,
            journal_entry:journal_entries!inner(
              entry_date,
              is_posted
            )
          `)
          .eq("journal_entry.is_posted", true)
          .gte("journal_entry.entry_date", startDate)
          .lte("journal_entry.entry_date", endDate);

        if (linesError) throw linesError;

        for (const line of lines || []) {
          if (!journalTotals[line.account_id]) {
            journalTotals[line.account_id] = { debit: 0, credit: 0 };
          }
          journalTotals[line.account_id].debit += Number(line.debit_amount) || 0;
          journalTotals[line.account_id].credit += Number(line.credit_amount) || 0;
        }
      }

      const getAmount = (account: any) => {
        if (useDateFilter) {
          const totals = journalTotals[account.id] || { debit: 0, credit: 0 };
          const isDebitNormal = account.account_type?.is_debit_normal ?? true;
          return isDebitNormal
            ? totals.debit - totals.credit
            : totals.credit - totals.debit;
        }
        return Math.abs(Number(account.current_balance) || 0);
      };

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
          amount: Math.abs(getAmount(a)),
        })).filter(i => i.amount > 0),
        total: revenueAccounts.reduce((sum, a) => sum + Math.abs(getAmount(a)), 0),
      };

      const expenses: ProfitLossSection = {
        title: "Expenses",
        items: expenseAccounts.map(a => ({
          account_id: a.id,
          account_name: a.name,
          amount: Math.abs(getAmount(a)),
        })).filter(i => i.amount > 0),
        total: expenseAccounts.reduce((sum, a) => sum + Math.abs(getAmount(a)), 0),
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
      // Fetch journal entry lines with account info for the date range
      let query = supabase
        .from("journal_entry_lines")
        .select(`
          debit_amount,
          credit_amount,
          description,
          account:accounts!inner(
            name,
            account_number,
            account_type:account_types(
              category,
              name
            )
          ),
          journal_entry:journal_entries!inner(
            entry_date,
            is_posted,
            reference_type,
            description
          )
        `)
        .eq("journal_entry.is_posted", true);

      if (startDate) query = query.gte("journal_entry.entry_date", startDate);
      if (endDate) query = query.lte("journal_entry.entry_date", endDate);

      const { data: lines, error } = await query;
      if (error) throw error;

      // Also fetch payments for the date range
      let paymentsQuery = supabase
        .from("payments")
        .select("amount, payment_date");
      if (startDate) paymentsQuery = paymentsQuery.gte("payment_date", startDate);
      if (endDate) paymentsQuery = paymentsQuery.lte("payment_date", endDate);

      const { data: payments, error: paymentsError } = await paymentsQuery;
      if (paymentsError) throw paymentsError;

      // Also fetch vendor payments
      let vpQuery = supabase
        .from("vendor_payments")
        .select("amount, payment_date");
      if (startDate) vpQuery = vpQuery.gte("payment_date", startDate);
      if (endDate) vpQuery = vpQuery.lte("payment_date", endDate);

      const { data: vendorPayments, error: vpError } = await vpQuery;
      if (vpError) throw vpError;

      // Also fetch payroll runs
      let payrollQuery = supabase
        .from("payroll_runs")
        .select("total_net, created_at")
        .eq("status", "completed");
      if (startDate) payrollQuery = payrollQuery.gte("created_at", startDate);
      if (endDate) payrollQuery = payrollQuery.lte("created_at", endDate);

      const { data: payrollRuns, error: payrollError } = await payrollQuery;
      if (payrollError) throw payrollError;

      // Calculate totals
      const totalCollections = (payments || []).reduce((sum, p) => sum + Number(p.amount), 0);
      const totalVendorPayments = (vendorPayments || []).reduce((sum, p) => sum + Number(p.amount), 0);
      const totalSalaries = (payrollRuns || []).reduce((sum, p) => sum + Number(p.total_net), 0);

      // Aggregate expense lines by account type for investing/financing
      const linesByRefType: Record<string, number> = {};
      for (const line of lines || []) {
        const category = line.account?.account_type?.category;
        const refType = line.journal_entry?.reference_type || 'manual';
        const key = `${category}_${refType}`;
        if (!linesByRefType[key]) linesByRefType[key] = 0;
        linesByRefType[key] += (Number(line.debit_amount) || 0) - (Number(line.credit_amount) || 0);
      }

      // Aggregate shipping costs from journal entries
      const shippingCosts = (lines || [])
        .filter(l => l.account?.account_number === 'EXP-SHIP-001' && (Number(l.debit_amount) || 0) > 0)
        .reduce((sum, l) => sum + (Number(l.debit_amount) || 0), 0);

      const operating: CashFlowItem[] = ([
        { description: "Collections from Patients", amount: totalCollections, category: "operating" as const },
        { description: "Payments to Suppliers", amount: -totalVendorPayments, category: "operating" as const },
        { description: "Salaries & Wages", amount: -totalSalaries, category: "operating" as const },
        { description: "Shipping Costs", amount: -shippingCosts, category: "operating" as const },
      ] as CashFlowItem[]).filter(i => i.amount !== 0);

      const investing: CashFlowItem[] = [
        { description: "Equipment Purchases", amount: 0, category: "investing" },
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
