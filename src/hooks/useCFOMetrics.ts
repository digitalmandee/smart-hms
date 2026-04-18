import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { subMonths } from "date-fns";

/**
 * CFO-grade liquidity & efficiency KPIs sourced from GL & subledgers.
 * - DSO: Days Sales Outstanding (AR ÷ avg daily revenue, last 90d)
 * - DPO: Days Payable Outstanding (AP ÷ avg daily COGS/expense, last 90d)
 * - Current Ratio: Current Assets ÷ Current Liabilities
 * - Quick Ratio: (Current Assets - Inventory) ÷ Current Liabilities
 * - Gross Margin %: (Revenue - COGS) ÷ Revenue
 * - Cash Runway: Cash ÷ avg monthly burn (last 3 months)
 */
export interface CFOMetrics {
  dso: number;
  dpo: number;
  currentRatio: number;
  quickRatio: number;
  grossMarginPct: number;
  cashRunwayMonths: number;
  cashPosition: number;
  totalAR: number;
  totalAP: number;
  monthlyBurn: number;
}

export function useCFOMetrics() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["cfo-metrics", profile?.organization_id],
    queryFn: async (): Promise<CFOMetrics> => {
      if (!profile?.organization_id) {
        return {
          dso: 0, dpo: 0, currentRatio: 0, quickRatio: 0,
          grossMarginPct: 0, cashRunwayMonths: 0,
          cashPosition: 0, totalAR: 0, totalAP: 0, monthlyBurn: 0,
        };
      }
      const orgId = profile.organization_id;
      const sb = supabase as any;
      const ninetyDaysAgo = subMonths(new Date(), 3).toISOString().split("T")[0];
      const threeMonthsAgo = subMonths(new Date(), 3).toISOString().split("T")[0];

      // Fetch accounts with balances + categories
      const { data: accounts } = await sb
        .from("accounts")
        .select("id, account_number, name, current_balance, is_active, account_type:account_types(category, name)")
        .eq("organization_id", orgId)
        .eq("is_active", true);

      const accs: any[] = accounts || [];

      // Cash & bank (assets containing cash/bank)
      const cashPosition = accs
        .filter(a => a.account_type?.category === "asset" &&
          (a.name.toLowerCase().includes("cash") || a.name.toLowerCase().includes("bank")))
        .reduce((s, a) => s + Number(a.current_balance || 0), 0);

      // AR
      const totalAR = accs
        .filter(a => a.account_type?.category === "asset" &&
          (a.name.toLowerCase().includes("receivable") || a.account_number?.startsWith("AR")))
        .reduce((s, a) => s + Number(a.current_balance || 0), 0);

      // AP
      const totalAP = accs
        .filter(a => a.account_type?.category === "liability" &&
          (a.name.toLowerCase().includes("payable") || a.account_number?.startsWith("AP")))
        .reduce((s, a) => s + Number(a.current_balance || 0), 0);

      // Inventory
      const inventory = accs
        .filter(a => a.account_type?.category === "asset" &&
          a.name.toLowerCase().includes("inventory"))
        .reduce((s, a) => s + Number(a.current_balance || 0), 0);

      // Current Assets (cash + AR + inventory + other current)
      const currentAssets = accs
        .filter(a => a.account_type?.category === "asset" &&
          !a.name.toLowerCase().includes("fixed") &&
          !a.name.toLowerCase().includes("equipment") &&
          !a.name.toLowerCase().includes("building"))
        .reduce((s, a) => s + Number(a.current_balance || 0), 0);

      // Current Liabilities
      const currentLiab = accs
        .filter(a => a.account_type?.category === "liability" &&
          !a.name.toLowerCase().includes("long-term") &&
          !a.name.toLowerCase().includes("loan"))
        .reduce((s, a) => s + Number(a.current_balance || 0), 0);

      // Last 90d revenue & COGS from GL
      const { data: jeLines } = await sb
        .from("journal_entry_lines")
        .select("debit_amount, credit_amount, account:accounts!inner(account_type:account_types(category), name), journal_entry:journal_entries!inner(is_posted, entry_date, organization_id)")
        .eq("journal_entry.organization_id", orgId)
        .eq("journal_entry.is_posted", true)
        .gte("journal_entry.entry_date", ninetyDaysAgo);

      let revenue90 = 0, cogs90 = 0, expense90 = 0;
      (jeLines || []).forEach((l: any) => {
        const cat = l.account?.account_type?.category;
        const name = (l.account?.name || "").toLowerCase();
        if (cat === "revenue") revenue90 += Number(l.credit_amount || 0) - Number(l.debit_amount || 0);
        if (cat === "expense") {
          const amt = Number(l.debit_amount || 0) - Number(l.credit_amount || 0);
          expense90 += amt;
          if (name.includes("cogs") || name.includes("cost of goods") || name.includes("cost of sales")) {
            cogs90 += amt;
          }
        }
      });

      const avgDailyRevenue = revenue90 / 90;
      const avgDailyCogs = (cogs90 || expense90) / 90;
      const monthlyBurn = expense90 / 3;

      const dso = avgDailyRevenue > 0 ? Math.round(totalAR / avgDailyRevenue) : 0;
      const dpo = avgDailyCogs > 0 ? Math.round(totalAP / avgDailyCogs) : 0;
      const currentRatio = currentLiab > 0 ? Number((currentAssets / currentLiab).toFixed(2)) : 0;
      const quickRatio = currentLiab > 0 ? Number(((currentAssets - inventory) / currentLiab).toFixed(2)) : 0;
      const grossMarginPct = revenue90 > 0 ? Number((((revenue90 - cogs90) / revenue90) * 100).toFixed(1)) : 0;
      const cashRunwayMonths = monthlyBurn > 0 ? Number((cashPosition / monthlyBurn).toFixed(1)) : 0;

      return {
        dso, dpo, currentRatio, quickRatio,
        grossMarginPct, cashRunwayMonths,
        cashPosition, totalAR, totalAP, monthlyBurn,
      };
    },
    enabled: !!profile?.organization_id,
    staleTime: 60000,
  });
}
