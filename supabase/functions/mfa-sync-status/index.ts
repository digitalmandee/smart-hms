import { requireAuth } from "../_shared/auth.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

interface Body {
  event: "enrolled" | "verified";
}

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  let body: Body;
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  if (body.event !== "enrolled" && body.event !== "verified") {
    return new Response(JSON.stringify({ error: "Invalid event" }), {
      status: 400, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  // Verify the user actually has a verified TOTP factor
  const { data: factorList } = await auth.admin.auth.admin.mfa.listFactors({ userId: auth.userId });
  const hasVerified = (factorList?.factors ?? []).some(
    (f: any) => f.factor_type === "totp" && f.status === "verified",
  );

  if (!hasVerified) {
    return new Response(JSON.stringify({ error: "No verified TOTP factor" }), {
      status: 400, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const { data: profile } = await auth.admin
    .from("profiles").select("organization_id").eq("id", auth.userId).maybeSingle();

  const now = new Date().toISOString();
  const patch: Record<string, string> = { last_verified_at: now };
  if (body.event === "enrolled") patch.enrolled_at = now;

  await auth.admin.from("user_mfa_settings").upsert({
    user_id: auth.userId,
    organization_id: profile?.organization_id ?? null,
    ...patch,
  }, { onConflict: "user_id" });

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...cors, "Content-Type": "application/json" },
  });
});
