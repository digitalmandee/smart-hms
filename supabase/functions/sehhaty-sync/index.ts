// Sehhaty bidirectional sync.
// Actions:
//   { action: "pull", patient_id, sync_types?: ["vaccination_certificates","sick_leaves","referrals"] }
//   { action: "push", patient_id, sync_type: "immunization", reference_id }
//   { action: "health" }  -> returns last-success timestamps + recent error counts
//
// Sandbox mode (no SEHHATY_API_KEY) returns deterministic stub data so the dashboard
// shows realistic flow during pilot before MOH credentials are issued.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { getCorsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SEHHATY_URL = Deno.env.get("SEHHATY_API_URL") || "https://api.sehhaty.sa/v1";
const SEHHATY_KEY = Deno.env.get("SEHHATY_API_KEY");
const SANDBOX = !SEHHATY_KEY;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

interface AuthCtx { user_id: string; organization_id: string }

async function authorize(req: Request): Promise<AuthCtx | null> {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: auth } },
  });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return null;
  const { data: profile } = await admin
    .from("profiles")
    .select("organization_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile?.organization_id) return null;
  return { user_id: user.id, organization_id: profile.organization_id };
}

async function callSehhaty(path: string, init: RequestInit = {}) {
  if (SANDBOX) return { sandbox: true };
  const r = await fetch(`${SEHHATY_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${SEHHATY_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.message || `Sehhaty HTTP ${r.status}`);
  return j;
}

function sandboxVaccinationCerts(nationalId: string) {
  return [{
    id: `SHC-${nationalId.slice(-4)}-${Math.floor(Math.random() * 9000 + 1000)}`,
    certificate_number: `VC-${nationalId.slice(-6)}`,
    vaccine_name: "COVID-19 Pfizer",
    dose_number: 3,
    administered_date: "2025-11-12",
    issued_at: new Date().toISOString(),
  }];
}
function sandboxSickLeaves(nationalId: string) {
  return [{
    id: `SLV-${nationalId.slice(-4)}-${Math.floor(Math.random() * 9000 + 1000)}`,
    start_date: "2026-04-10", end_date: "2026-04-12", days_count: 3,
    reason: "Acute pharyngitis",
    issuing_doctor_name: "Dr. Ahmed Al-Mutairi",
    issuing_facility: "King Saud Medical City",
  }];
}
function sandboxReferrals(nationalId: string) {
  return [{
    id: `REF-${nationalId.slice(-4)}-${Math.floor(Math.random() * 9000 + 1000)}`,
    referring_facility: "PHC Riyadh-04",
    receiving_facility: "King Faisal Specialist Hospital",
    specialty: "Cardiology",
    status: "scheduled",
    referral_date: "2026-05-08",
  }];
}

async function pull(ctx: AuthCtx, patientId: string, types: string[]) {
  const { data: patient } = await admin
    .from("patients").select("id, national_id, organization_id")
    .eq("id", patientId).maybeSingle();
  if (!patient) throw new Error("patient not found");
  if (!patient.national_id) throw new Error("patient has no national_id");

  const out: Record<string, number> = {};

  if (types.includes("vaccination_certificates")) {
    const raw = SANDBOX
      ? sandboxVaccinationCerts(patient.national_id)
      : (await callSehhaty(`/patients/${patient.national_id}/vaccinations`))?.items ?? [];
    for (const r of raw) {
      await admin.from("sehhaty_vaccination_certificates").upsert({
        organization_id: ctx.organization_id,
        patient_id: patient.id,
        sehhaty_certificate_id: r.id,
        certificate_number: r.certificate_number,
        vaccine_name: r.vaccine_name,
        dose_number: r.dose_number,
        administered_date: r.administered_date,
        issued_at: r.issued_at,
        payload: r,
        pulled_at: new Date().toISOString(),
      }, { onConflict: "sehhaty_certificate_id" });
    }
    out.vaccination_certificates = raw.length;
  }

  if (types.includes("sick_leaves")) {
    const raw = SANDBOX
      ? sandboxSickLeaves(patient.national_id)
      : (await callSehhaty(`/patients/${patient.national_id}/sick-leaves`))?.items ?? [];
    for (const r of raw) {
      await admin.from("sehhaty_sick_leaves").upsert({
        organization_id: ctx.organization_id,
        patient_id: patient.id,
        sehhaty_sickleave_id: r.id,
        start_date: r.start_date, end_date: r.end_date, days_count: r.days_count,
        reason: r.reason, issuing_doctor_name: r.issuing_doctor_name,
        issuing_facility: r.issuing_facility, payload: r,
        pulled_at: new Date().toISOString(),
      }, { onConflict: "sehhaty_sickleave_id" });
    }
    out.sick_leaves = raw.length;
  }

  if (types.includes("referrals")) {
    const raw = SANDBOX
      ? sandboxReferrals(patient.national_id)
      : (await callSehhaty(`/patients/${patient.national_id}/referrals`))?.items ?? [];
    for (const r of raw) {
      await admin.from("sehhaty_referrals").upsert({
        organization_id: ctx.organization_id,
        patient_id: patient.id,
        sehhaty_referral_id: r.id,
        referring_facility: r.referring_facility,
        receiving_facility: r.receiving_facility,
        specialty: r.specialty,
        status: r.status,
        referral_date: r.referral_date,
        payload: r,
        pulled_at: new Date().toISOString(),
      }, { onConflict: "sehhaty_referral_id" });
    }
    out.referrals = raw.length;
  }

  await admin.from("sehhaty_sync_log").insert({
    organization_id: ctx.organization_id,
    patient_id: patient.id,
    sync_type: "pull",
    submission_status: "success",
    submission_response: out,
    submitted_at: new Date().toISOString(),
    created_by: ctx.user_id,
  });

  return { sandbox: SANDBOX, pulled: out };
}

async function pushImmunization(ctx: AuthCtx, patientId: string, immunizationId: string) {
  const { data: imm } = await admin.from("immunizations").select("*").eq("id", immunizationId).maybeSingle();
  if (!imm) throw new Error("immunization not found");
  const { data: patient } = await admin.from("patients").select("national_id").eq("id", patientId).maybeSingle();
  if (!patient?.national_id) throw new Error("patient has no national_id");

  const fhir = {
    resourceType: "Immunization",
    status: "completed",
    vaccineCode: { text: imm.vaccine_name ?? imm.vaccine_code },
    patient: { identifier: { system: "http://nphies.sa/identifier/nationalid", value: patient.national_id } },
    occurrenceDateTime: imm.administered_at ?? imm.scheduled_at ?? imm.created_at,
    lotNumber: imm.lot_number,
  };

  let reference: string | null = null;
  let status = "success";
  let response: unknown = { sandbox: true };
  try {
    if (SANDBOX) {
      reference = `SHX-IMM-${crypto.randomUUID().slice(0, 8)}`;
    } else {
      const r = await callSehhaty("/immunizations", { method: "POST", body: JSON.stringify(fhir) });
      reference = r?.id ?? null;
      response = r;
    }
  } catch (err) {
    status = "failed";
    response = { error: String(err) };
  }

  await admin.from("sehhaty_sync_log").insert({
    organization_id: ctx.organization_id,
    patient_id: patientId,
    sync_type: "immunization",
    reference_type: "immunization",
    reference_id: immunizationId,
    sehhaty_reference_id: reference,
    submission_status: status,
    submission_response: response,
    submitted_at: new Date().toISOString(),
    created_by: ctx.user_id,
  });

  return { sandbox: SANDBOX, status, sehhaty_reference_id: reference };
}

async function health(ctx: AuthCtx) {
  const since = new Date(Date.now() - 7 * 86400_000).toISOString();
  const { data: logs } = await admin
    .from("sehhaty_sync_log")
    .select("sync_type, submission_status, submitted_at")
    .eq("organization_id", ctx.organization_id)
    .gte("submitted_at", since)
    .order("submitted_at", { ascending: false })
    .limit(500);

  const summary: Record<string, { last_success?: string; success: number; failed: number }> = {};
  for (const l of logs ?? []) {
    const key = l.sync_type || "unknown";
    if (!summary[key]) summary[key] = { success: 0, failed: 0 };
    if (l.submission_status === "success") {
      summary[key].success++;
      if (!summary[key].last_success) summary[key].last_success = l.submitted_at ?? undefined;
    } else {
      summary[key].failed++;
    }
  }
  return { sandbox: SANDBOX, window: "7d", summary };
}

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const ctx = await authorize(req);
    if (!ctx) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });

    const body = await req.json().catch(() => ({}));
    const action = body.action;

    let result: unknown;
    if (action === "pull") {
      const types = Array.isArray(body.sync_types) && body.sync_types.length
        ? body.sync_types
        : ["vaccination_certificates", "sick_leaves", "referrals"];
      result = await pull(ctx, body.patient_id, types);
    } else if (action === "push" && body.sync_type === "immunization") {
      result = await pushImmunization(ctx, body.patient_id, body.reference_id);
    } else if (action === "health") {
      result = await health(ctx);
    } else {
      return new Response(JSON.stringify({ error: "unknown action" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify(result), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
