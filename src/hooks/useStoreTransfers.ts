import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface StoreTransferItem {
  id?: string;
  transfer_id?: string;
  item_id: string;
  quantity_requested: number;
  quantity_sent: number;
  quantity_received: number;
  batch_number?: string | null;
  expiry_date?: string | null;
  notes?: string | null;
  item?: {
    id: string;
    item_code: string;
    name: string;
    unit_of_measure: string;
  };
}

export interface StoreTransfer {
  id: string;
  organization_id: string;
  transfer_number: string;
  from_store_id: string;
  to_store_id: string;
  status: string;
  requested_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  dispatched_by: string | null;
  dispatched_at: string | null;
  received_by: string | null;
  received_at: string | null;
  request_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  from_store?: { id: string; name: string };
  to_store?: { id: string; name: string };
  requested_by_profile?: { id: string; full_name: string };
  items?: StoreTransferItem[];
}

export function useStoreTransfers(filters?: { status?: string }) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["store-transfers", profile?.organization_id, filters],
    queryFn: async () => {
      let query = supabase
        .from("store_stock_transfers")
        .select(`
          *,
          from_store:stores!store_stock_transfers_from_store_id_fkey(id, name),
          to_store:stores!store_stock_transfers_to_store_id_fkey(id, name),
          requested_by_profile:profiles!store_stock_transfers_requested_by_fkey(id, full_name)
        `)
        .order("created_at", { ascending: false });

      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status as any);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as StoreTransfer[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useStoreTransfer(id: string) {
  return useQuery({
    queryKey: ["store-transfer", id],
    queryFn: async () => {
      const { data: transfer, error } = await supabase
        .from("store_stock_transfers")
        .select(`
          *,
          from_store:stores!store_stock_transfers_from_store_id_fkey(id, name),
          to_store:stores!store_stock_transfers_to_store_id_fkey(id, name),
          requested_by_profile:profiles!store_stock_transfers_requested_by_fkey(id, full_name)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;

      const { data: items, error: itemsError } = await supabase
        .from("store_stock_transfer_items")
        .select(`
          *,
          item:inventory_items(id, item_code, name, unit_of_measure)
        `)
        .eq("transfer_id", id);

      if (itemsError) throw itemsError;

      return { ...transfer, items } as unknown as StoreTransfer;
    },
    enabled: !!id,
  });
}

export function useCreateTransfer() {
  const queryClient = useQueryClient();
  const { profile, user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      from_store_id: string;
      to_store_id: string;
      notes?: string;
      items: StoreTransferItem[];
    }) => {
      const { data: transfer, error } = await supabase
        .from("store_stock_transfers")
        .insert({
          organization_id: profile!.organization_id!,
          transfer_number: "",
          from_store_id: data.from_store_id,
          to_store_id: data.to_store_id,
          requested_by: user?.id,
          notes: data.notes || null,
        })
        .select()
        .single();

      if (error) throw error;

      const itemsToInsert = data.items.map((item) => ({
        transfer_id: transfer.id,
        item_id: item.item_id,
        quantity_requested: item.quantity_requested,
        quantity_sent: 0,
        quantity_received: 0,
        batch_number: item.batch_number || null,
        expiry_date: item.expiry_date || null,
        notes: item.notes || null,
      }));

      const { error: itemsError } = await supabase
        .from("store_stock_transfer_items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      return transfer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-transfers"] });
      toast.success("Transfer created successfully");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useApproveTransfer() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("store_stock_transfers")
        .update({
          status: "approved",
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-transfers"] });
      queryClient.invalidateQueries({ queryKey: ["store-transfer"] });
      toast.success("Transfer approved");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDispatchTransfer() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, items }: { id: string; items: { id: string; quantity_sent: number }[] }) => {
      // Update items with sent quantities
      for (const item of items) {
        await supabase
          .from("store_stock_transfer_items")
          .update({ quantity_sent: item.quantity_sent })
          .eq("id", item.id);
      }

      const { error } = await supabase
        .from("store_stock_transfers")
        .update({
          status: "in_transit",
          dispatched_by: user?.id,
          dispatched_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-transfers"] });
      queryClient.invalidateQueries({ queryKey: ["store-transfer"] });
      toast.success("Transfer dispatched");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useReceiveTransfer() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, items }: { id: string; items: { id: string; quantity_received: number }[] }) => {
      for (const item of items) {
        await supabase
          .from("store_stock_transfer_items")
          .update({ quantity_received: item.quantity_received })
          .eq("id", item.id);
      }

      const { error } = await supabase
        .from("store_stock_transfers")
        .update({
          status: "received",
          received_by: user?.id,
          received_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-transfers"] });
      queryClient.invalidateQueries({ queryKey: ["store-transfer"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-stock"] });
      toast.success("Transfer received");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
