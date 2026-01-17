import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { CartItem } from "@/hooks/usePOS";

export interface HeldTransaction {
  id: string;
  organization_id: string;
  branch_id: string;
  customer_name: string | null;
  customer_phone: string | null;
  patient_id: string | null;
  prescription_id: string | null;
  cart_items: CartItem[];
  discount_percent: number;
  notes: string | null;
  held_by: string | null;
  held_at: string;
  is_active: boolean;
  holder?: { full_name: string } | null;
  patient?: { first_name: string; last_name: string; patient_number: string } | null;
}

// Helper for raw SQL queries to new tables
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const queryTable = (table: string): any => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).from(table);
};

// List held transactions for branch
export function useHeldTransactions(branchId?: string) {
  const { profile } = useAuth();
  const targetBranchId = branchId || profile?.branch_id;

  return useQuery({
    queryKey: ["held-transactions", targetBranchId],
    queryFn: async () => {
      if (!targetBranchId) return [];

      const { data, error } = await queryTable("pharmacy_pos_held_transactions")
        .select(`
          *,
          holder:profiles!pharmacy_pos_held_transactions_held_by_fkey(full_name),
          patient:patients(first_name, last_name, patient_number)
        `)
        .eq("branch_id", targetBranchId)
        .eq("is_active", true)
        .order("held_at", { ascending: false });

      if (error) throw error;
      return data as HeldTransaction[];
    },
    enabled: !!targetBranchId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

// Hold a transaction
export function useHoldTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      cartItems,
      customerName,
      customerPhone,
      patientId,
      prescriptionId,
      discountPercent = 0,
      notes,
    }: {
      cartItems: CartItem[];
      customerName?: string;
      customerPhone?: string;
      patientId?: string;
      prescriptionId?: string;
      discountPercent?: number;
      notes?: string;
    }) => {
      if (!profile?.organization_id || !profile?.branch_id) {
        throw new Error("No organization or branch context");
      }

      if (cartItems.length === 0) {
        throw new Error("Cannot hold empty cart");
      }

      const { data, error } = await queryTable("pharmacy_pos_held_transactions")
        .insert({
          organization_id: profile.organization_id,
          branch_id: profile.branch_id,
          customer_name: customerName || null,
          customer_phone: customerPhone || null,
          patient_id: patientId || null,
          prescription_id: prescriptionId || null,
          cart_items: cartItems,
          discount_percent: discountPercent,
          notes: notes || null,
          held_by: profile.id,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data as HeldTransaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["held-transactions"] });
      toast({
        title: "Transaction Held",
        description: "Cart has been saved. You can recall it anytime.",
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

// Recall a held transaction (marks it as recalled)
export function useRecallTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (heldId: string) => {
      // First get the held transaction
      const { data: held, error: fetchError } = await queryTable("pharmacy_pos_held_transactions")
        .select("*")
        .eq("id", heldId)
        .single();

      if (fetchError) throw fetchError;

      // Mark as recalled
      const { error: updateError } = await queryTable("pharmacy_pos_held_transactions")
        .update({
          is_active: false,
          recalled_at: new Date().toISOString(),
          recalled_by: profile?.id,
        })
        .eq("id", heldId);

      if (updateError) throw updateError;

      return held as HeldTransaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["held-transactions"] });
      toast({
        title: "Transaction Recalled",
        description: "Held cart has been loaded.",
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

// Delete a held transaction
export function useDeleteHeldTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (heldId: string) => {
      const { error } = await queryTable("pharmacy_pos_held_transactions")
        .update({ is_active: false })
        .eq("id", heldId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["held-transactions"] });
      toast({
        title: "Held Transaction Deleted",
        description: "The held cart has been removed.",
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
