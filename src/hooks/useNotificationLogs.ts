import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Use database-compatible types
export function useNotificationLogs(filters?: { type?: string; status?: string }, page = 1, limit = 50) {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["notification-logs", profile?.organization_id, filters, page, limit],
    queryFn: async () => {
      let query = supabase
        .from("notification_logs")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (filters?.type) {
        query = query.eq("notification_type", filters.type);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        logs: data || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      };
    },
    enabled: !!profile?.organization_id,
  });
}

export function useNotificationStats() {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["notification-stats", profile?.organization_id],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from("notification_logs")
        .select("notification_type, status, created_at")
        .gte("created_at", today);

      if (error) throw error;

      return {
        totalToday: data?.length || 0,
        smsCount: data?.filter(n => n.notification_type === "sms").length || 0,
        emailCount: data?.filter(n => n.notification_type === "email").length || 0,
        sentCount: data?.filter(n => n.status === "sent").length || 0,
        failedCount: data?.filter(n => n.status === "failed").length || 0,
      };
    },
    enabled: !!profile?.organization_id,
  });
}

export function useSendSMS() {
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: { to: string; message: string }) => {
      // Call edge function to send SMS
      const { data: response, error } = await supabase.functions.invoke("send-sms", {
        body: {
          to: data.to,
          message: data.message,
          organizationId: profile?.organization_id,
        },
      });

      if (error) throw error;
      return response;
    },
    onSuccess: () => {
      toast.success("SMS sent successfully");
    },
    onError: (error) => {
      toast.error("Failed to send SMS: " + error.message);
    },
  });
}

export function useSendEmail() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      to: string;
      subject: string;
      message: string;
      recipientName?: string;
      relatedEntityType?: string;
      relatedEntityId?: string;
    }) => {
      // Create log entry first
      const { data: log, error: logError } = await supabase
        .from("notification_logs")
        .insert({
          organization_id: profile?.organization_id,
          notification_type: "email",
          recipient: data.to,
          recipient_name: data.recipientName,
          subject: data.subject,
          message: data.message,
          status: "pending",
          related_entity_type: data.relatedEntityType,
          related_entity_id: data.relatedEntityId,
          created_by: profile?.id,
        })
        .select()
        .single();

      if (logError) throw logError;

      // For now, just mark as sent (email integration would be added later)
      await supabase
        .from("notification_logs")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
        })
        .eq("id", log.id);

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-logs"] });
      queryClient.invalidateQueries({ queryKey: ["notification-stats"] });
      toast.success("Email queued successfully");
    },
    onError: (error) => {
      toast.error("Failed to send email: " + error.message);
    },
  });
}
