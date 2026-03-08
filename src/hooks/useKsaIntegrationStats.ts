import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface KsaStats {
  nphiesClaims: number;
  zatcaInvoices: number;
  wasfatyPrescriptions: number;
  tatmeenTransactions: number;
  hesnReports: number;
  sehhatySyncs: number;
  nafathVerified: number;
}

export function useKsaIntegrationStats() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ["ksa-integration-stats", orgId],
    queryFn: async (): Promise<KsaStats> => {
      if (!orgId) return { nphiesClaims: 0, zatcaInvoices: 0, wasfatyPrescriptions: 0, tatmeenTransactions: 0, hesnReports: 0, sehhatySyncs: 0, nafathVerified: 0 };

      const [claims, invoices, tatmeen, hesn, sehhaty, nafath] = await Promise.all([
        supabase.from("insurance_claims").select("id", { count: "exact", head: true }).eq("organization_id", orgId).not("nphies_claim_id", "is", null),
        supabase.from("invoices").select("id", { count: "exact", head: true }).eq("organization_id", orgId).not("zatca_qr_code", "is", null),
        supabase.from("tatmeen_transactions").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
        supabase.from("hesn_reports").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
        supabase.from("sehhaty_sync_log").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
        supabase.from("patients").select("id", { count: "exact", head: true }).eq("organization_id", orgId).eq("nafath_verified", true),
      ]);

      return {
        nphiesClaims: claims.count ?? 0,
        zatcaInvoices: invoices.count ?? 0,
        wasfatyPrescriptions: 0, // table may not exist yet
        tatmeenTransactions: tatmeen.count ?? 0,
        hesnReports: hesn.count ?? 0,
        sehhatySyncs: sehhaty.count ?? 0,
        nafathVerified: nafath.count ?? 0,
      };
    },
    enabled: !!orgId,
    staleTime: 2 * 60 * 1000,
  });
}
