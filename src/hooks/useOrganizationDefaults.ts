import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface OrganizationDefaults {
  default_tax_rate: number | null;
  receipt_header: string | null;
  receipt_footer: string | null;
  working_hours_start: string | null;
  working_hours_end: string | null;
  working_days: string[] | null;
}

export interface OrganizationDefaultsUpdate {
  default_tax_rate?: number | null;
  receipt_header?: string | null;
  receipt_footer?: string | null;
  working_hours_start?: string | null;
  working_hours_end?: string | null;
  working_days?: string[] | null;
}

export function useOrganizationDefaults() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["organization-defaults", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) throw new Error("No organization ID");

      const { data, error } = await supabase
        .from("organizations")
        .select("default_tax_rate, receipt_header, receipt_footer, working_hours_start, working_hours_end, working_days")
        .eq("id", profile.organization_id)
        .single();

      if (error) throw error;
      return data as OrganizationDefaults;
    },
    enabled: !!profile?.organization_id,
  });
}

export function useUpdateOrganizationDefaults() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: OrganizationDefaultsUpdate) => {
      if (!profile?.organization_id) throw new Error("No organization ID");

      const { data: result, error } = await supabase
        .from("organizations")
        .update(data as any)
        .eq("id", profile.organization_id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization-defaults"] });
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      toast({
        title: "Settings saved",
        description: "Organization defaults have been updated successfully.",
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
