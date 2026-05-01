import { requireAuth, userHasAnyRole, forbidden } from "../_shared/auth.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

const ADMIN_ROLES = ["super_admin", "org_admin", "branch_admin"];
const CODE_COUNT = 10;

interface Body {
  target_user_id?: string; // omit to generate for self
}

function generateCode(): string {
  // 10 chars: groups of 5, base32-ish without ambiguous chars
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < 10; i++) {
    out += alphabet[bytes[i] % alphabet.length];
    if (i === 4) out += "-";
  }
  return out;
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

  let body: Body = {};
  try { body = await req.json(); } catch { /* allow empty */ }

  const targetUserId = body.target_user_id || auth.userId;
  const isSelf = targetUserId === auth.userId;

  if (!isSelf) {
    const isAdmin = await userHasAnyRole(auth.admin, auth.userId, ADMIN_ROLES);
    if (!isAdmin) return forbidden(req);

    const { data: targetProfile } = await auth.admin
      .from("profiles").select("organization_id").eq("id", targetUserId).maybeSingle();
    if (!targetProfile) {
      return new Response(JSON.stringify({ error: "Target user not found" }), {
        status: 404, headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    const isSuper = await userHasAnyRole(auth.admin, auth.userId, ["super_admin"]);
    const { data: callerProfile } = await auth.admin
      .from("profiles").select("organization_id").eq("id", auth.userId).maybeSingle();
    if (!isSuper && callerProfile?.organization_id !== targetProfile.organization_id) {
      return forbidden(req, "Cross-organization action not permitted");
    }
  }

  // Invalidate previous unused codes
  await auth.admin
    .from("user_mfa_recovery_codes")
    .delete()
    .eq("user_id", targetUserId)
    .is("used_at", null);

  // Generate fresh batch
  const plaintexts: string[] = [];
  const rows: { user_id: string; code_hash: string }[] = [];
  for (let i = 0; i < CODE_COUNT; i++) {
    const code = generateCode();
    plaintexts.push(code);
    rows.push({ user_id: targetUserId, code_hash: await sha256(code) });
  }

  const { error } = await auth.admin.from("user_mfa_recovery_codes").insert(rows);
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  // Audit
  const { data: targetProfile } = await auth.admin
    .from("profiles").select("organization_id").eq("id", targetUserId).maybeSingle();
  await auth.admin.from("audit_logs").insert({
    organization_id: targetProfile?.organization_id ?? null,
    user_id: auth.userId,
    action: "mfa.recovery_codes_generated",
    entity_type: "user_mfa_recovery_codes",
    entity_id: targetUserId,
    new_values: { count: CODE_COUNT, by_admin: !isSelf },
  });

  return new Response(JSON.stringify({ codes: plaintexts }), {
    headers: { ...cors, "Content-Type": "application/json" },
  });
});
