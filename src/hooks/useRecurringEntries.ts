import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useRecurringTemplates() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["recurring-templates", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recurring_journal_templates")
        .select("*")
        .eq("organization_id", profile!.organization_id!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateRecurringTemplate() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (values: {
      template_name: string;
      description?: string;
      frequency: string;
      lines: any[];
      start_date: string;
      end_date?: string;
    }) => {
      const { data, error } = await supabase
        .from("recurring_journal_templates")
        .insert({
          organization_id: profile!.organization_id!,
          ...values,
          lines: values.lines as any,
          next_run_date: values.start_date,
          created_by: profile!.id,
        })
        .select();
      if (error) throw error;
      return data?.[0];
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recurring-templates"] });
      toast.success("Recurring template created");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useGenerateRecurringEntries() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (templateId: string) => {
      // Fetch template
      const { data: tmpl, error: tErr } = await supabase
        .from("recurring_journal_templates")
        .select("*")
        .eq("id", templateId)
        .maybeSingle();
      if (tErr) throw tErr;
      if (!tmpl) throw new Error("Template not found");

      const lines = (tmpl.lines as any[]) || [];
      if (lines.length === 0) throw new Error("Template has no lines");

      const today = new Date().toISOString().slice(0, 10);

      // Create journal entry as draft
      const totalDebit = lines.reduce((s: number, l: any) => s + Number(l.debit_amount || 0), 0);
      const totalCredit = lines.reduce((s: number, l: any) => s + Number(l.credit_amount || 0), 0);

      const { data: je, error: jeErr } = await supabase
        .from("journal_entries")
        .insert({
          organization_id: profile!.organization_id!,
          branch_id: profile!.branch_id,
          entry_date: today,
          entry_number: "",
          reference_type: "manual",
          description: `Recurring: ${tmpl.template_name}`,
          total_debit: totalDebit,
          total_credit: totalCredit,
          is_posted: false,
          created_by: profile!.id,
        })
        .select();
      if (jeErr) throw jeErr;
      const journalId = je?.[0]?.id;

      const jeLines = lines.map((l: any) => ({
        journal_entry_id: journalId,
        account_id: l.account_id,
        debit_amount: Number(l.debit_amount || 0),
        credit_amount: Number(l.credit_amount || 0),
        description: l.description || tmpl.template_name,
      }));

      const { error: lErr } = await supabase.from("journal_entry_lines").insert(jeLines);
      if (lErr) throw lErr;

      // Advance next_run_date
      const nextRun = new Date(tmpl.next_run_date || today);
      if (tmpl.frequency === "monthly") nextRun.setMonth(nextRun.getMonth() + 1);
      else if (tmpl.frequency === "quarterly") nextRun.setMonth(nextRun.getMonth() + 3);
      else nextRun.setFullYear(nextRun.getFullYear() + 1);

      await supabase
        .from("recurring_journal_templates")
        .update({ last_run_date: today, next_run_date: nextRun.toISOString().slice(0, 10) })
        .eq("id", templateId);

      return journalId;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recurring-templates"] });
      qc.invalidateQueries({ queryKey: ["journal-entries"] });
      toast.success("Recurring journal entry generated (draft)");
    },
    onError: (e: any) => toast.error(e.message),
  });
}
