import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

type Organization = Database["public"]["Tables"]["organizations"]["Row"];
type OrganizationInsert = Database["public"]["Tables"]["organizations"]["Insert"];
type OrganizationUpdate = Database["public"]["Tables"]["organizations"]["Update"];

export function useOrganizations() {
  return useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Organization[];
    },
  });
}

export function useOrganization(id: string | undefined) {
  return useQuery({
    queryKey: ["organizations", id],
    queryFn: async () => {
      if (!id) throw new Error("Organization ID is required");
      
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Organization;
    },
    enabled: !!id,
  });
}

export function useOrganizationStats() {
  return useQuery({
    queryKey: ["organization-stats"],
    queryFn: async () => {
      const [orgsResult, branchesResult, profilesResult, patientsResult] = await Promise.all([
        supabase.from("organizations").select("id, subscription_status", { count: "exact" }),
        supabase.from("branches").select("id", { count: "exact" }),
        supabase.from("profiles").select("id", { count: "exact" }),
        supabase.from("patients").select("id", { count: "exact" }),
      ]);

      const orgs = orgsResult.data || [];
      const trialOrgs = orgs.filter(o => o.subscription_status === "trial").length;
      const activeOrgs = orgs.filter(o => o.subscription_status === "active").length;
      const suspendedOrgs = orgs.filter(o => o.subscription_status === "suspended").length;

      return {
        totalOrganizations: orgsResult.count || 0,
        trialOrganizations: trialOrgs,
        activeOrganizations: activeOrgs,
        suspendedOrganizations: suspendedOrgs,
        totalBranches: branchesResult.count || 0,
        totalUsers: profilesResult.count || 0,
        totalPatients: patientsResult.count || 0,
      };
    },
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: OrganizationInsert) => {
      const { data: org, error } = await supabase
        .from("organizations")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return org;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      toast({
        title: "Organization created",
        description: "The organization has been created successfully.",
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

export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: OrganizationUpdate }) => {
      const { data: org, error } = await supabase
        .from("organizations")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return org;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      queryClient.invalidateQueries({ queryKey: ["organizations", variables.id] });
      toast({
        title: "Organization updated",
        description: "The organization has been updated successfully.",
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
