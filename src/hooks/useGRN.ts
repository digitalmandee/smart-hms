import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type GRNStatus = Database["public"]["Enums"]["grn_status"];

export type GRNItemType = 'inventory' | 'medicine';

export interface GRNItem {
  id?: string;
  grn_id?: string;
  po_item_id?: string | null;
  item_type: GRNItemType;
  item_id?: string;       // For inventory items
  medicine_id?: string;   // For medicines
  quantity_received: number;
  quantity_accepted: number;
  quantity_rejected: number;
  rejection_reason?: string | null;
  batch_number?: string | null;
  expiry_date?: string | null;
  unit_cost: number;
  selling_price?: number | null;  // For medicine items (pharmacy markup)
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

export interface GoodsReceivedNote {
  id: string;
  organization_id: string;
  branch_id: string;
  grn_number: string;
  purchase_order_id: string | null;
  vendor_id: string;
  received_date: string;
  invoice_number: string | null;
  invoice_date: string | null;
  invoice_amount: number | null;
  status: GRNStatus;
  notes: string | null;
  received_by: string | null;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
  vendor?: {
    id: string;
    vendor_code: string;
    name: string;
  };
  branch?: {
    id: string;
    name: string;
  };
  purchase_order?: {
    id: string;
    po_number: string;
  };
  items?: GRNItem[];
  received_by_profile?: {
    id: string;
    full_name: string;
  };
  verified_by_profile?: {
    id: string;
    full_name: string;
  };
}

export function useGRNs(filters?: { status?: GRNStatus; vendorId?: string }) {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["grns", profile?.organization_id, filters],
    queryFn: async () => {
      let query = supabase
        .from("goods_received_notes")
        .select(`
          *,
          vendor:vendors(id, vendor_code, name),
          branch:branches(id, name),
          store:stores(id, name),
          purchase_order:purchase_orders(id, po_number),
          received_by_profile:profiles!goods_received_notes_received_by_fkey(id, full_name)
        `)
        .order("created_at", { ascending: false });
      
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      
      if (filters?.vendorId) {
        query = query.eq("vendor_id", filters.vendorId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as GoodsReceivedNote[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useGRN(id: string) {
  return useQuery({
    queryKey: ["grn", id],
    queryFn: async () => {
      const { data: grn, error } = await supabase
        .from("goods_received_notes")
        .select(`
          *,
          vendor:vendors(id, vendor_code, name),
          branch:branches(id, name),
          purchase_order:purchase_orders(id, po_number),
          received_by_profile:profiles!goods_received_notes_received_by_fkey(id, full_name),
          verified_by_profile:profiles!goods_received_notes_verified_by_fkey(id, full_name)
        `)
        .eq("id", id)
        .single();
      
      if (error) throw error;
      
      // Get items with both inventory items and medicines
      const { data: items, error: itemsError } = await supabase
        .from("grn_items")
        .select(`
          *,
          item:inventory_items(id, item_code, name, unit_of_measure),
          medicine:medicines(id, name, generic_name, unit)
        `)
        .eq("grn_id", id);
      
      if (itemsError) throw itemsError;
      
      return { ...grn, items } as GoodsReceivedNote;
    },
    enabled: !!id,
  });
}

export function useCreateGRN() {
  const queryClient = useQueryClient();
  const { profile, user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: {
      vendor_id: string;
      branch_id: string;
      store_id?: string;
      purchase_order_id?: string;
      requisition_id?: string;
      invoice_number?: string;
      invoice_date?: string;
      invoice_amount?: number;
      notes?: string;
      items: GRNItem[];
    }) => {
      // Create GRN
      const { data: grn, error } = await supabase
        .from("goods_received_notes")
        .insert({
          organization_id: profile!.organization_id!,
          branch_id: data.branch_id,
          store_id: data.store_id || null,
          grn_number: "", // Auto-generated
          vendor_id: data.vendor_id,
          purchase_order_id: data.purchase_order_id || null,
          requisition_id: data.requisition_id || null,
          invoice_number: data.invoice_number || null,
          invoice_date: data.invoice_date || null,
          invoice_amount: data.invoice_amount || null,
          notes: data.notes || null,
          received_by: user?.id,
        } as any)
        .select()
        .single();
      
      if (error) throw error;
      
      // Create items - support both inventory and medicine items
      const itemsToInsert = data.items.map(item => ({
        grn_id: grn.id,
        po_item_id: item.po_item_id || null,
        item_type: item.item_type || 'inventory',
        item_id: item.item_type === 'medicine' ? null : item.item_id,
        medicine_id: item.item_type === 'medicine' ? item.medicine_id : null,
        quantity_received: item.quantity_received,
        quantity_accepted: item.quantity_accepted,
        quantity_rejected: item.quantity_rejected,
        rejection_reason: item.rejection_reason || null,
        batch_number: item.batch_number || null,
        expiry_date: item.expiry_date || null,
        unit_cost: item.unit_cost,
        selling_price: item.selling_price || null,
      }));
      
      const { error: itemsError } = await supabase
        .from("grn_items")
        .insert(itemsToInsert);
      
      if (itemsError) throw itemsError;
      
      return grn;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grns"] });
      toast.success("Goods received note created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useVerifyGRN() {
  const queryClient = useQueryClient();
  const { profile, user } = useAuth();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Get GRN with items
      const { data: grn } = await supabase
        .from("goods_received_notes")
        .select("*, items:grn_items(*)")
        .eq("id", id)
        .single();
      
      if (!grn) throw new Error("GRN not found");
      
      // Update GRN status
      const { error: updateError } = await supabase
        .from("goods_received_notes")
        .update({
          status: "verified" as GRNStatus,
          verified_by: user?.id,
          verified_at: new Date().toISOString(),
        })
        .eq("id", id);
      
      if (updateError) throw updateError;
      
      // Add to appropriate stock table based on item type
      for (const item of grn.items) {
        if (item.quantity_accepted > 0) {
          const itemType = item.item_type || 'inventory';
          
          if (itemType === 'medicine') {
            // Add to medicine_inventory for pharmacy items
            const { error: stockError } = await supabase
              .from("medicine_inventory")
              .insert({
                medicine_id: item.medicine_id,
                branch_id: grn.branch_id,
                store_id: grn.store_id || null,
                batch_number: item.batch_number,
                quantity: item.quantity_accepted,
                unit_price: item.unit_cost,
                selling_price: item.selling_price || item.unit_cost,
                expiry_date: item.expiry_date,
                vendor_id: grn.vendor_id,
                supplier_name: null,
                organization_id: profile!.organization_id!,
              });
            
            if (stockError) throw stockError;
          } else {
            // Add to inventory_stock for general items
            const { error: stockError } = await supabase
              .from("inventory_stock")
              .insert({
                item_id: item.item_id,
                branch_id: grn.branch_id,
                store_id: grn.store_id || null,
                batch_number: item.batch_number,
                quantity: item.quantity_accepted,
                unit_cost: item.unit_cost,
                expiry_date: item.expiry_date,
                vendor_id: grn.vendor_id,
                grn_id: grn.id,
              });
            
            if (stockError) throw stockError;
          }
        }
      }
      
      // Update PO received quantities if linked
      if (grn.purchase_order_id) {
        for (const item of grn.items) {
          if (item.po_item_id) {
            // Get current received quantity
            const { data: poItem } = await supabase
              .from("purchase_order_items")
              .select("received_quantity")
              .eq("id", item.po_item_id)
              .single();
            
            const newReceived = (poItem?.received_quantity || 0) + item.quantity_accepted;
            
            await supabase
              .from("purchase_order_items")
              .update({ received_quantity: newReceived })
              .eq("id", item.po_item_id);
          }
        }
        
        // Check if PO is fully received
        const { data: poItems } = await supabase
          .from("purchase_order_items")
          .select("quantity, received_quantity")
          .eq("purchase_order_id", grn.purchase_order_id);
        
        const allReceived = poItems?.every(i => i.received_quantity >= i.quantity);
        const someReceived = poItems?.some(i => i.received_quantity > 0);
        
        const newStatus = allReceived ? "received" : someReceived ? "partially_received" : "ordered";
        
        await supabase
          .from("purchase_orders")
          .update({ status: newStatus })
          .eq("id", grn.purchase_order_id);
      }
      
      // If GRN is linked to a requisition, mark it as 'issued' so requester can accept
      const grnRequisitionId = (grn as any).requisition_id;
      if (grnRequisitionId) {
        await supabase
          .from("stock_requisitions")
          .update({ status: "issued" } as any)
          .eq("id", grnRequisitionId);
      }

      // Create stock adjustment records and update item-vendor mappings
      for (const item of grn.items) {
        if (item.quantity_accepted > 0) {
          // Query actual current stock for accurate audit trail
          let previousQty = 0;
          if (item.item_id) {
            const { data: stockRows } = await supabase
              .from("inventory_stock")
              .select("quantity")
              .eq("item_id", item.item_id)
              .eq("branch_id", grn.branch_id);
            previousQty = (stockRows || []).reduce((s, r) => s + (r.quantity || 0), 0);
          }

          await supabase
            .from("stock_adjustments")
            .insert({
              organization_id: profile!.organization_id!,
              branch_id: grn.branch_id,
              item_id: item.item_id,
              adjustment_type: "increase",
              quantity: item.quantity_accepted,
              previous_quantity: previousQty,
              new_quantity: previousQty + item.quantity_accepted,
              reason: `GRN: ${grn.grn_number}`,
              reference_type: "grn",
              reference_id: grn.id,
              adjusted_by: user?.id,
            });
          
          // Update item-vendor mapping with last purchase price
          if (grn.vendor_id && item.unit_cost) {
            const itemKey = item.item_type === 'medicine' ? 'medicine_id' : 'item_id';
            const itemValue = item.item_type === 'medicine' ? item.medicine_id : item.item_id;
            
            if (itemValue) {
              // Check if mapping exists
              const { data: existingMapping } = await supabase
                .from("item_vendor_mapping")
                .select("id")
                .eq("vendor_id", grn.vendor_id)
                .eq(itemKey, itemValue)
                .maybeSingle();
              
              if (existingMapping) {
                // Update existing mapping
                await supabase
                  .from("item_vendor_mapping")
                  .update({
                    last_purchase_price: item.unit_cost,
                    last_purchase_date: new Date().toISOString().split('T')[0],
                  })
                  .eq("id", existingMapping.id);
              } else {
                // Create new mapping
                await supabase
                  .from("item_vendor_mapping")
                  .insert({
                    organization_id: profile!.organization_id!,
                    [itemKey]: itemValue,
                    vendor_id: grn.vendor_id,
                    last_purchase_price: item.unit_cost,
                    last_purchase_date: new Date().toISOString().split('T')[0],
                    is_preferred: false,
                  });
              }
            }
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grns"] });
      queryClient.invalidateQueries({ queryKey: ["grn"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-stock"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      toast.success("GRN verified and stock updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function usePostGRN() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("goods_received_notes")
        .update({ status: "posted" as GRNStatus })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grns"] });
      queryClient.invalidateQueries({ queryKey: ["grn"] });
      toast.success("GRN posted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
