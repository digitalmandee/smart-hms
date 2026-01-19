import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BranchWithOrg {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  is_main_branch: boolean;
  created_at: string;
  organization_id: string;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
}

export function useBranchesAll(organizationId?: string) {
  return useQuery({
    queryKey: ["branches", "all", organizationId],
    queryFn: async () => {
      let query = supabase
        .from("branches")
        .select(`
          id,
          name,
          address,
          city,
          phone,
          email,
          is_active,
          is_main_branch,
          created_at,
          organization_id,
          organizations!inner (
            id,
            name,
            slug
          )
        `)
        .order("created_at", { ascending: false });

      if (organizationId) {
        query = query.eq("organization_id", organizationId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      return (data || []).map((branch: any) => ({
        ...branch,
        organization: branch.organizations,
      })) as BranchWithOrg[];
    },
  });
}
