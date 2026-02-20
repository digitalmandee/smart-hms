import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const queryTable = (table: string): any => (supabase as any).from(table);

export interface PickList {
  id: string;
  organization_id: string;
  store_id: string;
  pick_list_number: string;
  source_type: string | null;
  source_id: string | null;
  status: string;
  assigned_to: string | null;
  priority: number;
  pick_strategy: string;
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PickListItem {
  id: string;
  pick_list_id: string;
  item_id: string | null;
  medicine_id: string | null;
  quantity_required: number;
  quantity_picked: number;
  bin_id: string | null;
  batch_number: string | null;
  expiry_date: string | null;
  pick_sequence: number;
  status: string;
  picked_at: string | null;
  notes: string | null;
  bin?: { id: string; bin_code: string };
}

export interface PackingSlip {
  id: string;
  organization_id: string;
  store_id: string;
  packing_slip_number: string;
  pick_list_id: string | null;
  source_type: string | null;
  source_id: string | null;
  status: string;
  packed_by: string | null;
  verified_by: string | null;
  total_items: number;
  total_weight: number | null;
  box_count: number;
  packed_at: string | null;
  verified_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PackingSlipItem {
  id: string;
  packing_slip_id: string;
  item_id: string | null;
  medicine_id: string | null;
  quantity: number;
  batch_number: string | null;
  box_number: number | null;
  notes: string | null;
}

// Pick Lists
export function usePickLists(storeId?: string, status?: string) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["pick-lists", storeId, status],
    queryFn: async () => {
      let query = queryTable("pick_lists")
        .select("*")
        .eq("organization_id", profile!.organization_id)
        .order("created_at", { ascending: false });
      if (storeId && storeId !== "all") query = query.eq("store_id", storeId);
      if (status && status !== "all") query = query.eq("status", status);
      const { data, error } = await query;
      if (error) throw error;
      return data as PickList[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function usePickList(id?: string) {
  return useQuery({
    queryKey: ["pick-list", id],
    queryFn: async () => {
      const { data, error } = await queryTable("pick_lists").select("*").eq("id", id!).single();
      if (error) throw error;
      return data as PickList;
    },
    enabled: !!id,
  });
}

export function usePickListItems(pickListId?: string) {
  return useQuery({
    queryKey: ["pick-list-items", pickListId],
    queryFn: async () => {
      const { data, error } = await queryTable("pick_list_items")
        .select("*, bin:warehouse_bins(id, bin_code)")
        .eq("pick_list_id", pickListId!)
        .order("pick_sequence");
      if (error) throw error;
      return data as PickListItem[];
    },
    enabled: !!pickListId,
  });
}

export function useUpdatePickListItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; quantity_picked?: number; status?: string; picked_at?: string }) => {
      const { data: item, error } = await queryTable("pick_list_items").update(data).eq("id", id).select().single();
      if (error) throw error;
      return item;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pick-list-items"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdatePickList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; status?: string; started_at?: string; completed_at?: string }) => {
      const { data: list, error } = await queryTable("pick_lists").update(data).eq("id", id).select().single();
      if (error) throw error;
      return list;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pick-lists"] }); qc.invalidateQueries({ queryKey: ["pick-list"] }); toast.success("Pick list updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

// Packing Slips
export function usePackingSlips(storeId?: string, status?: string) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["packing-slips", storeId, status],
    queryFn: async () => {
      let query = queryTable("packing_slips")
        .select("*")
        .eq("organization_id", profile!.organization_id)
        .order("created_at", { ascending: false });
      if (storeId && storeId !== "all") query = query.eq("store_id", storeId);
      if (status && status !== "all") query = query.eq("status", status);
      const { data, error } = await query;
      if (error) throw error;
      return data as PackingSlip[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function usePackingSlip(id?: string) {
  return useQuery({
    queryKey: ["packing-slip", id],
    queryFn: async () => {
      const { data, error } = await queryTable("packing_slips").select("*").eq("id", id!).single();
      if (error) throw error;
      return data as PackingSlip;
    },
    enabled: !!id,
  });
}

export function usePackingSlipItems(slipId?: string) {
  return useQuery({
    queryKey: ["packing-slip-items", slipId],
    queryFn: async () => {
      const { data, error } = await queryTable("packing_slip_items").select("*").eq("packing_slip_id", slipId!).order("box_number");
      if (error) throw error;
      return data as PackingSlipItem[];
    },
    enabled: !!slipId,
  });
}

export function useUpdatePackingSlip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; status?: string; verified_at?: string; packed_at?: string; total_weight?: number; box_count?: number }) => {
      const { data: slip, error } = await queryTable("packing_slips").update(data).eq("id", id).select().single();
      if (error) throw error;
      return slip;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["packing-slips"] }); qc.invalidateQueries({ queryKey: ["packing-slip"] }); toast.success("Packing slip updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}
