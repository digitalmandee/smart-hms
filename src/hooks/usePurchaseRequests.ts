import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface PurchaseRequestItem {
  id?: string;
  purchase_request_id?: string;
  item_id?: string;
  medicine_id?: string;
  quantity_requested: number;
  current_stock: number;
  reorder_level: number;
  estimated_unit_cost: number;
  notes?: string | null;
  item?: {
    id: string;
    item_code: string;
    name: string;
    unit_of_measure: string;
  };
  medicine?: {
    id: string;
    name: string;
    generic_name: string;
    unit: string;
  };
}

export interface PurchaseRequest {
  id: string;
  organization_id: string;
  branch_id: string;
  store_id: string | null;
  pr_number: string;
  requested_by: string | null;
  department: string | null;
  priority: number;
  status: string;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  branch?: { id: string; name: string };
  store?: { id: string; name: string } | null;
  requested_by_profile?: { id: string; full_name: string };
  approved_by_profile?: { id: string; full_name: string };
  items?: PurchaseRequestItem[];
}

export function usePurchaseRequests(filters?: { status?: string }) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["purchase-requests", profile?.organization_id, filters],
    queryFn: async () => {
      let query = supabase
        .from("purchase_requests")
        .select(`
          *,
          branch:branches(id, name),
          store:stores(id, name),
          requested_by_profile:profiles!purchase_requests_requested_by_fkey(id, full_name),
          approved_by_profile:profiles!purchase_requests_approved_by_fkey(id, full_name)
        `)
        .order("created_at", { ascending: false });

      if (filters?.status) {
        query = query.eq("status", filters.status as any);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as PurchaseRequest[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function usePurchaseRequest(id: string) {
  return useQuery({
    queryKey: ["purchase-request", id],
    queryFn: async () => {
      const { data: pr, error } = await supabase
        .from("purchase_requests")
        .select(`
          *,
          branch:branches(id, name),
          store:stores(id, name),
          requested_by_profile:profiles!purchase_requests_requested_by_fkey(id, full_name),
          approved_by_profile:profiles!purchase_requests_approved_by_fkey(id, full_name)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;

      const { data: items, error: itemsError } = await supabase
        .from("purchase_request_items")
        .select(`
          *,
          item:inventory_items(id, item_code, name, unit_of_measure),
          medicine:medicines(id, name, generic_name, unit)
        `)
        .eq("purchase_request_id", id);

      if (itemsError) throw itemsError;

      return { ...pr, items } as unknown as PurchaseRequest;
    },
    enabled: !!id,
  });
}

export function useCreatePurchaseRequest() {
  const queryClient = useQueryClient();
  const { profile, user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      branch_id: string;
      store_id?: string;
      department?: string;
      priority?: number;
      notes?: string;
      items: PurchaseRequestItem[];
    }) => {
      const { data: pr, error } = await supabase
        .from("purchase_requests")
        .insert({
          organization_id: profile!.organization_id!,
          branch_id: data.branch_id,
          store_id: data.store_id || null,
          pr_number: "",
          requested_by: user?.id,
          department: data.department || null,
          priority: data.priority || 0,
          notes: data.notes || null,
        })
        .select()
        .single();

      if (error) throw error;

      const itemsToInsert = data.items.map((item) => ({
        purchase_request_id: pr.id,
        item_id: item.item_id || null,
        medicine_id: item.medicine_id || null,
        quantity_requested: item.quantity_requested,
        current_stock: item.current_stock || 0,
        reorder_level: item.reorder_level || 0,
        estimated_unit_cost: item.estimated_unit_cost || 0,
        notes: item.notes || null,
      }));

      const { error: itemsError } = await supabase
        .from("purchase_request_items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;
      return pr;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-requests"] });
      toast.success("Purchase request created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useSubmitPurchaseRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("purchase_requests")
        .update({ status: "pending_approval" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-requests"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-request"] });
      toast.success("Purchase request submitted for approval");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useApprovePurchaseRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("purchase_requests")
        .update({
          status: "approved",
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-requests"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-request"] });
      toast.success("Purchase request approved");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useRejectPurchaseRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { error } = await supabase
        .from("purchase_requests")
        .update({
          status: "rejected",
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
          rejection_reason: reason || null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-requests"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-request"] });
      toast.success("Purchase request rejected");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useConvertPRtoPO() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Guard: only approved PRs can be converted
      const { data: pr, error: fetchError } = await supabase
        .from("purchase_requests")
        .select("status")
        .eq("id", id)
        .single();
      if (fetchError) throw fetchError;
      if (pr?.status !== "approved") {
        throw new Error("Only approved purchase requests can be converted to a purchase order");
      }

      const { error } = await supabase
        .from("purchase_requests")
        .update({ status: "converted" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-requests"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-request"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
