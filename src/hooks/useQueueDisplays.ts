import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface QueueDisplayConfig {
  id: string;
  organization_id: string;
  branch_id: string | null;
  name: string;
  display_type: "opd" | "ipd" | "emergency" | "combined";
  departments: string[];
  linked_kiosk_ids: string[];
  doctor_ids: string[];
  show_next_count: number;
  audio_enabled: boolean;
  theme: "light" | "dark" | "auto";
  display_settings: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  branch?: { id: string; name: string };
}

export interface QueueDisplayFormData {
  name: string;
  branch_id?: string;
  display_type: "opd" | "ipd" | "emergency" | "combined";
  departments?: string[];
  linked_kiosk_ids?: string[];
  doctor_ids?: string[];
  show_next_count?: number;
  audio_enabled?: boolean;
  theme?: "light" | "dark" | "auto";
  is_active?: boolean;
}

// Fetch all queue displays for the organization
export function useQueueDisplays() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["queue-displays", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await (supabase as any)
        .from("queue_display_configs")
        .select(`
          *,
          branch:branches(id, name)
        `)
        .eq("organization_id", profile.organization_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as QueueDisplayConfig[];
    },
    enabled: !!profile?.organization_id,
  });
}

// Fetch a single queue display by ID
export function useQueueDisplay(id: string | undefined) {
  return useQuery({
    queryKey: ["queue-display", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await (supabase as any)
        .from("queue_display_configs")
        .select(`
          *,
          branch:branches(id, name)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as QueueDisplayConfig;
    },
    enabled: !!id,
  });
}

// Fetch public queue display (unauthenticated)
export function usePublicQueueDisplay(displayId: string | undefined) {
  return useQuery({
    queryKey: ["public-queue-display", displayId],
    queryFn: async () => {
      if (!displayId) return null;

      const { data, error } = await (supabase as any)
        .from("queue_display_configs")
        .select("*")
        .eq("id", displayId)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      return data as QueueDisplayConfig;
    },
    enabled: !!displayId,
  });
}

// Create queue display
export function useCreateQueueDisplay() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: QueueDisplayFormData) => {
      if (!profile?.organization_id) {
        throw new Error("No organization found");
      }

      const { data: result, error } = await (supabase as any)
        .from("queue_display_configs")
        .insert([{
          ...data,
          organization_id: profile.organization_id,
          departments: data.departments || [],
          linked_kiosk_ids: data.linked_kiosk_ids || [],
          doctor_ids: data.doctor_ids || [],
        }])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue-displays"] });
      toast({
        title: "Success",
        description: "Queue display created successfully",
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

// Update queue display
export function useUpdateQueueDisplay() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<QueueDisplayFormData> }) => {
      const { data: result, error } = await (supabase as any)
        .from("queue_display_configs")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue-displays"] });
      queryClient.invalidateQueries({ queryKey: ["queue-display"] });
      toast({
        title: "Success",
        description: "Queue display updated successfully",
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

// Delete queue display
export function useDeleteQueueDisplay() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("queue_display_configs")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue-displays"] });
      toast({
        title: "Success",
        description: "Queue display deleted successfully",
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

// Fetch queue data filtered by display config
export function useFilteredQueue(displayId: string | undefined) {
  const { data: displayConfig } = usePublicQueueDisplay(displayId);

  return useQuery({
    queryKey: ["filtered-queue", displayId, displayConfig?.organization_id],
    queryFn: async () => {
      if (!displayConfig) return [];

      const today = new Date().toISOString().split("T")[0];
      
      let query = (supabase as any)
        .from("appointments")
        .select(`
          id,
          token_number,
          priority,
          status,
          appointment_time,
          kiosk_id,
          patient:patients(id, first_name, last_name),
          doctor:doctors(id, name, specialization)
        `)
        .eq("organization_id", displayConfig.organization_id)
        .eq("appointment_date", today)
        .in("status", ["checked_in", "in_progress"])
        .order("priority", { ascending: false })
        .order("token_number", { ascending: true });

      // Filter by branch if set
      if (displayConfig.branch_id) {
        query = query.eq("branch_id", displayConfig.branch_id);
      }

      // Filter by linked kiosks if any
      if (displayConfig.linked_kiosk_ids?.length > 0) {
        query = query.in("kiosk_id", displayConfig.linked_kiosk_ids);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Additional filtering by departments if configured
      let filtered = data || [];
      if (displayConfig.departments?.length > 0) {
        filtered = filtered.filter((apt: any) => 
          displayConfig.departments.includes(apt.doctor?.specialization)
        );
      }

      // Filter by doctors if configured
      if (displayConfig.doctor_ids?.length > 0) {
        filtered = filtered.filter((apt: any) =>
          displayConfig.doctor_ids.includes(apt.doctor?.id)
        );
      }

      return filtered;
    },
    enabled: !!displayConfig,
    refetchInterval: 5000, // Refresh every 5 seconds
  });
}
