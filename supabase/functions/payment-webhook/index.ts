// payment-webhook — receives async callbacks from HyperPay / Tap / STC Pay.
// Discriminates by ?provider= query param, verifies signature where supported,
// pulls authoritative status from the gateway API, then updates our tx + invoice.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { getCorsHeaders } from "../_shared/cors.ts";
import { fetchStatus, verifyWebhook, type Provider } from "../_shared/payment-gateways.ts";

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const url = new URL(req.url);
  const provider = url.searchParams.get("provider") as Provider | null;
  const txId = url.searchParams.get("tx");
  if (!provider || !["hyperpay", "tap", "stcpay"].includes(provider) || !txId) {
    return new Response(JSON.stringify({ error: "Missing provider or tx" }), {
      status: 400, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const rawBody = await req.text();
  const ok = await verifyWebhook(provider, req, rawBody);
  if (!ok) {
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 401, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Load the tx (we need provider_ref + mode + invoice_id)
  const { data: tx } = await admin
    .from("payment_gateway_transactions")
    .select("id, organization_id, provider_ref, invoice_id, status, amount, currency")
    .eq("id", txId)
    .maybeSingle();
  if (!tx) {
    return new Response(JSON.stringify({ error: "Tx not found" }), {
      status: 404, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
  // Idempotency: ignore if already in a terminal state
  if (["succeeded", "refunded", "failed", "expired"].includes((tx as any).status)) {
    return new Response(JSON.stringify({ ok: true, idempotent: true }), {
      status: 200, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  // Re-load gateway settings for mode + entity_id
  const { data: settings } = await admin
    .from("payment_gateway_settings")
    .select("mode, public_config")
    .eq("organization_id", (tx as any).organization_id)
    .eq("provider", provider)
    .maybeSingle();

  const status = await fetchStatus(
    provider,
    (tx as any).provider_ref,
    ((settings as any)?.mode ?? "test") as "test" | "live",
    ((settings as any)?.public_config ?? {}) as Record<string, unknown>,
  );

  await admin.from("payment_gateway_transactions").update({
    status: status.status,
    failure_reason: status.failure_reason ?? null,
    raw_response: status.raw as any,
    completed_at: ["succeeded", "failed", "refunded", "expired"].includes(status.status) ? new Date().toISOString() : null,
  }).eq("id", (tx as any).id);

  // If the payment succeeded and is linked to an invoice, mark it paid (idempotent).
  if (status.status === "succeeded" && (tx as any).invoice_id) {
    await admin.rpc("mark_invoice_paid_by_gateway", {
      p_invoice_id: (tx as any).invoice_id,
      p_amount: (tx as any).amount,
      p_provider: provider,
      p_provider_ref: (tx as any).provider_ref,
    }).catch(() => {
      // RPC is optional; fall back to direct update
      return admin.from("invoices").update({
        payment_status: "paid",
        paid_at: new Date().toISOString(),
      }).eq("id", (tx as any).invoice_id);
    });
  }

  return new Response(JSON.stringify({ ok: true, status: status.status }), {
    status: 200, headers: { ...cors, "Content-Type": "application/json" },
  });
});
