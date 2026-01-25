import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface SurgeonFeeTemplate {
  id: string;
  surgeon_id: string;
  procedure_name: string;
  procedure_code: string | null;
  surgeon_fee: number;
  default_anesthesia_type: "local" | "spinal" | "general" | "sedation" | null;
  default_anesthesia_fee: number;
  nursing_fee: number;
  ot_room_fee: number;
  consumables_fee: number;
  recovery_fee: number;
  total_package: number;
  notes: string | null;
  is_active: boolean;
  organization_id: string;
  created_at: string;
  updated_at: string;
  // Joined data
  surgeon?: {
    id: string;
    profile: {
      full_name: string;
    } | null;
  } | null;
}

export interface SurgeryCharges {
  surgeon_fee: number;
  anesthesia_fee: number;
  nursing_fee: number;
  ot_room_fee: number;
  consumables_fee: number;
  recovery_fee: number;
  total: number;
}

export interface CreateTemplateData {
  surgeon_id: string;
  procedure_name: string;
  procedure_code?: string;
  surgeon_fee: number;
  default_anesthesia_type?: "local" | "spinal" | "general" | "sedation";
  default_anesthesia_fee: number;
  nursing_fee: number;
  ot_room_fee: number;
  consumables_fee: number;
  recovery_fee: number;
  notes?: string;
}

/**
 * Fetch all surgeon fee templates for the organization
 */
export function useSurgeonFeeTemplates(surgeonId?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["surgeon-fee-templates", profile?.organization_id, surgeonId],
    queryFn: async () => {
      if (!profile?.organization_id) throw new Error("No organization");

      let query = supabase
        .from("surgeon_fee_templates")
        .select(`
          *,
          surgeon:doctors!surgeon_fee_templates_surgeon_id_fkey(
            id,
            profile:profiles!doctors_profile_id_fkey(full_name)
          )
        `)
        .eq("organization_id", profile.organization_id)
        .eq("is_active", true)
        .order("procedure_name");

      if (surgeonId) {
        query = query.eq("surgeon_id", surgeonId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as SurgeonFeeTemplate[];
    },
    enabled: !!profile?.organization_id,
  });
}

/**
 * Fetch a single template by ID
 */
export function useSurgeonFeeTemplate(templateId: string | undefined) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["surgeon-fee-template", templateId],
    queryFn: async () => {
      if (!templateId) return null;

      const { data, error } = await supabase
        .from("surgeon_fee_templates")
        .select(`
          *,
          surgeon:doctors!surgeon_fee_templates_surgeon_id_fkey(
            id,
            profile:profiles!doctors_profile_id_fkey(full_name)
          )
        `)
        .eq("id", templateId)
        .single();

      if (error) throw error;
      return data as SurgeonFeeTemplate;
    },
    enabled: !!templateId && !!profile?.organization_id,
  });
}

/**
 * Create a new surgeon fee template
 */
export function useCreateSurgeonFeeTemplate() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateTemplateData) => {
      if (!profile?.organization_id) throw new Error("No organization");

      const { data: result, error } = await supabase
        .from("surgeon_fee_templates")
        .insert({
          ...data,
          organization_id: profile.organization_id,
          created_by: profile.id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["surgeon-fee-templates"] });
      toast.success("Fee template created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create template: ${error.message}`);
    },
  });
}

/**
 * Update an existing surgeon fee template
 */
export function useUpdateSurgeonFeeTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: Partial<CreateTemplateData> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("surgeon_fee_templates")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["surgeon-fee-templates"] });
      toast.success("Fee template updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update template: ${error.message}`);
    },
  });
}

/**
 * Delete (deactivate) a surgeon fee template
 */
export function useDeleteSurgeonFeeTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("surgeon_fee_templates")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["surgeon-fee-templates"] });
      toast.success("Fee template deleted");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete template: ${error.message}`);
    },
  });
}

/**
 * Calculate total from surgery charges
 */
export function calculateSurgeryChargesTotal(charges: Partial<SurgeryCharges>): number {
  return (
    (charges.surgeon_fee || 0) +
    (charges.anesthesia_fee || 0) +
    (charges.nursing_fee || 0) +
    (charges.ot_room_fee || 0) +
    (charges.consumables_fee || 0) +
    (charges.recovery_fee || 0)
  );
}

/**
 * Convert template to surgery charges
 */
export function templateToSurgeryCharges(template: SurgeonFeeTemplate): SurgeryCharges {
  const charges: SurgeryCharges = {
    surgeon_fee: template.surgeon_fee,
    anesthesia_fee: template.default_anesthesia_fee,
    nursing_fee: template.nursing_fee,
    ot_room_fee: template.ot_room_fee,
    consumables_fee: template.consumables_fee,
    recovery_fee: template.recovery_fee,
    total: template.total_package,
  };
  return charges;
}
