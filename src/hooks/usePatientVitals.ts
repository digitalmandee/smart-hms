import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface VitalsRecord {
  id: string;
  recorded_at: string;
  source: 'opd' | 'consultation' | 'ipd';
  source_id: string;
  blood_pressure_systolic?: number | null;
  blood_pressure_diastolic?: number | null;
  pulse?: number | null;
  temperature?: number | null;
  respiratory_rate?: number | null;
  spo2?: number | null;
  weight?: number | null;
  height?: number | null;
  bmi?: number | null;
  blood_sugar?: number | null;
  notes?: string | null;
}

interface CheckInVitals {
  blood_pressure?: {
    systolic?: number;
    diastolic?: number;
  };
  pulse?: number;
  temperature?: number;
  respiratory_rate?: number;
  spo2?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  blood_sugar?: number;
}

interface ConsultationVitals {
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  pulse?: number;
  temperature?: number;
  respiratory_rate?: number;
  spo2?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  blood_sugar?: number;
}

export function usePatientVitalsHistory(patientId: string | undefined) {
  return useQuery({
    queryKey: ["patient-vitals-history", patientId],
    queryFn: async () => {
      if (!patientId) return [];

      const allVitals: VitalsRecord[] = [];

      // Fetch OPD vitals from appointments
      const { data: appointments } = await supabase
        .from("appointments")
        .select("id, check_in_vitals, check_in_at")
        .eq("patient_id", patientId)
        .not("check_in_vitals", "is", null)
        .order("check_in_at", { ascending: false });

      if (appointments) {
        for (const appt of appointments) {
          const vitals = appt.check_in_vitals as CheckInVitals;
          if (vitals && Object.keys(vitals).length > 0) {
            allVitals.push({
              id: `opd-${appt.id}`,
              recorded_at: appt.check_in_at || new Date().toISOString(),
              source: 'opd',
              source_id: appt.id,
              blood_pressure_systolic: vitals.blood_pressure?.systolic,
              blood_pressure_diastolic: vitals.blood_pressure?.diastolic,
              pulse: vitals.pulse,
              temperature: vitals.temperature,
              respiratory_rate: vitals.respiratory_rate,
              spo2: vitals.spo2,
              weight: vitals.weight,
              height: vitals.height,
              bmi: vitals.bmi,
              blood_sugar: vitals.blood_sugar,
            });
          }
        }
      }

      // Fetch vitals from consultations
      const { data: consultations } = await supabase
        .from("consultations")
        .select("id, vitals, created_at")
        .eq("patient_id", patientId)
        .not("vitals", "is", null)
        .order("created_at", { ascending: false });

      if (consultations) {
        for (const consult of consultations) {
          const vitals = consult.vitals as ConsultationVitals;
          if (vitals && Object.keys(vitals).length > 0) {
            allVitals.push({
              id: `consult-${consult.id}`,
              recorded_at: consult.created_at,
              source: 'consultation',
              source_id: consult.id,
              blood_pressure_systolic: vitals.blood_pressure_systolic,
              blood_pressure_diastolic: vitals.blood_pressure_diastolic,
              pulse: vitals.pulse,
              temperature: vitals.temperature,
              respiratory_rate: vitals.respiratory_rate,
              spo2: vitals.spo2,
              weight: vitals.weight,
              height: vitals.height,
              bmi: vitals.bmi,
              blood_sugar: vitals.blood_sugar,
            });
          }
        }
      }

      // Fetch IPD vitals via admissions
      const { data: admissions } = await supabase
        .from("admissions")
        .select("id")
        .eq("patient_id", patientId);

      if (admissions && admissions.length > 0) {
        const admissionIds = admissions.map(a => a.id);
        const { data: ipdVitals } = await supabase
          .from("ipd_vitals")
          .select("*")
          .in("admission_id", admissionIds)
          .order("recorded_at", { ascending: false });

        if (ipdVitals) {
          for (const vital of ipdVitals) {
            allVitals.push({
              id: `ipd-${vital.id}`,
              recorded_at: vital.recorded_at || vital.created_at || new Date().toISOString(),
              source: 'ipd',
              source_id: vital.admission_id,
              blood_pressure_systolic: vital.blood_pressure_systolic,
              blood_pressure_diastolic: vital.blood_pressure_diastolic,
              pulse: vital.pulse,
              temperature: vital.temperature,
              respiratory_rate: vital.respiratory_rate,
              spo2: vital.oxygen_saturation,
              weight: vital.weight,
              height: vital.height,
              blood_sugar: vital.blood_sugar,
              notes: vital.notes,
            });
          }
        }
      }

      // Sort all vitals by recorded_at descending
      allVitals.sort((a, b) => 
        new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
      );

      return allVitals;
    },
    enabled: !!patientId,
    staleTime: 60000,
  });
}

// Helper to check if a vital reading is abnormal
export function isAbnormalVital(type: string, value: number | null | undefined): boolean {
  if (value == null) return false;
  
  switch (type) {
    case 'systolic':
      return value < 90 || value > 140;
    case 'diastolic':
      return value < 60 || value > 90;
    case 'pulse':
      return value < 60 || value > 100;
    case 'temperature':
      return value < 36 || value > 37.5;
    case 'spo2':
      return value < 95;
    case 'respiratory_rate':
      return value < 12 || value > 20;
    default:
      return false;
  }
}
