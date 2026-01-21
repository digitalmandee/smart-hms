import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface UnbilledCharge {
  id: string;
  admission_id: string;
  charge_date: string;
  charge_type: string;
  description: string;
  quantity: number | null;
  unit_price: number;
  total_amount: number;
  is_billed: boolean | null;
  created_at: string | null;
}

export interface PatientUnbilledChargesResult {
  charges: UnbilledCharge[];
  total: number;
  admissionId: string | null;
  admissionNumber: string | null;
}

export function usePatientUnbilledCharges(patientId: string | undefined) {
  return useQuery({
    queryKey: ["patient-unbilled-charges", patientId],
    queryFn: async (): Promise<PatientUnbilledChargesResult> => {
      if (!patientId) {
        return { charges: [], total: 0, admissionId: null, admissionNumber: null };
      }

      // Get patient's active admissions
      const { data: admissions, error: admError } = await supabase
        .from("admissions")
        .select("id, admission_number, status")
        .eq("patient_id", patientId)
        .in("status", ["admitted", "pending"])
        .order("admission_date", { ascending: false })
        .limit(1);

      if (admError) throw admError;
      if (!admissions?.length) {
        return { charges: [], total: 0, admissionId: null, admissionNumber: null };
      }

      const admission = admissions[0];

      // Get unbilled charges for that admission
      const { data: charges, error: chargesError } = await supabase
        .from("ipd_charges")
        .select("*")
        .eq("admission_id", admission.id)
        .eq("is_billed", false)
        .order("created_at", { ascending: false });

      if (chargesError) throw chargesError;

      const total = charges?.reduce((sum, c) => sum + (c.total_amount || 0), 0) || 0;

      return {
        charges: (charges || []) as UnbilledCharge[],
        total,
        admissionId: admission.id,
        admissionNumber: admission.admission_number,
      };
    },
    enabled: !!patientId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useAdmissionUnbilledCharges(admissionId: string | undefined) {
  return useQuery({
    queryKey: ["admission-unbilled-charges", admissionId],
    queryFn: async () => {
      if (!admissionId) return { charges: [], total: 0, count: 0 };

      const { data: charges, error } = await supabase
        .from("ipd_charges")
        .select("*")
        .eq("admission_id", admissionId)
        .eq("is_billed", false)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const total = charges?.reduce((sum, c) => sum + (c.total_amount || 0), 0) || 0;

      return {
        charges: (charges || []) as UnbilledCharge[],
        total,
        count: charges?.length || 0,
      };
    },
    enabled: !!admissionId,
  });
}
