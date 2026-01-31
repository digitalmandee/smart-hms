import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays, parseISO } from "date-fns";

interface Claim {
  id: string;
  claim_number: string;
  status: string | null;
  claim_amount: number | null;
  approved_amount: number | null;
  rejected_amount: number | null;
  rejection_reason: string | null;
  submitted_at: string | null;
  processed_at: string | null;
  created_at: string;
  insurance_company: { id: string; name: string } | null;
  invoice: { id: string; invoice_number: string; total_amount: number } | null;
  patient: { id: string; first_name: string; last_name: string } | null;
}

interface InsuranceStats {
  company_id: string;
  company_name: string;
  total_claims: number;
  submitted: number;
  approved: number;
  rejected: number;
  pending: number;
  total_claimed: number;
  total_approved: number;
  total_rejected: number;
  approval_rate: number;
  avg_processing_days: number;
}

interface StatusBreakdown {
  status: string;
  count: number;
  amount: number;
  percentage: number;
}

interface RejectionReason {
  reason: string;
  count: number;
  amount: number;
}

interface AgingBucket {
  bucket: string;
  count: number;
  amount: number;
  days_range: string;
}

export function useClaimsStats(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ["claims-stats", dateFrom, dateTo],
    queryFn: async () => {
      const { data: claims, error } = await supabase
        .from("insurance_claims")
        .select(`
          id, claim_number, status, claim_amount, approved_amount, rejected_amount,
          rejection_reason, submitted_at, processed_at, created_at,
          insurance_company:insurance_companies(id, name),
          invoice:invoices(id, invoice_number, total_amount),
          patient:patients(id, first_name, last_name)
        `)
        .gte("created_at", `${dateFrom}T00:00:00`)
        .lte("created_at", `${dateTo}T23:59:59`);

      if (error) throw error;

      const typedClaims = (claims || []) as unknown as Claim[];

      // Summary stats
      const totalClaims = typedClaims.length;
      const submittedClaims = typedClaims.filter(c => c.status === "submitted").length;
      const approvedClaims = typedClaims.filter(c => c.status === "approved").length;
      const rejectedClaims = typedClaims.filter(c => c.status === "rejected").length;
      const pendingClaims = typedClaims.filter(c => c.status === "pending" || c.status === "draft").length;
      const partiallyApproved = typedClaims.filter(c => c.status === "partially_approved").length;

      const totalClaimedAmount = typedClaims.reduce((acc, c) => acc + (c.claim_amount || 0), 0);
      const totalApprovedAmount = typedClaims.reduce((acc, c) => acc + (c.approved_amount || 0), 0);
      const totalRejectedAmount = typedClaims.reduce((acc, c) => acc + (c.rejected_amount || 0), 0);

      // Calculate average processing time
      const processedClaims = typedClaims.filter(c => c.submitted_at && c.processed_at);
      const processingDays = processedClaims.map(c => 
        differenceInDays(parseISO(c.processed_at!), parseISO(c.submitted_at!))
      );
      const avgProcessingDays = processingDays.length > 0
        ? Math.round(processingDays.reduce((a, b) => a + b, 0) / processingDays.length)
        : 0;

      // Status breakdown
      const statusMap = new Map<string, { count: number; amount: number }>();
      typedClaims.forEach(c => {
        const status = c.status || "unknown";
        const existing = statusMap.get(status) || { count: 0, amount: 0 };
        existing.count++;
        existing.amount += c.claim_amount || 0;
        statusMap.set(status, existing);
      });
      const byStatus: StatusBreakdown[] = Array.from(statusMap.entries()).map(([status, data]) => ({
        status,
        count: data.count,
        amount: data.amount,
        percentage: totalClaims > 0 ? Math.round((data.count / totalClaims) * 100) : 0,
      })).sort((a, b) => b.count - a.count);

      // By insurance company
      const companyMap = new Map<string, InsuranceStats>();
      typedClaims.forEach(c => {
        if (!c.insurance_company) return;
        const key = c.insurance_company.id;
        const existing = companyMap.get(key) || {
          company_id: key,
          company_name: c.insurance_company.name,
          total_claims: 0,
          submitted: 0,
          approved: 0,
          rejected: 0,
          pending: 0,
          total_claimed: 0,
          total_approved: 0,
          total_rejected: 0,
          approval_rate: 0,
          avg_processing_days: 0,
        };
        existing.total_claims++;
        existing.total_claimed += c.claim_amount || 0;
        if (c.status === "submitted") existing.submitted++;
        if (c.status === "approved" || c.status === "partially_approved") {
          existing.approved++;
          existing.total_approved += c.approved_amount || 0;
        }
        if (c.status === "rejected") {
          existing.rejected++;
          existing.total_rejected += c.rejected_amount || c.claim_amount || 0;
        }
        if (c.status === "pending" || c.status === "draft") existing.pending++;
        companyMap.set(key, existing);
      });
      const byCompany = Array.from(companyMap.values()).map(c => ({
        ...c,
        approval_rate: c.total_claims > 0 ? Math.round((c.approved / c.total_claims) * 100) : 0,
      })).sort((a, b) => b.total_claims - a.total_claims);

      // Rejection reasons
      const rejectionMap = new Map<string, { count: number; amount: number }>();
      typedClaims.filter(c => c.status === "rejected" && c.rejection_reason).forEach(c => {
        const reason = c.rejection_reason || "Other";
        const existing = rejectionMap.get(reason) || { count: 0, amount: 0 };
        existing.count++;
        existing.amount += c.claim_amount || 0;
        rejectionMap.set(reason, existing);
      });
      const rejectionReasons: RejectionReason[] = Array.from(rejectionMap.entries())
        .map(([reason, data]) => ({ reason, ...data }))
        .sort((a, b) => b.count - a.count);

      // Aging analysis (for pending/submitted claims)
      const pendingClaimsList = typedClaims.filter(c => 
        c.status === "pending" || c.status === "submitted" || c.status === "draft"
      );
      const agingBuckets: AgingBucket[] = [
        { bucket: "0-7", days_range: "0-7 days", count: 0, amount: 0 },
        { bucket: "8-15", days_range: "8-15 days", count: 0, amount: 0 },
        { bucket: "16-30", days_range: "16-30 days", count: 0, amount: 0 },
        { bucket: "31-60", days_range: "31-60 days", count: 0, amount: 0 },
        { bucket: "60+", days_range: "Over 60 days", count: 0, amount: 0 },
      ];
      pendingClaimsList.forEach(c => {
        const days = differenceInDays(new Date(), parseISO(c.created_at));
        let bucket: AgingBucket;
        if (days <= 7) bucket = agingBuckets[0];
        else if (days <= 15) bucket = agingBuckets[1];
        else if (days <= 30) bucket = agingBuckets[2];
        else if (days <= 60) bucket = agingBuckets[3];
        else bucket = agingBuckets[4];
        bucket.count++;
        bucket.amount += c.claim_amount || 0;
      });

      // Daily trend
      const dailyMap = new Map<string, { date: string; submitted: number; approved: number; rejected: number }>();
      typedClaims.forEach(c => {
        const date = c.created_at.split("T")[0];
        const existing = dailyMap.get(date) || { date, submitted: 0, approved: 0, rejected: 0 };
        if (c.status === "submitted") existing.submitted++;
        if (c.status === "approved" || c.status === "partially_approved") existing.approved++;
        if (c.status === "rejected") existing.rejected++;
        dailyMap.set(date, existing);
      });
      const dailyTrend = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));

      return {
        summary: {
          totalClaims,
          submittedClaims,
          approvedClaims,
          rejectedClaims,
          pendingClaims,
          partiallyApproved,
          totalClaimedAmount,
          totalApprovedAmount,
          totalRejectedAmount,
          avgProcessingDays,
          approvalRate: totalClaims > 0 ? Math.round((approvedClaims / totalClaims) * 100) : 0,
          recoveryRate: totalClaimedAmount > 0 ? Math.round((totalApprovedAmount / totalClaimedAmount) * 100) : 0,
        },
        byStatus,
        byCompany,
        rejectionReasons,
        agingBuckets,
        dailyTrend,
      };
    },
  });
}
