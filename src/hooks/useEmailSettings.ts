import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface EmailSettings {
  email_provider: 'resend' | 'smtp' | 'sendgrid' | null;
  resend_api_key: string | null;
  sendgrid_api_key: string | null;
  smtp_host: string | null;
  smtp_port: string | null;
  smtp_username: string | null;
  smtp_password: string | null;
  smtp_encryption: 'tls' | 'ssl' | 'none' | null;
  email_from_name: string | null;
  email_from_address: string | null;
  email_reply_to: string | null;
}

const EMAIL_SETTING_KEYS = [
  'email_provider',
  'resend_api_key',
  'sendgrid_api_key',
  'smtp_host',
  'smtp_port',
  'smtp_username',
  'smtp_password',
  'smtp_encryption',
  'email_from_name',
  'email_from_address',
  'email_reply_to'
];

export function useEmailSettings() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["email-settings", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return null;

      const { data, error } = await supabase
        .from("organization_settings")
        .select("setting_key, setting_value")
        .eq("organization_id", profile.organization_id)
        .in("setting_key", EMAIL_SETTING_KEYS);

      if (error) throw error;

      const settings: EmailSettings = {
        email_provider: null,
        resend_api_key: null,
        sendgrid_api_key: null,
        smtp_host: null,
        smtp_port: null,
        smtp_username: null,
        smtp_password: null,
        smtp_encryption: null,
        email_from_name: null,
        email_from_address: null,
        email_reply_to: null,
      };

      data?.forEach((item) => {
        const key = item.setting_key as keyof EmailSettings;
        if (key in settings) {
          (settings as any)[key] = item.setting_value;
        }
      });

      return settings;
    },
    enabled: !!profile?.organization_id,
  });
}

export function useUpdateEmailSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (settings: Partial<EmailSettings>) => {
      if (!profile?.organization_id) throw new Error("No organization");

      // Upsert each setting
      for (const [key, value] of Object.entries(settings)) {
        if (value === undefined) continue;

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
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-settings"] });
      toast({
        title: "Email settings saved",
        description: "Your email configuration has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useTestEmailConfig() {
  const { profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (testEmail: string) => {
      if (!profile?.organization_id) throw new Error("No organization");

      const { data, error } = await supabase.functions.invoke("test-email-config", {
        body: {
          organization_id: profile.organization_id,
          test_recipient: testEmail,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Test email sent!",
        description: "Check your inbox to verify the email was received.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Test failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
