import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PatientStatementEntry {
  id: string;
  date: string;
  type: "invoice" | "payment" | "deposit" | "deposit_applied" | "deposit_refund" | "credit_note" | "write_off";
  reference: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export function usePatientStatement(patientId: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["patient-statement", patientId, profile?.organization_id],
    queryFn: async (): Promise<{ entries: PatientStatementEntry[]; totalDebit: number; totalCredit: number; closingBalance: number }> => {
      if (!profile?.organization_id || !patientId) return { entries: [], totalDebit: 0, totalCredit: 0, closingBalance: 0 };

      // Fetch invoices
      const { data: invoices } = await supabase
        .from("invoices")
        .select("id, invoice_number, invoice_date, total_amount, status, notes")
        .eq("patient_id", patientId)
        .eq("organization_id", profile.organization_id)
        .neq("status", "cancelled")
        .order("invoice_date", { ascending: true });

      // Fetch payments
      const { data: payments } = await supabase
        .from("payments")
        .select("id, reference_number, payment_date, amount, payment_method_id, invoice_id")
        .eq("patient_id", patientId)
        .eq("organization_id", profile.organization_id)
        .order("payment_date", { ascending: true });

      // Fetch deposits
      const { data: deposits } = await supabase
        .from("patient_deposits")
        .select("id, reference_number, created_at, amount, type, status, notes")
        .eq("patient_id", patientId)
        .eq("organization_id", profile.organization_id)
        .eq("status", "completed")
        .order("created_at", { ascending: true });

      // Fetch credit notes linked to patient's invoices
      const invoiceIds = (invoices || []).map(i => i.id);
      let creditNotes: any[] = [];
      if (invoiceIds.length > 0) {
        const { data: cn } = await supabase
          .from("credit_notes")
          .select("id, credit_note_number, issue_date, total_amount, status, reason")
          .in("invoice_id", invoiceIds)
          .eq("status", "approved");
        creditNotes = cn || [];
      }

      // Build entries
      const entries: Omit<PatientStatementEntry, "balance">[] = [];

      (invoices || []).forEach(inv => {
        entries.push({
          id: inv.id,
          date: inv.invoice_date || "",
          type: "invoice",
          reference: inv.invoice_number,
          description: inv.notes || "Invoice",
          debit: Number(inv.total_amount || 0),
          credit: 0,
        });
      });

      (payments || []).forEach((p: any) => {
        entries.push({
          id: p.id,
          date: p.payment_date,
          type: "payment",
          reference: p.reference_number || "-",
          description: `Payment received`,
          debit: 0,
          credit: Number(p.amount || 0),
        });
      });

      (deposits || []).forEach((d: any) => {
        if (d.type === "deposit") {
          entries.push({
            id: d.id,
            date: d.created_at?.slice(0, 10) || "",
            type: "deposit",
            reference: d.reference_number || "-",
            description: "Advance Deposit",
            debit: 0,
            credit: Number(d.amount || 0),
          });
        } else if (d.type === "applied") {
          entries.push({
            id: d.id,
            date: d.created_at?.slice(0, 10) || "",
            type: "deposit_applied",
            reference: d.reference_number || "-",
            description: d.notes || "Deposit Applied",
            debit: 0,
            credit: Number(d.amount || 0),
          });
        } else if (d.type === "refund") {
          entries.push({
            id: d.id,
            date: d.created_at?.slice(0, 10) || "",
            type: "deposit_refund",
            reference: d.reference_number || "-",
            description: "Deposit Refund",
            debit: Number(d.amount || 0),
            credit: 0,
          });
        }
      });

      creditNotes.forEach((cn: any) => {
        entries.push({
          id: cn.id,
          date: cn.issue_date,
          type: "credit_note",
          reference: cn.credit_note_number,
          description: cn.reason || "Credit Note",
          debit: 0,
          credit: Number(cn.total_amount || 0),
        });
      });

      // Sort by date
      entries.sort((a, b) => a.date.localeCompare(b.date));

      // Calculate running balance
      let balance = 0;
      const finalEntries: PatientStatementEntry[] = entries.map(e => {
        balance += e.debit - e.credit;
        return { ...e, balance };
      });

      const totalDebit = entries.reduce((s, e) => s + e.debit, 0);
      const totalCredit = entries.reduce((s, e) => s + e.credit, 0);

      return { entries: finalEntries, totalDebit, totalCredit, closingBalance: balance };
    },
    enabled: !!profile?.organization_id && !!patientId,
  });
}
