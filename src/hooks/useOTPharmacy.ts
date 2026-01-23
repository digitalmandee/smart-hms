import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface OTMedicationRequest {
  id: string;
  surgery_id: string;
  medication_name: string;
  dosage: string | null;
  route: string | null;
  timing: 'pre_op' | 'intra_op' | 'post_op';
  scheduled_time: string | null;
  status: string;
  pharmacy_status: 'not_required' | 'requested' | 'dispensed' | 'cancelled';
  notes: string | null;
  ordered_at: string | null;
  organization_id: string;
  created_at: string;
  // Joined fields
  surgery?: {
    surgery_number: string;
    scheduled_date: string;
    status: string;
    patient?: {
      id: string;
      full_name: string;
      patient_number: string;
    };
    procedure?: {
      name: string;
    };
  };
  ordered_by_profile?: { full_name: string } | null;
}

export interface DispenseData {
  medicationId: string;
  surgeryId: string;
  inventoryItemId: string;
  batchNumber: string;
  unitPrice: number;
}

// Fetch pending OT medication requests for pharmacy queue
export function useOTMedicationQueue() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['ot-medication-queue', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('surgery_medications')
        .select(`
          *,
          surgery:surgeries!surgery_medications_surgery_id_fkey(
            surgery_number,
            scheduled_date,
            status,
            patient:patients!surgeries_patient_id_fkey(id, full_name, patient_number),
            procedure:surgery_types!surgeries_surgery_type_id_fkey(name)
          ),
          ordered_by_profile:profiles!surgery_medications_ordered_by_fkey(full_name)
        `)
        .eq('organization_id', profile.organization_id)
        .eq('pharmacy_status', 'requested')
        .in('status', ['pending'])
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as unknown as OTMedicationRequest[];
    },
    enabled: !!profile?.organization_id,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

// Dispense medication from pharmacy to OT
export function useDispenseOTMedication() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({ medicationId, surgeryId, inventoryItemId, batchNumber, unitPrice }: DispenseData) => {
      // 1. Get current inventory quantity
      const { data: inventory, error: invError } = await supabase
        .from('medicine_inventory')
        .select('id, quantity, medicine_id')
        .eq('id', inventoryItemId)
        .single();

      if (invError || !inventory) throw new Error('Inventory item not found');
      if (inventory.quantity < 1) throw new Error('Insufficient stock');

      // 2. Deduct from inventory
      const { error: deductError } = await supabase
        .from('medicine_inventory')
        .update({ quantity: inventory.quantity - 1 })
        .eq('id', inventoryItemId);

      if (deductError) throw deductError;

      // 3. Log stock movement
      const { error: movementError } = await supabase
        .from('pharmacy_stock_movements')
        .insert({
          organization_id: profile?.organization_id!,
          branch_id: profile?.branch_id!,
          medicine_id: inventory.medicine_id,
          inventory_id: inventoryItemId,
          movement_type: 'ot_dispense',
          quantity: -1,
          previous_stock: inventory.quantity,
          new_stock: inventory.quantity - 1,
          reference_type: 'surgery_medication',
          reference_id: medicationId,
          batch_number: batchNumber,
          unit_cost: unitPrice,
          total_value: unitPrice,
          notes: 'OT Medication Dispense',
          created_by: profile?.id,
        });

      if (movementError) {
        console.error('Stock movement log error:', movementError);
        // Don't fail the whole operation for logging error
      }

      // 4. Update surgery medication record
      const { data, error } = await supabase
        .from('surgery_medications')
        .update({
          pharmacy_status: 'dispensed',
          inventory_item_id: inventoryItemId,
          batch_number: batchNumber,
          unit_price: unitPrice,
          dispensed_by: profile?.id,
          dispensed_at: new Date().toISOString(),
        })
        .eq('id', medicationId)
        .select()
        .single();

      if (error) throw error;
      return { data, surgeryId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['ot-medication-queue'] });
      queryClient.invalidateQueries({ queryKey: ['surgery-medications', result.surgeryId] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Medication dispensed to OT');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to dispense medication');
    },
  });
}

// Cancel pharmacy request
export function useCancelOTMedicationRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ medicationId, surgeryId }: { medicationId: string; surgeryId: string }) => {
      const { data, error } = await supabase
        .from('surgery_medications')
        .update({ pharmacy_status: 'cancelled' })
        .eq('id', medicationId)
        .select()
        .single();

      if (error) throw error;
      return { data, surgeryId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['ot-medication-queue'] });
      queryClient.invalidateQueries({ queryKey: ['surgery-medications', result.surgeryId] });
      toast.success('Pharmacy request cancelled');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to cancel request');
    },
  });
}

// Get count of pending OT medication requests
export function useOTMedicationQueueCount() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['ot-medication-queue-count', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return 0;

      const { count, error } = await supabase
        .from('surgery_medications')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', profile.organization_id)
        .eq('pharmacy_status', 'requested')
        .eq('status', 'pending');

      if (error) throw error;
      return count || 0;
    },
    enabled: !!profile?.organization_id,
    refetchInterval: 30000,
  });
}

// Search available inventory for medication
export function useSearchMedicineInventory(searchTerm: string, medicationName?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['medicine-inventory-search', searchTerm, medicationName, profile?.branch_id],
    queryFn: async () => {
      if (!profile?.branch_id) return [];
      
      const query = medicationName || searchTerm;
      if (!query || query.length < 2) return [];

      const { data, error } = await supabase
        .from('medicine_inventory')
        .select(`
          id,
          batch_number,
          quantity,
          unit_price,
          selling_price,
          expiry_date,
          medicine:medicines!medicine_inventory_medicine_id_fkey(id, name, generic_name)
        `)
        .eq('branch_id', profile.branch_id)
        .gt('quantity', 0)
        .gte('expiry_date', new Date().toISOString().split('T')[0])
        .order('expiry_date', { ascending: true }) // FIFO
        .limit(20);

      if (error) throw error;

      // Filter by name match
      return (data || []).filter(item => 
        item.medicine?.name?.toLowerCase().includes(query.toLowerCase()) ||
        item.medicine?.generic_name?.toLowerCase().includes(query.toLowerCase())
      );
    },
    enabled: !!profile?.branch_id && (!!searchTerm || !!medicationName) && (searchTerm?.length >= 2 || (medicationName?.length ?? 0) >= 2),
  });
}
