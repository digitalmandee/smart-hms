import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface NphiesConfig {
  nphies_enabled: boolean;
  nphies_environment: "sandbox" | "production";
  nphies_facility_id: string;
  nphies_cchi_license: string;
  nphies_client_id: string;
  nphies_client_secret: string;
  nphies_base_url: string;
}

const NPHIES_KEYS = [
  "nphies_enabled",
  "nphies_environment",
  "nphies_facility_id",
  "nphies_cchi_license",
  "nphies_client_id",
  "nphies_client_secret",
  "nphies_base_url",
] as const;

const DEFAULT_CONFIG: NphiesConfig = {
  nphies_enabled: false,
  nphies_environment: "sandbox",
  nphies_facility_id: "",
  nphies_cchi_license: "",
  nphies_client_id: "",
  nphies_client_secret: "",
  nphies_base_url: "https://hsb.nphies.sa",
};

export function useNphiesConfig() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["nphies-config", profile?.organization_id],
    queryFn: async (): Promise<NphiesConfig> => {
      if (!profile?.organization_id) return DEFAULT_CONFIG;

      const { data, error } = await supabase
        .from("organization_settings")
        .select("setting_key, setting_value")
        .eq("organization_id", profile.organization_id)
        .in("setting_key", [...NPHIES_KEYS]);

      if (error) throw error;

      const settings: Record<string, string | null> = {};
      data?.forEach((s) => {
        settings[s.setting_key] = s.setting_value;
      });

      return {
        nphies_enabled: settings.nphies_enabled === "true",
        nphies_environment: (settings.nphies_environment as "sandbox" | "production") || "sandbox",
        nphies_facility_id: settings.nphies_facility_id || "",
        nphies_cchi_license: settings.nphies_cchi_license || "",
        nphies_client_id: settings.nphies_client_id || "",
        nphies_client_secret: settings.nphies_client_secret || "",
        nphies_base_url: settings.nphies_base_url || "https://hsb.nphies.sa",
      };
    },
    enabled: !!profile?.organization_id,
  });
}

export function useUpdateNphiesConfig() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (config: Partial<NphiesConfig>) => {
      if (!profile?.organization_id) throw new Error("No organization");

      const entries = Object.entries(config).map(([key, value]) => ({
        key,
        value: typeof value === "boolean" ? String(value) : (value as string),
      }));

      for (const { key, value } of entries) {
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
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nphies-config"] });
      toast.success("NPHIES configuration saved");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useSubmitClaimToNphies() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (claimId: string) => {
      if (!profile?.organization_id) throw new Error("No organization");

      const { data, error } = await supabase.functions.invoke("nphies-gateway", {
        body: {
          action: "submit_claim",
          organization_id: profile.organization_id,
          claim_id: claimId,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["insurance-claim"] });
      queryClient.invalidateQueries({ queryKey: ["insurance-claims"] });
      if (data?.nphies_status === "approved") {
        toast.success("Claim accepted by NPHIES");
      } else if (data?.nphies_status === "rejected") {
        toast.error("Claim rejected by NPHIES");
      } else {
        toast.info("Claim submitted to NPHIES — pending review");
      }
    },
    onError: (error: Error) => {
      toast.error(`NPHIES submission failed: ${error.message}`);
    },
  });
}

export function useSubmitPreAuth() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (claimId: string) => {
      if (!profile?.organization_id) throw new Error("No organization");

      const { data, error } = await supabase.functions.invoke("nphies-gateway", {
        body: {
          action: "submit_preauth",
          organization_id: profile.organization_id,
          claim_id: claimId,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["insurance-claim"] });
      queryClient.invalidateQueries({ queryKey: ["insurance-claims"] });
      if (data?.pre_auth_status === "approved") {
        toast.success("Pre-authorization approved by NPHIES");
      } else if (data?.pre_auth_status === "denied") {
        toast.error("Pre-authorization denied by NPHIES");
      } else {
        toast.info("Pre-authorization submitted — pending review");
      }
    },
    onError: (error: Error) => {
      toast.error(`Pre-auth request failed: ${error.message}`);
    },
  });
}

export function useCheckClaimStatus() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (claimId: string) => {
      if (!profile?.organization_id) throw new Error("No organization");

      const { data, error } = await supabase.functions.invoke("nphies-gateway", {
        body: {
          action: "check_claim_status",
          organization_id: profile.organization_id,
          claim_id: claimId,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["insurance-claim"] });
      queryClient.invalidateQueries({ queryKey: ["insurance-claims"] });
      if (data?.nphies_status === "approved") {
        toast.success("Claim has been approved by NPHIES");
      } else if (data?.nphies_status === "rejected") {
        toast.error("Claim has been rejected by NPHIES");
      } else {
        toast.info(data?.message || "Status checked — no update yet");
      }
    },
    onError: (error: Error) => {
      toast.error(`Status check failed: ${error.message}`);
    },
  });
}

export function useTestNphiesConnection() {
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!profile?.organization_id) throw new Error("No organization");

      const { data, error } = await supabase.functions.invoke("nphies-gateway", {
        body: {
          action: "test_connection",
          organization_id: profile.organization_id,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("NPHIES connection successful!");
    },
    onError: (error: Error) => {
      toast.error(`Connection test failed: ${error.message}`);
    },
  });
}

export function useNphiesStats(organizationId?: string) {
  return useQuery({
    queryKey: ["nphies-stats", organizationId],
    queryFn: async () => {
      if (!organizationId) return null;

      const { data: claims, error } = await supabase
        .from("insurance_claims")
        .select("nphies_status, total_amount, approved_amount")
        .eq("organization_id", organizationId)
        .not("nphies_claim_id", "is", null);

      if (error) throw error;

      const stats = {
        total: claims?.length || 0,
        approved: 0,
        rejected: 0,
        pending: 0,
        partiallyApproved: 0,
        totalApprovedAmount: 0,
      };

      claims?.forEach((c) => {
        if (c.nphies_status === "approved") {
          stats.approved++;
          stats.totalApprovedAmount += Number(c.approved_amount || c.total_amount || 0);
        } else if (c.nphies_status === "rejected") {
          stats.rejected++;
        } else if (c.nphies_status === "pending") {
          stats.pending++;
        } else if (c.nphies_status === "partially_approved") {
          stats.partiallyApproved++;
          stats.totalApprovedAmount += Number(c.approved_amount || 0);
        }
      });

      // Get eligibility check count (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: eligibilityCount } = await supabase
        .from("nphies_eligibility_logs")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", organizationId)
        .gte("checked_at", thirtyDaysAgo.toISOString());

      return { ...stats, eligibilityChecks: eligibilityCount || 0 };
    },
    enabled: !!organizationId,
  });
}
