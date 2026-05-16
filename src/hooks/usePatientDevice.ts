import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getDeviceInfo, nativePlatform } from "@/lib/native";

/**
 * Registers/updates the current patient device row whenever a portal patient
 * is signed in. Push token (if available) is upserted via usePushNotifications;
 * this hook is responsible for the device-identity record (model, platform,
 * last_seen_at) so admins can audit which devices have portal access.
 */
export function usePatientDevice(patientId?: string | null) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id || !patientId) return;
    let cancelled = false;

    (async () => {
      const info = await getDeviceInfo();
      if (!info || cancelled) return;

      const row = {
        patient_id: patientId,
        user_id: user.id,
        device_type: nativePlatform(),
        device_token: info.deviceId,
        device_name: `${info.manufacturer || ""} ${info.model || ""}`.trim() || "Web",
        last_seen_at: new Date().toISOString(),
      };

      const { error } = await (supabase as any)
        .from("patient_devices")
        .upsert(row, { onConflict: "user_id,device_token" });

      if (error) console.warn("[patient_devices] upsert failed", error);
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, patientId]);
}
