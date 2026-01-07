import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database, Json } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type Consultation = Database["public"]["Tables"]["consultations"]["Row"];
type ConsultationInsert = Database["public"]["Tables"]["consultations"]["Insert"];
type ConsultationUpdate = Database["public"]["Tables"]["consultations"]["Update"];

export interface Vitals {
  blood_pressure?: {
    systolic: number;
    diastolic: number;
  };
  pulse?: number;
  temperature?: number;
  temperature_unit?: 'F' | 'C';
  weight?: number;
  height?: number;
  bmi?: number;
  spo2?: number;
  respiratory_rate?: number;
  blood_sugar?: {
    value: number;
    type: 'fasting' | 'random' | 'pp';
  };
}

interface ConsultationFilters {
  patientId?: string;
  doctorId?: string;
  dateFrom?: string;
  dateTo?: string;
  branchId?: string;
}

export interface ConsultationWithRelations extends Consultation {
  patient?: {
    id: string;
    first_name: string;
    last_name: string | null;
    patient_number: string;
    phone: string | null;
    date_of_birth: string | null;
    gender: string | null;
    blood_group: string | null;
  };
  doctor?: {
    id: string;
    profile: {
      full_name: string;
    };
    specialization: string | null;
  };
  appointment?: {
    id: string;
    token_number: number | null;
    appointment_type: string | null;
  };
}

export function useConsultations(filters: ConsultationFilters = {}) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["consultations", filters],
    queryFn: async () => {
      let query = supabase
        .from("consultations")
        .select(`
          *,
          patient:patients(id, first_name, last_name, patient_number, phone, date_of_birth, gender, blood_group),
          doctor:doctors(id, specialization, profile:profiles(full_name)),
          appointment:appointments(id, token_number, appointment_type)
        `)
        .order("created_at", { ascending: false });

      if (filters.patientId) {
        query = query.eq("patient_id", filters.patientId);
      }
      if (filters.doctorId) {
        query = query.eq("doctor_id", filters.doctorId);
      }
      if (filters.branchId) {
        query = query.eq("branch_id", filters.branchId);
      }
      if (filters.dateFrom) {
        query = query.gte("created_at", filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte("created_at", filters.dateTo);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ConsultationWithRelations[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useConsultation(id: string | undefined) {
  return useQuery({
    queryKey: ["consultation", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("consultations")
        .select(`
          *,
          patient:patients(id, first_name, last_name, patient_number, phone, date_of_birth, gender, blood_group, email, address, city),
          doctor:doctors(id, specialization, qualification, profile:profiles(full_name)),
          appointment:appointments(id, token_number, appointment_type, chief_complaint, notes)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as ConsultationWithRelations;
    },
    enabled: !!id,
  });
}

export function useConsultationByAppointment(appointmentId: string | undefined) {
  return useQuery({
    queryKey: ["consultation-by-appointment", appointmentId],
    queryFn: async () => {
      if (!appointmentId) return null;

      const { data, error } = await supabase
        .from("consultations")
        .select(`
          *,
          patient:patients(id, first_name, last_name, patient_number, phone, date_of_birth, gender, blood_group),
          doctor:doctors(id, specialization, profile:profiles(full_name))
        `)
        .eq("appointment_id", appointmentId)
        .maybeSingle();

      if (error) throw error;
      return data as ConsultationWithRelations | null;
    },
    enabled: !!appointmentId,
  });
}

export function useCreateConsultation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Omit<ConsultationInsert, "id">) => {
      const { data: consultation, error } = await supabase
        .from("consultations")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return consultation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
      toast({
        title: "Consultation started",
        description: "The consultation has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateConsultation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: ConsultationUpdate & { id: string }) => {
      const { data: consultation, error } = await supabase
        .from("consultations")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return consultation;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
      queryClient.invalidateQueries({ queryKey: ["consultation", variables.id] });
      toast({
        title: "Consultation updated",
        description: "The consultation has been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function usePatientConsultationHistory(patientId: string | undefined, limit = 5) {
  return useQuery({
    queryKey: ["patient-consultations", patientId, limit],
    queryFn: async () => {
      if (!patientId) return [];

      const { data, error } = await supabase
        .from("consultations")
        .select(`
          *,
          doctor:doctors(id, specialization, profile:profiles(full_name))
        `)
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
    enabled: !!patientId,
  });
}

export function useTodayConsultationStats(doctorId: string | undefined) {
  const today = new Date().toISOString().split('T')[0];
  
  return useQuery({
    queryKey: ["consultation-stats", doctorId, today],
    queryFn: async () => {
      if (!doctorId) return { completed: 0, pending: 0 };

      const { data: appointments, error } = await supabase
        .from("appointments")
        .select("status")
        .eq("doctor_id", doctorId)
        .eq("appointment_date", today);

      if (error) throw error;

      const completed = appointments?.filter(a => a.status === 'completed').length || 0;
      const pending = appointments?.filter(a => 
        a.status === 'checked_in' || a.status === 'in_progress'
      ).length || 0;

      return { completed, pending };
    },
    enabled: !!doctorId,
  });
}
