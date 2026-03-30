import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type RequisitionStatus = Database["public"]["Enums"]["requisition_status"];

export interface RequisitionItem {
  id?: string;
  requisition_id?: string;
  item_id?: string | null;
  medicine_id?: string | null;
  quantity_requested: number;
  quantity_approved: number;
  quantity_issued: number;
  notes?: string | null;
  item?: {
    id: string;
    item_code: string;
    name: string;
    unit_of_measure: string;
  };
  medicine?: {
    id: string;
    name: string;
    generic_name: string | null;
    dosage_form: string | null;
  } | null;
}

export interface StockRequisition {
  id: string;
  organization_id: string;
  branch_id: string;
  requisition_number: string;
  requested_by: string;
  department_id: string | null;
  request_date: string;
  required_date: string | null;
  status: RequisitionStatus;
  priority: number;
  notes: string | null;
  approved_by: string | null;
  approved_at: string | null;
  issued_by: string | null;
  issued_at: string | null;
  created_at: string;
  updated_at: string;
  branch?: {
    id: string;
    name: string;
  };
  department?: {
    id: string;
    name: string;
  };
  items?: RequisitionItem[];
  requested_by_profile?: {
    id: string;
    full_name: string;
  };
  approved_by_profile?: {
    id: string;
    full_name: string;
  };
  issued_by_profile?: {
    id: string;
    full_name: string;
  };
  from_store?: {
    id: string;
    name: string;
  } | null;
}

export function useRequisitions(filters?: { status?: RequisitionStatus; departmentId?: string }) {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["requisitions", profile?.organization_id, filters],
    queryFn: async () => {
      let query = supabase
        .from("stock_requisitions")
        .select(`
          *,
          branch:branches(id, name),
          department:departments(id, name),
          from_store:stores!stock_requisitions_from_store_id_fkey(id, name),
          requested_by_profile:profiles!stock_requisitions_requested_by_fkey(id, full_name),
          approved_by_profile:profiles!stock_requisitions_approved_by_fkey(id, full_name)
        `)
        .order("created_at", { ascending: false });
      
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      
      if (filters?.departmentId) {
        query = query.eq("department_id", filters.departmentId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as StockRequisition[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useRequisition(id: string) {
  return useQuery({
    queryKey: ["requisition", id],
    queryFn: async () => {
      const { data: req, error } = await supabase
        .from("stock_requisitions")
        .select(`
          *,
          branch:branches(id, name),
          department:departments(id, name),
          requested_by_profile:profiles!stock_requisitions_requested_by_fkey(id, full_name),
          approved_by_profile:profiles!stock_requisitions_approved_by_fkey(id, full_name),
          issued_by_profile:profiles!stock_requisitions_issued_by_fkey(id, full_name)
        `)
        .eq("id", id)
        .single();
      
      if (error) throw error;
      
      // Get items
      const { data: items, error: itemsError } = await supabase
        .from("requisition_items")
        .select(`
          *,
          item:inventory_items(id, item_code, name, unit_of_measure),
          medicine:medicines(id, name, generic_name, dosage_form)
        `)
        .eq("requisition_id", id);
      
      if (itemsError) throw itemsError;
      
      return { ...req, items } as StockRequisition;
    },
    enabled: !!id,
  });
}

export function useCreateRequisition() {
  const queryClient = useQueryClient();
  const { profile, user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: {
      branch_id: string;
      department_id?: string;
      from_store_id?: string;
      required_date?: string;
      priority?: number;
      notes?: string;
      items: RequisitionItem[];
    }) => {
      // Create requisition
      const { data: req, error } = await supabase
        .from("stock_requisitions")
        .insert({
          organization_id: profile!.organization_id!,
          branch_id: data.branch_id,
          requisition_number: "", // Auto-generated
          requested_by: user!.id,
          department_id: data.department_id || null,
          from_store_id: data.from_store_id || null,
          required_date: data.required_date || null,
          priority: data.priority || 0,
          notes: data.notes || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Create items
      const itemsToInsert = data.items.map(item => ({
        requisition_id: req.id,
        item_id: item.item_id || null,
        medicine_id: item.medicine_id || null,
        quantity_requested: item.quantity_requested,
        quantity_approved: 0,
        quantity_issued: 0,
        notes: item.notes || null,
      }));
      
      const { error: itemsError } = await supabase
        .from("requisition_items")
        .insert(itemsToInsert);
      
      if (itemsError) throw itemsError;
      
      return req;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requisitions"] });
      toast.success("Requisition created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useSubmitRequisition() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("stock_requisitions")
        .update({ status: "pending" as RequisitionStatus })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requisitions"] });
      queryClient.invalidateQueries({ queryKey: ["requisition"] });
      toast.success("Requisition submitted for approval");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useApproveRequisition() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ id, items }: { id: string; items: { id: string; quantity_approved: number }[] }) => {
      // Update requisition
      const { error } = await supabase
        .from("stock_requisitions")
        .update({
          status: "approved" as RequisitionStatus,
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", id);
      
      if (error) throw error;
      
      // Update item quantities
      for (const item of items) {
        await supabase
          .from("requisition_items")
          .update({ quantity_approved: item.quantity_approved })
          .eq("id", item.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requisitions"] });
      queryClient.invalidateQueries({ queryKey: ["requisition"] });
      toast.success("Requisition approved");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useRejectRequisition() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { error } = await supabase
        .from("stock_requisitions")
        .update({
          status: "rejected" as RequisitionStatus,
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
          notes: reason || null,
        })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requisitions"] });
      queryClient.invalidateQueries({ queryKey: ["requisition"] });
      toast.success("Requisition rejected");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useIssueStock() {
  const queryClient = useQueryClient();
  const { profile, user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ id, items }: { id: string; items: { id: string; item_id: string; quantity_issued: number }[] }) => {
      // Get requisition
      const { data: req } = await supabase
        .from("stock_requisitions")
        .select("branch_id, requisition_number")
        .eq("id", id)
        .single();
      
      if (!req) throw new Error("Requisition not found");
      
      // Issue each item
      for (const item of items) {
        if (item.quantity_issued > 0) {
          // Update requisition item
          const { data: existingItem } = await supabase
            .from("requisition_items")
            .select("quantity_issued")
            .eq("id", item.id)
            .single();
          
          await supabase
            .from("requisition_items")
            .update({ quantity_issued: (existingItem?.quantity_issued || 0) + item.quantity_issued })
            .eq("id", item.id);
          
          // Deduct from stock (FIFO)
          let remainingToDeduct = item.quantity_issued;
          
          const { data: stocks } = await supabase
            .from("inventory_stock")
            .select("id, quantity")
            .eq("item_id", item.item_id)
            .eq("branch_id", req.branch_id)
            .gt("quantity", 0)
            .order("received_date", { ascending: true });
          
          for (const stock of stocks || []) {
            if (remainingToDeduct <= 0) break;
            
            const deductAmount = Math.min(stock.quantity, remainingToDeduct);
            const newQuantity = stock.quantity - deductAmount;
            
            await supabase
              .from("inventory_stock")
              .update({ quantity: newQuantity })
              .eq("id", stock.id);
            
            remainingToDeduct -= deductAmount;
          }
          
          // Create adjustment record
          await supabase
            .from("stock_adjustments")
            .insert({
              organization_id: profile!.organization_id!,
              branch_id: req.branch_id,
              item_id: item.item_id,
              adjustment_type: "decrease",
              quantity: item.quantity_issued,
              previous_quantity: 0,
              new_quantity: 0,
              reason: `Requisition: ${req.requisition_number}`,
              reference_type: "requisition",
              reference_id: id,
              adjusted_by: user?.id,
            });
        }
      }
      
      // Check if all items are fully issued
      const { data: allItems } = await supabase
        .from("requisition_items")
        .select("quantity_approved, quantity_issued")
        .eq("requisition_id", id);
      
      const allIssued = allItems?.every(i => i.quantity_issued >= i.quantity_approved);
      const someIssued = allItems?.some(i => i.quantity_issued > 0);
      
      const newStatus = allIssued ? "issued" : someIssued ? "partially_issued" : "approved";
      
      await supabase
        .from("stock_requisitions")
        .update({
          status: newStatus as RequisitionStatus,
          issued_by: user?.id,
          issued_at: new Date().toISOString(),
        })
        .eq("id", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requisitions"] });
      queryClient.invalidateQueries({ queryKey: ["requisition"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-stock"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
      toast.success("Stock issued successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
