import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface OrganizationBranding {
  // Visual Identity
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  
  // Organization Info
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  slug: string;
  
  // Business Details
  registration_number: string | null;
  tax_id: string | null;
  
  // Invoice Settings
  invoice_terms: string | null;
  invoice_payment_instructions: string | null;
  
  // Receipt Settings
  receipt_header: string | null;
  receipt_footer: string | null;
  thank_you_message: string;
  
  // Token Slip Settings
  token_slip_message: string;
  token_slip_footer: string;
  show_qr_on_token: boolean;
  show_payment_on_token: boolean;
}

const DEFAULT_BRANDING: OrganizationBranding = {
  logo_url: null,
  primary_color: "#0d9488",
  secondary_color: "#64748b",
  name: "Medical Center",
  address: null,
  phone: null,
  email: null,
  slug: "",
  registration_number: null,
  tax_id: null,
  invoice_terms: "Payment is due upon receipt. Thank you for choosing our services.",
  invoice_payment_instructions: null,
  receipt_header: null,
  receipt_footer: null,
  thank_you_message: "Thank you for your payment!",
  token_slip_message: "Please wait for your number to be called",
  token_slip_footer: "Keep this slip for reference",
  show_qr_on_token: true,
  show_payment_on_token: true,
};

export function useOrganizationBranding() {
  const { profile } = useAuth();
  const organizationId = profile?.organization_id;

  return useQuery({
    queryKey: ["organization-branding", organizationId],
    queryFn: async (): Promise<OrganizationBranding> => {
      if (!organizationId) {
        return DEFAULT_BRANDING;
      }

      // Fetch organization data
      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .select("name, address, phone, email, slug, logo_url, receipt_header, receipt_footer")
        .eq("id", organizationId)
        .single();

      if (orgError) {
        console.error("Error fetching organization:", orgError);
        return DEFAULT_BRANDING;
      }

      // Fetch organization settings
      const { data: settings, error: settingsError } = await supabase
        .from("organization_settings")
        .select("setting_key, setting_value")
        .eq("organization_id", organizationId)
        .in("setting_key", [
          "logo_url",
          "primary_color",
          "secondary_color",
          "registration_number",
          "tax_id",
          "invoice_terms",
          "invoice_payment_instructions",
          "receipt_header",
          "receipt_footer",
          "thank_you_message",
          "token_slip_message",
          "token_slip_footer",
          "show_qr_on_token",
          "show_payment_on_token",
        ]);

      if (settingsError) {
        console.error("Error fetching settings:", settingsError);
      }

      // Build settings map
      const settingsMap: Record<string, string> = {};
      settings?.forEach((s) => {
        settingsMap[s.setting_key] = s.setting_value;
      });

      return {
        // Visual Identity - settings override org table
        logo_url: settingsMap.logo_url || org.logo_url || null,
        primary_color: settingsMap.primary_color || DEFAULT_BRANDING.primary_color,
        secondary_color: settingsMap.secondary_color || DEFAULT_BRANDING.secondary_color,
        
        // Organization Info
        name: org.name || DEFAULT_BRANDING.name,
        address: org.address || null,
        phone: org.phone || null,
        email: org.email || null,
        slug: org.slug || "",
        
        // Business Details
        registration_number: settingsMap.registration_number || null,
        tax_id: settingsMap.tax_id || null,
        
        // Invoice Settings
        invoice_terms: settingsMap.invoice_terms || DEFAULT_BRANDING.invoice_terms,
        invoice_payment_instructions: settingsMap.invoice_payment_instructions || null,
        
        // Receipt Settings - settings override org table
        receipt_header: settingsMap.receipt_header || org.receipt_header || null,
        receipt_footer: settingsMap.receipt_footer || org.receipt_footer || null,
        thank_you_message: settingsMap.thank_you_message || DEFAULT_BRANDING.thank_you_message,
        
        // Token Slip Settings
        token_slip_message: settingsMap.token_slip_message || DEFAULT_BRANDING.token_slip_message,
        token_slip_footer: settingsMap.token_slip_footer || DEFAULT_BRANDING.token_slip_footer,
        show_qr_on_token: settingsMap.show_qr_on_token !== "false",
        show_payment_on_token: settingsMap.show_payment_on_token !== "false",
      };
    },
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export interface BrandingUpdatePayload {
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  registration_number?: string;
  tax_id?: string;
  invoice_terms?: string;
  invoice_payment_instructions?: string;
  receipt_header?: string;
  receipt_footer?: string;
  thank_you_message?: string;
  token_slip_message?: string;
  token_slip_footer?: string;
  show_qr_on_token?: boolean;
  show_payment_on_token?: boolean;
}

export function useUpdateOrganizationBranding() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: BrandingUpdatePayload) => {
      if (!profile?.organization_id) {
        throw new Error("Organization not found");
      }

      const settingsToSave = Object.entries(payload).map(([key, value]) => ({
        organization_id: profile.organization_id,
        setting_key: key,
        setting_value: typeof value === "boolean" ? String(value) : value || "",
      }));

      for (const setting of settingsToSave) {
        const { error } = await supabase
          .from("organization_settings")
          .upsert(setting, { onConflict: "organization_id,setting_key" });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization-branding"] });
      toast({
        title: "Branding Updated",
        description: "Your branding settings have been saved successfully.",
      });
    },
    onError: (error) => {
      console.error("Error updating branding:", error);
      toast({
        title: "Error",
        description: "Failed to update branding settings.",
        variant: "destructive",
      });
    },
  });
}
