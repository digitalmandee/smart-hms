import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface PatientCurrentVisit {
  id: string;
  token_number: number | null;
  status: string | null;
  chief_complaint: string | null;
  check_in_at: string | null;
  check_in_vitals: Record<string, any> | null;
  appointment_time: string | null;
  doctor: {
    id: string;
    profile: {
      full_name: string | null;
    } | null;
    specialization: string | null;
  } | null;
}

export function usePatientCurrentVisit(patientId: string | undefined) {
  return useQuery({
    queryKey: ["patient-current-visit", patientId],
    queryFn: async (): Promise<PatientCurrentVisit | null> => {
      if (!patientId) return null;

      const today = format(new Date(), "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id,
          token_number,
          status,
          chief_complaint,
          check_in_at,
          check_in_vitals,
          appointment_time,
          doctor:doctors!appointments_doctor_id_fkey (
            id,
            profile:profiles!doctors_profile_id_fkey (
              full_name
            ),
            specialization
          )
        `)
        .eq("patient_id", patientId)
        .eq("appointment_date", today)
        .in("status", ["scheduled", "checked_in", "in_progress"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching patient current visit:", error);
        return null;
      }

      if (!data) return null;

      return {
        id: data.id,
        token_number: data.token_number,
        status: data.status,
        chief_complaint: data.chief_complaint,
        check_in_at: data.check_in_at,
        check_in_vitals: data.check_in_vitals as Record<string, any> | null,
        appointment_time: data.appointment_time,
        doctor: data.doctor as PatientCurrentVisit["doctor"],
      };
    },
    enabled: !!patientId,
    staleTime: 30000, // 30 seconds
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });
}
