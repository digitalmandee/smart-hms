import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface WardOccupancy {
  wardId: string;
  wardName: string;
  totalBeds: number;
  occupiedBeds: number;
  occupancyPercent: number;
}

export interface DischargePipelineItem {
  stage: string;
  count: number;
  label: string;
}

export interface IPDFinancialSummary {
  totalDeposits: number;
  totalCharges: number;
  outstandingBalance: number;
}

export interface IPDDashboardEnhancedStats {
  wardOccupancy: WardOccupancy[];
  dischargePipeline: DischargePipelineItem[];
  financialSummary: IPDFinancialSummary;
  avgLengthOfStay: number;
  todayProcedures: number;
  pendingLabResults: number;
  recentActivity: any[];
}

export function useIPDDashboardEnhancedStats() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["ipd-dashboard-enhanced", profile?.organization_id],
    queryFn: async (): Promise<IPDDashboardEnhancedStats> => {
      const orgId = profile!.organization_id!;
      const branchId = profile?.branch_id;

      // Ward occupancy
      const { data: wards } = await supabase.from("wards").select("id, name").eq("organization_id", orgId).eq("is_active", true) as { data: any[] | null };

      // @ts-ignore - deep type instantiation
      const { data: allBeds } = await supabase.from("beds").select("id, ward_id, status").eq("organization_id", orgId).eq("is_active", true);

      const beds = allBeds || [];

      const wardOccupancy: WardOccupancy[] = (wards || []).map((w: any) => {
        const wardBeds = (beds || []).filter(b => b.ward_id === w.id);
        const occupied = wardBeds.filter(b => b.status === "occupied").length;
        const total = wardBeds.length;
        return {
          wardId: w.id,
          wardName: w.name,
          totalBeds: total,
          occupiedBeds: occupied,
          occupancyPercent: total > 0 ? Math.round((occupied / total) * 100) : 0,
        };
      }).filter(w => w.totalBeds > 0);

      // Discharge pipeline - use only valid admission statuses
      let admQuery = supabase.from("admissions").select("id, status, payment_status, deposit_amount")
        .eq("organization_id", orgId).eq("status", "admitted");
      if (branchId) admQuery = admQuery.eq("branch_id", branchId);
      const { data: activeAdmissions } = await admQuery;

      // Also get pending discharges
      let dischQuery = supabase.from("admissions").select("id, status, payment_status")
        .eq("organization_id", orgId).eq("status", "pending");
      if (branchId) dischQuery = dischQuery.eq("branch_id", branchId);
      const { data: pendingAdmissions } = await dischQuery;

      const active = activeAdmissions || [];
      const pending = pendingAdmissions || [];
      
      const dischargePipeline: DischargePipelineItem[] = [
        { stage: "admitted", count: active.length, label: "Active" },
        { stage: "pending", count: pending.length, label: "Pending Discharge" },
      ];

      // Financial summary from ipd_charges (total_amount column) for active admissions
      const activeIds = active.map(a => a.id);
      let totalCharges = 0;
      let totalDeposits = 0;
      
      if (activeIds.length > 0) {
        const { data: charges } = await supabase
          .from("ipd_charges")
          .select("total_amount")
          .in("admission_id", activeIds.slice(0, 100));
        totalCharges = (charges || []).reduce((s, c) => s + (Number(c.total_amount) || 0), 0);
        
        // Use deposit_amount from admissions directly
        totalDeposits = active.reduce((s, a) => s + (Number(a.deposit_amount) || 0), 0);
      }

      // Avg length of stay (from discharged patients in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { data: discharged } = await supabase
        .from("admissions")
        .select("admission_date, actual_discharge_date")
        .eq("organization_id", orgId)
        .eq("status", "discharged")
        .gte("actual_discharge_date", thirtyDaysAgo.toISOString())
        .limit(100);

      let avgLOS = 0;
      if (discharged && discharged.length > 0) {
        const totalDays = discharged.reduce((sum, a) => {
          if (a.actual_discharge_date && a.admission_date) {
            const days = (new Date(a.actual_discharge_date).getTime() - new Date(a.admission_date).getTime()) / (1000 * 60 * 60 * 24);
            return sum + Math.max(days, 1);
          }
          return sum;
        }, 0);
        avgLOS = Math.round((totalDays / discharged.length) * 10) / 10;
      }

      // Today's procedures
      const today = new Date().toISOString().split("T")[0];
      // @ts-ignore - deep type instantiation
      const { count: todayProcedures } = await supabase
        .from("surgeries")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .eq("surgery_date", today);

      // Pending lab results
      const { count: pendingLabs } = await supabase
        .from("lab_orders")
        .select("id", { count: "exact", head: true })
        .in("status", ["ordered", "collected", "processing"]);

      // Recent activity (last 10 admissions/discharges)
      const { data: recentAdmissions } = await supabase
        .from("admissions")
        .select("id, admission_number, status, created_at, patient:patients(first_name, last_name)")
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false })
        .limit(10);

      return {
        wardOccupancy,
        dischargePipeline,
        financialSummary: {
          totalDeposits,
          totalCharges,
          outstandingBalance: totalCharges - totalDeposits,
        },
        avgLengthOfStay: avgLOS,
        todayProcedures: todayProcedures || 0,
        pendingLabResults: pendingLabs || 0,
        recentActivity: recentAdmissions || [],
      };
    },
    enabled: !!profile?.organization_id,
    refetchInterval: 120000,
  });
}
