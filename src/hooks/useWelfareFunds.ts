import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface FundBalance { fund: string; received: number; spent: number; balance: number; donations: number; utilizations: number }
export interface FundUtilization {
  id: string; fund: string; amount: number; department: string | null; patient_id: string | null;
  invoice_id: string | null; created_at: string; patient_name?: string; invoice_number?: string;
}

async function fetchAll<T>(build: (from: number, to: number) => any): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await build(from, from + 999);
    if (error) throw error;
    out.push(...((data as T[]) || []));
    if (!data || data.length < 1000) break;
  }
  return out;
}

export function useFundBalances() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;
  return useQuery({
    queryKey: ["fund-balances", orgId],
    enabled: !!orgId,
    queryFn: async (): Promise<FundBalance[]> => {
      const [dons, uses] = await Promise.all([
        fetchAll<{ purpose: string | null; amount: number }>((f, t) =>
          supabase.from("financial_donations").select("purpose, amount").eq("organization_id", orgId!).eq("status", "received").range(f, t)),
        fetchAll<{ fund: string; amount: number }>((f, t) =>
          (supabase as any).from("fund_utilizations").select("fund, amount").eq("organization_id", orgId!).range(f, t)),
      ]);
      const map = new Map<string, FundBalance>();
      const get = (k: string) => {
        if (!map.has(k)) map.set(k, { fund: k, received: 0, spent: 0, balance: 0, donations: 0, utilizations: 0 });
        return map.get(k)!;
      };
      dons.forEach(d => { const b = get(d.purpose || "general"); b.received += Number(d.amount || 0); b.donations++; });
      uses.forEach(u => { const b = get(u.fund); b.spent += Number(u.amount || 0); b.utilizations++; });
      map.forEach(b => { b.balance = b.received - b.spent; });
      return [...map.values()].sort((a, b) => b.received - a.received);
    },
  });
}

export function useFundUtilizations(fund?: string) {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;
  return useQuery({
    queryKey: ["fund-utilizations", orgId, fund ?? "all"],
    enabled: !!orgId,
    queryFn: async (): Promise<FundUtilization[]> => {
      const rows = await fetchAll<FundUtilization>((f, t) => {
        let q = (supabase as any).from("fund_utilizations").select("*").eq("organization_id", orgId!).order("created_at", { ascending: false });
        if (fund) q = q.eq("fund", fund);
        return q.range(f, t);
      });
      const pIds = [...new Set(rows.map(r => r.patient_id).filter(Boolean))] as string[];
      const iIds = [...new Set(rows.map(r => r.invoice_id).filter(Boolean))] as string[];
      const [pts, invs] = await Promise.all([
        pIds.length ? supabase.from("patients").select("id, first_name, last_name, patient_number").in("id", pIds.slice(0, 500)) : Promise.resolve({ data: [] as any[] }),
        iIds.length ? supabase.from("invoices").select("id, invoice_number").in("id", iIds.slice(0, 500)) : Promise.resolve({ data: [] as any[] }),
      ]);
      const pm = new Map((pts.data || []).map((p: any) => [p.id, `${p.first_name} ${p.last_name || ""}`.trim() + (p.patient_number ? ` (${p.patient_number})` : "")]));
      const im = new Map((invs.data || []).map((i: any) => [i.id, i.invoice_number]));
      return rows.map(r => ({ ...r, patient_name: r.patient_id ? pm.get(r.patient_id) : undefined, invoice_number: r.invoice_id ? im.get(r.invoice_id) : undefined }));
    },
  });
}

export function useFundDonations(fund: string) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["fund-donations", profile?.organization_id, fund],
    enabled: !!profile?.organization_id && !!fund,
    queryFn: async () => {
      const { data, error } = await supabase.from("financial_donations")
        .select("id, donation_number, amount, donation_date, donor_id, financial_donors(name)")
        .eq("organization_id", profile!.organization_id!).eq("purpose", fund).eq("status", "received")
        .order("donation_date", { ascending: false }).limit(500);
      if (error) throw error;
      return data as any[];
    },
  });
}

/** Picks the fund to charge. "any" = eligible fund with the largest balance that can cover the amount. */
export function pickFund(balances: FundBalance[], wanted: string | null | undefined, amount: number): { fund: string | null; available: number } {
  const eligible = ["zakat", "sadaqah", "fitrana", "general", "patient_welfare", "sponsorship"];
  if (wanted && wanted !== "any") {
    const b = balances.find(x => x.fund === wanted);
    return { fund: wanted, available: b?.balance ?? 0 };
  }
  const best = balances.filter(b => eligible.includes(b.fund) && b.balance >= amount).sort((a, b) => b.balance - a.balance)[0];
  return best ? { fund: best.fund, available: best.balance } : { fund: null, available: 0 };
}

export function useApplyFund() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (p: { invoiceId: string; patientId: string; fund: string; amount: number; department?: string }) => {
      const { data, error } = await (supabase as any).from("fund_utilizations").insert({
        organization_id: profile!.organization_id, branch_id: profile?.branch_id || null,
        invoice_id: p.invoiceId, patient_id: p.patientId, fund: p.fund, amount: p.amount,
        department: p.department || null, created_by: profile?.id || null,
      }).select();
      if (error) throw error;
      return data?.[0];
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fund-balances"] });
      qc.invalidateQueries({ queryKey: ["fund-utilizations"] });
      qc.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}
