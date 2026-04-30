/**
 * JWT verification + role gating for edge functions (Phase 1.3).
 *
 * Usage:
 *   const auth = await requireAuth(req);
 *   if (!auth.ok) return auth.response;
 *   const { userId, claims } = auth;
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { getCorsHeaders } from "./cors.ts";

export interface AuthOk {
  ok: true;
  userId: string;
  email?: string;
  claims: Record<string, unknown>;
  /** Authenticated supabase client (uses caller's JWT, RLS-respecting). */
  supabase: ReturnType<typeof createClient>;
  /** Service-role client for elevated operations (use carefully). */
  admin: ReturnType<typeof createClient>;
}

export interface AuthErr {
  ok: false;
  response: Response;
}

export async function requireAuth(req: Request): Promise<AuthOk | AuthErr> {
  const cors = getCorsHeaders(req);
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...cors, "Content-Type": "application/json" },
      }),
    };
  }

  const url = Deno.env.get("SUPABASE_URL")!;
  const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const supabase = createClient(url, anon, {
    global: { headers: { Authorization: authHeader } },
  });

  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims?.sub) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...cors, "Content-Type": "application/json" },
      }),
    };
  }

  return {
    ok: true,
    userId: data.claims.sub as string,
    email: data.claims.email as string | undefined,
    claims: data.claims as Record<string, unknown>,
    supabase,
    admin: createClient(url, serviceKey),
  };
}

/** Returns true if user has any of the given roles. Uses service role to read user_roles. */
export async function userHasAnyRole(
  admin: ReturnType<typeof createClient>,
  userId: string,
  roles: string[],
): Promise<boolean> {
  const { data } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", roles);
  return (data?.length ?? 0) > 0;
}

export function forbidden(req: Request, message = "Forbidden"): Response {
  const cors = getCorsHeaders(req);
  return new Response(JSON.stringify({ error: message }), {
    status: 403,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
