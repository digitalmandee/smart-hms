import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface ItemVendorMapping {
  id: string;
  organization_id: string;
  item_id: string | null;
  medicine_id: string | null;
  vendor_id: string;
  is_preferred: boolean;
  last_purchase_price: number | null;
  last_purchase_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  vendor?: {
    id: string;
    name: string;
    vendor_code: string;
    vendor_type: string;
  };
}

// Get all vendor mappings for an inventory item
export function useItemVendorMappings(itemId: string) {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["item-vendor-mappings", itemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("item_vendor_mapping")
        .select(`
          *,
          vendor:vendors(id, name, vendor_code, vendor_type)
        `)
        .eq("item_id", itemId);
      
      if (error) throw error;
      return data as ItemVendorMapping[];
    },
    enabled: !!itemId && !!profile?.organization_id,
  });
}

// Get all vendor mappings for a medicine
export function useMedicineVendorMappings(medicineId: string) {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["medicine-vendor-mappings", medicineId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("item_vendor_mapping")
        .select(`
          *,
          vendor:vendors(id, name, vendor_code, vendor_type)
        `)
        .eq("medicine_id", medicineId);
      
      if (error) throw error;
      return data as ItemVendorMapping[];
    },
    enabled: !!medicineId && !!profile?.organization_id,
  });
}

// Get preferred vendor for an item
export function usePreferredVendor(itemId?: string, medicineId?: string) {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["preferred-vendor", itemId, medicineId],
    queryFn: async () => {
      let query = supabase
        .from("item_vendor_mapping")
        .select(`
          *,
          vendor:vendors(id, name, vendor_code, vendor_type, phone, email)
        `)
        .eq("is_preferred", true);
      
      if (itemId) {
        query = query.eq("item_id", itemId);
      } else if (medicineId) {
        query = query.eq("medicine_id", medicineId);
      } else {
        return null;
      }
      
      const { data, error } = await query.maybeSingle();
      
      if (error) throw error;
      return data as ItemVendorMapping | null;
    },
    enabled: !!(itemId || medicineId) && !!profile?.organization_id,
  });
}

// Create item-vendor mapping
export function useCreateItemVendorMapping() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  
  return useMutation({
    mutationFn: async (data: {
      item_id?: string;
      medicine_id?: string;
      vendor_id: string;
      is_preferred?: boolean;
      last_purchase_price?: number;
      notes?: string;
    }) => {
      // If setting as preferred, unset other preferred mappings for this item
      if (data.is_preferred) {
        if (data.item_id) {
          await supabase
            .from("item_vendor_mapping")
            .update({ is_preferred: false })
            .eq("item_id", data.item_id)
            .eq("is_preferred", true);
        } else if (data.medicine_id) {
          await supabase
            .from("item_vendor_mapping")
            .update({ is_preferred: false })
            .eq("medicine_id", data.medicine_id)
            .eq("is_preferred", true);
        }
      }
      
      const { data: result, error } = await supabase
        .from("item_vendor_mapping")
        .insert({
          organization_id: profile!.organization_id!,
          item_id: data.item_id || null,
          medicine_id: data.medicine_id || null,
          vendor_id: data.vendor_id,
          is_preferred: data.is_preferred || false,
          last_purchase_price: data.last_purchase_price || null,
          notes: data.notes || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["item-vendor-mappings"] });
      queryClient.invalidateQueries({ queryKey: ["medicine-vendor-mappings"] });
      queryClient.invalidateQueries({ queryKey: ["preferred-vendor"] });
      toast.success("Vendor mapping created");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Update item-vendor mapping
export function useUpdateItemVendorMapping() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<ItemVendorMapping> & { id: string }) => {
      // If setting as preferred, unset other preferred mappings
      if (data.is_preferred) {
        const { data: existing } = await supabase
          .from("item_vendor_mapping")
          .select("item_id, medicine_id")
          .eq("id", id)
          .single();
        
        if (existing?.item_id) {
          await supabase
            .from("item_vendor_mapping")
            .update({ is_preferred: false })
            .eq("item_id", existing.item_id)
            .neq("id", id)
            .eq("is_preferred", true);
        } else if (existing?.medicine_id) {
          await supabase
            .from("item_vendor_mapping")
            .update({ is_preferred: false })
            .eq("medicine_id", existing.medicine_id)
            .neq("id", id)
            .eq("is_preferred", true);
        }
      }
      
      const { data: result, error } = await supabase
        .from("item_vendor_mapping")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item-vendor-mappings"] });
      queryClient.invalidateQueries({ queryKey: ["medicine-vendor-mappings"] });
      queryClient.invalidateQueries({ queryKey: ["preferred-vendor"] });
      toast.success("Vendor mapping updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Delete item-vendor mapping
export function useDeleteItemVendorMapping() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("item_vendor_mapping")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item-vendor-mappings"] });
      queryClient.invalidateQueries({ queryKey: ["medicine-vendor-mappings"] });
      queryClient.invalidateQueries({ queryKey: ["preferred-vendor"] });
      toast.success("Vendor mapping removed");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Update last purchase price from GRN/PO
export function useUpdateLastPurchasePrice() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  
  return useMutation({
    mutationFn: async (data: {
      item_id?: string;
      medicine_id?: string;
      vendor_id: string;
      price: number;
    }) => {
      // Check if mapping exists
      let query = supabase
        .from("item_vendor_mapping")
        .select("id")
        .eq("vendor_id", data.vendor_id);
      
      if (data.item_id) {
        query = query.eq("item_id", data.item_id);
      } else if (data.medicine_id) {
        query = query.eq("medicine_id", data.medicine_id);
      }
      
      const { data: existing } = await query.maybeSingle();
      
      if (existing) {
        // Update existing mapping
        const { error } = await supabase
          .from("item_vendor_mapping")
          .update({
            last_purchase_price: data.price,
            last_purchase_date: new Date().toISOString().split('T')[0],
          })
          .eq("id", existing.id);
        
        if (error) throw error;
      } else {
        // Create new mapping
        const { error } = await supabase
          .from("item_vendor_mapping")
          .insert({
            organization_id: profile!.organization_id!,
            item_id: data.item_id || null,
            medicine_id: data.medicine_id || null,
            vendor_id: data.vendor_id,
            last_purchase_price: data.price,
            last_purchase_date: new Date().toISOString().split('T')[0],
            is_preferred: false,
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item-vendor-mappings"] });
      queryClient.invalidateQueries({ queryKey: ["medicine-vendor-mappings"] });
    },
  });
}
