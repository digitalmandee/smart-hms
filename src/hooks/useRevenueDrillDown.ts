import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface RevenueDrillDownFilters {
  accountId?: string;
  dateFrom?: string;
  dateTo?: string;
  doctorId?: string;
  departmentId?: string;
}

export function useRevenueDrillDown(filters: RevenueDrillDownFilters) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["revenue-drilldown", filters, profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id || !filters.accountId) return [];

      // Step 1: Get journal entry lines for the selected revenue account
      let jeQuery = supabase
        .from("journal_entry_lines")
        .select(`
          id, credit_amount, debit_amount, description,
          journal_entry:journal_entry_id(
            id, entry_number, entry_date, description,
            reference_type, reference_id
          ),
          account:account_id(id, name, account_number)
        `)
        .eq("account_id", filters.accountId)
        .gt("credit_amount", 0);

      if (filters.dateFrom) {
        jeQuery = jeQuery.gte("journal_entry.entry_date", filters.dateFrom);
      }
      if (filters.dateTo) {
        jeQuery = jeQuery.lte("journal_entry.entry_date", filters.dateTo);
      }

      const { data: journalLines, error: jeError } = await jeQuery;
      if (jeError) throw jeError;

      // Filter out lines where journal_entry is null (date filter mismatch)
      const validLines = (journalLines || []).filter((l: any) => l.journal_entry);

      // Step 2: Collect invoice reference IDs
      const invoiceIds = validLines
        .filter((l: any) => l.journal_entry?.reference_type === "invoice" && l.journal_entry?.reference_id)
        .map((l: any) => l.journal_entry.reference_id);

      if (invoiceIds.length === 0) {
        return validLines.map((l: any) => ({
          ...l,
          invoice: null,
          invoiceItems: [],
        }));
      }

      // Step 3: Fetch invoices
      const { data: invoices } = await supabase
        .from("invoices")
        .select(`
          id, invoice_number, total_amount, net_amount, status,
          patient:patient_id(id, first_name, last_name, patient_number),
          doctor:doctor_id(id, name)
        `)
        .in("id", invoiceIds);

      // Step 4: Fetch invoice items
      const { data: invoiceItems } = await supabase
        .from("invoice_items")
        .select(`
          id, invoice_id, item_name, quantity, unit_price, total_price, tax_amount,
          service_type:service_type_id(id, name, category)
        `)
        .in("invoice_id", invoiceIds);

      // Build lookup maps
      const invoiceMap: Record<string, any> = {};
      (invoices || []).forEach((inv: any) => { invoiceMap[inv.id] = inv; });

      const itemsByInvoice: Record<string, any[]> = {};
      (invoiceItems || []).forEach((item: any) => {
        if (!itemsByInvoice[item.invoice_id]) itemsByInvoice[item.invoice_id] = [];
        itemsByInvoice[item.invoice_id].push(item);
      });

      // Step 5: Combine
      return validLines.map((l: any) => {
        const refId = l.journal_entry?.reference_id;
        const invoice = refId ? invoiceMap[refId] : null;
        return {
          ...l,
          invoice,
          invoiceItems: refId ? (itemsByInvoice[refId] || []) : [],
        };
      });
    },
    enabled: !!profile?.organization_id && !!filters.accountId,
  });
}

export function useRevenueAccounts() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["revenue-accounts", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from("accounts")
        .select("id, name, account_number, is_header, current_balance, account_type:account_type_id(category)")
        .eq("organization_id", profile.organization_id)
        .eq("is_active", true)
        .order("account_number");
      if (error) throw error;
      return (data || []).filter((a: any) => a.account_type?.category?.toLowerCase() === "revenue");
    },
    enabled: !!profile?.organization_id,
  });
}
