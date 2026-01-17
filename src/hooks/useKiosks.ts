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
  kiosk_username: string | null;
  session_timeout_minutes: number;
  last_login_at: string | null;
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
  session_timeout_minutes?: number;
  password?: string;
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

// Generate a random password
function generateRandomPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export function useCreateKiosk() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: KioskFormData) => {
      if (!profile?.organization_id) throw new Error("No organization");

      const client: any = supabase;
      
      // Generate password if not provided
      const password = data.password || generateRandomPassword();
      
      // Generate username from name
      const { data: usernameData, error: usernameError } = await client
        .rpc("generate_kiosk_username", { 
          kiosk_name: data.name, 
          org_id: profile.organization_id 
        });
      
      if (usernameError) throw usernameError;
      
      // Hash password
      const { data: hashedPassword, error: hashError } = await client
        .rpc("hash_kiosk_password", { password });
      
      if (hashError) throw hashError;

      // Create kiosk
      const { data: result, error } = await client
        .from("kiosk_configs")
        .insert([{
          name: data.name,
          kiosk_type: data.kiosk_type,
          branch_id: data.branch_id,
          departments: data.departments,
          is_active: data.is_active,
          auto_print: data.auto_print,
          show_estimated_wait: data.show_estimated_wait,
          display_message: data.display_message,
          session_timeout_minutes: data.session_timeout_minutes || 480,
          organization_id: profile.organization_id,
          created_by: profile.id,
          kiosk_username: usernameData,
          kiosk_password_hash: hashedPassword,
        }])
        .select()
        .single();

      if (error) throw error;
      
      return { ...result, generatedPassword: password };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kiosks"] });
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
      
      // Build update object, excluding password
      const updateData: any = {
        name: data.name,
        kiosk_type: data.kiosk_type,
        branch_id: data.branch_id,
        departments: data.departments,
        is_active: data.is_active,
        auto_print: data.auto_print,
        show_estimated_wait: data.show_estimated_wait,
        display_message: data.display_message,
        session_timeout_minutes: data.session_timeout_minutes,
      };

      const { error } = await client
        .from("kiosk_configs")
        .update(updateData)
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

export function useResetKioskPassword() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (kioskId: string) => {
      const client: any = supabase;
      
      // Generate new password
      const newPassword = generateRandomPassword();
      
      // Hash password
      const { data: hashedPassword, error: hashError } = await client
        .rpc("hash_kiosk_password", { password: newPassword });
      
      if (hashError) throw hashError;

      // Update kiosk
      const { error } = await client
        .from("kiosk_configs")
        .update({ kiosk_password_hash: hashedPassword })
        .eq("id", kioskId);

      if (error) throw error;
      
      return newPassword;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kiosks"] });
      queryClient.invalidateQueries({ queryKey: ["kiosk"] });
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
