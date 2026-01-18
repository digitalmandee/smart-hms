import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OrganizationModule {
  id: string;
  organization_id: string;
  module_code: string;
  is_enabled: boolean | null;
  enabled_at: string | null;
  enabled_by: string | null;
}

interface AvailableModule {
  id: string;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  category: string | null;
  is_hospital_only: boolean | null;
  is_core: boolean | null;
  sort_order: number | null;
}

// Fetch enabled modules for an organization
export function useOrganizationModules(orgId?: string) {
  return useQuery({
    queryKey: ["organization-modules", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      
      const { data, error } = await supabase
        .from("organization_modules")
        .select("*")
        .eq("organization_id", orgId)
        .eq("is_enabled", true);

      if (error) throw error;
      return (data || []).map(m => m.module_code);
    },
    enabled: !!orgId,
  });
}

// Fetch all modules with their enabled status for an organization
export function useOrganizationModulesWithStatus(orgId?: string) {
  return useQuery({
    queryKey: ["organization-modules-status", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      
      // Get all available modules
      const { data: availableModules, error: availableError } = await supabase
        .from("available_modules")
        .select("*")
        .order("sort_order", { ascending: true });

      if (availableError) throw availableError;

      // Get organization's enabled modules
      const { data: orgModules, error: orgError } = await supabase
        .from("organization_modules")
        .select("*")
        .eq("organization_id", orgId);

      if (orgError) throw orgError;

      // Merge them
      return (availableModules || []).map(module => {
        const orgModule = (orgModules || []).find(m => m.module_code === module.code);
        return {
          ...module,
          is_enabled: orgModule?.is_enabled ?? false,
          org_module_id: orgModule?.id,
        };
      });
    },
    enabled: !!orgId,
  });
}

// Fetch all available modules
export function useAvailableModules() {
  return useQuery({
    queryKey: ["available-modules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("available_modules")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as AvailableModule[];
    },
  });
}

// Toggle a module on/off
export function useToggleOrganizationModule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      organizationId,
      moduleCode,
      isEnabled,
    }: {
      organizationId: string;
      moduleCode: string;
      isEnabled: boolean;
    }) => {
      // Check if record exists
      const { data: existing } = await supabase
        .from("organization_modules")
        .select("id")
        .eq("organization_id", organizationId)
        .eq("module_code", moduleCode)
        .single();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from("organization_modules")
          .update({
            is_enabled: isEnabled,
            enabled_at: isEnabled ? new Date().toISOString() : null,
          })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from("organization_modules")
          .insert({
            organization_id: organizationId,
            module_code: moduleCode,
            is_enabled: isEnabled,
            enabled_at: isEnabled ? new Date().toISOString() : null,
          });

        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["organization-modules", variables.organizationId] });
      queryClient.invalidateQueries({ queryKey: ["organization-modules-status", variables.organizationId] });
      toast({
        title: "Module updated",
        description: `Module ${variables.isEnabled ? "enabled" : "disabled"} successfully.`,
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

// Bulk update modules (for facility type changes)
export function useBulkUpdateModules() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      organizationId,
      modules,
    }: {
      organizationId: string;
      modules: { code: string; enabled: boolean }[];
    }) => {
      for (const module of modules) {
        const { data: existing } = await supabase
          .from("organization_modules")
          .select("id")
          .eq("organization_id", organizationId)
          .eq("module_code", module.code)
          .single();

        if (existing) {
          await supabase
            .from("organization_modules")
            .update({ is_enabled: module.enabled })
            .eq("id", existing.id);
        } else {
          await supabase
            .from("organization_modules")
            .insert({
              organization_id: organizationId,
              module_code: module.code,
              is_enabled: module.enabled,
            });
        }
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["organization-modules", variables.organizationId] });
      queryClient.invalidateQueries({ queryKey: ["organization-modules-status", variables.organizationId] });
      toast({
        title: "Modules updated",
        description: "All modules have been updated successfully.",
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
