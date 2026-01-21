import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OutstandingInvoice {
  id: string;
  invoice_number: string;
  total_amount: number;
  paid_amount: number;
  status: string;
  notes: string | null;
  created_at: string;
  outstanding: number;
}

/**
 * Hook to fetch outstanding (unpaid) invoices for a patient during their admission period
 */
export function useOutstandingInvoices(
  patientId?: string,
  admissionDate?: string,
  excludeInvoiceIds?: string[]
) {
  return useQuery({
    queryKey: ["outstanding-invoices", patientId, admissionDate, excludeInvoiceIds],
    queryFn: async (): Promise<OutstandingInvoice[]> => {
      if (!patientId || !admissionDate) return [];

      let query = supabase
        .from("invoices")
        .select("id, invoice_number, total_amount, paid_amount, status, notes, created_at")
        .eq("patient_id", patientId)
        .in("status", ["pending", "partially_paid"])
        .gte("created_at", admissionDate)
        .order("created_at", { ascending: false });

      // Exclude specific invoices (like admission deposit invoice, discharge invoice)
      if (excludeInvoiceIds && excludeInvoiceIds.length > 0) {
        const validIds = excludeInvoiceIds.filter(id => id);
        if (validIds.length > 0) {
          query = query.not("id", "in", `(${validIds.join(",")})`);
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      // Calculate outstanding amount for each invoice
      return (data || []).map((inv) => ({
        ...inv,
        outstanding: (inv.total_amount || 0) - (inv.paid_amount || 0),
      }));
    },
    enabled: !!patientId && !!admissionDate,
  });
}

/**
 * Calculate total outstanding amount from invoices
 */
export function calculateOutstandingTotal(invoices: OutstandingInvoice[]): number {
  return invoices.reduce((sum, inv) => sum + inv.outstanding, 0);
}
