import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PatientForPOS {
  id: string;
  patient_number: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
}

export interface PrescriptionItemForPOS {
  id: string;
  medicine_id: string | null;
  medicine_name: string;
  dosage: string | null;
  frequency: string | null;
  duration: string | null;
  quantity: number;
  is_dispensed: boolean;
}

export interface PrescriptionForPOS {
  id: string;
  prescription_number: string;
  status: string;
  created_at: string;
  notes: string | null;
  items: PrescriptionItemForPOS[];
  doctor: {
    id: string;
    profile: { full_name: string } | null;
  } | null;
}

// Search patient by MR number or phone
export function useSearchPatientForPOS(search: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["pos-patient-search", search, profile?.organization_id],
    queryFn: async () => {
      if (!search || search.length < 3 || !profile?.organization_id) return [];

      const { data, error } = await supabase
        .from("patients")
        .select("id, patient_number, first_name, last_name, phone, date_of_birth, gender")
        .eq("organization_id", profile.organization_id)
        .or(`patient_number.ilike.%${search}%,phone.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`)
        .limit(10);

      if (error) throw error;
      return data as PatientForPOS[];
    },
    enabled: !!search && search.length >= 3 && !!profile?.organization_id,
    staleTime: 30000,
  });
}

// Get patient prescriptions for POS (only created/partially dispensed)
export function usePatientPrescriptionsForPOS(patientId: string | undefined) {
  return useQuery({
    queryKey: ["pos-patient-prescriptions", patientId],
    queryFn: async () => {
      if (!patientId) return [];

      const { data, error } = await supabase
        .from("prescriptions")
        .select(`
          id,
          prescription_number,
          status,
          created_at,
          notes,
          items:prescription_items(id, medicine_id, medicine_name, dosage, frequency, duration, quantity, is_dispensed),
          doctor:doctors(id, profile:profiles(full_name))
        `)
        .eq("patient_id", patientId)
        .in("status", ["created", "partially_dispensed"])
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as PrescriptionForPOS[];
    },
    enabled: !!patientId,
  });
}

// Get single patient by ID
export function usePatientForPOS(patientId: string | undefined) {
  return useQuery({
    queryKey: ["pos-patient", patientId],
    queryFn: async () => {
      if (!patientId) return null;

      const { data, error } = await supabase
        .from("patients")
        .select("id, patient_number, first_name, last_name, phone, date_of_birth, gender")
        .eq("id", patientId)
        .maybeSingle();

      if (error) throw error;
      return data as PatientForPOS | null;
    },
    enabled: !!patientId,
  });
}
