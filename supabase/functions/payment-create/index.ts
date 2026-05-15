// payment-create — create a checkout session at a KSA gateway and persist a pending tx.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { z } from "https://esm.sh/zod@3.23.8";
import { getCorsHeaders } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth.ts";
import {
  createSession,
  GatewayNotConfiguredError,
  type Provider,
} from "../_shared/payment-gateways.ts";

const BodySchema = z.object({
  provider: z.enum(["hyperpay", "tap", "stcpay"]),
  invoice_id: z.string().uuid().optional(),
  patient_id: z.string().uuid().optional(),
  branch_id: z.string().uuid().optional(),
  amount: z.number().positive().max(1_000_000),
  currency: z.string().min(3).max(3).default("SAR"),
  customer: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
  }).optional(),
  return_url: z.string().url(),
});

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  let parsed;
  try {
    parsed = BodySchema.safeParse(await req.json());
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
      status: 400, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
  const input = parsed.data;
  const provider = input.provider as Provider;

  // Resolve org from caller's profile
  const { data: profile } = await auth.admin
    .from("profiles").select("organization_id, branch_id").eq("id", auth.userId).maybeSingle();
  const organization_id = (profile as any)?.organization_id;
  if (!organization_id) {
    return new Response(JSON.stringify({ error: "No organization for user" }), {
      status: 400, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  // Load gateway settings
  const { data: settings } = await auth.admin
    .from("payment_gateway_settings")
    .select("enabled, mode, public_config")
    .eq("organization_id", organization_id)
    .eq("provider", provider)
    .maybeSingle();
  if (!settings || !(settings as any).enabled) {
    return new Response(JSON.stringify({ error: `Gateway ${provider} not enabled for this organization` }), {
      status: 400, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const branch_id = input.branch_id ?? (profile as any)?.branch_id ?? null;

  // Insert pending tx FIRST so we have a stable reference for the gateway
  const { data: tx, error: insertErr } = await auth.admin
    .from("payment_gateway_transactions")
    .insert({
      organization_id,
      branch_id,
      patient_id: input.patient_id ?? null,
      invoice_id: input.invoice_id ?? null,
      provider,
      status: "initiated",
      amount: input.amount,
      currency: input.currency,
      initiated_by: auth.userId,
    })
    .select()
    .maybeSingle();
  if (insertErr || !tx) {
    return new Response(JSON.stringify({ error: insertErr?.message ?? "Insert failed" }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const supaUrl = Deno.env.get("SUPABASE_URL")!;
  const notify_url = `${supaUrl}/functions/v1/payment-webhook?provider=${provider}&tx=${tx.id}`;

  try {
    const session = await createSession(provider, {
      amount: input.amount,
      currency: input.currency,
      reference: tx.id,
      customer: input.customer,
      return_url: input.return_url,
      notify_url,
      mode: ((settings as any).mode ?? "test") as "test" | "live",
      public_config: ((settings as any).public_config ?? {}) as Record<string, unknown>,
    });

    await auth.admin.from("payment_gateway_transactions")
      .update({
        status: "pending",
        provider_ref: session.provider_ref,
        checkout_url: session.checkout_url,
        raw_response: session.raw as any,
      })
      .eq("id", tx.id);

    return new Response(JSON.stringify({
      tx_id: tx.id,
      provider,
      checkout_url: session.checkout_url,
      client_payload: session.client_payload,
    }), { status: 200, headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    const msg = (e as Error).message;
    const isConfigErr = e instanceof GatewayNotConfiguredError;
    await auth.admin.from("payment_gateway_transactions")
      .update({ status: "failed", failure_reason: msg })
      .eq("id", tx.id);
    return new Response(JSON.stringify({ error: msg, code: isConfigErr ? "not_configured" : "gateway_error" }), {
      status: isConfigErr ? 503 : 502,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
