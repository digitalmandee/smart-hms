/**
 * Audit logging for data exports (HIPAA §164.312(b))
 */
import { supabase } from "@/integrations/supabase/client";

export async function logExportAudit(params: {
  entityType: string;
  recordCount: number;
  exportFormat: "csv" | "pdf";
  filename: string;
}): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Get org id from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single();

    await supabase.from("audit_logs").insert({
      action: "data_export",
      entity_type: params.entityType,
      user_id: user.id,
      organization_id: profile?.organization_id ?? null,
      new_values: {
        export_format: params.exportFormat,
        record_count: params.recordCount,
        filename: params.filename,
      },
    });
  } catch (err) {
    console.warn("Export audit log failed:", err);
  }
}
