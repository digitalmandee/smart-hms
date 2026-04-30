/**
 * Public health endpoint for uptime monitors.
 * Returns 200 + JSON when DB is reachable, 503 otherwise.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { getCorsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const start = Date.now();
  try {
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );
    const { error } = await sb.from("organizations").select("id").limit(1);
    if (error) throw error;
    return new Response(
      JSON.stringify({
        status: "ok",
        db: "ok",
        latency_ms: Date.now() - start,
        time: new Date().toISOString(),
      }),
      { status: 200, headers: { ...cors, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({
        status: "degraded",
        db: "fail",
        latency_ms: Date.now() - start,
        time: new Date().toISOString(),
        error: e instanceof Error ? e.message : String(e),
      }),
      { status: 503, headers: { ...cors, "Content-Type": "application/json" } },
    );
  }
});
