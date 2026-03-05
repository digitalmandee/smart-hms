import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

export interface NphiesClaim {
  id: string;
  claim_number: string;
  claim_date: string;
  submission_date: string | null;
  total_amount: number;
  approved_amount: number;
  status: string;
  nphies_status: string | null;
  nphies_claim_id: string | null;
  patient_name: string;
  patient_number: string;
  payer_name: string;
  payer_id: string;
}

export interface MonthlyTrend {
  month: string;
  submitted: number;
  approved: number;
  rejected: number;
  pending: number;
}

export interface PayerBreakdown {
  payerId: string;
  payerName: string;
  totalClaims: number;
  approved: number;
  rejected: number;
  pending: number;
  approvalRate: number;
  totalAmount: number;
  approvedAmount: number;
}

export interface NphiesAnalyticsSummary {
  totalClaims: number;
  approved: number;
  rejected: number;
  pending: number;
  totalAmount: number;
  approvedAmount: number;
  avgProcessingDays: number;
}

export function useNphiesAnalytics(dateFrom?: Date, dateTo?: Date) {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ["nphies-analytics", orgId, dateFrom?.toISOString(), dateTo?.toISOString()],
    queryFn: async () => {
      if (!orgId) return null;

      const query = supabase
        .from("insurance_claims")
        .select(`
          id, claim_number, claim_date, submission_date, total_amount, approved_amount,
          status, nphies_status, nphies_claim_id, approval_date,
          patient_insurance!inner (
            patient:patients!inner (id, first_name, last_name, patient_number),
            insurance_plan:insurance_plans!inner (
              insurance_company:insurance_companies!inner (id, name)
            )
          )
        `)
        .eq("organization_id", orgId)
        .not("nphies_claim_id", "is", null);

      if (dateFrom) query.gte("claim_date", format(dateFrom, "yyyy-MM-dd"));
      if (dateTo) query.lte("claim_date", format(dateTo, "yyyy-MM-dd"));

      const { data, error } = await query.order("claim_date", { ascending: false });
      if (error) throw error;

      // Transform claims
      const claims: NphiesClaim[] = (data || []).map((c: any) => {
        const pi = c.patient_insurance;
        const patient = pi?.patient;
        const company = pi?.insurance_plan?.insurance_company;
        return {
          id: c.id,
          claim_number: c.claim_number,
          claim_date: c.claim_date,
          submission_date: c.submission_date,
          total_amount: c.total_amount,
          approved_amount: c.approved_amount,
          status: c.status,
          nphies_status: c.nphies_status,
          nphies_claim_id: c.nphies_claim_id,
          patient_name: patient ? `${patient.first_name} ${patient.last_name}` : "—",
          patient_number: patient?.patient_number || "—",
          payer_name: company?.name || "—",
          payer_id: company?.id || "",
        };
      });

      // Summary
      const summary: NphiesAnalyticsSummary = {
        totalClaims: claims.length,
        approved: claims.filter(c => c.nphies_status === "accepted").length,
        rejected: claims.filter(c => c.nphies_status === "rejected").length,
        pending: claims.filter(c => c.nphies_status === "pending" || c.nphies_status === "submitted").length,
        totalAmount: claims.reduce((s, c) => s + c.total_amount, 0),
        approvedAmount: claims.reduce((s, c) => s + c.approved_amount, 0),
        avgProcessingDays: 0,
      };

      // Avg processing days
      const processed = (data || []).filter((c: any) => c.approval_date && c.submission_date);
      if (processed.length > 0) {
        const totalDays = processed.reduce((s: number, c: any) => {
          const diff = (new Date(c.approval_date).getTime() - new Date(c.submission_date).getTime()) / (1000 * 60 * 60 * 24);
          return s + Math.max(0, diff);
        }, 0);
        summary.avgProcessingDays = Math.round(totalDays / processed.length);
      }

      // Monthly trends (last 12 months)
      const monthlyMap = new Map<string, MonthlyTrend>();
      for (let i = 11; i >= 0; i--) {
        const m = subMonths(new Date(), i);
        const key = format(m, "yyyy-MM");
        monthlyMap.set(key, { month: format(m, "MMM yyyy"), submitted: 0, approved: 0, rejected: 0, pending: 0 });
      }
      claims.forEach(c => {
        const key = c.claim_date.substring(0, 7);
        const entry = monthlyMap.get(key);
        if (entry) {
          entry.submitted++;
          if (c.nphies_status === "accepted") entry.approved++;
          else if (c.nphies_status === "rejected") entry.rejected++;
          else entry.pending++;
        }
      });
      const monthlyTrends: MonthlyTrend[] = Array.from(monthlyMap.values());

      // Payer breakdown
      const payerMap = new Map<string, PayerBreakdown>();
      claims.forEach(c => {
        if (!c.payer_id) return;
        let p = payerMap.get(c.payer_id);
        if (!p) {
          p = { payerId: c.payer_id, payerName: c.payer_name, totalClaims: 0, approved: 0, rejected: 0, pending: 0, approvalRate: 0, totalAmount: 0, approvedAmount: 0 };
          payerMap.set(c.payer_id, p);
        }
        p.totalClaims++;
        p.totalAmount += c.total_amount;
        p.approvedAmount += c.approved_amount;
        if (c.nphies_status === "accepted") p.approved++;
        else if (c.nphies_status === "rejected") p.rejected++;
        else p.pending++;
      });
      const payerBreakdown: PayerBreakdown[] = Array.from(payerMap.values()).map(p => ({
        ...p,
        approvalRate: p.totalClaims > 0 ? Math.round((p.approved / p.totalClaims) * 100) : 0,
      })).sort((a, b) => b.totalClaims - a.totalClaims);

      return { claims, summary, monthlyTrends, payerBreakdown };
    },
    enabled: !!orgId,
  });
}
