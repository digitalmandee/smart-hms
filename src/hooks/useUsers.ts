import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
type UserRole = Database["public"]["Tables"]["user_roles"]["Row"];
type AppRole = Database["public"]["Enums"]["app_role"];

export interface UserWithRoles extends Profile {
  roles: AppRole[];
}

export function useUsers() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["users", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .order("full_name", { ascending: true });

      if (profilesError) throw profilesError;

      // Fetch roles for all users
      const userIds = profiles.map((p) => p.id);
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*")
        .in("user_id", userIds);

      if (rolesError) throw rolesError;

      // Combine profiles with roles
      const usersWithRoles: UserWithRoles[] = profiles.map((p) => ({
        ...p,
        roles: roles
          .filter((r) => r.user_id === p.id)
          .map((r) => r.role),
      }));

      return usersWithRoles;
    },
    enabled: !!profile?.organization_id,
  });
}

export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: ["users", "detail", id],
    queryFn: async () => {
      if (!id) throw new Error("User ID is required");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (profileError) throw profileError;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", id);

      if (rolesError) throw rolesError;

      return {
        ...profile,
        roles: roles.map((r) => r.role),
      } as UserWithRoles;
    },
    enabled: !!id,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      data,
      roles,
    }: {
      id: string;
      data: ProfileUpdate;
      roles?: AppRole[];
    }) => {
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update(data)
        .eq("id", id);

      if (profileError) throw profileError;

      // Update roles if provided
      if (roles) {
        // Delete existing roles
        await supabase.from("user_roles").delete().eq("user_id", id);

        // Insert new roles
        if (roles.length > 0) {
          const { error: rolesError } = await supabase
            .from("user_roles")
            .insert(roles.map((role) => ({ user_id: id, role })));

          if (rolesError) throw rolesError;
        }
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", "detail", variables.id] });
      toast({
        title: "User updated",
        description: "The user has been updated successfully.",
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

export function useAllUsers() {
  return useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select(`
          *,
          organizations:organization_id (name)
        `)
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      const userIds = profiles.map((p) => p.id);
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*")
        .in("user_id", userIds);

      if (rolesError) throw rolesError;

      return profiles.map((p) => ({
        ...p,
        roles: roles
          .filter((r) => r.user_id === p.id)
          .map((r) => r.role),
      }));
    },
  });
}
