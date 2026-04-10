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

      // Step 1: Fetch journal entry IDs matching date range first (avoids nested filter issue)
      let jeQuery = supabase
        .from("journal_entries")
        .select("id")
        .eq("organization_id", profile.organization_id);

      if (filters.dateFrom) {
        jeQuery = jeQuery.gte("entry_date", filters.dateFrom);
      }
      if (filters.dateTo) {
        jeQuery = jeQuery.lte("entry_date", filters.dateTo);
      }

      const { data: journalEntries, error: jeError } = await jeQuery;
      if (jeError) throw jeError;
      
      const jeIds = (journalEntries || []).map((je: any) => je.id);
      if (jeIds.length === 0) return [];

      // Step 2: Fetch journal entry lines for this account + matching JE IDs
      // Process in batches of 500 to avoid URL length limits
      const allLines: any[] = [];
      for (let i = 0; i < jeIds.length; i += 500) {
        const batch = jeIds.slice(i, i + 500);
        const { data: lines, error: linesError } = await supabase
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
          .gt("credit_amount", 0)
          .in("journal_entry_id", batch);
        
        if (linesError) throw linesError;
        if (lines) allLines.push(...lines);
      }

      const validLines = allLines.filter((l: any) => l.journal_entry);

      // Step 3: Collect invoice reference IDs
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

      // Step 4: Fetch invoices (with optional doctor filter)
      let invoiceQuery = supabase
        .from("invoices")
        .select(`
          id, invoice_number, total_amount, net_amount, status,
          patient:patient_id(id, first_name, last_name, patient_number),
          doctor:doctor_id(id, name)
        `)
        .in("id", invoiceIds) as any;

      if (filters.doctorId) {
        invoiceQuery = invoiceQuery.eq("doctor_id", filters.doctorId);
      }

      const { data: invoices } = await invoiceQuery;

      // Step 5: Fetch invoice items (with optional department/category filter)
      const filteredInvoiceIds = (invoices || []).map((inv: any) => inv.id);
      if (filteredInvoiceIds.length === 0) {
        return validLines.map((l: any) => ({ ...l, invoice: null, invoiceItems: [] }));
      }

      const { data: invoiceItems } = await supabase
        .from("invoice_items")
        .select(`
          id, invoice_id, item_name, quantity, unit_price, total_price, tax_amount,
          service_type:service_type_id(id, name, category)
        `)
        .in("invoice_id", filteredInvoiceIds);

      // Build lookup maps
      const invoiceMap: Record<string, any> = {};
      (invoices || []).forEach((inv: any) => { invoiceMap[inv.id] = inv; });

      const itemsByInvoice: Record<string, any[]> = {};
      (invoiceItems || []).forEach((item: any) => {
        if (!itemsByInvoice[item.invoice_id]) itemsByInvoice[item.invoice_id] = [];
        itemsByInvoice[item.invoice_id].push(item);
      });

      // Step 6: Combine and apply department filter client-side
      let result = validLines.map((l: any) => {
        const refId = l.journal_entry?.reference_id;
        const invoice = refId ? invoiceMap[refId] : null;
        return {
          ...l,
          invoice,
          invoiceItems: refId ? (itemsByInvoice[refId] || []) : [],
        };
      });

      // Filter by department if specified (match service_type category)
      if (filters.departmentId && filters.departmentId !== "all") {
        result = result.filter((r: any) => {
          if (!r.invoiceItems.length) return false;
          return r.invoiceItems.some((item: any) =>
            item.service_type?.category?.toLowerCase() === filters.departmentId?.toLowerCase()
          );
        });
      }

      // If doctor filter applied, exclude entries whose invoice was filtered out
      if (filters.doctorId) {
        result = result.filter((r: any) => r.invoice !== null || r.journal_entry?.reference_type !== "invoice");
      }

      return result;
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
