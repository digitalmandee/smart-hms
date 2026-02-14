import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type Medicine = Database["public"]["Tables"]["medicines"]["Row"];
type MedicineInventory = Database["public"]["Tables"]["medicine_inventory"]["Row"];
type MedicineCategory = Database["public"]["Tables"]["medicine_categories"]["Row"];
type Prescription = Database["public"]["Tables"]["prescriptions"]["Row"];
type PrescriptionItem = Database["public"]["Tables"]["prescription_items"]["Row"];

export interface InventoryWithMedicine extends MedicineInventory {
  medicine: Medicine & {
    category?: MedicineCategory | null;
  };
  store?: { id: string; name: string } | null;
}

export interface PrescriptionQueueItem extends Prescription {
  patient: {
    id: string;
    first_name: string;
    last_name: string | null;
    patient_number: string;
    phone: string | null;
  };
  doctor: {
    id: string;
    profile: {
      full_name: string;
    };
  };
  items: PrescriptionItem[];
  itemCount: number;
}

interface InventoryFilters {
  lowStock?: boolean;
  expiringSoon?: boolean;
  categoryId?: string;
  search?: string;
  storeId?: string;
}

// Prescription Queue - pending prescriptions for pharmacy
export function usePrescriptionQueue(branchId?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["prescription-queue", branchId || profile?.branch_id],
    queryFn: async () => {
      const targetBranchId = branchId || profile?.branch_id;
      
      let query = supabase
        .from("prescriptions")
        .select(`
          *,
          patient:patients(id, first_name, last_name, patient_number, phone),
          doctor:doctors(id, profile:profiles(full_name)),
          items:prescription_items(*)
        `)
        .in("status", ["created", "partially_dispensed"])
        .order("created_at", { ascending: true });

      if (targetBranchId) {
        query = query.eq("branch_id", targetBranchId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(p => ({
        ...p,
        itemCount: p.items?.length || 0,
      })) as PrescriptionQueueItem[];
    },
    enabled: !!profile?.organization_id,
  });
}

// Single prescription for dispensing
export function usePrescriptionForDispensing(prescriptionId: string | undefined) {
  return useQuery({
    queryKey: ["prescription-dispensing", prescriptionId],
    queryFn: async () => {
      if (!prescriptionId) return null;

      const { data, error } = await supabase
        .from("prescriptions")
        .select(`
          *,
          patient:patients(id, first_name, last_name, patient_number, phone, date_of_birth, gender),
          doctor:doctors(id, specialization, profile:profiles(full_name)),
          items:prescription_items(*, medicine:medicines(id, name, generic_name, strength, unit)),
          branch:branches(id, name, code)
        `)
        .eq("id", prescriptionId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!prescriptionId,
  });
}

// Dispense prescription mutation - auto-adds charges for IPD patients
export function useDispensePrescription() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      prescriptionId,
      dispensedItems,
      notes,
    }: {
      prescriptionId: string;
      dispensedItems: { itemId: string; inventoryId?: string; quantityDispensed: number }[];
      notes?: string;
    }) => {
      // Get prescription with patient info
      const { data: prescription, error: prescError } = await supabase
        .from("prescriptions")
        .select("patient_id, prescription_number")
        .eq("id", prescriptionId)
        .single();

      if (prescError) throw prescError;

      // Check if patient has active admission (IPD patient)
      const { data: activeAdmission } = await supabase
        .from("admissions")
        .select("id, branch_id, admission_number")
        .eq("patient_id", prescription.patient_id)
        .eq("status", "admitted")
        .maybeSingle();

      // Update prescription items as dispensed
      for (const item of dispensedItems) {
        const { error: itemError } = await supabase
          .from("prescription_items")
          .update({ is_dispensed: true })
          .eq("id", item.itemId);

        if (itemError) throw itemError;

        // Deduct from inventory if inventory selected
        if (item.inventoryId && item.quantityDispensed > 0) {
          const { data: inventory, error: invError } = await supabase
            .from("medicine_inventory")
            .select("quantity, selling_price, batch_number, store_id, medicine:medicines(id, name)")
            .eq("id", item.inventoryId)
            .single();

          if (invError) throw invError;

          const previousStock = inventory.quantity || 0;
          const newQuantity = Math.max(0, previousStock - item.quantityDispensed);
          
          const { error: updateError } = await supabase
            .from("medicine_inventory")
            .update({ quantity: newQuantity })
            .eq("id", item.inventoryId);

          if (updateError) throw updateError;

          // Log stock movement for clinical dispensing
          const medicineId = (inventory.medicine as any)?.id;
          if (medicineId && profile?.organization_id && profile?.branch_id) {
            await (supabase as any).from("pharmacy_stock_movements").insert({
              organization_id: profile.organization_id,
              branch_id: profile.branch_id,
              store_id: inventory.store_id || null,
              medicine_id: medicineId,
              inventory_id: item.inventoryId,
              movement_type: "dispense",
              quantity: -item.quantityDispensed,
              previous_stock: previousStock,
              new_stock: newQuantity,
              reference_type: "prescription",
              reference_id: prescriptionId,
              reference_number: prescription.prescription_number,
              batch_number: inventory.batch_number,
              unit_cost: inventory.selling_price,
              total_value: item.quantityDispensed * (inventory.selling_price || 0),
              notes: activeAdmission ? "IPD Prescription Dispense" : "Clinical Dispense",
              created_by: profile.id,
            });
          }

          // If patient is admitted (IPD), create IPD charge for medication
          if (activeAdmission && profile?.id) {
            const medicineName = (inventory.medicine as any)?.name || "Medication";
            const unitPrice = inventory.selling_price || 0;
            const totalAmount = item.quantityDispensed * unitPrice;

            await supabase.from("ipd_charges").insert({
              admission_id: activeAdmission.id,
              charge_date: new Date().toISOString().split("T")[0],
              charge_type: "medication",
              description: `Medication: ${medicineName}`,
              quantity: item.quantityDispensed,
              unit_price: unitPrice,
              total_amount: totalAmount,
              is_billed: false,
              added_by: profile.id,
              notes: `Dispensed from prescription ${prescription.prescription_number}`,
            });
          }
        }
      }

      // Check if all items are dispensed
      const { data: allItems } = await supabase
        .from("prescription_items")
        .select("is_dispensed")
        .eq("prescription_id", prescriptionId);

      const allDispensed = allItems?.every(i => i.is_dispensed);
      const someDispensed = allItems?.some(i => i.is_dispensed);

      // Update prescription status
      const newStatus = allDispensed ? "dispensed" : someDispensed ? "partially_dispensed" : "created";
      
      const { error: presError } = await supabase
        .from("prescriptions")
        .update({ 
          status: newStatus,
          notes: notes || undefined,
        })
        .eq("id", prescriptionId);

      if (presError) throw presError;

      return { status: newStatus, isIPDPatient: !!activeAdmission };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["prescription-queue"] });
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      queryClient.invalidateQueries({ queryKey: ["medicine-inventory"] });
      
      if (result.isIPDPatient) {
        queryClient.invalidateQueries({ queryKey: ["ipd-charges"] });
        queryClient.invalidateQueries({ queryKey: ["ipd-billing-stats"] });
        toast({
          title: "Prescription dispensed",
          description: "Medication charges added to IPD patient account.",
        });
      } else {
        toast({
          title: "Prescription dispensed",
          description: "The prescription has been dispensed successfully.",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Inventory management
export function useInventory(branchId?: string, filters: InventoryFilters = {}) {
  const { profile } = useAuth();
  const targetBranchId = branchId || profile?.branch_id;

  return useQuery({
    queryKey: ["medicine-inventory", targetBranchId, filters],
    queryFn: async () => {
      if (!targetBranchId) return [];

      let query = supabase
        .from("medicine_inventory")
        .select(`
          *,
          medicine:medicines(*, category:medicine_categories(id, name)),
          store:stores(id, name)
        `)
        .eq("branch_id", targetBranchId)
        .order("created_at", { ascending: false });

      if (filters.storeId) {
        query = query.eq("store_id", filters.storeId);
      }

      const { data, error } = await query;
      if (error) throw error;

      let result = data as InventoryWithMedicine[];

      // Apply client-side filters
      if (filters.lowStock) {
        result = result.filter(i => (i.quantity || 0) <= (i.reorder_level || 10));
      }

      if (filters.expiringSoon) {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        result = result.filter(i => {
          if (!i.expiry_date) return false;
          return new Date(i.expiry_date) <= thirtyDaysFromNow;
        });
      }

      if (filters.categoryId) {
        result = result.filter(i => i.medicine?.category_id === filters.categoryId);
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        result = result.filter(i => 
          i.medicine?.name.toLowerCase().includes(searchLower) ||
          i.medicine?.generic_name?.toLowerCase().includes(searchLower) ||
          i.batch_number?.toLowerCase().includes(searchLower)
        );
      }

      return result;
    },
    enabled: !!targetBranchId,
  });
}

// Available batches for a specific medicine
export function useMedicineBatches(medicineId: string | undefined, branchId?: string) {
  const { profile } = useAuth();
  const targetBranchId = branchId || profile?.branch_id;

  return useQuery({
    queryKey: ["medicine-batches", medicineId, targetBranchId],
    queryFn: async () => {
      if (!medicineId || !targetBranchId) return [];

      const { data, error } = await supabase
        .from("medicine_inventory")
        .select("*")
        .eq("medicine_id", medicineId)
        .eq("branch_id", targetBranchId)
        .gt("quantity", 0)
        .order("expiry_date", { ascending: true }); // FIFO by expiry

      if (error) throw error;
      return data;
    },
    enabled: !!medicineId && !!targetBranchId,
  });
}

// Add new stock
export function useAddStock() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (stock: Omit<MedicineInventory, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("medicine_inventory")
        .insert(stock)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicine-inventory"] });
      toast({
        title: "Stock added",
        description: "New stock has been added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Adjust stock quantity
export function useAdjustStock() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      inventoryId,
      newQuantity,
      reason,
    }: {
      inventoryId: string;
      newQuantity: number;
      reason?: string;
    }) => {
      const { data, error } = await supabase
        .from("medicine_inventory")
        .update({ quantity: newQuantity })
        .eq("id", inventoryId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicine-inventory"] });
      toast({
        title: "Stock adjusted",
        description: "Stock quantity has been adjusted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Low stock items
export function useLowStockItems(branchId?: string) {
  const { profile } = useAuth();
  const targetBranchId = branchId || profile?.branch_id;

  return useQuery({
    queryKey: ["low-stock-items", targetBranchId],
    queryFn: async () => {
      if (!targetBranchId) return [];

      const { data, error } = await supabase
        .from("medicine_inventory")
        .select(`
          *,
          medicine:medicines(id, name, generic_name, unit)
        `)
        .eq("branch_id", targetBranchId);

      if (error) throw error;

      // Filter low stock items
      return (data || []).filter(i => (i.quantity || 0) <= (i.reorder_level || 10));
    },
    enabled: !!targetBranchId,
  });
}

// Expiring items
export function useExpiringItems(branchId?: string, days = 30) {
  const { profile } = useAuth();
  const targetBranchId = branchId || profile?.branch_id;

  return useQuery({
    queryKey: ["expiring-items", targetBranchId, days],
    queryFn: async () => {
      if (!targetBranchId) return [];

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      const { data, error } = await supabase
        .from("medicine_inventory")
        .select(`
          *,
          medicine:medicines(id, name, generic_name, unit)
        `)
        .eq("branch_id", targetBranchId)
        .lte("expiry_date", futureDate.toISOString().split('T')[0])
        .gt("quantity", 0);

      if (error) throw error;
      return data || [];
    },
    enabled: !!targetBranchId,
  });
}

// Medicine categories
export function useMedicineCategories() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["medicine-categories", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from("medicine_categories")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });
}

// Create medicine
export function useCreateMedicine() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (medicine: Omit<Medicine, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("medicines")
        .insert(medicine)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      toast({
        title: "Medicine created",
        description: "The medicine has been added to the catalog.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Update medicine
export function useUpdateMedicine() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Medicine> & { id: string }) => {
      const { data, error } = await supabase
        .from("medicines")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      queryClient.invalidateQueries({ queryKey: ["medicine", variables.id] });
      toast({
        title: "Medicine updated",
        description: "The medicine has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Pharmacy dashboard stats
export function usePharmacyStats(branchId?: string) {
  const { profile } = useAuth();
  const targetBranchId = branchId || profile?.branch_id;

  return useQuery({
    queryKey: ["pharmacy-stats", targetBranchId],
    queryFn: async () => {
      if (!targetBranchId) return null;

      // Get pending prescriptions count
      const { count: pendingCount } = await supabase
        .from("prescriptions")
        .select("*", { count: "exact", head: true })
        .eq("branch_id", targetBranchId)
        .in("status", ["created", "partially_dispensed"]);

      // Get today's dispensed count
      const today = new Date().toISOString().split('T')[0];
      const { count: dispensedToday } = await supabase
        .from("prescriptions")
        .select("*", { count: "exact", head: true })
        .eq("branch_id", targetBranchId)
        .eq("status", "dispensed")
        .gte("updated_at", today);

      // Get low stock count
      const { data: inventory } = await supabase
        .from("medicine_inventory")
        .select("quantity, reorder_level")
        .eq("branch_id", targetBranchId);

      const lowStockCount = (inventory || []).filter(
        i => (i.quantity || 0) <= (i.reorder_level || 10)
      ).length;

      // Get expiring soon count (30 days)
      const thirtyDays = new Date();
      thirtyDays.setDate(thirtyDays.getDate() + 30);
      const { count: expiringCount } = await supabase
        .from("medicine_inventory")
        .select("*", { count: "exact", head: true })
        .eq("branch_id", targetBranchId)
        .lte("expiry_date", thirtyDays.toISOString().split('T')[0])
        .gt("quantity", 0);

      return {
        pendingPrescriptions: pendingCount || 0,
        dispensedToday: dispensedToday || 0,
        lowStockItems: lowStockCount,
        expiringItems: expiringCount || 0,
      };
    },
    enabled: !!targetBranchId,
  });
}

// Dashboard widget - detailed low stock and expiring items
export function useDashboardPharmacy() {
  const { profile } = useAuth();
  const targetBranchId = profile?.branch_id;

  return useQuery({
    queryKey: ["dashboard-pharmacy", targetBranchId],
    queryFn: async () => {
      if (!targetBranchId) return { lowStockItems: [], expiringItems: [], pendingPrescriptions: 0 };

      // Get inventory with medicine details
      const { data: inventory, error: invError } = await supabase
        .from("medicine_inventory")
        .select(`
          *,
          medicine:medicines(id, name, generic_name, strength, unit)
        `)
        .eq("branch_id", targetBranchId);

      if (invError) throw invError;

      // Filter low stock items
      const lowStockItems = (inventory || []).filter(
        (i) => (i.quantity || 0) <= (i.reorder_level || 10) && (i.quantity || 0) > 0
      );

      // Filter expiring items (within 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      const expiringItems = (inventory || []).filter((i) => {
        if (!i.expiry_date || (i.quantity || 0) <= 0) return false;
        return new Date(i.expiry_date) <= thirtyDaysFromNow;
      }).sort((a, b) => 
        new Date(a.expiry_date!).getTime() - new Date(b.expiry_date!).getTime()
      );

      // Count pending prescriptions
      const { count: pendingCount } = await supabase
        .from("prescriptions")
        .select("*", { count: "exact", head: true })
        .eq("branch_id", targetBranchId)
        .in("status", ["created", "partially_dispensed"]);

      return {
        lowStockItems,
        expiringItems,
        pendingPrescriptions: pendingCount || 0,
      };
    },
    enabled: !!targetBranchId,
  });
}
