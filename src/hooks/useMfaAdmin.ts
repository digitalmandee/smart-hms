import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface MfaRosterEntry {
  user_id: string;
  full_name: string;
  email: string | null;
  roles: string[];
  is_required: boolean;
  enrolled_at: string | null;
  last_verified_at: string | null;
  required_at: string | null;
  grace_period_ends_at: string | null;
  recovery_codes_total: number;
  recovery_codes_used: number;
}

export function useMfaRoster() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ["mfa-roster", orgId],
    enabled: !!orgId,
    queryFn: async (): Promise<MfaRosterEntry[]> => {
      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("id, full_name, email, organization_id")
        .eq("organization_id", orgId!)
        .order("full_name");
      if (pErr) throw pErr;

      const ids = (profiles ?? []).map(p => p.id);
      if (ids.length === 0) return [];

      const [rolesRes, mfaRes, codesRes] = await Promise.all([
        supabase.from("user_roles").select("user_id, role").in("user_id", ids),
        supabase.from("user_mfa_settings")
          .select("user_id, is_required, enrolled_at, last_verified_at, required_at, grace_period_ends_at")
          .in("user_id", ids),
        supabase.from("user_mfa_recovery_codes")
          .select("user_id, used_at").in("user_id", ids),
      ]);

      const rolesByUser = new Map<string, string[]>();
      (rolesRes.data ?? []).forEach(r => {
        const arr = rolesByUser.get(r.user_id) ?? [];
        arr.push(r.role as string);
        rolesByUser.set(r.user_id, arr);
      });

      const mfaByUser = new Map<string, any>();
      (mfaRes.data ?? []).forEach(m => mfaByUser.set(m.user_id, m));

      const codesByUser = new Map<string, { total: number; used: number }>();
      (codesRes.data ?? []).forEach(c => {
        const cur = codesByUser.get(c.user_id) ?? { total: 0, used: 0 };
        cur.total++;
        if (c.used_at) cur.used++;
        codesByUser.set(c.user_id, cur);
      });

      return (profiles ?? []).map(p => {
        const m = mfaByUser.get(p.id) ?? {};
        const c = codesByUser.get(p.id) ?? { total: 0, used: 0 };
        return {
          user_id: p.id,
          full_name: p.full_name,
          email: p.email,
          roles: rolesByUser.get(p.id) ?? [],
          is_required: !!m.is_required,
          enrolled_at: m.enrolled_at ?? null,
          last_verified_at: m.last_verified_at ?? null,
          required_at: m.required_at ?? null,
          grace_period_ends_at: m.grace_period_ends_at ?? null,
          recovery_codes_total: c.total,
          recovery_codes_used: c.used,
        };
      });
    },
  });
}

export function useSetMfaRequired() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { target_user_id: string; is_required: boolean; grace_period_days?: number }) => {
      const { data, error } = await supabase.functions.invoke("mfa-admin-set-required", { body: vars });
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mfa-roster"] }),
  });
}

export function useGenerateRecoveryCodes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { target_user_id?: string }) => {
      const { data, error } = await supabase.functions.invoke("mfa-generate-recovery-codes", { body: vars });
      if (error) throw error;
      return data as { codes: string[] };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mfa-roster"] }),
  });
}

export function useRedeemRecoveryCode() {
  return useMutation({
    mutationFn: async (code: string) => {
      const { data, error } = await supabase.functions.invoke("mfa-redeem-recovery-code", { body: { code } });
      if (error) throw error;
      return data;
    },
  });
}

export function useSyncMfaStatus() {
  return useMutation({
    mutationFn: async (event: "enrolled" | "verified") => {
      const { data, error } = await supabase.functions.invoke("mfa-sync-status", { body: { event } });
      if (error) throw error;
      return data;
    },
  });
}
