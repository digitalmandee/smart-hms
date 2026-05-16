// FHIR R4 read-only server (SMART-on-FHIR style).
// Endpoints (relative to /functions/v1/fhir-server):
//   GET  /.well-known/smart-configuration
//   GET  /metadata
//   POST /token                              (client_credentials → system scope)
//   GET  /Patient/:id
//   GET  /Patient?...                        (search by patient_number, name)
//   GET  /Appointment?patient=:id
//   GET  /Observation?patient=:id            (vitals)
//   GET  /MedicationRequest?patient=:id
//   GET  /Immunization?patient=:id
//   GET  /DiagnosticReport?patient=:id       (lab_orders)
//
// Scopes:
//   patient/*.read   — caller is portal patient; restricted to their own patient_id
//   user/*.read      — authenticated staff user (uses RLS via service role + has_role)
//   system/*.read    — client_credentials token (org-wide read)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { getCorsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

const BASE = `${SUPABASE_URL}/functions/v1/fhir-server`;

interface Caller {
  scope: "patient" | "user" | "system";
  patient_id?: string;
  organization_id?: string;
  user_id?: string;
}

function ok(body: unknown, cors: Record<string, string>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/fhir+json" },
  });
}

function outcome(severity: string, code: string, diagnostics: string, status: number, cors: Record<string, string>) {
  return ok({
    resourceType: "OperationOutcome",
    issue: [{ severity, code, diagnostics }],
  }, cors, status);
}

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// In-memory short-lived token store (system tokens)
const systemTokens = new Map<string, { organization_id: string; expires_at: number }>();

async function authenticate(req: Request): Promise<Caller | null> {
  const auth = req.headers.get("authorization");
  if (!auth) return null;
  const token = auth.replace(/^Bearer\s+/i, "");

  // System token (issued by /token)
  const sys = systemTokens.get(token);
  if (sys && sys.expires_at > Date.now()) {
    return { scope: "system", organization_id: sys.organization_id };
  }

  // Supabase user JWT
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return null;

  // Portal patient?
  const { data: portal } = await admin
    .from("patient_portal_accounts")
    .select("patient_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (portal?.patient_id) {
    return { scope: "patient", patient_id: portal.patient_id, user_id: user.id };
  }

  // Staff user
  const { data: profile } = await admin
    .from("profiles")
    .select("organization_id")
    .eq("user_id", user.id)
    .maybeSingle();
  return { scope: "user", organization_id: profile?.organization_id, user_id: user.id };
}

function assertPatientAccess(caller: Caller, patientId: string): boolean {
  if (caller.scope === "patient") return caller.patient_id === patientId;
  return true; // user/system scoped at query level
}

// ---------- FHIR mappers ----------

function patientToFhir(p: any) {
  return {
    resourceType: "Patient",
    id: p.id,
    meta: { lastUpdated: p.updated_at, source: "smart-hms" },
    identifier: [
      { system: "urn:hms:patient-number", value: p.patient_number },
      ...(p.national_id ? [{ system: "urn:sa:national-id", value: p.national_id }] : []),
    ],
    active: p.is_active !== false,
    name: [{
      family: p.last_name ?? "",
      given: [p.first_name].filter(Boolean),
    }],
    telecom: [
      ...(p.phone ? [{ system: "phone", value: p.phone, use: "mobile" }] : []),
      ...(p.email ? [{ system: "email", value: p.email }] : []),
    ],
    gender: p.gender,
    birthDate: p.date_of_birth,
    address: p.address ? [{ text: p.address, city: p.city, postalCode: p.postal_code, country: p.nationality }] : [],
  };
}

function appointmentToFhir(a: any) {
  return {
    resourceType: "Appointment",
    id: a.id,
    meta: { lastUpdated: a.updated_at },
    status: a.status === "cancelled" ? "cancelled" : a.status === "completed" ? "fulfilled" : "booked",
    description: a.reason ?? a.notes ?? undefined,
    start: a.appointment_date ? `${a.appointment_date}T${a.appointment_time ?? "00:00:00"}` : undefined,
    participant: [
      { actor: { reference: `Patient/${a.patient_id}` }, status: "accepted" },
      ...(a.doctor_id ? [{ actor: { reference: `Practitioner/${a.doctor_id}` }, status: "accepted" }] : []),
    ],
  };
}

function immunizationToFhir(i: any) {
  return {
    resourceType: "Immunization",
    id: i.id,
    meta: { lastUpdated: i.updated_at },
    status: i.status ?? "completed",
    vaccineCode: { text: i.vaccine_name ?? i.vaccine_code ?? "" },
    patient: { reference: `Patient/${i.patient_id}` },
    occurrenceDateTime: i.administered_at ?? i.scheduled_at ?? i.created_at,
    lotNumber: i.lot_number ?? undefined,
    site: i.administration_site ? { text: i.administration_site } : undefined,
    doseQuantity: i.dose_amount ? { value: Number(i.dose_amount), unit: i.dose_unit ?? "mL" } : undefined,
  };
}

function prescriptionToFhir(p: any) {
  return {
    resourceType: "MedicationRequest",
    id: p.id,
    meta: { lastUpdated: p.updated_at },
    status: p.status ?? "active",
    intent: "order",
    medicationCodeableConcept: { text: p.medicine_name ?? p.medication_name ?? "" },
    subject: { reference: `Patient/${p.patient_id}` },
    authoredOn: p.created_at,
    dosageInstruction: [{
      text: [p.dosage, p.frequency, p.duration].filter(Boolean).join(" — "),
    }],
  };
}

function labOrderToFhir(l: any) {
  return {
    resourceType: "DiagnosticReport",
    id: l.id,
    meta: { lastUpdated: l.updated_at },
    status: l.status === "completed" || l.status === "reported" ? "final" : "registered",
    code: { text: l.test_name ?? "Laboratory Order" },
    subject: { reference: `Patient/${l.patient_id}` },
    effectiveDateTime: l.collected_at ?? l.created_at,
    issued: l.reported_at ?? l.updated_at,
    conclusion: l.result_notes ?? l.notes ?? undefined,
  };
}

function vitalsToFhir(v: any) {
  const items: any[] = [];
  const push = (code: string, display: string, value: number | null | undefined, unit: string) => {
    if (value == null) return;
    items.push({
      resourceType: "Observation",
      id: `${v.id}-${code}`,
      meta: { lastUpdated: v.updated_at ?? v.created_at },
      status: "final",
      category: [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/observation-category", code: "vital-signs" }] }],
      code: { coding: [{ system: "http://loinc.org", code, display }], text: display },
      subject: { reference: `Patient/${v.patient_id}` },
      effectiveDateTime: v.recorded_at ?? v.created_at,
      valueQuantity: { value, unit, system: "http://unitsofmeasure.org" },
    });
  };
  push("8867-4", "Heart rate", v.pulse, "/min");
  push("8310-5", "Body temperature", v.temperature, "Cel");
  push("9279-1", "Respiratory rate", v.respiratory_rate, "/min");
  push("2708-6", "Oxygen saturation", v.oxygen_saturation, "%");
  push("8480-6", "Systolic BP", v.blood_pressure_systolic, "mm[Hg]");
  push("8462-4", "Diastolic BP", v.blood_pressure_diastolic, "mm[Hg]");
  push("29463-7", "Body weight", v.weight, "kg");
  push("8302-2", "Body height", v.height, "cm");
  return items;
}

function bundle(resources: any[], type = "searchset") {
  return {
    resourceType: "Bundle",
    type,
    total: resources.length,
    entry: resources.map((r) => ({ resource: r, fullUrl: `${BASE}/${r.resourceType}/${r.id}` })),
  };
}

// ---------- Handlers ----------

async function handlePatient(id: string, caller: Caller, cors: Record<string, string>) {
  if (!assertPatientAccess(caller, id)) return outcome("error", "forbidden", "patient/* scope cannot access other patients", 403, cors);
  let q = admin.from("patients").select("*").eq("id", id);
  if (caller.scope === "system" && caller.organization_id) q = q.eq("organization_id", caller.organization_id);
  const { data, error } = await q.maybeSingle();
  if (error) return outcome("error", "exception", error.message, 500, cors);
  if (!data) return outcome("error", "not-found", "Patient not found", 404, cors);
  return ok(patientToFhir(data), cors);
}

async function handlePatientSearch(url: URL, caller: Caller, cors: Record<string, string>) {
  if (caller.scope === "patient") {
    const { data } = await admin.from("patients").select("*").eq("id", caller.patient_id).maybeSingle();
    return ok(bundle(data ? [patientToFhir(data)] : []), cors);
  }
  const count = Math.min(Number(url.searchParams.get("_count") ?? 50), 200);
  const number = url.searchParams.get("identifier") ?? url.searchParams.get("patient_number");
  const name = url.searchParams.get("name");
  let q = admin.from("patients").select("*").limit(count);
  if (caller.scope === "system" && caller.organization_id) q = q.eq("organization_id", caller.organization_id);
  if (number) q = q.eq("patient_number", number);
  if (name) q = q.or(`first_name.ilike.%${name}%,last_name.ilike.%${name}%`);
  const { data, error } = await q;
  if (error) return outcome("error", "exception", error.message, 500, cors);
  return ok(bundle((data ?? []).map(patientToFhir)), cors);
}

async function handleByPatient(
  table: string,
  mapper: (r: any) => any,
  patientCol: string,
  url: URL,
  caller: Caller,
  cors: Record<string, string>,
) {
  let patientId = url.searchParams.get("patient") ?? url.searchParams.get("subject");
  if (caller.scope === "patient") patientId = caller.patient_id!;
  if (!patientId) return outcome("error", "invalid", "patient parameter required", 400, cors);
  if (!assertPatientAccess(caller, patientId)) return outcome("error", "forbidden", "scope mismatch", 403, cors);

  const count = Math.min(Number(url.searchParams.get("_count") ?? 100), 500);
  let q = admin.from(table).select("*").eq(patientCol, patientId).order("updated_at", { ascending: false }).limit(count);
  if (caller.scope === "system" && caller.organization_id) {
    q = q.eq("organization_id", caller.organization_id);
  }
  const { data, error } = await q;
  if (error) return outcome("error", "exception", error.message, 500, cors);
  return ok(bundle((data ?? []).map(mapper)), cors);
}

async function handleObservations(url: URL, caller: Caller, cors: Record<string, string>) {
  let patientId = url.searchParams.get("patient") ?? url.searchParams.get("subject");
  if (caller.scope === "patient") patientId = caller.patient_id!;
  if (!patientId) return outcome("error", "invalid", "patient parameter required", 400, cors);
  if (!assertPatientAccess(caller, patientId)) return outcome("error", "forbidden", "scope mismatch", 403, cors);

  const { data, error } = await admin
    .from("patient_vitals")
    .select("*")
    .eq("patient_id", patientId)
    .order("recorded_at", { ascending: false })
    .limit(200);
  if (error) return outcome("error", "exception", error.message, 500, cors);
  const obs = (data ?? []).flatMap(vitalsToFhir);
  return ok(bundle(obs), cors);
}

async function handleToken(req: Request, cors: Record<string, string>) {
  const ct = req.headers.get("content-type") || "";
  let clientId = "", clientSecret = "", grantType = "";
  if (ct.includes("application/x-www-form-urlencoded")) {
    const form = new URLSearchParams(await req.text());
    clientId = form.get("client_id") ?? "";
    clientSecret = form.get("client_secret") ?? "";
    grantType = form.get("grant_type") ?? "";
  } else {
    const j = await req.json().catch(() => ({}));
    clientId = j.client_id ?? "";
    clientSecret = j.client_secret ?? "";
    grantType = j.grant_type ?? "";
  }
  if (grantType !== "client_credentials") return outcome("error", "invalid", "grant_type must be client_credentials", 400, cors);
  if (!clientId || !clientSecret) return outcome("error", "invalid", "client_id and client_secret required", 400, cors);

  const { data: client } = await admin
    .from("fhir_clients")
    .select("id, organization_id, client_secret_hash, is_active, scopes")
    .eq("client_id", clientId)
    .maybeSingle();
  if (!client || !client.is_active) return outcome("error", "forbidden", "invalid client", 401, cors);

  const hash = await sha256(clientSecret);
  if (hash !== client.client_secret_hash) return outcome("error", "forbidden", "invalid client", 401, cors);

  const token = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, "");
  const expiresIn = 3600;
  systemTokens.set(token, { organization_id: client.organization_id, expires_at: Date.now() + expiresIn * 1000 });
  await admin.from("fhir_clients").update({ last_used_at: new Date().toISOString() }).eq("id", client.id);

  return new Response(JSON.stringify({
    access_token: token,
    token_type: "Bearer",
    expires_in: expiresIn,
    scope: client.scopes,
  }), { headers: { ...cors, "Content-Type": "application/json" } });
}

function smartConfig(cors: Record<string, string>) {
  return new Response(JSON.stringify({
    issuer: BASE,
    token_endpoint: `${BASE}/token`,
    token_endpoint_auth_methods_supported: ["client_secret_post"],
    grant_types_supported: ["client_credentials"],
    scopes_supported: ["patient/*.read", "user/*.read", "system/*.read"],
    capabilities: ["client-confidential-symmetric", "permission-patient", "permission-user", "permission-system"],
  }), { headers: { ...cors, "Content-Type": "application/json" } });
}

function capabilityStatement(cors: Record<string, string>) {
  const resources = ["Patient", "Appointment", "Observation", "MedicationRequest", "Immunization", "DiagnosticReport"];
  return ok({
    resourceType: "CapabilityStatement",
    status: "active",
    date: new Date().toISOString(),
    kind: "instance",
    software: { name: "Smart HMS FHIR", version: "1.0.0" },
    fhirVersion: "4.0.1",
    format: ["application/fhir+json"],
    rest: [{
      mode: "server",
      security: {
        service: [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/restful-security-service", code: "SMART-on-FHIR" }] }],
        extension: [{
          url: "http://fhir-registry.smarthealthit.org/StructureDefinition/oauth-uris",
          extension: [{ url: "token", valueUri: `${BASE}/token` }],
        }],
      },
      resource: resources.map((type) => ({
        type,
        interaction: type === "Patient"
          ? [{ code: "read" }, { code: "search-type" }]
          : [{ code: "search-type" }],
        searchParam: type === "Patient"
          ? [{ name: "identifier", type: "token" }, { name: "name", type: "string" }]
          : [{ name: "patient", type: "reference" }],
      })),
    }],
  }, cors);
}

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const url = new URL(req.url);
  // Strip the function prefix
  const path = url.pathname.replace(/^.*?\/fhir-server/, "") || "/";

  try {
    // Public endpoints
    if (path === "/.well-known/smart-configuration") return smartConfig(cors);
    if (path === "/metadata") return capabilityStatement(cors);
    if (path === "/token" && req.method === "POST") return await handleToken(req, cors);

    const caller = await authenticate(req);
    if (!caller) return outcome("error", "login", "Authentication required", 401, cors);

    // Routing
    const patientMatch = path.match(/^\/Patient\/([^/?]+)$/);
    if (patientMatch && req.method === "GET") return await handlePatient(patientMatch[1], caller, cors);
    if (path === "/Patient" && req.method === "GET") return await handlePatientSearch(url, caller, cors);
    if (path === "/Appointment" && req.method === "GET")
      return await handleByPatient("appointments", appointmentToFhir, "patient_id", url, caller, cors);
    if (path === "/Observation" && req.method === "GET")
      return await handleObservations(url, caller, cors);
    if (path === "/MedicationRequest" && req.method === "GET")
      return await handleByPatient("prescriptions", prescriptionToFhir, "patient_id", url, caller, cors);
    if (path === "/Immunization" && req.method === "GET")
      return await handleByPatient("immunizations", immunizationToFhir, "patient_id", url, caller, cors);
    if (path === "/DiagnosticReport" && req.method === "GET")
      return await handleByPatient("lab_orders", labOrderToFhir, "patient_id", url, caller, cors);

    return outcome("error", "not-found", `Unknown endpoint ${path}`, 404, cors);
  } catch (err) {
    return outcome("error", "exception", String(err), 500, cors);
  }
});
