import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { authLogger } from "@/lib/logger";

type AppRole = Database["public"]["Enums"]["app_role"];

interface Profile {
  id: string;
  email: string | null;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  organization_id: string | null;
  branch_id: string | null;
  is_active: boolean | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: AppRole[];
  permissions: string[];
  isLoading: boolean;
  mfaRequired: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: AppRole) => boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mfaRequired, setMfaRequired] = useState(false);

  // Fetch user profile and roles
  const fetchUserData = async (userId: string) => {
    authLogger.debug("Fetching user data", { userId });
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) {
        authLogger.error("Failed to fetch profile", profileError, { userId });
      }

      if (profileData) {
        setProfile(profileData);
        authLogger.debug("Profile loaded", { 
          userId, 
          organizationId: profileData.organization_id,
          branchId: profileData.branch_id 
        });
      }

      // Fetch roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (rolesError) {
        authLogger.error("Failed to fetch roles", rolesError, { userId });
      }

      if (rolesData) {
        const userRoles = rolesData.map((r) => r.role);
        setRoles(userRoles);
        authLogger.info("Roles loaded", { userId, roles: userRoles, count: userRoles.length });

        // Fetch permissions based on roles
        if (userRoles.includes("super_admin")) {
          // Super admin has all permissions
          const { data: allPerms } = await supabase
            .from("permissions")
            .select("code");
          if (allPerms) {
            setPermissions(allPerms.map((p) => p.code));
            authLogger.info("Super admin permissions loaded", { count: allPerms.length });
          }
        } else if (userRoles.length > 0) {
          // Fetch permissions for user's roles
          const { data: rolePerms } = await supabase
            .from("role_permissions")
            .select("permission_id, permissions(code)")
            .in("role", userRoles)
            .eq("is_granted", true);

          if (rolePerms) {
            const permCodes = rolePerms
              .map((rp) => (rp.permissions as any)?.code)
              .filter(Boolean);
            setPermissions([...new Set(permCodes)]);
            authLogger.info("Permissions loaded", { count: permCodes.length });
          }
        }
      }
    } catch (error) {
      authLogger.error("Error fetching user data", error, { userId });
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Defer data fetching with setTimeout to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setRoles([]);
          setPermissions([]);
        }

        if (event === "SIGNED_OUT") {
          setProfile(null);
          setRoles([]);
          setPermissions([]);
        }

        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchUserData(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, "$1***$3");
    authLogger.info("Sign in attempt", { email: maskedEmail });
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      authLogger.warn("Sign in failed", { email: maskedEmail, error: error.message });
    } else {
      authLogger.info("Sign in successful", { email: maskedEmail });
    }
    
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, "$1***$3");
    authLogger.info("Sign up attempt", { email: maskedEmail, fullName });
    
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    
    if (error) {
      authLogger.warn("Sign up failed", { email: maskedEmail, error: error.message });
    } else {
      authLogger.info("Sign up successful", { email: maskedEmail });
    }
    
    return { error };
  };

  const signOut = async () => {
    authLogger.info("Sign out", { userId: user?.id });
    await supabase.auth.signOut();
  };

  const hasPermission = (permission: string): boolean => {
    if (roles.includes("super_admin")) return true;
    return permissions.includes(permission);
  };

  const hasRole = (role: AppRole): boolean => {
    return roles.includes(role);
  };

  const isSuperAdmin = roles.includes("super_admin");

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        roles,
        permissions,
        isLoading,
        signIn,
        signUp,
        signOut,
        hasPermission,
        hasRole,
        isSuperAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
