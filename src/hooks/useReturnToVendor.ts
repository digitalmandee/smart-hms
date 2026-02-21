import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface ReturnToVendor {
  id: string;
  organization_id: string;
  rtv_number: string;
  grn_id: string | null;
  vendor_id: string;
  store_id: string | null;
  status: string;
  reason: string | null;
  notes: string | null;
  return_date: string;
  approved_by: string | null;
  approved_at: string | null;
  shipped_at: string | null;
  completed_at: string | null;
  created_by: string | null;
  created_at: string;
  vendor?: { name: string; vendor_code: string };
  grn?: { grn_number: string };
  created_by_profile?: { full_name: string };
  approved_by_profile?: { full_name: string };
  items?: RTVItem[];
}

export interface RTVItem {
  id: string;
  rtv_id: string;
  item_id: string;
  quantity: number;
  unit_cost: number;
  reason: string | null;
  batch_number: string | null;
  item?: { name: string; item_code: string };
}

export function useRTVs(status?: string) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["rtvs", status],
    queryFn: async () => {
      let query = (supabase as any)
        .from("return_to_vendor")
        .select("*, vendor:vendors(name, vendor_code), grn:goods_received_notes(grn_number), created_by_profile:profiles!return_to_vendor_created_by_fkey(full_name)")
        .eq("organization_id", profile?.organization_id)
        .order("created_at", { ascending: false });
      if (status && status !== "all") query = query.eq("status", status);
      const { data, error } = await query;
      if (error) throw error;
      return data as ReturnToVendor[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useRTV(id: string) {
  return useQuery({
    queryKey: ["rtv", id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("return_to_vendor")
        .select("*, vendor:vendors(name, vendor_code), grn:goods_received_notes(grn_number), created_by_profile:profiles!return_to_vendor_created_by_fkey(full_name), approved_by_profile:profiles!return_to_vendor_approved_by_fkey(full_name), items:rtv_items(*, item:inventory_items(name, item_code))")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as ReturnToVendor;
    },
    enabled: !!id,
  });
}

export function useCreateRTV() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (data: {
      vendor_id: string;
      grn_id?: string;
      store_id?: string;
      reason?: string;
      notes?: string;
      items: { item_id: string; quantity: number; unit_cost: number; reason?: string; batch_number?: string }[];
    }) => {
      const { items, ...rtvData } = data;
      const { data: rtv, error } = await (supabase as any)
        .from("return_to_vendor")
        .insert({ ...rtvData, organization_id: profile?.organization_id, created_by: profile?.id, rtv_number: "TEMP" })
        .select()
        .single();
      if (error) throw error;

      const rtvItems = items.map((i) => ({ ...i, rtv_id: rtv.id }));
      const { error: itemsError } = await (supabase as any).from("rtv_items").insert(rtvItems);
      if (itemsError) throw itemsError;

      return rtv;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rtvs"] });
      toast.success("Return to Vendor created");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useApproveRTV() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("return_to_vendor")
        .update({ status: "approved", approved_by: profile?.id, approved_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rtvs"] });
      queryClient.invalidateQueries({ queryKey: ["rtv"] });
      toast.success("RTV approved");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useShipRTV() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("return_to_vendor")
        .update({ status: "shipped", shipped_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rtvs"] });
      queryClient.invalidateQueries({ queryKey: ["rtv"] });
      toast.success("RTV marked as shipped");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useCompleteRTV() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("return_to_vendor")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rtvs"] });
      queryClient.invalidateQueries({ queryKey: ["rtv"] });
      toast.success("RTV completed");
    },
    onError: (e: any) => toast.error(e.message),
  });
}
