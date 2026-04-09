import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BAA {
  id: string;
  organization_id: string;
  vendor_name: string;
  vendor_contact: string | null;
  vendor_email: string | null;
  service_description: string | null;
  agreement_date: string;
  expiry_date: string | null;
  renewal_date: string | null;
  status: string;
  document_url: string | null;
  phi_categories: string[];
  reviewed_by: string | null;
  approved_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useBAAgreements() {
  return useQuery({
    queryKey: ["baa-agreements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_associate_agreements" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as BAA[];
    },
  });
}

export function useCreateBAA() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (baa: Partial<BAA>) => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", userId!)
        .single();

      const { error } = await supabase.from("business_associate_agreements" as any).insert({
        ...baa,
        organization_id: profile?.organization_id,
        reviewed_by: userId,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["baa-agreements"] });
      toast.success("BAA created successfully");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useUpdateBAA() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BAA> & { id: string }) => {
      const { error } = await supabase
        .from("business_associate_agreements" as any)
        .update(updates as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["baa-agreements"] });
      toast.success("BAA updated successfully");
    },
    onError: (e: any) => toast.error(e.message),
  });
}
