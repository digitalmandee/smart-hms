import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const queryTable = (table: string): any => (supabase as any).from(table);

interface CreatePickListData {
  store_id: string;
  pick_strategy: string;
  priority: number;
  assigned_to?: string;
  notes?: string;
  source_type?: string;
  source_id?: string;
  items: {
    item_id?: string;
    medicine_id?: string;
    quantity_required: number;
    bin_id?: string;
    batch_number?: string;
    expiry_date?: string;
    pick_sequence: number;
  }[];
}

interface CreatePackingSlipData {
  store_id: string;
  pick_list_id?: string;
  source_type?: string;
  source_id?: string;
  notes?: string;
  items: {
    item_id?: string;
    medicine_id?: string;
    quantity: number;
    batch_number?: string;
    box_number?: number;
    notes?: string;
  }[];
}

export function useCreatePickList() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (data: CreatePickListData) => {
      const { items, ...listData } = data;
      const { data: list, error } = await queryTable("pick_lists")
        .insert({ ...listData, organization_id: profile!.organization_id, status: "draft" })
        .select()
        .single();
      if (error) throw error;
      if (items.length > 0) {
        const itemsToInsert = items.map((item) => ({
          ...item,
          pick_list_id: list.id,
          quantity_picked: 0,
          status: "pending",
        }));
        const { error: itemsError } = await queryTable("pick_list_items").insert(itemsToInsert);
        if (itemsError) throw itemsError;
      }
      return list;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pick-lists"] });
      toast.success("Pick list created");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useCreatePackingSlip() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (data: CreatePackingSlipData) => {
      const { items, ...slipData } = data;
      const { data: slip, error } = await queryTable("packing_slips")
        .insert({
          ...slipData,
          organization_id: profile!.organization_id,
          status: "draft",
          total_items: items.reduce((sum, i) => sum + i.quantity, 0),
          box_count: Math.max(...items.map((i) => i.box_number || 1), 1),
        })
        .select()
        .single();
      if (error) throw error;
      if (items.length > 0) {
        const itemsToInsert = items.map((item) => ({
          ...item,
          packing_slip_id: slip.id,
        }));
        const { error: itemsError } = await queryTable("packing_slip_items").insert(itemsToInsert);
        if (itemsError) throw itemsError;
      }
      return slip;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["packing-slips"] });
      toast.success("Packing slip created");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
