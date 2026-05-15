import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

interface OutboxItem {
  client_uuid: string;
  device_id: string;
  organization_id: string;
  entity_type: "mobile_visits" | "home_visits" | "immunizations" | "payment_gateway_transactions";
  operation: "insert" | "update";
  payload: Record<string, unknown>;
  client_created_at: string;
}

const ALLOWED_ENTITIES = new Set([
  "mobile_visits",
  "home_visits",
  "immunizations",
  "payment_gateway_transactions",
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "missing_auth" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // RLS-aware client (uses caller's JWT)
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    // Service client for sync_outbox audit only
    const adminClient = createClient(supabaseUrl, serviceKey);

    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "invalid_auth" }, 401);
    const user_id = userData.user.id;

    const body = await req.json().catch(() => null);
    const items: OutboxItem[] = body?.items;
    if (!Array.isArray(items)) return json({ error: "invalid_body" }, 400);

    const results: Array<{ client_uuid: string; status: string; server_id?: string; error?: string }> = [];

    for (const item of items) {
      try {
        if (!ALLOWED_ENTITIES.has(item.entity_type)) {
          results.push({ client_uuid: item.client_uuid, status: "failed", error: "entity_not_allowed" });
          continue;
        }
        if (!item.client_uuid || !item.organization_id) {
          results.push({ client_uuid: item.client_uuid, status: "failed", error: "missing_fields" });
          continue;
        }

        const payload: Record<string, unknown> = {
          ...item.payload,
          client_uuid: item.client_uuid,
          organization_id: item.organization_id,
        };

        // Idempotent upsert via the unique client_uuid index
        const { data, error } = await userClient
          .from(item.entity_type)
          .upsert(payload, { onConflict: "client_uuid" })
          .select("id")
          .limit(1);

        if (error) {
          const msg = error.message ?? "db_error";
          // Conflict-like errors: surface for manual resolution
          const isConflict = /conflict|version|stale/i.test(msg);
          results.push({
            client_uuid: item.client_uuid,
            status: isConflict ? "conflict" : "failed",
            error: msg,
          });

          await adminClient.from("sync_outbox").upsert({
            client_uuid: item.client_uuid,
            organization_id: item.organization_id,
            device_id: item.device_id,
            user_id,
            entity_type: item.entity_type,
            operation: item.operation,
            payload: item.payload,
            client_created_at: item.client_created_at,
            status: isConflict ? "conflict" : "failed",
            error_message: msg,
          }, { onConflict: "client_uuid" });

          if (isConflict) {
            await adminClient.from("sync_conflicts").insert({
              outbox_id: null,
              conflict_type: "server_newer_or_validation",
              client_record: item.payload,
              server_record: null,
            }).select().limit(1);
          }
          continue;
        }

        const server_id = data?.[0]?.id ?? null;
        await adminClient.from("sync_outbox").upsert({
          client_uuid: item.client_uuid,
          organization_id: item.organization_id,
          device_id: item.device_id,
          user_id,
          entity_type: item.entity_type,
          operation: item.operation,
          payload: item.payload,
          client_created_at: item.client_created_at,
          status: "applied",
          applied_at: new Date().toISOString(),
          applied_record_id: server_id,
        }, { onConflict: "client_uuid" });

        results.push({ client_uuid: item.client_uuid, status: "applied", server_id });
      } catch (e) {
        results.push({
          client_uuid: item.client_uuid,
          status: "failed",
          error: (e as Error).message ?? "unknown",
        });
      }
    }

    return json({ results });
  } catch (e) {
    return json({ error: (e as Error).message ?? "server_error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
