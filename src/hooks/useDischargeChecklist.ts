import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ChecklistItem {
  id: string;
  admission_id: string;
  item_id: string;
  completed: boolean;
  completed_at: string | null;
  completed_by: string | null;
  notes: string | null;
}

export function useDischargeChecklist(admissionId?: string) {
  return useQuery({
    queryKey: ["discharge-checklist", admissionId],
    queryFn: async () => {
      if (!admissionId) return [];

      const { data, error } = await supabase
        .from("discharge_checklist_items")
        .select("*")
        .eq("admission_id", admissionId);

      if (error) throw error;
      return (data || []) as ChecklistItem[];
    },
    enabled: !!admissionId,
  });
}

export function useSaveChecklistItem() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      admissionId,
      itemId,
      completed,
      notes,
    }: {
      admissionId: string;
      itemId: string;
      completed: boolean;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("discharge_checklist_items")
        .upsert(
          {
            admission_id: admissionId,
            item_id: itemId,
            completed,
            completed_at: completed ? new Date().toISOString() : null,
            completed_by: completed ? user?.id : null,
            notes,
          },
          {
            onConflict: "admission_id,item_id",
          }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["discharge-checklist", variables.admissionId],
      });
    },
  });
}

export function useBulkSaveChecklist() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      admissionId,
      items,
    }: {
      admissionId: string;
      items: { itemId: string; completed: boolean }[];
    }) => {
      const upsertData = items.map((item) => ({
        admission_id: admissionId,
        item_id: item.itemId,
        completed: item.completed,
        completed_at: item.completed ? new Date().toISOString() : null,
        completed_by: item.completed ? user?.id : null,
      }));

      const { error } = await supabase
        .from("discharge_checklist_items")
        .upsert(upsertData, { onConflict: "admission_id,item_id" });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["discharge-checklist", variables.admissionId],
      });
    },
  });
}
