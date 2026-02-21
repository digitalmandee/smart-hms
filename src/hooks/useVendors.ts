import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type VendorType = 'pharmaceutical' | 'equipment' | 'consumables' | 'surgical' | 'services' | 'general' | 'manufacturer' | 'distributor' | 'wholesaler' | 'raw_materials' | 'packaging' | 'logistics';

export interface Vendor {
  id: string;
  organization_id: string;
  vendor_code: string;
  name: string;
  vendor_type: VendorType;
  is_preferred: boolean;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string;
  payment_terms: string;
  tax_number: string | null;
  bank_details: {
    bank_name?: string;
    account_number?: string;
    iban?: string;
  };
  rating: number;
  is_active: boolean;
  notes: string | null;
  ledger_account_id: string | null;
  created_at: string;
  updated_at: string;
}

export function useVendors(search?: string) {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["vendors", profile?.organization_id, search],
    queryFn: async () => {
      let query = supabase
        .from("vendors")
        .select("*")
        .eq("is_active", true)
        .order("name");
      
      if (search) {
        query = query.or(`name.ilike.%${search}%,vendor_code.ilike.%${search}%,contact_person.ilike.%${search}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Vendor[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useVendor(id: string) {
  return useQuery({
    queryKey: ["vendor", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data as Vendor;
    },
    enabled: !!id,
  });
}

export function useVendorPurchaseHistory(vendorId: string) {
  return useQuery({
    queryKey: ["vendor-purchase-history", vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchase_orders")
        .select(`
          id, po_number, order_date, status, total_amount,
          branch:branches(id, name)
        `)
        .eq("vendor_id", vendorId)
        .order("order_date", { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    },
    enabled: !!vendorId,
  });
}

export function useCreateVendor() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  
  return useMutation({
    mutationFn: async (data: Partial<Vendor>) => {
      const { data: result, error } = await supabase
        .from("vendors")
        .insert({
          organization_id: profile!.organization_id!,
          vendor_code: "", // Auto-generated
          name: data.name!,
          vendor_type: data.vendor_type || "general",
          is_preferred: data.is_preferred || false,
          contact_person: data.contact_person || null,
          email: data.email || null,
          phone: data.phone || null,
          address: data.address || null,
          city: data.city || null,
          country: data.country || "Pakistan",
          payment_terms: data.payment_terms || "Net 30",
          tax_number: data.tax_number || null,
          bank_details: data.bank_details || {},
          rating: data.rating || 3,
          notes: data.notes || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast.success("Vendor created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Vendor> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("vendors")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      queryClient.invalidateQueries({ queryKey: ["vendor"] });
      toast.success("Vendor updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteVendor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("vendors")
        .update({ is_active: false })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast.success("Vendor deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
