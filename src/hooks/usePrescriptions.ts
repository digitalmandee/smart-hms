import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type Prescription = Database["public"]["Tables"]["prescriptions"]["Row"];
type PrescriptionInsert = Database["public"]["Tables"]["prescriptions"]["Insert"];
type PrescriptionItem = Database["public"]["Tables"]["prescription_items"]["Row"];
type PrescriptionItemInsert = Database["public"]["Tables"]["prescription_items"]["Insert"];
type PrescriptionStatus = Database["public"]["Enums"]["prescription_status"];

export interface PrescriptionItemInput {
  medicine_id?: string;
  medicine_name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  quantity?: number;
  instructions?: string;
}

export interface PrescriptionWithItems extends Prescription {
  items?: PrescriptionItem[];
  patient?: {
    id: string;
    first_name: string;
    last_name: string | null;
    patient_number: string;
  };
  doctor?: {
    id: string;
    profile: {
      full_name: string;
    };
    specialization: string | null;
  };
}

interface PrescriptionFilters {
  consultationId?: string;
  patientId?: string;
  status?: PrescriptionStatus;
  branchId?: string;
}

export function usePrescriptions(filters: PrescriptionFilters = {}) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["prescriptions", filters],
    queryFn: async () => {
      let query = supabase
        .from("prescriptions")
        .select(`
          *,
          items:prescription_items(*),
          patient:patients(id, first_name, last_name, patient_number),
          doctor:doctors(id, specialization, profile:profiles(full_name))
        `)
        .order("created_at", { ascending: false });

      if (filters.consultationId) {
        query = query.eq("consultation_id", filters.consultationId);
      }
      if (filters.patientId) {
        query = query.eq("patient_id", filters.patientId);
      }
      if (filters.status) {
        query = query.eq("status", filters.status);
      }
      if (filters.branchId) {
        query = query.eq("branch_id", filters.branchId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PrescriptionWithItems[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function usePrescription(id: string | undefined) {
  return useQuery({
    queryKey: ["prescription", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("prescriptions")
        .select(`
          *,
          items:prescription_items(*),
          patient:patients(id, first_name, last_name, patient_number, phone, date_of_birth, gender),
          doctor:doctors(id, specialization, qualification, profile:profiles(full_name))
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as PrescriptionWithItems;
    },
    enabled: !!id,
  });
}

export function usePrescriptionByConsultation(consultationId: string | undefined) {
  return useQuery({
    queryKey: ["prescription-by-consultation", consultationId],
    queryFn: async () => {
      if (!consultationId) return null;

      const { data, error } = await supabase
        .from("prescriptions")
        .select(`
          *,
          items:prescription_items(*)
        `)
        .eq("consultation_id", consultationId)
        .maybeSingle();

      if (error) throw error;
      return data as PrescriptionWithItems | null;
    },
    enabled: !!consultationId,
  });
}

async function generatePrescriptionNumber(branchId: string): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
  
  // Get count of prescriptions today for this branch
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
  
  const { count } = await supabase
    .from("prescriptions")
    .select("*", { count: 'exact', head: true })
    .eq("branch_id", branchId)
    .gte("created_at", startOfDay)
    .lte("created_at", endOfDay);

  const sequence = String((count || 0) + 1).padStart(4, '0');
  return `RX-${dateStr}-${sequence}`;
}

export function useCreatePrescription() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      prescription,
      items,
    }: {
      prescription: Omit<PrescriptionInsert, "prescription_number">;
      items: PrescriptionItemInput[];
    }) => {
      // Generate prescription number
      const prescriptionNumber = await generatePrescriptionNumber(prescription.branch_id);

      // Create prescription
      const { data: newPrescription, error: prescriptionError } = await supabase
        .from("prescriptions")
        .insert({
          ...prescription,
          prescription_number: prescriptionNumber,
        })
        .select()
        .single();

      if (prescriptionError) throw prescriptionError;

      // Create prescription items
      if (items.length > 0) {
        const prescriptionItems = items.map((item) => ({
          ...item,
          prescription_id: newPrescription.id,
        }));

        const { error: itemsError } = await supabase
          .from("prescription_items")
          .insert(prescriptionItems);

        if (itemsError) throw itemsError;
      }

      return newPrescription;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      toast({
        title: "Prescription created",
        description: "The prescription has been created successfully.",
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

export function useUpdatePrescription() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: string;
      status?: PrescriptionStatus;
      notes?: string;
    }) => {
      const updateData: Partial<Prescription> = {};
      if (status) updateData.status = status;
      if (notes !== undefined) updateData.notes = notes;

      const { data, error } = await supabase
        .from("prescriptions")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      queryClient.invalidateQueries({ queryKey: ["prescription", variables.id] });
      toast({
        title: "Prescription updated",
        description: "The prescription has been updated successfully.",
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

export function usePatientPrescriptions(patientId: string | undefined, limit = 5) {
  return useQuery({
    queryKey: ["patient-prescriptions", patientId, limit],
    queryFn: async () => {
      if (!patientId) return [];

      const { data, error } = await supabase
        .from("prescriptions")
        .select(`
          *,
          items:prescription_items(*),
          doctor:doctors(id, profile:profiles(full_name))
        `)
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as PrescriptionWithItems[];
    },
    enabled: !!patientId,
  });
}
