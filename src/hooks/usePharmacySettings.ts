import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface PharmacySettings {
  id: string;
  organization_id: string;
  branch_id: string | null;
  default_tax_rate: number;
  receipt_header: string | null;
  receipt_footer: string;
  low_stock_threshold: number;
  expiry_alert_days: number;
  require_customer_name: boolean;
  allow_held_transactions: boolean;
  auto_print_receipt: boolean;
  require_prescription_for_controlled: boolean;
  sales_revenue_account_id: string | null;
  inventory_account_id: string | null;
  cogs_account_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PharmacySettingsUpdate {
  default_tax_rate?: number;
  receipt_header?: string | null;
  receipt_footer?: string;
  low_stock_threshold?: number;
  expiry_alert_days?: number;
  require_customer_name?: boolean;
  allow_held_transactions?: boolean;
  auto_print_receipt?: boolean;
  require_prescription_for_controlled?: boolean;
  sales_revenue_account_id?: string | null;
  inventory_account_id?: string | null;
  cogs_account_id?: string | null;
}

export function usePharmacySettings() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["pharmacy-settings", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return null;

      const { data, error } = await supabase
        .from("pharmacy_settings")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .maybeSingle();

      if (error) throw error;
      return data as PharmacySettings | null;
    },
    enabled: !!profile?.organization_id,
  });
}

export function useUpdatePharmacySettings() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (updates: PharmacySettingsUpdate) => {
      if (!profile?.organization_id) throw new Error("No organization");

      // Check if settings exist
      const { data: existing } = await supabase
        .from("pharmacy_settings")
        .select("id")
        .eq("organization_id", profile.organization_id)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from("pharmacy_settings")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("organization_id", profile.organization_id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new
        const { data, error } = await supabase
          .from("pharmacy_settings")
          .insert({
            organization_id: profile.organization_id,
            branch_id: profile.branch_id,
            ...updates,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacy-settings"] });
      toast.success("Pharmacy settings updated");
    },
    onError: (error) => {
      toast.error("Failed to update settings: " + error.message);
    },
  });
}
