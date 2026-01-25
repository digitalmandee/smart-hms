import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface LabSettings {
  id?: string;
  organization_id: string;
  branch_id: string | null;
  allow_direct_lab_payment: boolean;
  require_consultation_for_lab: boolean;
  lab_payment_location: "reception" | "lab" | "both";
  auto_generate_invoice: boolean;
  allow_unpaid_processing: boolean;
}

const DEFAULT_SETTINGS: Omit<LabSettings, "organization_id"> = {
  branch_id: null,
  allow_direct_lab_payment: false,
  require_consultation_for_lab: true,
  lab_payment_location: "reception",
  auto_generate_invoice: true,
  allow_unpaid_processing: false,
};

export function useLabSettings() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["lab-settings", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return null;

      const { data, error } = await (supabase as any)
        .from("lab_settings")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .is("branch_id", null)
        .maybeSingle();

      if (error) {
        console.error("Failed to fetch lab settings:", error);
        return null;
      }

      // Return fetched data or default settings
      if (data) {
        return data as LabSettings;
      }

      // Return defaults with organization_id if no settings exist
      return {
        organization_id: profile.organization_id,
        ...DEFAULT_SETTINGS,
      } as LabSettings;
    },
    enabled: !!profile?.organization_id,
  });
}
