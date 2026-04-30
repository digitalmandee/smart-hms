import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RETENTION_RULES = [
  { table: "audit_logs", interval: "12 months", column: "created_at" },
  { table: "kiosk_sessions", interval: "90 days", column: "created_at" },
  { table: "kiosk_token_logs", interval: "90 days", column: "created_at" },
  { table: "notification_logs", interval: "6 months", column: "created_at" },
  { table: "ai_conversations", interval: "6 months", column: "created_at" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Phase 1.3: Restrict to authenticated super_admin OR cron (service-role secret).
  const cronSecret = req.headers.get("x-cron-secret");
  const expectedCron = Deno.env.get("CRON_SECRET");
  const isCron = !!expectedCron && cronSecret === expectedCron;

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  if (!isCron) {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claims } = await userClient.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (!claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const admin = createClient(supabaseUrl, serviceRoleKey);
    const { data: roles } = await admin.from("user_roles").select("role")
      .eq("user_id", claims.claims.sub).in("role", ["super_admin", "admin"]);
    if (!roles?.length) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const results: Record<string, number> = {};
    let totalDeleted = 0;

    for (const rule of RETENTION_RULES) {
      const { data, error } = await supabase.rpc("execute_retention_purge" as any, {
        p_table_name: rule.table,
        p_column_name: rule.column,
        p_interval: rule.interval,
      });

      // Fallback: use direct delete if RPC doesn't exist
      if (error) {
        // Use the supabase client to delete old records
        const cutoffDate = new Date();
        const match = rule.interval.match(/(\d+)\s*(months?|days?)/);
        if (match) {
          const amount = parseInt(match[1]);
          const unit = match[2];
          if (unit.startsWith("month")) {
            cutoffDate.setMonth(cutoffDate.getMonth() - amount);
          } else if (unit.startsWith("day")) {
            cutoffDate.setDate(cutoffDate.getDate() - amount);
          }
        }

        const { count, error: deleteError } = await supabase
          .from(rule.table)
          .delete({ count: "exact" })
          .lt(rule.column, cutoffDate.toISOString());

        if (deleteError) {
          console.error(`Failed to purge ${rule.table}:`, deleteError);
          results[rule.table] = 0;
        } else {
          results[rule.table] = count || 0;
          totalDeleted += count || 0;
        }
      } else {
        const count = typeof data === "number" ? data : 0;
        results[rule.table] = count;
        totalDeleted += count;
      }
    }

    // Log the purge action
    await supabase.from("audit_logs").insert({
      action: "data_retention_purge",
      entity_type: "system",
      entity_id: null,
      new_values: { results, total_deleted: totalDeleted, timestamp: new Date().toISOString() },
    });

    const response = {
      success: true,
      total_deleted: totalDeleted,
      details: results,
      executed_at: new Date().toISOString(),
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("Data retention purge error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
