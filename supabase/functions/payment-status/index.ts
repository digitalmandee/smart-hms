// payment-status — server-side polling fallback. UI calls after returning from gateway.
import { z } from "https://esm.sh/zod@3.23.8";
import { getCorsHeaders } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth.ts";
import { fetchStatus, GatewayNotConfiguredError, type Provider } from "../_shared/payment-gateways.ts";

const BodySchema = z.object({ tx_id: z.string().uuid() });

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
      status: 400, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const { data: tx } = await auth.admin
    .from("payment_gateway_transactions")
    .select("id, organization_id, provider, provider_ref, invoice_id, status, amount")
    .eq("id", parsed.data.tx_id).maybeSingle();
  if (!tx) {
    return new Response(JSON.stringify({ error: "Tx not found" }), {
      status: 404, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
  if (["succeeded", "refunded", "failed", "expired"].includes((tx as any).status)) {
    return new Response(JSON.stringify({ status: (tx as any).status, idempotent: true }), {
      status: 200, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
  if (!(tx as any).provider_ref) {
    return new Response(JSON.stringify({ status: (tx as any).status }), {
      status: 200, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const { data: settings } = await auth.admin
    .from("payment_gateway_settings")
    .select("mode, public_config")
    .eq("organization_id", (tx as any).organization_id)
    .eq("provider", (tx as any).provider)
    .maybeSingle();

  try {
    const result = await fetchStatus(
      (tx as any).provider as Provider,
      (tx as any).provider_ref,
      ((settings as any)?.mode ?? "test") as "test" | "live",
      ((settings as any)?.public_config ?? {}) as Record<string, unknown>,
    );
    await auth.admin.from("payment_gateway_transactions").update({
      status: result.status,
      failure_reason: result.failure_reason ?? null,
      raw_response: result.raw as any,
      completed_at: ["succeeded", "failed", "refunded", "expired"].includes(result.status) ? new Date().toISOString() : null,
    }).eq("id", (tx as any).id);

    if (result.status === "succeeded" && (tx as any).invoice_id) {
      await auth.admin.from("invoices").update({
        payment_status: "paid", paid_at: new Date().toISOString(),
      }).eq("id", (tx as any).invoice_id);
    }
    return new Response(JSON.stringify({ status: result.status }), {
      status: 200, headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = (e as Error).message;
    return new Response(JSON.stringify({
      error: msg,
      code: e instanceof GatewayNotConfiguredError ? "not_configured" : "gateway_error",
    }), { status: e instanceof GatewayNotConfiguredError ? 503 : 502, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
