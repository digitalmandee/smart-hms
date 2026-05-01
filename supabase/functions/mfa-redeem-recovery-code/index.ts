import { requireAuth } from "../_shared/auth.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

interface Body {
  code: string;
}

async function sha256(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
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

  const code = (body.code || "").trim().toUpperCase();
  if (!/^[A-Z0-9]{5}-[A-Z0-9]{5}$/.test(code)) {
    return new Response(JSON.stringify({ error: "Invalid code format" }), {
      status: 400, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const hash = await sha256(code);

  const { data: row } = await auth.admin
    .from("user_mfa_recovery_codes")
    .select("id, used_at")
    .eq("user_id", auth.userId)
    .eq("code_hash", hash)
    .maybeSingle();

  if (!row || row.used_at) {
    return new Response(JSON.stringify({ error: "Invalid or already used code" }), {
      status: 400, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  // Mark used
  await auth.admin
    .from("user_mfa_recovery_codes")
    .update({ used_at: new Date().toISOString() })
    .eq("id", row.id);

  // Unenroll all TOTP factors so user can re-enroll on next login
  const { data: factorList } = await auth.admin.auth.admin.mfa.listFactors({ userId: auth.userId });
  const factors = factorList?.factors ?? [];
  for (const f of factors) {
    if (f.factor_type === "totp") {
      await auth.admin.auth.admin.mfa.deleteFactor({ userId: auth.userId, id: f.id });
    }
  }

  // Reset enrollment timestamp so user is prompted again
  await auth.admin.from("user_mfa_settings")
    .update({ enrolled_at: null, last_verified_at: null })
    .eq("user_id", auth.userId);

  // Audit
  const { data: profile } = await auth.admin
    .from("profiles").select("organization_id").eq("id", auth.userId).maybeSingle();
  await auth.admin.from("audit_logs").insert({
    organization_id: profile?.organization_id ?? null,
    user_id: auth.userId,
    action: "mfa.recovery_code_redeemed",
    entity_type: "user_mfa_recovery_codes",
    entity_id: auth.userId,
  });

  return new Response(JSON.stringify({ ok: true, factors_removed: factors.length }), {
    headers: { ...cors, "Content-Type": "application/json" },
  });
});
