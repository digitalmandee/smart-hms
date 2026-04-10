import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { maskPhiFields } from "@/lib/phiMasking";

const DEBOUNCE_KEY_PREFIX = "phi_access_";
const DEBOUNCE_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Logs PHI access to audit_logs when a user views a sensitive record.
 * Debounces: max 1 log per entity per user per 5 minutes.
 */
export function usePhiAccessLog(
  entityType: string,
  entityId: string | undefined
) {
  const { user, profile } = useAuth();
  const loggedRef = useRef(false);

  useEffect(() => {
    if (!user || !entityId || loggedRef.current) return;

    const cacheKey = `${DEBOUNCE_KEY_PREFIX}${entityType}_${entityId}_${user.id}`;
    const lastLog = sessionStorage.getItem(cacheKey);

    if (lastLog && Date.now() - parseInt(lastLog) < DEBOUNCE_MS) {
      loggedRef.current = true;
      return;
    }

    loggedRef.current = true;
    sessionStorage.setItem(cacheKey, String(Date.now()));

    supabase
      .from("audit_logs")
      .insert({
        action: "phi_access",
        entity_type: entityType,
        entity_id: entityId,
        user_id: user.id,
        organization_id: profile?.organization_id ?? null,
        new_values: {
          access_type: "view",
          page: window.location.pathname,
        },
      })
      .then(({ error }) => {
        if (error) {
          console.warn("PHI access log failed:", error.message);
        }
      });
  }, [user, entityId, entityType, profile?.organization_id]);
}
