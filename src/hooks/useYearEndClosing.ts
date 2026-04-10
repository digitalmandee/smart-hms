import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface AccountClosingLine {
  account_id: string;
  account_number: string;
  account_name: string;
  category: string;
  balance: number;
}

export function useYearEndAccountTotals(fiscalYearStart: string, fiscalYearEnd: string) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["year-end-totals", profile?.organization_id, fiscalYearStart, fiscalYearEnd],
    queryFn: async () => {
      // Get all revenue and expense accounts with their balances from journal lines in the period
      const { data: accounts, error: accErr } = await supabase
        .from("accounts")
        .select("id, account_number, name, account_type_id, current_balance, account_type:account_types(category)")
        .eq("organization_id", profile!.organization_id!)
        .eq("is_active", true)
        .eq("is_header", false);
      if (accErr) throw accErr;

      const revenueAccounts: AccountClosingLine[] = [];
      const expenseAccounts: AccountClosingLine[] = [];

      for (const acc of accounts || []) {
        const cat = (acc as any).account_type?.category;
        if (cat === "revenue" || cat === "income") {
          // Get period movement from journal lines
          const { data: lines } = await supabase
            .from("journal_entry_lines")
            .select("debit_amount, credit_amount, journal_entry:journal_entries!inner(entry_date, is_posted)")
            .eq("account_id", acc.id)
            .gte("journal_entry.entry_date", fiscalYearStart)
            .lte("journal_entry.entry_date", fiscalYearEnd)
            .eq("journal_entry.is_posted", true);

          const totalDebit = (lines || []).reduce((s, l) => s + Number(l.debit_amount || 0), 0);
          const totalCredit = (lines || []).reduce((s, l) => s + Number(l.credit_amount || 0), 0);
          const balance = totalCredit - totalDebit; // Revenue is credit-normal
          if (Math.abs(balance) > 0.01) {
            revenueAccounts.push({
              account_id: acc.id,
              account_number: acc.account_number,
              account_name: acc.name,
              category: "revenue",
              balance,
            });
          }
        } else if (cat === "expense" || cat === "expenses") {
          const { data: lines } = await supabase
            .from("journal_entry_lines")
            .select("debit_amount, credit_amount, journal_entry:journal_entries!inner(entry_date, is_posted)")
            .eq("account_id", acc.id)
            .gte("journal_entry.entry_date", fiscalYearStart)
            .lte("journal_entry.entry_date", fiscalYearEnd)
            .eq("journal_entry.is_posted", true);

          const totalDebit = (lines || []).reduce((s, l) => s + Number(l.debit_amount || 0), 0);
          const totalCredit = (lines || []).reduce((s, l) => s + Number(l.credit_amount || 0), 0);
          const balance = totalDebit - totalCredit; // Expense is debit-normal
          if (Math.abs(balance) > 0.01) {
            expenseAccounts.push({
              account_id: acc.id,
              account_number: acc.account_number,
              account_name: acc.name,
              category: "expense",
              balance,
            });
          }
        }
      }

      const totalRevenue = revenueAccounts.reduce((s, a) => s + a.balance, 0);
      const totalExpenses = expenseAccounts.reduce((s, a) => s + a.balance, 0);
      const netIncome = totalRevenue - totalExpenses;

      return { revenueAccounts, expenseAccounts, totalRevenue, totalExpenses, netIncome };
    },
    enabled: !!profile?.organization_id && !!fiscalYearStart && !!fiscalYearEnd,
  });
}

export function usePostYearEndClosing() {
  const qc = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      fiscalYearEnd,
      retainedEarningsAccountId,
      revenueAccounts,
      expenseAccounts,
      netIncome,
    }: {
      fiscalYearEnd: string;
      retainedEarningsAccountId: string;
      revenueAccounts: AccountClosingLine[];
      expenseAccounts: AccountClosingLine[];
      netIncome: number;
    }) => {
      // Create closing journal entry
      const { data: je, error: jeErr } = await supabase
        .from("journal_entries")
        .insert({
          organization_id: profile!.organization_id!,
          branch_id: profile!.branch_id,
          entry_date: fiscalYearEnd,
          posting_date: fiscalYearEnd,
          entry_number: "",
          reference_type: "manual",
          description: `Year-End Closing Entry for fiscal year ending ${fiscalYearEnd}`,
          total_debit: 0,
          total_credit: 0,
          is_posted: true,
          posted_at: new Date().toISOString(),
          posted_by: profile!.id,
          created_by: profile!.id,
        })
        .select();
      if (jeErr) throw jeErr;
      const journalId = je?.[0]?.id;
      if (!journalId) throw new Error("Failed to create closing journal entry");

      const lines: any[] = [];
      let totalDebit = 0;
      let totalCredit = 0;

      // Close revenue accounts (DR Revenue, CR Retained Earnings)
      for (const rev of revenueAccounts) {
        lines.push({
          journal_entry_id: journalId,
          account_id: rev.account_id,
          debit_amount: rev.balance,
          credit_amount: 0,
          description: `Close ${rev.account_name} to Retained Earnings`,
        });
        totalDebit += rev.balance;
      }

      // Close expense accounts (CR Expense, DR Retained Earnings)
      for (const exp of expenseAccounts) {
        lines.push({
          journal_entry_id: journalId,
          account_id: exp.account_id,
          debit_amount: 0,
          credit_amount: exp.balance,
          description: `Close ${exp.account_name} to Retained Earnings`,
        });
        totalCredit += exp.balance;
      }

      // Net to Retained Earnings
      if (netIncome > 0) {
        lines.push({
          journal_entry_id: journalId,
          account_id: retainedEarningsAccountId,
          debit_amount: 0,
          credit_amount: netIncome,
          description: "Net Income transferred to Retained Earnings",
        });
        totalCredit += netIncome;
      } else {
        lines.push({
          journal_entry_id: journalId,
          account_id: retainedEarningsAccountId,
          debit_amount: Math.abs(netIncome),
          credit_amount: 0,
          description: "Net Loss transferred to Retained Earnings",
        });
        totalDebit += Math.abs(netIncome);
      }

      const { error: linesErr } = await supabase
        .from("journal_entry_lines")
        .insert(lines);
      if (linesErr) throw linesErr;

      // Update journal totals
      await supabase
        .from("journal_entries")
        .update({ total_debit: totalDebit, total_credit: totalCredit })
        .eq("id", journalId);

      return journalId;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["year-end-totals"] });
      qc.invalidateQueries({ queryKey: ["journal-entries"] });
      toast.success("Year-end closing entry posted successfully");
    },
    onError: (e: any) => toast.error(e.message),
  });
}
