import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// =============================================
// INTERFACES
// =============================================

export interface ConfigItem {
  id: string;
  organization_id: string | null;
  code: string;
  name: string;
  description?: string | null;
  color?: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface AdmissionType extends ConfigItem {}

export interface DischargeType extends ConfigItem {
  requires_reason?: boolean;
}

export interface TransferReason extends ConfigItem {}

export interface ConditionStatus extends ConfigItem {
  severity_level?: number;
}

export interface ArrivalMode extends ConfigItem {}

export interface TriageLevel {
  id: string;
  organization_id: string | null;
  level: number;
  name: string;
  description?: string | null;
  color: string;
  zone?: string | null;
  max_wait_minutes?: number | null;
  is_active: boolean;
  sort_order: number;
}

export interface ERZone extends ConfigItem {
  capacity?: number | null;
}

export interface ImagingPriority extends ConfigItem {
  max_wait_hours?: number | null;
}

export interface ImagingModality extends ConfigItem {}

// =============================================
// IPD CONFIGURATION HOOKS
// =============================================

// Admission Types
export const useAdmissionTypes = () => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["config", "admission-types", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("config_admission_types")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      
      if (error) throw error;
      return (data || []) as AdmissionType[];
    },
    enabled: !!profile?.organization_id,
  });
};

export const useCreateAdmissionType = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (input: { code: string; name: string; description?: string; color?: string }) => {
      const { data: result, error } = await supabase
        .from("config_admission_types")
        .insert({
          code: input.code,
          name: input.name,
          description: input.description,
          color: input.color,
          organization_id: profile?.organization_id,
        })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config", "admission-types"] });
      toast.success("Admission type created");
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

export const useUpdateAdmissionType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<AdmissionType> & { id: string }) => {
      const { error } = await supabase
        .from("config_admission_types")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config", "admission-types"] });
      toast.success("Admission type updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

export const useDeleteAdmissionType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("config_admission_types")
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config", "admission-types"] });
      toast.success("Admission type deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

// Discharge Types
export const useDischargeTypes = () => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["config", "discharge-types", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("config_discharge_types")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      
      if (error) throw error;
      return (data || []) as DischargeType[];
    },
    enabled: !!profile?.organization_id,
  });
};

export const useCreateDischargeType = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (input: { code: string; name: string; description?: string; color?: string; requires_reason?: boolean }) => {
      const { data: result, error } = await supabase
        .from("config_discharge_types")
        .insert({
          code: input.code,
          name: input.name,
          description: input.description,
          color: input.color,
          requires_reason: input.requires_reason,
          organization_id: profile?.organization_id,
        })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config", "discharge-types"] });
      toast.success("Discharge type created");
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

export const useUpdateDischargeType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<DischargeType> & { id: string }) => {
      const { error } = await supabase
        .from("config_discharge_types")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config", "discharge-types"] });
      toast.success("Discharge type updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

export const useDeleteDischargeType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("config_discharge_types")
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config", "discharge-types"] });
      toast.success("Discharge type deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

// Transfer Reasons
export const useTransferReasons = () => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["config", "transfer-reasons", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("config_transfer_reasons")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      
      if (error) throw error;
      return (data || []) as TransferReason[];
    },
    enabled: !!profile?.organization_id,
  });
};

export const useCreateTransferReason = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (input: { code: string; name: string; description?: string }) => {
      const { data: result, error } = await supabase
        .from("config_transfer_reasons")
        .insert({
          code: input.code,
          name: input.name,
          description: input.description,
          organization_id: profile?.organization_id,
        })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config", "transfer-reasons"] });
      toast.success("Transfer reason created");
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

export const useUpdateTransferReason = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<TransferReason> & { id: string }) => {
      const { error } = await supabase
        .from("config_transfer_reasons")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config", "transfer-reasons"] });
      toast.success("Transfer reason updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

export const useDeleteTransferReason = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("config_transfer_reasons")
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config", "transfer-reasons"] });
      toast.success("Transfer reason deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

// Condition Statuses
export const useConditionStatuses = () => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["config", "condition-statuses", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("config_condition_statuses")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      
      if (error) throw error;
      return (data || []) as ConditionStatus[];
    },
    enabled: !!profile?.organization_id,
  });
};

export const useCreateConditionStatus = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (input: { code: string; name: string; color?: string; severity_level?: number }) => {
      const { data: result, error } = await supabase
        .from("config_condition_statuses")
        .insert({
          code: input.code,
          name: input.name,
          color: input.color,
          severity_level: input.severity_level,
          organization_id: profile?.organization_id,
        })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config", "condition-statuses"] });
      toast.success("Condition status created");
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

export const useUpdateConditionStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<ConditionStatus> & { id: string }) => {
      const { error } = await supabase
        .from("config_condition_statuses")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config", "condition-statuses"] });
      toast.success("Condition status updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

export const useDeleteConditionStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("config_condition_statuses")
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config", "condition-statuses"] });
      toast.success("Condition status deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

// =============================================
// EMERGENCY CONFIGURATION HOOKS
// =============================================

// Arrival Modes
export const useArrivalModes = () => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["config", "arrival-modes", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("config_arrival_modes")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      
      if (error) throw error;
      return (data || []) as ArrivalMode[];
    },
    enabled: !!profile?.organization_id,
  });
};

export const useCreateArrivalMode = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (input: { code: string; name: string; description?: string }) => {
      const { data: result, error } = await supabase
        .from("config_arrival_modes")
        .insert({
          code: input.code,
          name: input.name,
          description: input.description,
          organization_id: profile?.organization_id,
        })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config", "arrival-modes"] });
      toast.success("Arrival mode created");
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

export const useUpdateArrivalMode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<ArrivalMode> & { id: string }) => {
      const { error } = await supabase
        .from("config_arrival_modes")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config", "arrival-modes"] });
      toast.success("Arrival mode updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

export const useDeleteArrivalMode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("config_arrival_modes")
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config", "arrival-modes"] });
      toast.success("Arrival mode deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

// Triage Levels
export const useTriageLevels = () => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["config", "triage-levels", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("config_triage_levels")
        .select("*")
        .eq("is_active", true)
        .order("level");
      
      if (error) throw error;
      return (data || []) as TriageLevel[];
    },
    enabled: !!profile?.organization_id,
  });
};

export const useCreateTriageLevel = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (input: { level: number; name: string; color: string; zone?: string; description?: string; max_wait_minutes?: number }) => {
      const { data: result, error } = await supabase
        .from("config_triage_levels")
        .insert({
          level: input.level,
          name: input.name,
          color: input.color,
          zone: input.zone,
          description: input.description,
          max_wait_minutes: input.max_wait_minutes,
          organization_id: profile?.organization_id,
        })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config", "triage-levels"] });
      toast.success("Triage level created");
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

export const useUpdateTriageLevel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<TriageLevel> & { id: string }) => {
      const { error } = await supabase
        .from("config_triage_levels")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config", "triage-levels"] });
      toast.success("Triage level updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

export const useDeleteTriageLevel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("config_triage_levels")
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config", "triage-levels"] });
      toast.success("Triage level deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

// ER Zones
export const useERZones = () => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["config", "er-zones", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("config_er_zones")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      
      if (error) throw error;
      return (data || []) as ERZone[];
    },
    enabled: !!profile?.organization_id,
  });
};

export const useCreateERZone = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (input: { code: string; name: string; color?: string; description?: string; capacity?: number }) => {
      const { data: result, error } = await supabase
        .from("config_er_zones")
        .insert({
          code: input.code,
          name: input.name,
          color: input.color,
          description: input.description,
          capacity: input.capacity,
          organization_id: profile?.organization_id,
        })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config", "er-zones"] });
      toast.success("ER zone created");
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

export const useUpdateERZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<ERZone> & { id: string }) => {
      const { error } = await supabase
        .from("config_er_zones")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config", "er-zones"] });
      toast.success("ER zone updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

export const useDeleteERZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("config_er_zones")
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config", "er-zones"] });
      toast.success("ER zone deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

// =============================================
// RADIOLOGY CONFIGURATION HOOKS
// =============================================

// Imaging Priorities
export const useImagingPriorities = () => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["config", "imaging-priorities", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("config_imaging_priorities")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      
      if (error) throw error;
      return (data || []) as ImagingPriority[];
    },
    enabled: !!profile?.organization_id,
  });
};

export const useCreateImagingPriority = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (input: { code: string; name: string; color: string; max_wait_hours?: number }) => {
      const { data: result, error } = await supabase
        .from("config_imaging_priorities")
        .insert({
          code: input.code,
          name: input.name,
          color: input.color,
          max_wait_hours: input.max_wait_hours,
          organization_id: profile?.organization_id,
        })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config", "imaging-priorities"] });
      toast.success("Imaging priority created");
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

export const useUpdateImagingPriority = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<ImagingPriority> & { id: string }) => {
      const { error } = await supabase
        .from("config_imaging_priorities")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config", "imaging-priorities"] });
      toast.success("Imaging priority updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

export const useDeleteImagingPriority = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("config_imaging_priorities")
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config", "imaging-priorities"] });
      toast.success("Imaging priority deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

// Imaging Modalities
export const useImagingModalities = () => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["config", "imaging-modalities", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("config_imaging_modalities")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      
      if (error) throw error;
      return (data || []) as ImagingModality[];
    },
    enabled: !!profile?.organization_id,
  });
};

export const useCreateImagingModality = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (input: { code: string; name: string; description?: string }) => {
      const { data: result, error } = await supabase
        .from("config_imaging_modalities")
        .insert({
          code: input.code,
          name: input.name,
          description: input.description,
          organization_id: profile?.organization_id,
        })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config", "imaging-modalities"] });
      toast.success("Imaging modality created");
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

export const useUpdateImagingModality = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<ImagingModality> & { id: string }) => {
      const { error } = await supabase
        .from("config_imaging_modalities")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config", "imaging-modalities"] });
      toast.success("Imaging modality updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

export const useDeleteImagingModality = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("config_imaging_modalities")
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config", "imaging-modalities"] });
      toast.success("Imaging modality deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

// =============================================
// FALLBACK HELPERS (use hardcoded if no DB data)
// =============================================

// Default admission types (fallback)
export const DEFAULT_ADMISSION_TYPES = [
  { code: "emergency", name: "Emergency", color: "bg-red-100 text-red-800" },
  { code: "elective", name: "Elective", color: "bg-blue-100 text-blue-800" },
  { code: "transfer", name: "Transfer", color: "bg-purple-100 text-purple-800" },
  { code: "referral", name: "Referral", color: "bg-green-100 text-green-800" },
];

// Default discharge types (fallback)
export const DEFAULT_DISCHARGE_TYPES = [
  { code: "normal", name: "Normal Discharge", color: "bg-green-100 text-green-800" },
  { code: "against_advice", name: "Left Against Medical Advice", color: "bg-amber-100 text-amber-800" },
  { code: "referred", name: "Referred to Another Facility", color: "bg-blue-100 text-blue-800" },
  { code: "transfer", name: "Transfer to Another Facility", color: "bg-blue-100 text-blue-800" },
  { code: "absconded", name: "Absconded", color: "bg-red-100 text-red-800" },
  { code: "expired", name: "Expired", color: "bg-gray-100 text-gray-800" },
];

// Default transfer reasons (fallback)
export const DEFAULT_TRANSFER_REASONS = [
  { code: "medical_necessity", name: "Medical necessity" },
  { code: "patient_request", name: "Patient request" },
  { code: "isolation_required", name: "Isolation required" },
  { code: "step_down", name: "Step-down care" },
  { code: "step_up", name: "Step-up care (ICU)" },
  { code: "room_upgrade", name: "Room upgrade" },
  { code: "bed_maintenance", name: "Bed maintenance" },
  { code: "ward_consolidation", name: "Ward consolidation" },
  { code: "other", name: "Other" },
];

// Default condition statuses (fallback)
export const DEFAULT_CONDITION_STATUSES = [
  { code: "stable", name: "Stable", color: "bg-green-100 text-green-800" },
  { code: "improving", name: "Improving", color: "bg-blue-100 text-blue-800" },
  { code: "unchanged", name: "Unchanged", color: "bg-gray-100 text-gray-800" },
  { code: "deteriorating", name: "Deteriorating", color: "bg-amber-100 text-amber-800" },
  { code: "critical", name: "Critical", color: "bg-red-100 text-red-800" },
  { code: "guarded", name: "Guarded", color: "bg-purple-100 text-purple-800" },
];

// Default arrival modes (fallback)
export const DEFAULT_ARRIVAL_MODES = [
  { code: "walk_in", name: "Walk-in" },
  { code: "ambulance", name: "Ambulance" },
  { code: "police", name: "Police/MLC" },
  { code: "brought_by_family", name: "Brought by Family" },
  { code: "referred", name: "Referred" },
];

// Default triage levels (fallback)
export const DEFAULT_TRIAGE_LEVELS = [
  { level: 1, name: "Resuscitation", color: "red", zone: "Resuscitation Bay", description: "Immediate life-threatening conditions" },
  { level: 2, name: "Emergent", color: "orange", zone: "Trauma Bay", description: "Potentially life-threatening, needs urgent care" },
  { level: 3, name: "Urgent", color: "yellow", zone: "Yellow Zone", description: "Serious but stable, can wait briefly" },
  { level: 4, name: "Less Urgent", color: "green", zone: "Green Zone", description: "Non-urgent, standard care needed" },
  { level: 5, name: "Non-Urgent", color: "blue", zone: "Green Zone", description: "Minor issues, can wait" },
];

// Default ER zones (fallback)
export const DEFAULT_ER_ZONES = [
  { code: "resuscitation", name: "Resuscitation Bay", color: "bg-red-100 text-red-800" },
  { code: "trauma", name: "Trauma Bay", color: "bg-orange-100 text-orange-800" },
  { code: "yellow", name: "Yellow Zone", color: "bg-yellow-100 text-yellow-800" },
  { code: "green", name: "Green Zone", color: "bg-green-100 text-green-800" },
];

// Default imaging priorities (fallback)
export const DEFAULT_IMAGING_PRIORITIES = [
  { code: "routine", name: "Routine", color: "bg-blue-100 text-blue-800" },
  { code: "urgent", name: "Urgent", color: "bg-amber-100 text-amber-800" },
  { code: "stat", name: "STAT", color: "bg-red-100 text-red-800" },
];

// Default imaging modalities (fallback)
export const DEFAULT_IMAGING_MODALITIES = [
  { code: "xray", name: "X-Ray" },
  { code: "ultrasound", name: "Ultrasound" },
  { code: "ct_scan", name: "CT Scan" },
  { code: "mri", name: "MRI" },
  { code: "fluoroscopy", name: "Fluoroscopy" },
  { code: "mammography", name: "Mammography" },
  { code: "dexa", name: "DEXA Scan" },
  { code: "ecg", name: "ECG" },
  { code: "echo", name: "Echocardiogram" },
  { code: "pet_ct", name: "PET-CT" },
  { code: "other", name: "Other" },
];
