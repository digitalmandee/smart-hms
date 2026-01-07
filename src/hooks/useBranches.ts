import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

type Branch = Database["public"]["Tables"]["branches"]["Row"];
type BranchInsert = Database["public"]["Tables"]["branches"]["Insert"];
type BranchUpdate = Database["public"]["Tables"]["branches"]["Update"];

export function useBranches(organizationId?: string) {
  return useQuery({
    queryKey: ["branches", organizationId],
    queryFn: async () => {
      let query = supabase
        .from("branches")
        .select("*")
        .order("is_main_branch", { ascending: false })
        .order("name", { ascending: true });

      if (organizationId) {
        query = query.eq("organization_id", organizationId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Branch[];
    },
  });
}

export function useBranch(id: string | undefined) {
  return useQuery({
    queryKey: ["branches", "detail", id],
    queryFn: async () => {
      if (!id) throw new Error("Branch ID is required");

      const { data, error } = await supabase
        .from("branches")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Branch;
    },
    enabled: !!id,
  });
}

export function useCreateBranch() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: BranchInsert) => {
      const { data: branch, error } = await supabase
        .from("branches")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return branch;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      toast({
        title: "Branch created",
        description: "The branch has been created successfully.",
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

export function useUpdateBranch() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: BranchUpdate }) => {
      const { data: branch, error } = await supabase
        .from("branches")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return branch;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      queryClient.invalidateQueries({ queryKey: ["branches", "detail", variables.id] });
      toast({
        title: "Branch updated",
        description: "The branch has been updated successfully.",
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

export function useDeleteBranch() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("branches")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      toast({
        title: "Branch deleted",
        description: "The branch has been deleted successfully.",
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
