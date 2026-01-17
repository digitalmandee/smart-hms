import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export type MovementType = 
  | "grn" 
  | "sale" 
  | "dispense" 
  | "adjustment" 
  | "return" 
  | "transfer_in" 
  | "transfer_out" 
  | "expired" 
  | "damaged" 
  | "opening";

export interface StockMovement {
  id: string;
  organization_id: string;
  branch_id: string;
  medicine_id: string | null;
  inventory_id: string | null;
  movement_type: MovementType;
  quantity: number;
  previous_stock: number | null;
  new_stock: number | null;
  reference_type: string | null;
  reference_id: string | null;
  reference_number: string | null;
  batch_number: string | null;
  unit_cost: number | null;
  total_value: number | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  medicine?: { name: string; generic_name: string | null } | null;
  creator?: { full_name: string } | null;
}

export interface StockMovementFilters {
  startDate?: string;
  endDate?: string;
  movementType?: MovementType;
  medicineId?: string;
  search?: string;
}

// Helper for raw SQL queries
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const queryTable = (table: string): any => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).from(table);
};

// List stock movements with filters
export function useStockMovements(branchId?: string, filters?: StockMovementFilters) {
  const { profile } = useAuth();
  const targetBranchId = branchId || profile?.branch_id;

  return useQuery({
    queryKey: ["stock-movements", targetBranchId, filters],
    queryFn: async () => {
      if (!targetBranchId) return [];

      let query = queryTable("pharmacy_stock_movements")
        .select(`
          *,
          medicine:medicines(name, generic_name),
          creator:profiles!pharmacy_stock_movements_created_by_fkey(full_name)
        `)
        .eq("branch_id", targetBranchId)
        .order("created_at", { ascending: false })
        .limit(500);

      if (filters?.startDate) {
        query = query.gte("created_at", `${filters.startDate}T00:00:00`);
      }

      if (filters?.endDate) {
        query = query.lte("created_at", `${filters.endDate}T23:59:59`);
      }

      if (filters?.movementType) {
        query = query.eq("movement_type", filters.movementType);
      }

      if (filters?.medicineId) {
        query = query.eq("medicine_id", filters.medicineId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as StockMovement[];
    },
    enabled: !!targetBranchId,
  });
}

// Create manual stock adjustment
export function useCreateStockAdjustment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      medicineId,
      inventoryId,
      movementType,
      quantity,
      batchNumber,
      unitCost,
      notes,
    }: {
      medicineId: string;
      inventoryId?: string;
      movementType: MovementType;
      quantity: number;
      batchNumber?: string;
      unitCost?: number;
      notes?: string;
    }) => {
      if (!profile?.organization_id || !profile?.branch_id) {
        throw new Error("No organization or branch context");
      }

      // Get current stock
      let previousStock = 0;
      if (inventoryId) {
        const { data: inv } = await supabase
          .from("medicine_inventory")
          .select("quantity")
          .eq("id", inventoryId)
          .single();
        previousStock = inv?.quantity || 0;
      }

      const newStock = previousStock + quantity;
      const totalValue = unitCost ? Math.abs(quantity) * unitCost : null;

      const { data, error } = await queryTable("pharmacy_stock_movements")
        .insert({
          organization_id: profile.organization_id,
          branch_id: profile.branch_id,
          medicine_id: medicineId,
          inventory_id: inventoryId || null,
          movement_type: movementType,
          quantity,
          previous_stock: previousStock,
          new_stock: newStock,
          reference_type: "manual_adjustment",
          batch_number: batchNumber || null,
          unit_cost: unitCost || null,
          total_value: totalValue,
          notes: notes || null,
          created_by: profile.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Update inventory if inventoryId provided
      if (inventoryId) {
        const { error: invError } = await supabase
          .from("medicine_inventory")
          .update({ quantity: newStock })
          .eq("id", inventoryId);

        if (invError) throw invError;
      }

      return data as StockMovement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
      queryClient.invalidateQueries({ queryKey: ["medicine-inventory"] });
      toast({
        title: "Stock Adjusted",
        description: "Stock movement has been recorded.",
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

// Get stock movement summary by type for a date range
export function useStockMovementSummary(branchId?: string, startDate?: string, endDate?: string) {
  const { profile } = useAuth();
  const targetBranchId = branchId || profile?.branch_id;

  return useQuery({
    queryKey: ["stock-movement-summary", targetBranchId, startDate, endDate],
    queryFn: async () => {
      if (!targetBranchId) return null;

      let query = queryTable("pharmacy_stock_movements")
        .select("movement_type, quantity, total_value")
        .eq("branch_id", targetBranchId);

      if (startDate) {
        query = query.gte("created_at", `${startDate}T00:00:00`);
      }

      if (endDate) {
        query = query.lte("created_at", `${endDate}T23:59:59`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Aggregate by type
      const summary: Record<MovementType, { count: number; totalQty: number; totalValue: number }> = {} as any;

      (data || []).forEach((m: any) => {
        if (!summary[m.movement_type as MovementType]) {
          summary[m.movement_type as MovementType] = { count: 0, totalQty: 0, totalValue: 0 };
        }
        summary[m.movement_type as MovementType].count++;
        summary[m.movement_type as MovementType].totalQty += m.quantity || 0;
        summary[m.movement_type as MovementType].totalValue += Number(m.total_value) || 0;
      });

      return summary;
    },
    enabled: !!targetBranchId,
  });
}
