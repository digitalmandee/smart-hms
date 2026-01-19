import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Types
export interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  user_id: string | null;
  organization_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user?: {
    full_name: string | null;
    email: string | null;
  };
}

export interface AuditLogFilters {
  entityType?: string;
  entityId?: string;
  userId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  organizationId?: string; // For super admin filtering
}

// =====================
// Audit Logs
// =====================

export function useAuditLogs(filters?: AuditLogFilters, page = 1, limit = 50) {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["audit-logs", profile?.organization_id, filters, page, limit],
    queryFn: async () => {
      let query = supabase
        .from("audit_logs")
        .select(`
          *,
          user:profiles!audit_logs_user_id_fkey(full_name, email)
        `, { count: "exact" })
        .order("created_at", { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (filters?.entityType) {
        query = query.eq("entity_type", filters.entityType);
      }
      if (filters?.entityId) {
        query = query.eq("entity_id", filters.entityId);
      }
      if (filters?.userId) {
        query = query.eq("user_id", filters.userId);
      }
      if (filters?.action) {
        query = query.eq("action", filters.action);
      }
      if (filters?.startDate) {
        query = query.gte("created_at", filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte("created_at", filters.endDate + "T23:59:59");
      }
      if (filters?.search) {
        query = query.or(`entity_type.ilike.%${filters.search}%,action.ilike.%${filters.search}%`);
      }
      if (filters?.organizationId) {
        query = query.eq("organization_id", filters.organizationId);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        logs: (data || []) as AuditLog[],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      };
    },
    enabled: !!profile?.organization_id,
  });
}

// Get single audit log
export function useAuditLog(id: string | undefined) {
  return useQuery({
    queryKey: ["audit-log", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("audit_logs")
        .select(`
          *,
          user:profiles!audit_logs_user_id_fkey(full_name, email)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as AuditLog;
    },
    enabled: !!id,
  });
}

// Get entity types for filter dropdown
export function useAuditEntityTypes() {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["audit-entity-types", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("entity_type")
        .limit(100);

      if (error) throw error;

      // Get unique entity types
      const entityTypes = [...new Set((data || []).map(d => d.entity_type))].sort();
      return entityTypes;
    },
    enabled: !!profile?.organization_id,
  });
}

// Get actions for filter dropdown
export function useAuditActions() {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["audit-actions", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("action")
        .limit(100);

      if (error) throw error;

      // Get unique actions
      const actions = [...new Set((data || []).map(d => d.action))].sort();
      return actions;
    },
    enabled: !!profile?.organization_id,
  });
}

// Get users for filter dropdown
export function useAuditUsers() {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["audit-users", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .order("full_name");

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });
}

// Get audit stats
export function useAuditStats() {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["audit-stats", profile?.organization_id],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const { data, error } = await supabase
        .from("audit_logs")
        .select("action, created_at")
        .gte("created_at", weekAgo);

      if (error) throw error;

      const todayLogs = (data || []).filter(d => d.created_at.startsWith(today));
      const createActions = (data || []).filter(d => d.action.toLowerCase().includes("create"));
      const updateActions = (data || []).filter(d => d.action.toLowerCase().includes("update"));
      const deleteActions = (data || []).filter(d => d.action.toLowerCase().includes("delete"));

      return {
        totalThisWeek: data?.length || 0,
        todayCount: todayLogs.length,
        creates: createActions.length,
        updates: updateActions.length,
        deletes: deleteActions.length,
      };
    },
    enabled: !!profile?.organization_id,
  });
}
