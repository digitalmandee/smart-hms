import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface SurgeryMedication {
  id: string;
  surgery_id: string;
  medication_name: string;
  dosage: string | null;
  route: string | null;
  timing: 'pre_op' | 'intra_op' | 'post_op';
  scheduled_time: string | null;
  ordered_by: string | null;
  ordered_at: string | null;
  administered_at: string | null;
  administered_by: string | null;
  status: 'pending' | 'given' | 'held' | 'cancelled';
  hold_reason: string | null;
  notes: string | null;
  organization_id: string;
  created_at: string;
  updated_at: string;
  // Pharmacy integration fields
  pharmacy_status: 'not_required' | 'requested' | 'dispensed' | 'cancelled' | null;
  inventory_item_id: string | null;
  batch_number: string | null;
  unit_price: number | null;
  is_billed: boolean | null;
  dispensed_by: string | null;
  dispensed_at: string | null;
  // Joined fields
  ordered_by_profile?: { full_name: string } | null;
  administered_by_profile?: { full_name: string } | null;
}

export interface CreateMedicationData {
  surgery_id: string;
  medication_name: string;
  dosage?: string;
  route?: string;
  timing: 'pre_op' | 'intra_op' | 'post_op';
  scheduled_time?: string;
  notes?: string;
  pharmacy_status?: 'not_required' | 'requested';
}

// Common pre-op medication protocols
export const COMMON_PREOP_MEDICATIONS = [
  { name: 'Cefazolin', dosage: '1g IV', timing: '30 min before incision', category: 'antibiotic' },
  { name: 'Ceftriaxone', dosage: '1g IV', timing: '30 min before incision', category: 'antibiotic' },
  { name: 'Metronidazole', dosage: '500mg IV', timing: '30 min before incision', category: 'antibiotic' },
  { name: 'Ondansetron', dosage: '4mg IV', timing: 'Pre-op', category: 'antiemetic' },
  { name: 'Midazolam', dosage: '1-2mg IV', timing: 'Pre-op', category: 'anxiolytic' },
  { name: 'Ranitidine', dosage: '50mg IV', timing: 'Pre-op', category: 'antacid' },
  { name: 'Metoclopramide', dosage: '10mg IV', timing: 'Pre-op', category: 'prokinetic' },
  { name: 'Dexamethasone', dosage: '8mg IV', timing: 'Pre-op', category: 'steroid' },
];

export function useSurgeryMedications(surgeryId?: string) {
  return useQuery({
    queryKey: ['surgery-medications', surgeryId],
    queryFn: async () => {
      if (!surgeryId) return [];

      const { data, error } = await supabase
        .from('surgery_medications')
        .select(`
          *,
          ordered_by_profile:profiles!surgery_medications_ordered_by_fkey(full_name),
          administered_by_profile:profiles!surgery_medications_administered_by_fkey(full_name)
        `)
        .eq('surgery_id', surgeryId)
        .order('timing', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as SurgeryMedication[];
    },
    enabled: !!surgeryId,
  });
}

export function useCreateMedication() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (medication: CreateMedicationData) => {
      const { data, error } = await supabase
        .from('surgery_medications')
        .insert({
          surgery_id: medication.surgery_id,
          medication_name: medication.medication_name,
          dosage: medication.dosage,
          route: medication.route,
          timing: medication.timing,
          scheduled_time: medication.scheduled_time,
          notes: medication.notes,
          ordered_by: profile?.id,
          ordered_at: new Date().toISOString(),
          status: 'pending',
          pharmacy_status: medication.pharmacy_status || 'not_required',
          organization_id: profile?.organization_id!,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['surgery-medications', variables.surgery_id] });
      toast.success('Medication order added');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add medication');
    },
  });
}

export function useAdministerMedication() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({ medicationId, surgeryId }: { medicationId: string; surgeryId: string }) => {
      const { data, error } = await supabase
        .from('surgery_medications')
        .update({
          status: 'given',
          administered_at: new Date().toISOString(),
          administered_by: profile?.id,
        })
        .eq('id', medicationId)
        .select()
        .single();

      if (error) throw error;
      return { data, surgeryId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['surgery-medications', result.surgeryId] });
      toast.success('Medication administered');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to administer medication');
    },
  });
}

export function useHoldMedication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ medicationId, surgeryId, reason }: { medicationId: string; surgeryId: string; reason: string }) => {
      const { data, error } = await supabase
        .from('surgery_medications')
        .update({
          status: 'held',
          hold_reason: reason,
        })
        .eq('id', medicationId)
        .select()
        .single();

      if (error) throw error;
      return { data, surgeryId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['surgery-medications', result.surgeryId] });
      toast.success('Medication held');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to hold medication');
    },
  });
}

export function useCancelMedication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ medicationId, surgeryId }: { medicationId: string; surgeryId: string }) => {
      const { data, error } = await supabase
        .from('surgery_medications')
        .update({ status: 'cancelled' })
        .eq('id', medicationId)
        .select()
        .single();

      if (error) throw error;
      return { data, surgeryId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['surgery-medications', result.surgeryId] });
      toast.success('Medication cancelled');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to cancel medication');
    },
  });
}

export function useDeleteMedication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ medicationId, surgeryId }: { medicationId: string; surgeryId: string }) => {
      const { error } = await supabase
        .from('surgery_medications')
        .delete()
        .eq('id', medicationId);

      if (error) throw error;
      return { surgeryId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['surgery-medications', result.surgeryId] });
      toast.success('Medication order removed');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to remove medication');
    },
  });
}
