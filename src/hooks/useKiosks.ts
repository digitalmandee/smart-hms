import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface KioskConfig {
  id: string;
  organization_id: string;
  branch_id: string | null;
  name: string;
  kiosk_type: "opd" | "ipd" | "emergency";
  departments: string[];
  is_active: boolean;
  auto_print: boolean;
  show_estimated_wait: boolean;
  display_message: string | null;
  created_at: string;
  updated_at: string;
  branch?: {
    name: string;
  };
}

export interface KioskFormData {
  name: string;
  kiosk_type: "opd" | "ipd" | "emergency";
  branch_id?: string | null;
  departments: string[];
  is_active: boolean;
  auto_print: boolean;
  show_estimated_wait: boolean;
  display_message?: string;
}

export function useKiosks() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["kiosks", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const client: any = supabase;
      const { data, error } = await client
        .from("kiosk_configs")
        .select(`
          *,
          branch:branches(name)
        `)
        .eq("organization_id", profile.organization_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as KioskConfig[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useKiosk(id: string | undefined) {
  return useQuery({
    queryKey: ["kiosk", id],
    queryFn: async () => {
      if (!id) return null;

      const client: any = supabase;
      const { data, error } = await client
        .from("kiosk_configs")
        .select(`
          *,
          branch:branches(name)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as KioskConfig;
    },
    enabled: !!id,
  });
}

export function usePublicKiosk(kioskId: string | undefined) {
  return useQuery({
    queryKey: ["public-kiosk", kioskId],
    queryFn: async () => {
      if (!kioskId) return null;

      const client: any = supabase;
      const { data, error } = await client
        .from("kiosk_configs")
        .select("*")
        .eq("id", kioskId)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      return data as KioskConfig;
    },
    enabled: !!kioskId,
  });
}

export function useCreateKiosk() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: KioskFormData) => {
      if (!profile?.organization_id) throw new Error("No organization");

      const client: any = supabase;
      const { data: result, error } = await client
        .from("kiosk_configs")
        .insert([{
          ...data,
          organization_id: profile.organization_id,
          created_by: profile.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kiosks"] });
      toast({
        title: "Kiosk created",
        description: "The kiosk has been created successfully.",
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

export function useUpdateKiosk() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<KioskFormData> }) => {
      const client: any = supabase;
      const { error } = await client
        .from("kiosk_configs")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kiosks"] });
      queryClient.invalidateQueries({ queryKey: ["kiosk"] });
      toast({
        title: "Kiosk updated",
        description: "The kiosk has been updated successfully.",
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

export function useDeleteKiosk() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const client: any = supabase;
      const { error } = await client
        .from("kiosk_configs")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kiosks"] });
      toast({
        title: "Kiosk deleted",
        description: "The kiosk has been deleted.",
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

// Hook to get unique departments/specializations from doctors
export function useDepartments() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["departments", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const client: any = supabase;
      const { data, error } = await client
        .from("doctors")
        .select("specialization")
        .eq("organization_id", profile.organization_id)
        .eq("is_active", true);

      if (error) throw error;

      // Get unique specializations
      const specializations = [...new Set(
        data
          .map((d: any) => d.specialization)
          .filter((s: string | null) => s)
      )] as string[];

      return specializations.sort();
    },
    enabled: !!profile?.organization_id,
  });
}
