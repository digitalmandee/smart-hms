import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type NotificationChannel = Database["public"]["Enums"]["notification_channel"];

export interface NotificationTemplate {
  id: string;
  organization_id: string | null;
  event_type: string;
  channel: NotificationChannel;
  subject: string | null;
  template: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const EVENT_TYPE_LABELS: Record<string, string> = {
  appointment_reminder: "Appointment Reminder",
  appointment_confirmation: "Appointment Confirmation",
  appointment_cancellation: "Appointment Cancellation",
  invoice_created: "Invoice Created",
  payment_received: "Payment Received",
  payment_overdue: "Payment Overdue",
  lab_report_ready: "Lab Report Ready",
  prescription_ready: "Prescription Ready",
  welcome_patient: "Welcome Patient",
};

export const EVENT_TYPE_CATEGORIES: Record<string, string[]> = {
  Appointments: ["appointment_reminder", "appointment_confirmation", "appointment_cancellation"],
  Billing: ["invoice_created", "payment_received", "payment_overdue"],
  "Lab Reports": ["lab_report_ready"],
  Pharmacy: ["prescription_ready"],
  General: ["welcome_patient"],
};

export const AVAILABLE_PLACEHOLDERS: Record<string, string[]> = {
  appointment_reminder: [
    "{{patient_name}}", "{{patient_email}}", "{{appointment_date}}", "{{appointment_time}}",
    "{{doctor_name}}", "{{department}}", "{{organization_name}}", "{{organization_phone}}", "{{organization_address}}"
  ],
  appointment_confirmation: [
    "{{patient_name}}", "{{appointment_date}}", "{{appointment_time}}", "{{doctor_name}}",
    "{{token_number}}", "{{organization_name}}", "{{organization_phone}}"
  ],
  appointment_cancellation: [
    "{{patient_name}}", "{{appointment_date}}", "{{appointment_time}}", "{{doctor_name}}",
    "{{organization_name}}", "{{organization_phone}}"
  ],
  invoice_created: [
    "{{patient_name}}", "{{invoice_number}}", "{{total_amount}}", "{{currency}}",
    "{{due_date}}", "{{organization_name}}", "{{organization_phone}}"
  ],
  payment_received: [
    "{{patient_name}}", "{{payment_amount}}", "{{invoice_number}}", "{{payment_date}}",
    "{{payment_method}}", "{{balance_due}}", "{{currency}}", "{{organization_name}}"
  ],
  payment_overdue: [
    "{{patient_name}}", "{{invoice_number}}", "{{amount_due}}", "{{due_date}}",
    "{{days_overdue}}", "{{currency}}", "{{organization_name}}", "{{organization_phone}}"
  ],
  lab_report_ready: [
    "{{patient_name}}", "{{lab_order_number}}", "{{test_names}}", "{{access_code}}",
    "{{report_link}}", "{{organization_name}}", "{{organization_phone}}"
  ],
  prescription_ready: [
    "{{patient_name}}", "{{prescription_number}}", "{{doctor_name}}", "{{medication_count}}",
    "{{pharmacy_hours}}", "{{organization_name}}", "{{organization_phone}}"
  ],
  welcome_patient: [
    "{{patient_name}}", "{{patient_number}}", "{{organization_name}}",
    "{{organization_address}}", "{{organization_phone}}"
  ],
};

export function useNotificationTemplates(channel: NotificationChannel = "email") {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["notification-templates", profile?.organization_id, channel],
    queryFn: async () => {
      // Fetch both system defaults (org_id is null) and org-specific templates
      const { data, error } = await supabase
        .from("notification_templates")
        .select("*")
        .eq("channel", channel)
        .or(`organization_id.is.null,organization_id.eq.${profile?.organization_id}`)
        .order("event_type");

      if (error) throw error;

      // Group by event_type, preferring org-specific over system default
      const templateMap = new Map<string, NotificationTemplate>();
      
      // First add system defaults
      data?.filter(t => t.organization_id === null).forEach(t => {
        templateMap.set(t.event_type, t as NotificationTemplate);
      });
      
      // Then override with org-specific
      data?.filter(t => t.organization_id !== null).forEach(t => {
        templateMap.set(t.event_type, t as NotificationTemplate);
      });

      return Array.from(templateMap.values());
    },
    enabled: !!profile?.organization_id,
  });
}

export function useNotificationTemplate(eventType: string, channel: NotificationChannel = "email") {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["notification-template", profile?.organization_id, eventType, channel],
    queryFn: async () => {
      // First try org-specific
      const { data: orgTemplate } = await supabase
        .from("notification_templates")
        .select("*")
        .eq("organization_id", profile?.organization_id)
        .eq("event_type", eventType)
        .eq("channel", channel)
        .single();

      if (orgTemplate) return orgTemplate as NotificationTemplate;

      // Fall back to system default
      const { data: defaultTemplate, error } = await supabase
        .from("notification_templates")
        .select("*")
        .is("organization_id", null)
        .eq("event_type", eventType)
        .eq("channel", channel)
        .single();

      if (error) throw error;
      return defaultTemplate as NotificationTemplate;
    },
    enabled: !!profile?.organization_id && !!eventType,
  });
}

export function useSaveNotificationTemplate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (template: Partial<NotificationTemplate> & { event_type: string; channel: NotificationChannel }) => {
      if (!profile?.organization_id) throw new Error("No organization");

      // Check if org-specific template exists
      const { data: existing } = await supabase
        .from("notification_templates")
        .select("id")
        .eq("organization_id", profile.organization_id)
        .eq("event_type", template.event_type)
        .eq("channel", template.channel)
        .single();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from("notification_templates")
          .update({
            subject: template.subject,
            template: template.template,
            is_active: template.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        // Create new org-specific template
        const { error } = await supabase
          .from("notification_templates")
          .insert({
            organization_id: profile.organization_id,
            event_type: template.event_type,
            channel: template.channel,
            subject: template.subject,
            template: template.template || "",
            is_active: template.is_active ?? true,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-templates"] });
      queryClient.invalidateQueries({ queryKey: ["notification-template"] });
      toast({
        title: "Template saved",
        description: "Your email template has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving template",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useResetToDefault() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({ eventType, channel }: { eventType: string; channel: NotificationChannel }) => {
      if (!profile?.organization_id) throw new Error("No organization");

      // Delete org-specific template to fall back to default
      const { error } = await supabase
        .from("notification_templates")
        .delete()
        .eq("organization_id", profile.organization_id)
        .eq("event_type", eventType)
        .eq("channel", channel);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-templates"] });
      queryClient.invalidateQueries({ queryKey: ["notification-template"] });
      toast({
        title: "Reset to default",
        description: "The template has been reset to the system default.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error resetting template",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
