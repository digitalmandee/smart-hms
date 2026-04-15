import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useWriteOff() {
  const qc = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      invoiceId,
      patientName,
      amount,
      reason,
    }: {
      invoiceId: string;
      patientName: string;
      amount: number;
      reason: string;
    }) => {
      if (!profile?.organization_id) throw new Error("No organization");

      // 1. Find the bad debt expense account
      const { data: badDebtAcct } = await supabase
        .from("accounts")
        .select("id, account_number")
        .eq("organization_id", profile.organization_id)
        .ilike("account_number", "BAD-DEBT%")
        .eq("is_active", true)
        .limit(1)
        .single();

      // 2. Find the AR account
      const { data: arAcct } = await supabase
        .from("accounts")
        .select("id, account_number")
        .eq("organization_id", profile.organization_id)
        .ilike("account_number", "AR-%")
        .eq("is_active", true)
        .limit(1)
        .single();

      if (!badDebtAcct) throw new Error("Bad Debt Expense account (BAD-DEBT-*) not found. Please create it first.");
      if (!arAcct) throw new Error("Accounts Receivable account (AR-*) not found.");

      // 3. Create journal entry
      const entryNumber = `WO-${Date.now()}`;
      const { data: je, error: jeErr } = await supabase
        .from("journal_entries")
        .insert({
          organization_id: profile.organization_id,
          branch_id: profile.branch_id,
          entry_number: entryNumber,
          entry_date: new Date().toISOString().split("T")[0],
          description: `Write-off: ${patientName} — ${reason}`,
          reference_type: "write_off",
          reference_id: invoiceId,
          is_posted: true,
          created_by: profile.id,
        })
        .select("id")
        .single();

      if (jeErr) throw jeErr;

      // 4. Create journal lines: DR Bad Debt Expense, CR AR
      const { error: lineErr } = await supabase
        .from("journal_entry_lines")
        .insert([
          {
            journal_entry_id: je.id,
            account_id: badDebtAcct.id,
            debit_amount: amount,
            credit_amount: 0,
            description: `Write-off for invoice ${invoiceId}`,
          },
          {
            journal_entry_id: je.id,
            account_id: arAcct.id,
            debit_amount: 0,
            credit_amount: amount,
            description: `Write-off for invoice ${invoiceId}`,
          },
        ]);

      if (lineErr) throw lineErr;

      // 5. Update invoice status to written_off (best-effort)
      await supabase
        .from("invoices")
        .update({ status: "written_off" as any })
        .eq("id", invoiceId);

      return { journalEntryId: je.id, entryNumber };
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["aging-report"] });
      qc.invalidateQueries({ queryKey: ["ar-reconciliation"] });
      toast.success(`Write-off posted: ${data.entryNumber}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
