import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface SurgeryConsumable {
  id: string;
  surgery_id: string;
  item_name: string;
  item_category: string | null;
  inventory_item_id: string | null;
  quantity: number;
  unit: string | null;
  unit_price: number | null;
  total_price: number | null;
  lot_number: string | null;
  batch_number: string | null;
  serial_number: string | null;
  expiry_date: string | null;
  is_implant: boolean;
  implant_location: string | null;
  implant_size: string | null;
  manufacturer: string | null;
  is_billable: boolean;
  billed_to_invoice_id: string | null;
  added_by: string | null;
  organization_id: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  added_by_profile?: { full_name: string } | null;
}

export interface CreateConsumableData {
  surgery_id: string;
  item_name: string;
  item_category?: string;
  inventory_item_id?: string;
  quantity?: number;
  unit?: string;
  unit_price?: number;
  lot_number?: string;
  batch_number?: string;
  serial_number?: string;
  expiry_date?: string;
  is_implant?: boolean;
  implant_location?: string;
  implant_size?: string;
  manufacturer?: string;
  is_billable?: boolean;
}

// Common consumable categories
export const CONSUMABLE_CATEGORIES = [
  { value: 'suture', label: 'Sutures' },
  { value: 'implant', label: 'Implants' },
  { value: 'disposable', label: 'Disposables' },
  { value: 'dressing', label: 'Dressings' },
  { value: 'catheter', label: 'Catheters & Drains' },
  { value: 'stapler', label: 'Staplers' },
  { value: 'mesh', label: 'Mesh/Graft' },
  { value: 'instrument', label: 'Instruments (single-use)' },
  { value: 'other', label: 'Other' },
];

export function useSurgeryConsumables(surgeryId?: string) {
  return useQuery({
    queryKey: ['surgery-consumables', surgeryId],
    queryFn: async () => {
      if (!surgeryId) return [];

      const { data, error } = await supabase
        .from('surgery_consumables')
        .select(`
          *,
          added_by_profile:profiles!surgery_consumables_added_by_fkey(full_name)
        `)
        .eq('surgery_id', surgeryId)
        .order('is_implant', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as SurgeryConsumable[];
    },
    enabled: !!surgeryId,
  });
}

export function useCreateConsumable() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (consumable: CreateConsumableData) => {
      const quantity = consumable.quantity || 1;
      const unitPrice = consumable.unit_price || 0;
      
      const { data, error } = await supabase
        .from('surgery_consumables')
        .insert({
          surgery_id: consumable.surgery_id,
          item_name: consumable.item_name,
          item_category: consumable.item_category,
          inventory_item_id: consumable.inventory_item_id,
          quantity: quantity,
          unit: consumable.unit || 'pcs',
          unit_price: unitPrice,
          total_price: quantity * unitPrice,
          lot_number: consumable.lot_number,
          batch_number: consumable.batch_number,
          serial_number: consumable.serial_number,
          expiry_date: consumable.expiry_date,
          is_implant: consumable.is_implant || false,
          implant_location: consumable.implant_location,
          implant_size: consumable.implant_size,
          manufacturer: consumable.manufacturer,
          is_billable: consumable.is_billable ?? true,
          added_by: profile?.id,
          organization_id: profile?.organization_id!,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['surgery-consumables', variables.surgery_id] });
      toast.success(variables.is_implant ? 'Implant added' : 'Consumable added');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add consumable');
    },
  });
}

export function useUpdateConsumable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, surgeryId, ...updates }: Partial<SurgeryConsumable> & { id: string; surgeryId: string }) => {
      const { data, error } = await supabase
        .from('surgery_consumables')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, surgeryId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['surgery-consumables', result.surgeryId] });
      toast.success('Consumable updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update consumable');
    },
  });
}

export function useDeleteConsumable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ consumableId, surgeryId }: { consumableId: string; surgeryId: string }) => {
      const { error } = await supabase
        .from('surgery_consumables')
        .delete()
        .eq('id', consumableId);

      if (error) throw error;
      return { surgeryId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['surgery-consumables', result.surgeryId] });
      toast.success('Consumable removed');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to remove consumable');
    },
  });
}

// Get total consumables cost for a surgery
export function useConsumablesTotalCost(surgeryId?: string) {
  const { data: consumables } = useSurgeryConsumables(surgeryId);
  
  if (!consumables) return { total: 0, billable: 0, implants: 0 };
  
  const total = consumables.reduce((sum, c) => sum + (c.total_price || 0), 0);
  const billable = consumables.filter(c => c.is_billable).reduce((sum, c) => sum + (c.total_price || 0), 0);
  const implants = consumables.filter(c => c.is_implant).reduce((sum, c) => sum + (c.total_price || 0), 0);
  
  return { total, billable, implants };
}
