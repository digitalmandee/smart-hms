import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type POStatus = Database["public"]["Enums"]["po_status"];

export type POItemType = 'inventory' | 'medicine';

export interface PurchaseOrderItem {
  id?: string;
  purchase_order_id?: string;
  item_type: POItemType;
  item_id?: string;      // For inventory items
  medicine_id?: string;  // For medicines
  quantity: number;
  unit_price: number;
  tax_percent: number;
  discount_percent: number;
  total_price: number;
  received_quantity?: number;
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

export interface PurchaseOrder {
  id: string;
  organization_id: string;
  branch_id: string;
  store_id: string | null;
  po_number: string;
  vendor_id: string;
  order_date: string;
  expected_delivery_date: string | null;
  status: POStatus;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  terms: string | null;
  notes: string | null;
  created_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  vendor?: {
    id: string;
    vendor_code: string;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
  };
  store?: { id: string; name: string } | null;
  branch?: {
    id: string;
    name: string;
  };
  items?: PurchaseOrderItem[];
  created_by_profile?: {
    id: string;
    full_name: string;
  };
  approved_by_profile?: {
    id: string;
    full_name: string;
  };
}

export function usePurchaseOrders(filters?: { status?: POStatus; vendorId?: string }) {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["purchase-orders", profile?.organization_id, filters],
    queryFn: async () => {
      let query = supabase
        .from("purchase_orders")
        .select(`
          *,
          vendor:vendors(id, vendor_code, name, email, phone),
          branch:branches(id, name),
          created_by_profile:profiles!purchase_orders_created_by_fkey(id, full_name)
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
      return data as unknown as PurchaseOrder[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function usePurchaseOrder(id: string) {
  return useQuery({
    queryKey: ["purchase-order", id],
    queryFn: async () => {
      const { data: po, error } = await supabase
        .from("purchase_orders")
        .select(`
          *,
          vendor:vendors(id, vendor_code, name, email, phone, address, city),
          branch:branches(id, name),
          created_by_profile:profiles!purchase_orders_created_by_fkey(id, full_name),
          approved_by_profile:profiles!purchase_orders_approved_by_fkey(id, full_name)
        `)
        .eq("id", id)
        .single();
      
      if (error) throw error;
      
      // Get items with both inventory items and medicines
      const { data: items, error: itemsError } = await supabase
        .from("purchase_order_items")
        .select(`
          *,
          item:inventory_items(id, item_code, name, unit_of_measure),
          medicine:medicines(id, name, generic_name, unit)
        `)
        .eq("purchase_order_id", id);
      
      if (itemsError) throw itemsError;
      
      return { ...po, items } as PurchaseOrder;
    },
    enabled: !!id,
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();
  const { profile, user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: {
      vendor_id: string;
      branch_id: string;
      expected_delivery_date?: string;
      terms?: string;
      notes?: string;
      items: PurchaseOrderItem[];
    }) => {
      // Calculate totals
      const subtotal = data.items.reduce((sum, item) => {
        const itemTotal = item.quantity * item.unit_price;
        const discount = itemTotal * (item.discount_percent / 100);
        return sum + (itemTotal - discount);
      }, 0);
      
      const taxAmount = data.items.reduce((sum, item) => {
        const itemTotal = item.quantity * item.unit_price;
        const discount = itemTotal * (item.discount_percent / 100);
        const afterDiscount = itemTotal - discount;
        return sum + (afterDiscount * (item.tax_percent / 100));
      }, 0);
      
      const discountAmount = data.items.reduce((sum, item) => {
        const itemTotal = item.quantity * item.unit_price;
        return sum + (itemTotal * (item.discount_percent / 100));
      }, 0);
      
      const totalAmount = subtotal + taxAmount;
      
      // Create PO
      const { data: po, error } = await supabase
        .from("purchase_orders")
        .insert({
          organization_id: profile!.organization_id!,
          branch_id: data.branch_id,
          po_number: "", // Auto-generated
          vendor_id: data.vendor_id,
          expected_delivery_date: data.expected_delivery_date || null,
          terms: data.terms || null,
          notes: data.notes || null,
          subtotal,
          tax_amount: taxAmount,
          discount_amount: discountAmount,
          total_amount: totalAmount,
          created_by: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Create items - support both inventory and medicine items
      const itemsToInsert = data.items.map(item => ({
        purchase_order_id: po.id,
        item_type: item.item_type || 'inventory',
        item_id: item.item_type === 'medicine' ? null : item.item_id,
        medicine_id: item.item_type === 'medicine' ? item.medicine_id : null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax_percent: item.tax_percent,
        discount_percent: item.discount_percent,
        total_price: item.total_price,
      }));
      
      const { error: itemsError } = await supabase
        .from("purchase_order_items")
        .insert(itemsToInsert);
      
      if (itemsError) throw itemsError;
      
      return po;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      toast.success("Purchase order created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdatePurchaseOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, items, ...data }: {
      id: string;
      vendor_id?: string;
      expected_delivery_date?: string;
      terms?: string;
      notes?: string;
      items?: PurchaseOrderItem[];
    }) => {
      if (items) {
        // Calculate totals
        const subtotal = items.reduce((sum, item) => {
          const itemTotal = item.quantity * item.unit_price;
          const discount = itemTotal * (item.discount_percent / 100);
          return sum + (itemTotal - discount);
        }, 0);
        
        const taxAmount = items.reduce((sum, item) => {
          const itemTotal = item.quantity * item.unit_price;
          const discount = itemTotal * (item.discount_percent / 100);
          const afterDiscount = itemTotal - discount;
          return sum + (afterDiscount * (item.tax_percent / 100));
        }, 0);
        
        const discountAmount = items.reduce((sum, item) => {
          const itemTotal = item.quantity * item.unit_price;
          return sum + (itemTotal * (item.discount_percent / 100));
        }, 0);
        
        const totalAmount = subtotal + taxAmount;
        
        // Update PO
        const { error } = await supabase
          .from("purchase_orders")
          .update({
            ...data,
            subtotal,
            tax_amount: taxAmount,
            discount_amount: discountAmount,
            total_amount: totalAmount,
          })
          .eq("id", id);
        
        if (error) throw error;
        
        // Delete existing items and insert new ones
        await supabase
          .from("purchase_order_items")
          .delete()
          .eq("purchase_order_id", id);
        
        const itemsToInsert = items.map(item => ({
          purchase_order_id: id,
          item_type: item.item_type || 'inventory',
          item_id: item.item_type === 'medicine' ? null : item.item_id,
          medicine_id: item.item_type === 'medicine' ? item.medicine_id : null,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tax_percent: item.tax_percent,
          discount_percent: item.discount_percent,
          total_price: item.total_price,
        }));
        
        const { error: itemsError } = await supabase
          .from("purchase_order_items")
          .insert(itemsToInsert);
        
        if (itemsError) throw itemsError;
      } else {
        const { error } = await supabase
          .from("purchase_orders")
          .update(data)
          .eq("id", id);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-order"] });
      toast.success("Purchase order updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useApprovePurchaseOrder() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("purchase_orders")
        .update({
          status: "approved" as POStatus,
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-order"] });
      toast.success("Purchase order approved");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useSubmitPurchaseOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("purchase_orders")
        .update({ status: "pending_approval" as POStatus })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-order"] });
      toast.success("Purchase order submitted for approval");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useMarkPOAsOrdered() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("purchase_orders")
        .update({ status: "ordered" as POStatus })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-order"] });
      toast.success("Purchase order marked as ordered");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useCancelPurchaseOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("purchase_orders")
        .update({ status: "cancelled" as POStatus })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-order"] });
      toast.success("Purchase order cancelled");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
