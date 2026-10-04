// Staff-only management of patient portal logins (create / reset / disable / enable / status).
import { z } from "npm:zod@3.23.8";
import { getCorsHeaders } from "../_shared/cors.ts";
import { requireAuth, userHasAnyRole, forbidden } from "../_shared/auth.ts";

const Body = z.object({
  action: z.enum(["status", "create", "reset", "disable", "enable"]),
  patient_id: z.string().uuid(),
  email: z.string().email().max(255).optional(),
});

function tempPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return Array.from(bytes, (b) => chars[b % chars.length]).join("") + "!7";
}

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req);
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const auth = await requireAuth(req);
    if (!auth.ok) return auth.response;
    const { admin, userId } = auth;

    if (!(await userHasAnyRole(admin, userId, ["org_admin", "super_admin", "receptionist"]))) {
      return forbidden(req, "Only reception or admin staff can manage portal access");
    }

    const parsed = Body.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
    const { action, patient_id, email } = parsed.data;

    const [{ data: staff }, { data: patient }] = await Promise.all([
      admin.from("profiles").select("organization_id").eq("id", userId).maybeSingle(),
      admin.from("patients").select("id, organization_id, email, first_name, last_name").eq("id", patient_id).maybeSingle(),
    ]);
    if (!patient) return json({ error: "Patient not found" }, 404);
    const isSuper = await userHasAnyRole(admin, userId, ["super_admin"]);
    if (!isSuper && (staff as any)?.organization_id !== (patient as any).organization_id) {
      return forbidden(req, "Patient belongs to another organization");
    }

    const { data: acct } = await admin
      .from("patient_portal_accounts")
      .select("id, user_id, is_active, last_login_at, created_at")
      .eq("patient_id", patient_id)
      .maybeSingle();

    const loginEmail = async (uid: string) => (await admin.auth.admin.getUserById(uid)).data.user?.email ?? null;

    if (action === "status") {
      if (!acct) return json({ exists: false });
      return json({ exists: true, is_active: (acct as any).is_active, last_login_at: (acct as any).last_login_at, created_at: (acct as any).created_at, email: await loginEmail((acct as any).user_id) });
    }

    if (action === "create") {
      if (acct) return json({ error: "This patient already has portal access" }, 409);
      const addr = (email || (patient as any).email || "").trim().toLowerCase();
      if (!z.string().email().safeParse(addr).success) return json({ error: "A valid email is required" }, 400);
      const password = tempPassword();
      const { data: created, error } = await admin.auth.admin.createUser({
        email: addr, password, email_confirm: true,
        user_metadata: { full_name: `${(patient as any).first_name ?? ""} ${(patient as any).last_name ?? ""}`.trim(), portal: true },
      });
      if (error || !created.user) return json({ error: error?.message || "Could not create login" }, 400);
      const { error: insErr } = await admin.from("patient_portal_accounts").insert({
        patient_id, user_id: created.user.id, organization_id: (patient as any).organization_id, created_by: userId, is_active: true,
      });
      if (insErr) {
        await admin.auth.admin.deleteUser(created.user.id);
        return json({ error: insErr.message }, 400);
      }
      // Portal-only login: make sure no staff role lingers from the signup trigger
      await admin.from("user_roles").delete().eq("user_id", created.user.id).neq("role", "patient");
      return json({ ok: true, email: addr, password });
    }

    if (!acct) return json({ error: "No portal access for this patient" }, 404);
    const uid = (acct as any).user_id;

    if (action === "reset") {
      const password = tempPassword();
      const { error } = await admin.auth.admin.updateUserById(uid, { password });
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true, email: await loginEmail(uid), password });
    }

    const active = action === "enable";
    const { error } = await admin.from("patient_portal_accounts").update({ is_active: active }).eq("id", (acct as any).id);
    if (error) return json({ error: error.message }, 400);
    await admin.auth.admin.updateUserById(uid, { ban_duration: active ? "none" : "876000h" });
    return json({ ok: true, is_active: active });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unexpected error" }, 500);
  }
});
