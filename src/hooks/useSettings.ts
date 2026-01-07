import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type SystemSetting = Database["public"]["Tables"]["system_settings"]["Row"];
type OrgSetting = Database["public"]["Tables"]["organization_settings"]["Row"];

export function useSystemSettings() {
  return useQuery({
    queryKey: ["system-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("*")
        .order("setting_key", { ascending: true });

      if (error) throw error;
      
      // Convert to object for easier access
      const settings: Record<string, string | null> = {};
      data.forEach((s) => {
        settings[s.setting_key] = s.setting_value;
      });

      return { raw: data as SystemSetting[], settings };
    },
  });
}

export function useUpdateSystemSetting() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      key,
      value,
    }: {
      key: string;
      value: string | null;
    }) => {
      const { error } = await supabase
        .from("system_settings")
        .update({ setting_value: value })
        .eq("setting_key", key);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
      toast({
        title: "Setting updated",
        description: "The system setting has been updated.",
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

export function useOrgSettings() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["org-settings", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return { raw: [], settings: {} };

      const { data, error } = await supabase
        .from("organization_settings")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .order("setting_key", { ascending: true });

      if (error) throw error;

      const settings: Record<string, string | null> = {};
      data.forEach((s) => {
        settings[s.setting_key] = s.setting_value;
      });

      return { raw: data as OrgSetting[], settings };
    },
    enabled: !!profile?.organization_id,
  });
}

export function useUpdateOrgSetting() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      key,
      value,
    }: {
      key: string;
      value: string | null;
    }) => {
      if (!profile?.organization_id) throw new Error("No organization");

      // Check if setting exists
      const { data: existing } = await supabase
        .from("organization_settings")
        .select("id")
        .eq("organization_id", profile.organization_id)
        .eq("setting_key", key)
        .single();

      if (existing) {
        const { error } = await supabase
          .from("organization_settings")
          .update({ setting_value: value })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("organization_settings")
          .insert({
            organization_id: profile.organization_id,
            setting_key: key,
            setting_value: value,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-settings"] });
      toast({
        title: "Setting updated",
        description: "The organization setting has been updated.",
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
