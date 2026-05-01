import { requireAuth, userHasAnyRole, forbidden } from "../_shared/auth.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

const ADMIN_ROLES = ["super_admin", "org_admin", "branch_admin"];

interface Body {
  target_user_id: string;
  is_required: boolean;
  grace_period_days?: number; // 0 = enforce immediately
}

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  const isAdmin = await userHasAnyRole(auth.admin, auth.userId, ADMIN_ROLES);
  if (!isAdmin) return forbidden(req);

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  if (!body.target_user_id || typeof body.is_required !== "boolean") {
    return new Response(JSON.stringify({ error: "target_user_id and is_required are required" }), {
      status: 400, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  // Look up target user's organization for org-scoping
  const { data: targetProfile } = await auth.admin
    .from("profiles")
    .select("organization_id")
    .eq("id", body.target_user_id)
    .maybeSingle();

  if (!targetProfile) {
    return new Response(JSON.stringify({ error: "Target user not found" }), {
      status: 404, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  // Verify caller belongs to same org (unless super_admin)
  const { data: callerProfile } = await auth.admin
    .from("profiles").select("organization_id").eq("id", auth.userId).maybeSingle();

  const isSuper = await userHasAnyRole(auth.admin, auth.userId, ["super_admin"]);
  if (!isSuper && callerProfile?.organization_id !== targetProfile.organization_id) {
    return forbidden(req, "Cross-organization action not permitted");
  }

  const graceDays = Math.max(0, Math.min(90, body.grace_period_days ?? 0));
  const graceEnd = body.is_required && graceDays > 0
    ? new Date(Date.now() + graceDays * 86400_000).toISOString()
    : null;

  const { error } = await auth.admin.from("user_mfa_settings").upsert({
    user_id: body.target_user_id,
    organization_id: targetProfile.organization_id,
    is_required: body.is_required,
    required_by: body.is_required ? auth.userId : null,
    required_at: body.is_required ? new Date().toISOString() : null,
    grace_period_ends_at: graceEnd,
  }, { onConflict: "user_id" });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  // Audit
  await auth.admin.from("audit_logs").insert({
    organization_id: targetProfile.organization_id,
    user_id: auth.userId,
    action: body.is_required ? "mfa.require" : "mfa.unrequire",
    entity_type: "user_mfa_settings",
    entity_id: body.target_user_id,
    new_values: { is_required: body.is_required, grace_period_days: graceDays },
  });

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...cors, "Content-Type": "application/json" },
  });
});
