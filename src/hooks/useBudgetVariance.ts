import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface BudgetVarianceRow {
  account_id: string;
  account_number: string;
  account_name: string;
  category: string;
  budgeted: number;
  actual: number;
  variance: number;
  variance_pct: number;
  status: "favorable" | "unfavorable" | "on_track";
}

/**
 * Compares budget allocations against GL actuals for a given fiscal year.
 * Variance = Budget - Actual (for expenses: positive = under budget = favorable)
 */
export function useBudgetVariance(fiscalYearId?: string, branchId?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["budget-variance", fiscalYearId, branchId, profile?.organization_id],
    queryFn: async (): Promise<{ rows: BudgetVarianceRow[]; totalBudget: number; totalActual: number; totalVariance: number }> => {
      if (!profile?.organization_id || !fiscalYearId) {
        return { rows: [], totalBudget: 0, totalActual: 0, totalVariance: 0 };
      }
      const sb = supabase as any;

      // Get fiscal year dates
      const { data: fy } = await sb
        .from("fiscal_years")
        .select("start_date, end_date")
        .eq("id", fiscalYearId)
        .maybeSingle();
      if (!fy) return { rows: [], totalBudget: 0, totalActual: 0, totalVariance: 0 };

      // Get budget periods for this fiscal year
      const { data: periods } = await sb
        .from("budget_periods")
        .select("id")
        .eq("fiscal_year_id", fiscalYearId)
        .eq("organization_id", profile.organization_id);
      const periodIds = (periods || []).map((p: any) => p.id);
      if (periodIds.length === 0) {
        return { rows: [], totalBudget: 0, totalActual: 0, totalVariance: 0 };
      }

      // Get budget allocations
      let allocQuery = sb
        .from("budget_allocations")
        .select("account_id, allocated_amount, branch_id, account:accounts(id, account_number, name, account_type:account_types(category))")
        .in("budget_period_id", periodIds);
      if (branchId) allocQuery = allocQuery.eq("branch_id", branchId);
      const { data: allocations } = await allocQuery;

      const allocs: any[] = allocations || [];
      if (allocs.length === 0) {
        return { rows: [], totalBudget: 0, totalActual: 0, totalVariance: 0 };
      }

      // Aggregate budget per account
      const budgetMap: Record<string, { budget: number; account: any }> = {};
      allocs.forEach(a => {
        const aid = a.account_id;
        if (!budgetMap[aid]) budgetMap[aid] = { budget: 0, account: a.account };
        budgetMap[aid].budget += Number(a.allocated_amount || 0);
      });

      // Get GL actuals for these accounts within FY
      const accountIds = Object.keys(budgetMap);
      let actualQuery = sb
        .from("journal_entry_lines")
        .select("account_id, debit_amount, credit_amount, journal_entry:journal_entries!inner(is_posted, entry_date, organization_id, branch_id)")
        .in("account_id", accountIds)
        .eq("journal_entry.is_posted", true)
        .eq("journal_entry.organization_id", profile.organization_id)
        .gte("journal_entry.entry_date", fy.start_date)
        .lte("journal_entry.entry_date", fy.end_date);
      if (branchId) actualQuery = actualQuery.eq("journal_entry.branch_id", branchId);
      const { data: jeLines } = await actualQuery;

      const actualMap: Record<string, number> = {};
      (jeLines || []).forEach((l: any) => {
        const acct = budgetMap[l.account_id]?.account;
        const cat = acct?.account_type?.category;
        const debit = Number(l.debit_amount || 0);
        const credit = Number(l.credit_amount || 0);
        // Expense/Asset: debit-normal; Revenue/Liability/Equity: credit-normal
        const amount = (cat === "revenue" || cat === "liability" || cat === "equity")
          ? credit - debit
          : debit - credit;
        actualMap[l.account_id] = (actualMap[l.account_id] || 0) + amount;
      });

      const rows: BudgetVarianceRow[] = Object.entries(budgetMap).map(([aid, { budget, account }]) => {
        const actual = actualMap[aid] || 0;
        const cat = account?.account_type?.category || "expense";
        // For expense accounts: variance = budget - actual (positive = favorable / under budget)
        // For revenue accounts: variance = actual - budget (positive = favorable / over budget)
        const variance = cat === "revenue" ? actual - budget : budget - actual;
        const variance_pct = budget > 0 ? Number(((variance / budget) * 100).toFixed(1)) : 0;
        let status: "favorable" | "unfavorable" | "on_track" = "on_track";
        if (Math.abs(variance_pct) > 10) status = variance >= 0 ? "favorable" : "unfavorable";
        return {
          account_id: aid,
          account_number: account?.account_number || "",
          account_name: account?.name || "",
          category: cat,
          budgeted: budget,
          actual,
          variance,
          variance_pct,
          status,
        };
      }).sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance));

      const totalBudget = rows.reduce((s, r) => s + r.budgeted, 0);
      const totalActual = rows.reduce((s, r) => s + r.actual, 0);
      const totalVariance = totalBudget - totalActual;

      return { rows, totalBudget, totalActual, totalVariance };
    },
    enabled: !!profile?.organization_id && !!fiscalYearId,
  });
}
