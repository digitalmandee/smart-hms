import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface VendorStatementEntry {
  id: string;
  date: string;
  type: "po" | "grn" | "payment" | "credit_note" | "opening";
  reference: string;
  description: string;
  debit: number;   // we paid them / they reduced what we owe
  credit: number;  // they delivered / we owe more
  balance: number; // running payable balance (positive = we owe vendor)
}

export function useVendorStatement(vendorId: string, fromDate?: string, toDate?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["vendor-statement", vendorId, fromDate, toDate, profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id || !vendorId) {
        return { entries: [] as VendorStatementEntry[], totalDebit: 0, totalCredit: 0, closingBalance: 0, vendor: null };
      }
      const sb = supabase as any;

      const { data: vendor } = await sb
        .from("vendors")
        .select("id, name, contact_person, phone, email, address")
        .eq("id", vendorId)
        .maybeSingle();

      // GRNs (we received goods → we owe vendor → CREDIT)
      let grnQ = sb.from("goods_received_notes")
        .select("id, grn_number, received_date, total_amount, status, purchase_order:purchase_orders(po_number)")
        .eq("vendor_id", vendorId)
        .eq("organization_id", profile.organization_id)
        .neq("status", "cancelled")
        .order("received_date", { ascending: true });
      if (fromDate) grnQ = grnQ.gte("received_date", fromDate);
      if (toDate) grnQ = grnQ.lte("received_date", toDate);
      const { data: grns } = await grnQ;

      // Payments (we paid them → reduces payable → DEBIT)
      let payQ = sb.from("vendor_payments")
        .select("id, payment_number, payment_date, amount, status, grn_id, notes")
        .eq("vendor_id", vendorId)
        .eq("organization_id", profile.organization_id)
        .in("status", ["approved", "paid"])
        .order("payment_date", { ascending: true });
      if (fromDate) payQ = payQ.gte("payment_date", fromDate);
      if (toDate) payQ = payQ.lte("payment_date", toDate);
      const { data: payments } = await payQ;

      const entries: Omit<VendorStatementEntry, "balance">[] = [];

      (grns || []).forEach((g: any) => {
        entries.push({
          id: g.id,
          date: g.received_date,
          type: "grn",
          reference: g.grn_number,
          description: `GRN${g.purchase_order?.po_number ? ` (PO ${g.purchase_order.po_number})` : ""}`,
          debit: 0,
          credit: Number(g.total_amount || 0),
        });
      });

      (payments || []).forEach((p: any) => {
        entries.push({
          id: p.id,
          date: p.payment_date,
          type: "payment",
          reference: p.payment_number || "-",
          description: p.notes || "Payment to vendor",
          debit: Number(p.amount || 0),
          credit: 0,
        });
      });

      entries.sort((a, b) => (a.date || "").localeCompare(b.date || ""));

      let balance = 0;
      const finalEntries: VendorStatementEntry[] = entries.map(e => {
        balance += e.credit - e.debit;
        return { ...e, balance };
      });

      return {
        entries: finalEntries,
        totalDebit: entries.reduce((s, e) => s + e.debit, 0),
        totalCredit: entries.reduce((s, e) => s + e.credit, 0),
        closingBalance: balance,
        vendor,
      };
    },
    enabled: !!profile?.organization_id && !!vendorId,
  });
}
