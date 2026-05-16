import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { getCorsHeaders } from "../_shared/cors.ts";

// WhatsApp Business Cloud API dispatcher.
// Reads queued rows from whatsapp_message_log, sends via Meta Cloud API,
// updates status/provider_message_id. Falls back to sandbox mode if creds missing.

const GRAPH_URL = "https://graph.facebook.com/v20.0";

interface QueuedRow {
  id: string;
  patient_id: string | null;
  recipient_phone: string;
  template_name: string;
  language_code: string;
  payload: Record<string, unknown>;
}

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const token = Deno.env.get("WHATSAPP_TOKEN");
    const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
    const sandbox = !token || !phoneNumberId;

    let body: { message_id?: string; limit?: number } = {};
    try { body = await req.json(); } catch { /* ignore */ }

    let query = admin
      .from("whatsapp_message_log")
      .select("id, patient_id, recipient_phone, template_name, language_code, payload")
      .eq("status", "queued")
      .order("created_at", { ascending: true })
      .limit(body.limit ?? 25);

    if (body.message_id) query = admin.from("whatsapp_message_log")
      .select("id, patient_id, recipient_phone, template_name, language_code, payload")
      .eq("id", body.message_id);

    const { data: rows, error } = await query;
    if (error) throw error;

    const results: Array<{ id: string; status: string; error?: string }> = [];

    for (const row of (rows ?? []) as QueuedRow[]) {
      try {
        let providerId = `SANDBOX-${Date.now()}`;
        if (!sandbox) {
          const payload = {
            messaging_product: "whatsapp",
            to: row.recipient_phone.replace(/[^\d+]/g, ""),
            type: "template",
            template: {
              name: row.template_name,
              language: { code: row.language_code || "en" },
              components: row.payload?.components ?? [],
            },
          };
          const r = await fetch(`${GRAPH_URL}/${phoneNumberId}/messages`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
          const j = await r.json();
          if (!r.ok) throw new Error(j?.error?.message || `HTTP ${r.status}`);
          providerId = j?.messages?.[0]?.id ?? providerId;
        }

        await admin.from("whatsapp_message_log").update({
          status: "sent",
          provider_message_id: providerId,
          sent_at: new Date().toISOString(),
        }).eq("id", row.id);

        results.push({ id: row.id, status: "sent" });
      } catch (err) {
        await admin.from("whatsapp_message_log").update({
          status: "failed",
          error_message: String(err),
        }).eq("id", row.id);
        results.push({ id: row.id, status: "failed", error: String(err) });
      }
    }

    return new Response(
      JSON.stringify({ sandbox, processed: results.length, results }),
      { headers: { ...cors, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
