import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const KIOSK_SESSION_KEY = "kiosk_session_token";

export interface KioskSession {
  valid: boolean;
  kioskId: string | null;
  sessionId: string | null;
  kioskName: string | null;
  kioskType: string | null;
  departments: string[];
  organizationId: string | null;
  displayMessage: string | null;
}

export function useKioskAuth() {
  const [session, setSession] = useState<KioskSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const validateSession = useCallback(async () => {
    const token = localStorage.getItem(KIOSK_SESSION_KEY);
    if (!token) {
      setSession(null);
      setIsLoading(false);
      return null;
    }

    try {
      const { data, error } = await (supabase as any).rpc("validate_kiosk_session", {
        p_session_token: token,
      });

      if (error) throw error;

      if (data && data.length > 0 && data[0].valid) {
        const s = data[0];
        const sessionData: KioskSession = {
          valid: true,
          kioskId: s.kiosk_id,
          sessionId: s.session_id,
          kioskName: s.kiosk_name,
          kioskType: s.kiosk_type,
          departments: s.departments || [],
          organizationId: s.organization_id,
          displayMessage: s.display_message,
        };
        setSession(sessionData);
        setError(null);
        return sessionData;
      } else {
        localStorage.removeItem(KIOSK_SESSION_KEY);
        setSession(null);
        return null;
      }
    } catch (err: any) {
      console.error("Session validation error:", err);
      localStorage.removeItem(KIOSK_SESSION_KEY);
      setSession(null);
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (username: string, password: string, deviceInfo?: any) => {
    setIsLoading(true);
    setError(null);

    try {
      // Find kiosk by username using secure RPC (no password hash exposure)
      const { data: kioskResult, error: kioskError } = await (supabase as any).rpc(
        "get_active_kiosk_by_username",
        { p_username: username }
      );

      if (kioskError) throw kioskError;

      const kiosk = kioskResult && kioskResult.length > 0 ? kioskResult[0] : null;

      if (!kiosk) {
        throw new Error("Invalid username or password");
      }

      // Verify password
      const { data: isValid, error: verifyError } = await (supabase as any).rpc(
        "verify_kiosk_password",
        { kiosk_id: kiosk.id, password }
      );

      if (verifyError) throw verifyError;
      if (!isValid) {
        throw new Error("Invalid username or password");
      }

      // Create session
      const { data: sessionData, error: sessionError } = await (supabase as any).rpc(
        "create_kiosk_session",
        {
          p_kiosk_id: kiosk.id,
          p_device_info: deviceInfo || {},
          p_ip_address: null,
        }
      );

      if (sessionError) throw sessionError;
      if (!sessionData || sessionData.length === 0) {
        throw new Error("Failed to create session");
      }

      const { session_token } = sessionData[0];
      localStorage.setItem(KIOSK_SESSION_KEY, session_token);

      // Validate and get full session details
      return await validateSession();
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
      return null;
    }
  }, [validateSession]);

  const logout = useCallback(async () => {
    const token = localStorage.getItem(KIOSK_SESSION_KEY);
    if (token) {
      try {
        await (supabase as any)
          .from("kiosk_sessions")
          .update({ is_active: false, ended_at: new Date().toISOString() })
          .eq("session_token", token);
      } catch (err) {
        console.error("Logout error:", err);
      }
    }
    localStorage.removeItem(KIOSK_SESSION_KEY);
    setSession(null);
  }, []);

  const refreshActivity = useCallback(async () => {
    const token = localStorage.getItem(KIOSK_SESSION_KEY);
    if (token) {
      await (supabase as any)
        .from("kiosk_sessions")
        .update({ last_activity_at: new Date().toISOString() })
        .eq("session_token", token);
    }
  }, []);

  useEffect(() => {
    validateSession();
  }, [validateSession]);

  // Refresh activity every 5 minutes
  useEffect(() => {
    if (!session?.valid) return;

    const interval = setInterval(refreshActivity, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [session?.valid, refreshActivity]);

  return {
    session,
    isLoading,
    error,
    login,
    logout,
    validateSession,
    refreshActivity,
    isAuthenticated: session?.valid ?? false,
  };
}

export function useKioskSessions(organizationId?: string) {
  return {
    async getSessions(includeInactive = false) {
      let query = (supabase as any)
        .from("kiosk_sessions")
        .select(`
          *,
          kiosk:kiosk_configs(name, kiosk_type)
        `)
        .order("started_at", { ascending: false });

      if (organizationId) {
        query = query.eq("organization_id", organizationId);
      }

      if (!includeInactive) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data;
    },

    async endSession(sessionId: string) {
      const { error } = await (supabase as any)
        .from("kiosk_sessions")
        .update({ is_active: false, ended_at: new Date().toISOString() })
        .eq("id", sessionId);
      if (error) throw error;
    },
  };
}

export function useKioskTokenLogs(organizationId?: string) {
  return {
    async getLogs(filters?: { kioskId?: string; dateFrom?: string; dateTo?: string; limit?: number }) {
      let query = (supabase as any)
        .from("kiosk_token_logs")
        .select(`
          *,
          kiosk:kiosk_configs(name, kiosk_type)
        `)
        .order("generated_at", { ascending: false });

      if (organizationId) {
        query = query.eq("organization_id", organizationId);
      }

      if (filters?.kioskId) {
        query = query.eq("kiosk_id", filters.kioskId);
      }

      if (filters?.dateFrom) {
        query = query.gte("generated_at", filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte("generated_at", filters.dateTo);
      }

      const { data, error } = await query.limit(filters?.limit || 500);
      if (error) throw error;
      return data;
    },
  };
}

export async function logKioskToken(params: {
  kioskId: string;
  sessionId: string;
  organizationId: string;
  appointmentId?: string;
  tokenNumber: number;
  patientName?: string;
  patientPhone?: string;
  doctorName?: string;
  department?: string;
  priority?: number;
}) {
  const { data, error } = await (supabase as any).rpc("log_kiosk_token", {
    p_kiosk_id: params.kioskId,
    p_session_id: params.sessionId,
    p_organization_id: params.organizationId,
    p_appointment_id: params.appointmentId || null,
    p_token_number: params.tokenNumber,
    p_patient_name: params.patientName || null,
    p_patient_phone: params.patientPhone || null,
    p_doctor_name: params.doctorName || null,
    p_department: params.department || null,
    p_priority: params.priority || 0,
  });

  if (error) throw error;
  return data;
}
