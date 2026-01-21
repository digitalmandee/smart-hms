import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PatientAdmissionStatus {
  id: string;
  admission_number: string;
  ward: { name: string } | null;
  bed: { bed_number: string } | null;
}

// Check if patient is currently admitted (for Post to Profile feature)
export function usePatientAdmissionStatus(patientId?: string) {
  return useQuery({
    queryKey: ["patient-admission-status", patientId],
    queryFn: async () => {
      if (!patientId) return null;

      const { data, error } = await supabase
        .from("admissions")
        .select("id, admission_number, ward:wards(name), bed:beds(bed_number)")
        .eq("patient_id", patientId)
        .eq("status", "admitted")
        .maybeSingle();

      if (error) throw error;
      return data as PatientAdmissionStatus | null;
    },
    enabled: !!patientId,
  });
}

export interface PatientForPOS {
  id: string;
  patient_number: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  token_number?: number | null;
}

export interface PrescriptionItemForPOS {
  id: string;
  prescription_id?: string;
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

// Search patient by MR number, phone, name, OR today's token number
export function useSearchPatientForPOS(search: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["pos-patient-search", search, profile?.organization_id],
    queryFn: async () => {
      if (!search || !profile?.organization_id) return [];

      const trimmedSearch = search.trim();
      
      // Check if search is a token number (1-4 digits only)
      const isTokenSearch = /^\d{1,4}$/.test(trimmedSearch);
      
      if (isTokenSearch) {
        // Search by today's token number
        const today = new Date().toISOString().split("T")[0];
        const { data: appointments, error: apptError } = await supabase
          .from("appointments")
          .select(`
            patient_id,
            token_number,
            patient:patients(id, patient_number, first_name, last_name, phone, date_of_birth, gender)
          `)
          .eq("organization_id", profile.organization_id)
          .eq("appointment_date", today)
          .eq("token_number", parseInt(trimmedSearch))
          .limit(5);

        if (apptError) throw apptError;

        // Extract patient data from appointments
        const patients = appointments
          ?.filter((a: any) => a.patient)
          .map((a: any) => ({
            ...a.patient,
            token_number: a.token_number,
          })) || [];

        return patients as (PatientForPOS & { token_number?: number })[];
      }

      // Regular search by MR#, phone, or name (requires min 3 chars)
      if (trimmedSearch.length < 3) return [];

      const { data, error } = await supabase
        .from("patients")
        .select("id, patient_number, first_name, last_name, phone, date_of_birth, gender")
        .eq("organization_id", profile.organization_id)
        .or(`patient_number.ilike.%${trimmedSearch}%,phone.ilike.%${trimmedSearch}%,first_name.ilike.%${trimmedSearch}%,last_name.ilike.%${trimmedSearch}%`)
        .limit(10);

      if (error) throw error;

      // Also fetch today's tokens for these patients
      const today = new Date().toISOString().split("T")[0];
      const patientIds = data?.map(p => p.id) || [];
      
      if (patientIds.length > 0) {
        const { data: todayAppointments } = await supabase
          .from("appointments")
          .select("patient_id, token_number")
          .eq("organization_id", profile.organization_id)
          .eq("appointment_date", today)
          .in("patient_id", patientIds);

        // Merge token numbers into patient results
        return data?.map(patient => ({
          ...patient,
          token_number: todayAppointments?.find(a => a.patient_id === patient.id)?.token_number || null
        })) as PatientForPOS[];
      }

      return data as PatientForPOS[];
    },
    enabled: !!search && !!profile?.organization_id && (search.trim().length >= 1),
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
