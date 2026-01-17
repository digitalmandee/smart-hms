import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface PatientProfileStats {
  totalVisits: number;
  lastVisit: string | null;
  totalPrescriptions: number;
  totalLabOrders: number;
  totalAdmissions: number;
  totalERVisits: number;
}

export function usePatientProfileStats(patientId: string | undefined) {
  return useQuery({
    queryKey: ["patient-profile-stats", patientId],
    queryFn: async (): Promise<PatientProfileStats> => {
      if (!patientId) {
        return {
          totalVisits: 0,
          lastVisit: null,
          totalPrescriptions: 0,
          totalLabOrders: 0,
          totalAdmissions: 0,
          totalERVisits: 0,
        };
      }

      // Fetch all counts in parallel
      const [
        visitsResult,
        lastVisitResult,
        prescriptionsResult,
        labOrdersResult,
        admissionsResult,
        erVisitsResult,
      ] = await Promise.all([
        // Total consultations/visits
        supabase
          .from("consultations")
          .select("*", { count: "exact", head: true })
          .eq("patient_id", patientId),
        
        // Last visit date
        supabase
          .from("consultations")
          .select("created_at")
          .eq("patient_id", patientId)
          .order("created_at", { ascending: false })
          .limit(1),
        
        // Total prescriptions
        supabase
          .from("prescriptions")
          .select("*", { count: "exact", head: true })
          .eq("patient_id", patientId),
        
        // Total lab orders
        supabase
          .from("lab_orders")
          .select("*", { count: "exact", head: true })
          .eq("patient_id", patientId),
        
        // Total admissions (IPD)
        supabase
          .from("admissions")
          .select("*", { count: "exact", head: true })
          .eq("patient_id", patientId),
        
        // Total ER visits
        supabase
          .from("emergency_registrations")
          .select("*", { count: "exact", head: true })
          .eq("patient_id", patientId),
      ]);

      return {
        totalVisits: visitsResult.count || 0,
        lastVisit: lastVisitResult.data?.[0]?.created_at || null,
        totalPrescriptions: prescriptionsResult.count || 0,
        totalLabOrders: labOrdersResult.count || 0,
        totalAdmissions: admissionsResult.count || 0,
        totalERVisits: erVisitsResult.count || 0,
      };
    },
    enabled: !!patientId,
    staleTime: 60000, // Cache for 1 minute
  });
}
