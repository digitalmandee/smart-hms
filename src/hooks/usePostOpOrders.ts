import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

export interface PostOpOrder {
  id: string;
  surgery_id: string;
  ordered_by: string;
  ordered_at: string;
  disposition: string;
  diet_order: string;
  diet_notes: string | null;
  diet_start_time: string | null;
  activity_level: string;
  activity_restrictions: string | null;
  weight_bearing: string | null;
  pain_management: Json;
  pca_ordered: boolean;
  pca_settings: Json | null;
  pain_goal: number | null;
  iv_fluids: Json;
  medications: Json;
  continue_home_meds: boolean;
  held_medications: string | null;
  vital_signs_frequency: string;
  neuro_checks: boolean;
  neuro_frequency: string | null;
  intake_output: boolean;
  fall_precautions: boolean;
  bleeding_precautions: boolean;
  drains: Json;
  foley_catheter: boolean;
  foley_removal_date: string | null;
  ng_tube: boolean;
  ng_tube_orders: string | null;
  vte_prophylaxis: string | null;
  vte_medication_details: string | null;
  wound_care_instructions: string | null;
  dressing_change_frequency: string | null;
  incentive_spirometry: boolean;
  oxygen_therapy: string | null;
  respiratory_treatments: string | null;
  stat_labs: string[] | null;
  morning_labs: string[] | null;
  imaging_orders: string | null;
  consults: string[] | null;
  follow_up_instructions: string | null;
  follow_up_appointment: string | null;
  discharge_criteria: string | null;
  special_instructions: string | null;
  code_status: string;
  is_active: boolean;
  organization_id: string;
  created_at: string;
  updated_at: string;
  // Joined
  ordered_by_profile?: { full_name: string } | null;
}

export interface CreatePostOpOrderData {
  surgery_id: string;
  disposition?: string;
  diet_order?: string;
  diet_notes?: string;
  activity_level?: string;
  activity_restrictions?: string;
  weight_bearing?: string;
  pain_management?: Array<{ medication: string; dose: string; route: string; frequency: string }>;
  pca_ordered?: boolean;
  pca_settings?: { medication: string; dose: string; lockout: string };
  pain_goal?: number;
  iv_fluids?: Array<{ fluid: string; rate: string }>;
  medications?: Array<{ medication: string; dose: string; route: string; frequency: string }>;
  continue_home_meds?: boolean;
  held_medications?: string;
  vital_signs_frequency?: string;
  neuro_checks?: boolean;
  neuro_frequency?: string;
  intake_output?: boolean;
  fall_precautions?: boolean;
  bleeding_precautions?: boolean;
  drains?: Array<{ type: string; location: string; output: string }>;
  foley_catheter?: boolean;
  foley_removal_date?: string;
  ng_tube?: boolean;
  ng_tube_orders?: string;
  vte_prophylaxis?: string;
  vte_medication_details?: string;
  wound_care_instructions?: string;
  dressing_change_frequency?: string;
  incentive_spirometry?: boolean;
  oxygen_therapy?: string;
  respiratory_treatments?: string;
  stat_labs?: string[];
  morning_labs?: string[];
  imaging_orders?: string;
  consults?: string[];
  follow_up_instructions?: string;
  follow_up_appointment?: string;
  discharge_criteria?: string;
  special_instructions?: string;
  code_status?: string;
}

// Preset options
export const DIET_OPTIONS = [
  { value: 'npo', label: 'NPO (Nothing by mouth)' },
  { value: 'ice_chips', label: 'Ice Chips Only' },
  { value: 'clear_liquids', label: 'Clear Liquids' },
  { value: 'full_liquids', label: 'Full Liquids' },
  { value: 'soft', label: 'Soft Diet' },
  { value: 'regular', label: 'Regular Diet' },
  { value: 'diabetic', label: 'Diabetic Diet' },
  { value: 'cardiac', label: 'Cardiac Diet (Low Sodium)' },
  { value: 'renal', label: 'Renal Diet' },
];

export const ACTIVITY_OPTIONS = [
  { value: 'bed_rest', label: 'Strict Bed Rest' },
  { value: 'bed_rest_with_brp', label: 'Bed Rest with Bathroom Privileges' },
  { value: 'dangle', label: 'Dangle at Bedside' },
  { value: 'chair', label: 'Out of Bed to Chair' },
  { value: 'ambulate', label: 'Ambulate with Assistance' },
  { value: 'ambulate_ad_lib', label: 'Ambulate as Tolerated' },
];

export const VITAL_FREQUENCY_OPTIONS = [
  { value: 'q15min', label: 'Every 15 minutes' },
  { value: 'q30min', label: 'Every 30 minutes' },
  { value: 'q1h', label: 'Every hour' },
  { value: 'q2h', label: 'Every 2 hours' },
  { value: 'q4h', label: 'Every 4 hours' },
  { value: 'q6h', label: 'Every 6 hours' },
  { value: 'q8h', label: 'Every 8 hours' },
];

export const VTE_OPTIONS = [
  { value: 'scds', label: 'Sequential Compression Devices (SCDs)' },
  { value: 'ted_hose', label: 'TED Hose' },
  { value: 'heparin', label: 'Heparin 5000 units SC q8h' },
  { value: 'lovenox', label: 'Lovenox 40mg SC daily' },
  { value: 'none', label: 'None (ambulating)' },
];

export function usePostOpOrders(surgeryId?: string) {
  return useQuery({
    queryKey: ['post-op-orders', surgeryId],
    queryFn: async () => {
      if (!surgeryId) return null;

      const { data, error } = await supabase
        .from('post_op_orders')
        .select(`
          *,
          ordered_by_profile:profiles!post_op_orders_ordered_by_fkey(full_name)
        `)
        .eq('surgery_id', surgeryId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as PostOpOrder | null;
    },
    enabled: !!surgeryId,
  });
}

export function useCreatePostOpOrder() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (order: CreatePostOpOrderData) => {
      // First, deactivate any existing active orders for this surgery
      await supabase
        .from('post_op_orders')
        .update({ is_active: false })
        .eq('surgery_id', order.surgery_id)
        .eq('is_active', true);

      // Create new order
      const { data, error } = await supabase
        .from('post_op_orders')
        .insert({
          surgery_id: order.surgery_id,
          ordered_by: profile?.id!,
          ordered_at: new Date().toISOString(),
          disposition: order.disposition || 'ward',
          diet_order: order.diet_order || 'npo',
          diet_notes: order.diet_notes,
          activity_level: order.activity_level || 'bed_rest',
          activity_restrictions: order.activity_restrictions,
          weight_bearing: order.weight_bearing,
          pain_management: order.pain_management || [],
          pca_ordered: order.pca_ordered || false,
          pca_settings: order.pca_settings,
          pain_goal: order.pain_goal,
          iv_fluids: order.iv_fluids || [],
          medications: order.medications || [],
          continue_home_meds: order.continue_home_meds || false,
          held_medications: order.held_medications,
          vital_signs_frequency: order.vital_signs_frequency || 'q4h',
          neuro_checks: order.neuro_checks || false,
          neuro_frequency: order.neuro_frequency,
          intake_output: order.intake_output ?? true,
          fall_precautions: order.fall_precautions || false,
          bleeding_precautions: order.bleeding_precautions || false,
          drains: order.drains || [],
          foley_catheter: order.foley_catheter || false,
          foley_removal_date: order.foley_removal_date,
          ng_tube: order.ng_tube || false,
          ng_tube_orders: order.ng_tube_orders,
          vte_prophylaxis: order.vte_prophylaxis,
          vte_medication_details: order.vte_medication_details,
          wound_care_instructions: order.wound_care_instructions,
          dressing_change_frequency: order.dressing_change_frequency,
          incentive_spirometry: order.incentive_spirometry || false,
          oxygen_therapy: order.oxygen_therapy,
          respiratory_treatments: order.respiratory_treatments,
          stat_labs: order.stat_labs,
          morning_labs: order.morning_labs,
          imaging_orders: order.imaging_orders,
          consults: order.consults,
          follow_up_instructions: order.follow_up_instructions,
          follow_up_appointment: order.follow_up_appointment,
          discharge_criteria: order.discharge_criteria,
          special_instructions: order.special_instructions,
          code_status: order.code_status || 'full_code',
          is_active: true,
          organization_id: profile?.organization_id!,
        })
        .select()
        .single();

      if (error) throw error;

      // Bridge medications to IPD if surgery has an admission
      if (data && order.medications && Array.isArray(order.medications) && order.medications.length > 0) {
        // Look up the surgery to get admission_id
        const { data: surgeryData } = await supabase
          .from('surgeries')
          .select('admission_id')
          .eq('id', order.surgery_id)
          .maybeSingle();

        if (surgeryData?.admission_id) {
          const ipdMeds = (order.medications as Array<{ medication: string; dose: string; route: string; frequency: string }>).map(med => ({
            admission_id: surgeryData.admission_id!,
            medicine_name: med.medication,
            dosage: med.dose,
            route: (med.route || 'oral') as any,
            frequency: med.frequency,
            start_date: new Date().toISOString().split('T')[0],
            is_active: true,
            prescribed_by: profile?.id,
            special_instructions: `Post-op order from surgery ${order.surgery_id}`,
          }));

          const { error: ipdError } = await supabase
            .from('ipd_medications')
            .insert(ipdMeds);

          if (ipdError) {
            console.error('Failed to bridge post-op meds to IPD:', ipdError);
            // Don't throw - post-op orders are saved, just log the IPD bridge failure
          }
        }
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['post-op-orders', variables.surgery_id] });
      queryClient.invalidateQueries({ queryKey: ['surgery', variables.surgery_id] });
      queryClient.invalidateQueries({ queryKey: ['ipd-medications'] });
      toast.success('Post-op orders saved');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save post-op orders');
    },
  });
}

export function useUpdatePostOpOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, surgeryId, ...updates }: Partial<PostOpOrder> & { id: string; surgeryId: string }) => {
      const { data, error } = await supabase
        .from('post_op_orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, surgeryId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['post-op-orders', result.surgeryId] });
      toast.success('Post-op orders updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update post-op orders');
    },
  });
}
