import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// =====================================================
// TYPES
// =====================================================

export interface ConfigSurgeryPriority {
  id: string;
  organization_id: string;
  code: string;
  name: string;
  description?: string | null;
  color?: string | null;
  requires_immediate_attention?: boolean | null;
  max_wait_hours?: number | null;
  sort_order?: number | null;
  is_active?: boolean | null;
  created_at?: string | null;
}

export interface ConfigAnesthesiaType {
  id: string;
  organization_id: string;
  code: string;
  name: string;
  description?: string | null;
  requires_intubation?: boolean | null;
  typical_duration_minutes?: number | null;
  monitoring_level?: string | null;
  sort_order?: number | null;
  is_active?: boolean | null;
  created_at?: string | null;
}

export interface ConfigAirwayDevice {
  id: string;
  organization_id: string;
  code: string;
  name: string;
  sizes_available?: string[] | null;
  is_invasive?: boolean | null;
  sort_order?: number | null;
  is_active?: boolean | null;
  created_at?: string | null;
}

export interface ConfigOTTeamRole {
  id: string;
  organization_id: string;
  code: string;
  name: string;
  category?: 'surgeon' | 'anesthesia' | 'nursing' | 'technician' | 'support' | null;
  is_required?: boolean | null;
  sort_order?: number | null;
  is_active?: boolean | null;
  created_at?: string | null;
}

export interface ConfigSurgicalProcedure {
  id: string;
  organization_id: string;
  code: string;
  name: string;
  category: string | null;
  specialization_id: string | null;
  typical_duration_minutes: number | null;
  requires_general_anesthesia: boolean | null;
  typical_blood_requirement: string | null;
  equipment_checklist: string[] | null;
  is_active: boolean | null;
  created_at: string | null;
  specialization?: { name: string } | null;
}

export interface ConfigSurgicalPosition {
  id: string;
  organization_id: string;
  code: string;
  name: string;
  description?: string | null;
  precautions?: string | null;
  sort_order?: number | null;
  is_active?: boolean | null;
  created_at?: string | null;
}

export interface ConfigASAClass {
  id: string;
  organization_id: string;
  class_level: string;
  name: string;
  description: string;
  risk_level?: string | null;
  sort_order?: number | null;
  is_active?: boolean | null;
  created_at?: string | null;
}

export interface ConfigWHOChecklistItem {
  id: string;
  organization_id: string;
  phase: 'sign_in' | 'time_out' | 'sign_out';
  item_key: string;
  item_label: string;
  is_critical: boolean | null;
  sort_order: number | null;
  is_active: boolean | null;
  created_at: string | null;
}

// =====================================================
// SURGERY PRIORITIES
// =====================================================

export function useConfigSurgeryPriorities() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['config', 'surgery-priorities', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('config_surgery_priorities')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return data as ConfigSurgeryPriority[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateConfigSurgeryPriority() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: Omit<ConfigSurgeryPriority, 'id' | 'organization_id' | 'created_at'>) => {
      if (!profile?.organization_id) throw new Error('No organization');

      const { data: result, error } = await supabase
        .from('config_surgery_priorities')
        .insert({ ...data, organization_id: profile.organization_id })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'surgery-priorities'] });
      toast.success('Surgery priority created');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateConfigSurgeryPriority() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<ConfigSurgeryPriority> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('config_surgery_priorities')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'surgery-priorities'] });
      toast.success('Surgery priority updated');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteConfigSurgeryPriority() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('config_surgery_priorities')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'surgery-priorities'] });
      toast.success('Surgery priority removed');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

// =====================================================
// ANESTHESIA TYPES
// =====================================================

export function useConfigAnesthesiaTypes() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['config', 'anesthesia-types', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('config_anesthesia_types')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return data as ConfigAnesthesiaType[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateConfigAnesthesiaType() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: Omit<ConfigAnesthesiaType, 'id' | 'organization_id' | 'created_at'>) => {
      if (!profile?.organization_id) throw new Error('No organization');

      const { data: result, error } = await supabase
        .from('config_anesthesia_types')
        .insert({ ...data, organization_id: profile.organization_id })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'anesthesia-types'] });
      toast.success('Anesthesia type created');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateConfigAnesthesiaType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<ConfigAnesthesiaType> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('config_anesthesia_types')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'anesthesia-types'] });
      toast.success('Anesthesia type updated');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteConfigAnesthesiaType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('config_anesthesia_types')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'anesthesia-types'] });
      toast.success('Anesthesia type removed');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

// =====================================================
// AIRWAY DEVICES
// =====================================================

export function useConfigAirwayDevices() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['config', 'airway-devices', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('config_airway_devices')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return data as ConfigAirwayDevice[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateConfigAirwayDevice() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: Omit<ConfigAirwayDevice, 'id' | 'organization_id' | 'created_at'>) => {
      if (!profile?.organization_id) throw new Error('No organization');

      const { data: result, error } = await supabase
        .from('config_airway_devices')
        .insert({ ...data, organization_id: profile.organization_id })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'airway-devices'] });
      toast.success('Airway device created');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateConfigAirwayDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<ConfigAirwayDevice> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('config_airway_devices')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'airway-devices'] });
      toast.success('Airway device updated');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteConfigAirwayDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('config_airway_devices')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'airway-devices'] });
      toast.success('Airway device removed');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

// =====================================================
// OT TEAM ROLES
// =====================================================

export function useConfigOTTeamRoles() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['config', 'ot-team-roles', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('config_ot_team_roles')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return data as ConfigOTTeamRole[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateConfigOTTeamRole() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: Omit<ConfigOTTeamRole, 'id' | 'organization_id' | 'created_at'>) => {
      if (!profile?.organization_id) throw new Error('No organization');

      const { data: result, error } = await supabase
        .from('config_ot_team_roles')
        .insert({ ...data, organization_id: profile.organization_id })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'ot-team-roles'] });
      toast.success('OT team role created');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateConfigOTTeamRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<ConfigOTTeamRole> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('config_ot_team_roles')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'ot-team-roles'] });
      toast.success('OT team role updated');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteConfigOTTeamRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('config_ot_team_roles')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'ot-team-roles'] });
      toast.success('OT team role removed');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

// =====================================================
// SURGICAL PROCEDURES
// =====================================================

export function useConfigSurgicalProcedures() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['config', 'surgical-procedures', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('config_surgical_procedures')
        .select('*, specialization:specializations(name)')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as ConfigSurgicalProcedure[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateConfigSurgicalProcedure() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: Omit<ConfigSurgicalProcedure, 'id' | 'organization_id' | 'created_at' | 'specialization'>) => {
      if (!profile?.organization_id) throw new Error('No organization');

      const { data: result, error } = await supabase
        .from('config_surgical_procedures')
        .insert({ ...data, organization_id: profile.organization_id })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'surgical-procedures'] });
      toast.success('Surgical procedure created');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateConfigSurgicalProcedure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<ConfigSurgicalProcedure> & { id: string }) => {
      const { specialization, ...updateData } = data;
      const { data: result, error } = await supabase
        .from('config_surgical_procedures')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'surgical-procedures'] });
      toast.success('Surgical procedure updated');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteConfigSurgicalProcedure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('config_surgical_procedures')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'surgical-procedures'] });
      toast.success('Surgical procedure removed');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

// =====================================================
// SURGICAL POSITIONS
// =====================================================

export function useConfigSurgicalPositions() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['config', 'surgical-positions', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('config_surgical_positions')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return data as ConfigSurgicalPosition[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateConfigSurgicalPosition() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: Omit<ConfigSurgicalPosition, 'id' | 'organization_id' | 'created_at'>) => {
      if (!profile?.organization_id) throw new Error('No organization');

      const { data: result, error } = await supabase
        .from('config_surgical_positions')
        .insert({ ...data, organization_id: profile.organization_id })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'surgical-positions'] });
      toast.success('Surgical position created');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateConfigSurgicalPosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<ConfigSurgicalPosition> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('config_surgical_positions')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'surgical-positions'] });
      toast.success('Surgical position updated');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteConfigSurgicalPosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('config_surgical_positions')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'surgical-positions'] });
      toast.success('Surgical position removed');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

// =====================================================
// ASA CLASSES
// =====================================================

export function useConfigASAClasses() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['config', 'asa-classes', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('config_asa_classes')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return data as ConfigASAClass[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateConfigASAClass() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: Omit<ConfigASAClass, 'id' | 'organization_id' | 'created_at'>) => {
      if (!profile?.organization_id) throw new Error('No organization');

      const { data: result, error } = await supabase
        .from('config_asa_classes')
        .insert({ ...data, organization_id: profile.organization_id })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'asa-classes'] });
      toast.success('ASA class created');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateConfigASAClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<ConfigASAClass> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('config_asa_classes')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'asa-classes'] });
      toast.success('ASA class updated');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteConfigASAClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('config_asa_classes')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'asa-classes'] });
      toast.success('ASA class removed');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

// =====================================================
// WHO CHECKLIST ITEMS
// =====================================================

export function useConfigWHOChecklistItems(phase?: 'sign_in' | 'time_out' | 'sign_out') {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['config', 'who-checklist-items', profile?.organization_id, phase],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      let query = supabase
        .from('config_who_checklist_items')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .order('sort_order');

      if (phase) {
        query = query.eq('phase', phase);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ConfigWHOChecklistItem[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateConfigWHOChecklistItem() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: Omit<ConfigWHOChecklistItem, 'id' | 'organization_id' | 'created_at'>) => {
      if (!profile?.organization_id) throw new Error('No organization');

      const { data: result, error } = await supabase
        .from('config_who_checklist_items')
        .insert({ ...data, organization_id: profile.organization_id })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'who-checklist-items'] });
      toast.success('WHO checklist item created');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateConfigWHOChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<ConfigWHOChecklistItem> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('config_who_checklist_items')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'who-checklist-items'] });
      toast.success('WHO checklist item updated');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteConfigWHOChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('config_who_checklist_items')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'who-checklist-items'] });
      toast.success('WHO checklist item removed');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

// =====================================================
// PRE-ANESTHESIA ASSESSMENTS
// =====================================================

export interface PreAnesthesiaAssessment {
  id: string;
  surgery_id: string;
  organization_id: string;
  assessed_by: string | null;
  assessment_date: string | null;
  mallampati_score: string | null;
  mouth_opening: string | null;
  thyromental_distance: string | null;
  neck_mobility: string | null;
  dental_status: string | null;
  airway_notes: string | null;
  predicted_difficult_airway: boolean | null;
  npo_verified: boolean | null;
  last_solid_food: string | null;
  last_clear_fluid: string | null;
  npo_notes: string | null;
  previous_anesthesia: boolean | null;
  previous_anesthesia_type: string | null;
  previous_complications: boolean | null;
  previous_complications_details: string | null;
  family_anesthesia_complications: boolean | null;
  family_complications_details: string | null;
  current_medications: any[] | null;
  anticoagulant_status: string | null;
  last_anticoagulant_dose: string | null;
  known_allergies: any[] | null;
  latex_allergy: boolean | null;
  blood_pressure: string | null;
  heart_rate: number | null;
  spo2: number | null;
  weight_kg: number | null;
  height_cm: number | null;
  bmi: number | null;
  hemoglobin: number | null;
  platelets: number | null;
  inr: number | null;
  creatinine: number | null;
  blood_sugar: number | null;
  ecg_findings: string | null;
  chest_xray_findings: string | null;
  planned_anesthesia_type_id: string | null;
  planned_airway_device_id: string | null;
  planned_position_id: string | null;
  asa_class_id: string | null;
  special_considerations: string | null;
  cardiac_risk_score: string | null;
  pulmonary_risk_score: string | null;
  overall_risk: string | null;
  consent_obtained: boolean | null;
  consent_obtained_at: string | null;
  consent_notes: string | null;
  status: 'pending' | 'completed' | 'cleared' | 'not_cleared';
  clearance_notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  assessed_by_doctor?: { profile: { full_name: string } } | null;
  planned_anesthesia_type?: ConfigAnesthesiaType | null;
  planned_airway_device?: ConfigAirwayDevice | null;
  planned_position?: ConfigSurgicalPosition | null;
  asa_class?: ConfigASAClass | null;
}

export function usePreAnesthesiaAssessment(surgeryId: string) {
  return useQuery({
    queryKey: ['pre-anesthesia-assessment', surgeryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pre_anesthesia_assessments')
        .select(`
          *,
          assessed_by_doctor:doctors!pre_anesthesia_assessments_assessed_by_fkey(
            profile:profiles(full_name)
          ),
          planned_anesthesia_type:config_anesthesia_types(*),
          planned_airway_device:config_airway_devices(*),
          planned_position:config_surgical_positions(*),
          asa_class:config_asa_classes(*)
        `)
        .eq('surgery_id', surgeryId)
        .maybeSingle();

      if (error) throw error;
      return data as PreAnesthesiaAssessment | null;
    },
    enabled: !!surgeryId,
  });
}

export function useCreatePreAnesthesiaAssessment() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: Partial<Omit<PreAnesthesiaAssessment, 'assessed_by_doctor' | 'planned_anesthesia_type' | 'planned_airway_device' | 'planned_position' | 'asa_class'>>) => {
      if (!profile?.organization_id) throw new Error('No organization');

      const { data: result, error } = await supabase
        .from('pre_anesthesia_assessments')
        .insert({ ...data, organization_id: profile.organization_id } as any)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pre-anesthesia-assessment', variables.surgery_id] });
      queryClient.invalidateQueries({ queryKey: ['surgeries'] });
      toast.success('Pre-anesthesia assessment created');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdatePreAnesthesiaAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<PreAnesthesiaAssessment> & { id: string }) => {
      const { 
        assessed_by_doctor, 
        planned_anesthesia_type, 
        planned_airway_device, 
        planned_position, 
        asa_class,
        ...updateData 
      } = data;
      
      const { data: result, error } = await supabase
        .from('pre_anesthesia_assessments')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pre-anesthesia-assessment'] });
      queryClient.invalidateQueries({ queryKey: ['surgeries'] });
      toast.success('Pre-anesthesia assessment updated');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

// =====================================================
// SEED DATA HELPER
// =====================================================

export function useSeedOTConfigData() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!profile?.organization_id) throw new Error('No organization');
      const orgId = profile.organization_id;

      // Seed Surgery Priorities
      await supabase.from('config_surgery_priorities').upsert([
        { organization_id: orgId, code: 'emergency', name: 'Emergency', color: '#EF4444', requires_immediate_attention: true, max_wait_hours: 1, sort_order: 1 },
        { organization_id: orgId, code: 'urgent', name: 'Urgent', color: '#F97316', requires_immediate_attention: false, max_wait_hours: 24, sort_order: 2 },
        { organization_id: orgId, code: 'elective', name: 'Elective', color: '#22C55E', requires_immediate_attention: false, max_wait_hours: null, sort_order: 3 },
        { organization_id: orgId, code: 'scheduled', name: 'Scheduled', color: '#3B82F6', requires_immediate_attention: false, max_wait_hours: null, sort_order: 4 },
      ], { onConflict: 'organization_id,code' });

      // Seed Anesthesia Types
      await supabase.from('config_anesthesia_types').upsert([
        { organization_id: orgId, code: 'ga', name: 'General Anesthesia', requires_intubation: true, monitoring_level: 'full', sort_order: 1 },
        { organization_id: orgId, code: 'spinal', name: 'Spinal Anesthesia', requires_intubation: false, monitoring_level: 'standard', sort_order: 2 },
        { organization_id: orgId, code: 'epidural', name: 'Epidural Anesthesia', requires_intubation: false, monitoring_level: 'standard', sort_order: 3 },
        { organization_id: orgId, code: 'local', name: 'Local Anesthesia', requires_intubation: false, monitoring_level: 'basic', sort_order: 4 },
        { organization_id: orgId, code: 'regional', name: 'Regional Block', requires_intubation: false, monitoring_level: 'standard', sort_order: 5 },
        { organization_id: orgId, code: 'sedation', name: 'Conscious Sedation', requires_intubation: false, monitoring_level: 'standard', sort_order: 6 },
        { organization_id: orgId, code: 'combined', name: 'Combined Spinal-Epidural', requires_intubation: false, monitoring_level: 'standard', sort_order: 7 },
        { organization_id: orgId, code: 'tiva', name: 'Total IV Anesthesia (TIVA)', requires_intubation: true, monitoring_level: 'full', sort_order: 8 },
        { organization_id: orgId, code: 'mac', name: 'Monitored Anesthesia Care', requires_intubation: false, monitoring_level: 'standard', sort_order: 9 },
      ], { onConflict: 'organization_id,code' });

      // Seed Airway Devices
      await supabase.from('config_airway_devices').upsert([
        { organization_id: orgId, code: 'ett', name: 'Endotracheal Tube', is_invasive: true, sizes_available: ['6.0', '6.5', '7.0', '7.5', '8.0', '8.5'], sort_order: 1 },
        { organization_id: orgId, code: 'lma', name: 'Laryngeal Mask Airway', is_invasive: false, sizes_available: ['2', '2.5', '3', '4', '5'], sort_order: 2 },
        { organization_id: orgId, code: 'igel', name: 'I-gel', is_invasive: false, sizes_available: ['3', '4', '5'], sort_order: 3 },
        { organization_id: orgId, code: 'facemask', name: 'Face Mask', is_invasive: false, sizes_available: ['Small', 'Medium', 'Large'], sort_order: 4 },
        { organization_id: orgId, code: 'nasal', name: 'Nasal Cannula', is_invasive: false, sizes_available: ['Adult', 'Pediatric'], sort_order: 5 },
        { organization_id: orgId, code: 'trach', name: 'Tracheostomy Tube', is_invasive: true, sizes_available: ['6.0', '7.0', '8.0'], sort_order: 6 },
      ], { onConflict: 'organization_id,code' });

      // Seed OT Team Roles
      await supabase.from('config_ot_team_roles').upsert([
        { organization_id: orgId, code: 'lead_surgeon', name: 'Lead Surgeon', category: 'surgeon', is_required: true, sort_order: 1 },
        { organization_id: orgId, code: 'assistant_surgeon', name: 'Assistant Surgeon', category: 'surgeon', is_required: false, sort_order: 2 },
        { organization_id: orgId, code: 'anesthetist', name: 'Anesthetist', category: 'anesthesia', is_required: true, sort_order: 3 },
        { organization_id: orgId, code: 'anesthesia_assistant', name: 'Anesthesia Assistant', category: 'anesthesia', is_required: false, sort_order: 4 },
        { organization_id: orgId, code: 'scrub_nurse', name: 'Scrub Nurse', category: 'nursing', is_required: true, sort_order: 5 },
        { organization_id: orgId, code: 'circulating_nurse', name: 'Circulating Nurse', category: 'nursing', is_required: true, sort_order: 6 },
        { organization_id: orgId, code: 'ot_technician', name: 'OT Technician', category: 'technician', is_required: false, sort_order: 7 },
      ], { onConflict: 'organization_id,code' });

      // Seed Surgical Positions
      await supabase.from('config_surgical_positions').upsert([
        { organization_id: orgId, code: 'supine', name: 'Supine', description: 'Lying on back, face up', precautions: 'Protect pressure points, occiput, heels', sort_order: 1 },
        { organization_id: orgId, code: 'prone', name: 'Prone', description: 'Lying on stomach, face down', precautions: 'Eyes, face protection; chest rolls; airway access', sort_order: 2 },
        { organization_id: orgId, code: 'lateral', name: 'Lateral Decubitus', description: 'Lying on side', precautions: 'Axillary roll; padding between legs', sort_order: 3 },
        { organization_id: orgId, code: 'lithotomy', name: 'Lithotomy', description: 'Supine with legs elevated and abducted', precautions: 'Nerve injury risk; proper stirrup positioning', sort_order: 4 },
        { organization_id: orgId, code: 'trendelenburg', name: 'Trendelenburg', description: 'Head lower than feet', precautions: 'Increased ICP; shoulder braces positioning', sort_order: 5 },
        { organization_id: orgId, code: 'reverse_trendelenburg', name: 'Reverse Trendelenburg', description: 'Head higher than feet', precautions: 'Prevent sliding; footboard', sort_order: 6 },
        { organization_id: orgId, code: 'sitting', name: 'Sitting/Beach Chair', description: 'Semi-upright position', precautions: 'Air embolism risk; blood pressure management', sort_order: 7 },
      ], { onConflict: 'organization_id,code' });

      // Seed ASA Classes
      await supabase.from('config_asa_classes').upsert([
        { organization_id: orgId, class_level: 'I', name: 'ASA I', description: 'Normal healthy patient', risk_level: 'minimal', sort_order: 1 },
        { organization_id: orgId, class_level: 'II', name: 'ASA II', description: 'Patient with mild systemic disease', risk_level: 'low', sort_order: 2 },
        { organization_id: orgId, class_level: 'III', name: 'ASA III', description: 'Patient with severe systemic disease', risk_level: 'moderate', sort_order: 3 },
        { organization_id: orgId, class_level: 'IV', name: 'ASA IV', description: 'Patient with severe systemic disease that is a constant threat to life', risk_level: 'high', sort_order: 4 },
        { organization_id: orgId, class_level: 'V', name: 'ASA V', description: 'Moribund patient who is not expected to survive without the operation', risk_level: 'critical', sort_order: 5 },
        { organization_id: orgId, class_level: 'VI', name: 'ASA VI', description: 'Declared brain-dead patient whose organs are being removed for donor purposes', risk_level: 'n/a', sort_order: 6 },
      ], { onConflict: 'organization_id,class_level' });

      // Seed WHO Checklist Items - Sign In
      await supabase.from('config_who_checklist_items').upsert([
        { organization_id: orgId, phase: 'sign_in', item_key: 'patient_identity', item_label: 'Patient identity confirmed', is_critical: true, sort_order: 1 },
        { organization_id: orgId, phase: 'sign_in', item_key: 'site_marked', item_label: 'Site marked / not applicable', is_critical: true, sort_order: 2 },
        { organization_id: orgId, phase: 'sign_in', item_key: 'consent_verified', item_label: 'Consent verified', is_critical: true, sort_order: 3 },
        { organization_id: orgId, phase: 'sign_in', item_key: 'anesthesia_check', item_label: 'Anesthesia safety check complete', is_critical: true, sort_order: 4 },
        { organization_id: orgId, phase: 'sign_in', item_key: 'pulse_oximeter', item_label: 'Pulse oximeter functioning', is_critical: true, sort_order: 5 },
        { organization_id: orgId, phase: 'sign_in', item_key: 'allergies_known', item_label: 'Known allergies reviewed', is_critical: true, sort_order: 6 },
        { organization_id: orgId, phase: 'sign_in', item_key: 'difficult_airway', item_label: 'Difficult airway / aspiration risk assessed', is_critical: true, sort_order: 7 },
        { organization_id: orgId, phase: 'sign_in', item_key: 'blood_loss_risk', item_label: 'Risk of >500ml blood loss assessed', is_critical: false, sort_order: 8 },
      ], { onConflict: 'organization_id,phase,item_key' });

      // Seed WHO Checklist Items - Time Out
      await supabase.from('config_who_checklist_items').upsert([
        { organization_id: orgId, phase: 'time_out', item_key: 'team_intro', item_label: 'All team members introduced by name and role', is_critical: false, sort_order: 1 },
        { organization_id: orgId, phase: 'time_out', item_key: 'patient_name_procedure', item_label: 'Patient name, procedure, and site confirmed', is_critical: true, sort_order: 2 },
        { organization_id: orgId, phase: 'time_out', item_key: 'antibiotic_given', item_label: 'Antibiotic prophylaxis given within last 60 minutes', is_critical: true, sort_order: 3 },
        { organization_id: orgId, phase: 'time_out', item_key: 'critical_events_surgeon', item_label: 'Surgeon: Critical steps, duration, blood loss discussed', is_critical: false, sort_order: 4 },
        { organization_id: orgId, phase: 'time_out', item_key: 'critical_events_anesthesia', item_label: 'Anesthesia: Patient-specific concerns discussed', is_critical: false, sort_order: 5 },
        { organization_id: orgId, phase: 'time_out', item_key: 'critical_events_nursing', item_label: 'Nursing: Sterility confirmed, equipment issues', is_critical: false, sort_order: 6 },
        { organization_id: orgId, phase: 'time_out', item_key: 'imaging_displayed', item_label: 'Essential imaging displayed', is_critical: false, sort_order: 7 },
      ], { onConflict: 'organization_id,phase,item_key' });

      // Seed WHO Checklist Items - Sign Out
      await supabase.from('config_who_checklist_items').upsert([
        { organization_id: orgId, phase: 'sign_out', item_key: 'procedure_name', item_label: 'Procedure name recorded', is_critical: true, sort_order: 1 },
        { organization_id: orgId, phase: 'sign_out', item_key: 'instrument_count', item_label: 'Instrument, sponge, needle counts correct', is_critical: true, sort_order: 2 },
        { organization_id: orgId, phase: 'sign_out', item_key: 'specimen_labeled', item_label: 'Specimen labeled correctly', is_critical: true, sort_order: 3 },
        { organization_id: orgId, phase: 'sign_out', item_key: 'equipment_problems', item_label: 'Equipment problems addressed', is_critical: false, sort_order: 4 },
        { organization_id: orgId, phase: 'sign_out', item_key: 'recovery_concerns', item_label: 'Key recovery concerns communicated', is_critical: true, sort_order: 5 },
      ], { onConflict: 'organization_id,phase,item_key' });

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config'] });
      toast.success('OT configuration data seeded successfully');
    },
    onError: (error: Error) => toast.error('Failed to seed data: ' + error.message),
  });
}
