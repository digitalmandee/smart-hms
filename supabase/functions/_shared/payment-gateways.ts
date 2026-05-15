/**
 * KSA payment-gateway adapters (HyperPay, Tap, STC Pay).
 *
 * Each adapter exposes a uniform interface so the payment-create / payment-webhook /
 * payment-status edge functions can dispatch by `provider` without conditionals.
 *
 * Secrets are read from environment per-call. If a required secret is missing,
 * the adapter throws `GatewayNotConfiguredError` which the caller surfaces as 503.
 */

export type Provider = "hyperpay" | "tap" | "stcpay";
export type Mode = "test" | "live";

export class GatewayNotConfiguredError extends Error {
  constructor(public provider: Provider, public missing: string[]) {
    super(`${provider} not configured: missing ${missing.join(", ")}`);
    this.name = "GatewayNotConfiguredError";
  }
}

export interface CreateSessionInput {
  amount: number;             // major units (SAR)
  currency: string;           // "SAR"
  reference: string;          // our internal tx id (uuid)
  customer?: { name?: string; email?: string; phone?: string };
  return_url: string;
  notify_url: string;         // webhook URL for this provider
  mode: Mode;
  public_config: Record<string, unknown>;
}

export interface CreateSessionResult {
  provider_ref: string;
  /** URL to redirect/embed for completion. Null for STC Pay (uses OTP flow). */
  checkout_url: string | null;
  /** Provider-specific payload echoed to the client (e.g., HyperPay checkoutId). */
  client_payload: Record<string, unknown>;
  raw: unknown;
}

export interface NormalizedStatus {
  status: "pending" | "succeeded" | "failed" | "refunded" | "partial_refund" | "expired";
  failure_reason?: string;
  raw: unknown;
}

function req(name: string): string | null {
  return Deno.env.get(name) ?? null;
}
function need(provider: Provider, names: string[]): string[] {
  const missing = names.filter((n) => !req(n));
  if (missing.length) throw new GatewayNotConfiguredError(provider, missing);
  return names.map((n) => req(n)!);
}

/* ─────────────────────────── HyperPay ─────────────────────────── */
async function hyperpayCreate(input: CreateSessionInput): Promise<CreateSessionResult> {
  const [token] = need("hyperpay", ["HYPERPAY_ACCESS_TOKEN"]);
  const baseUrl = req("HYPERPAY_BASE_URL") ??
    (input.mode === "live" ? "https://eu-prod.oppwa.com" : "https://eu-test.oppwa.com");
  const entityId = (input.public_config.entity_id as string) ??
    req(input.mode === "live" ? "HYPERPAY_ENTITY_ID_LIVE" : "HYPERPAY_ENTITY_ID_TEST");
  if (!entityId) throw new GatewayNotConfiguredError("hyperpay", ["entity_id"]);

  const body = new URLSearchParams({
    entityId,
    amount: input.amount.toFixed(2),
    currency: input.currency,
    paymentType: "DB",
    merchantTransactionId: input.reference,
    "customer.email": input.customer?.email ?? "",
    "customer.givenName": input.customer?.name ?? "Patient",
    "customer.surname": ".",
    notificationUrl: input.notify_url,
  });

  const resp = await fetch(`${baseUrl}/v1/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const json = await resp.json();
  if (!resp.ok || !json.id) {
    throw new Error(`HyperPay create failed: ${json.result?.description ?? resp.statusText}`);
  }
  return {
    provider_ref: json.id,
    checkout_url: `${baseUrl}/v1/paymentWidgets.js?checkoutId=${json.id}`,
    client_payload: { checkoutId: json.id, entityId, scriptUrl: `${baseUrl}/v1/paymentWidgets.js?checkoutId=${json.id}` },
    raw: json,
  };
}

async function hyperpayStatus(providerRef: string, mode: Mode, publicConfig: Record<string, unknown>): Promise<NormalizedStatus> {
  const [token] = need("hyperpay", ["HYPERPAY_ACCESS_TOKEN"]);
  const baseUrl = req("HYPERPAY_BASE_URL") ??
    (mode === "live" ? "https://eu-prod.oppwa.com" : "https://eu-test.oppwa.com");
  const entityId = (publicConfig.entity_id as string) ??
    req(mode === "live" ? "HYPERPAY_ENTITY_ID_LIVE" : "HYPERPAY_ENTITY_ID_TEST");
  if (!entityId) throw new GatewayNotConfiguredError("hyperpay", ["entity_id"]);

  const resp = await fetch(`${baseUrl}/v1/checkouts/${providerRef}/payment?entityId=${entityId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await resp.json();
  // HyperPay result codes: https://hyperpay.docs.oppwa.com/reference/resultCodes
  const code: string = json?.result?.code ?? "";
  let status: NormalizedStatus["status"] = "pending";
  if (/^(000\.000\.|000\.100\.1|000\.[36])/.test(code)) status = "succeeded";
  else if (/^(000\.200|800\.400\.5|100\.396\.101)/.test(code)) status = "pending";
  else if (code) status = "failed";
  return {
    status,
    failure_reason: status === "failed" ? json?.result?.description : undefined,
    raw: json,
  };
}

/* ─────────────────────────── Tap Payments ─────────────────────────── */
async function tapCreate(input: CreateSessionInput): Promise<CreateSessionResult> {
  const [secret] = need("tap", ["TAP_SECRET_KEY"]);
  const body = {
    amount: input.amount,
    currency: input.currency,
    threeDSecure: true,
    save_card: false,
    customer: {
      first_name: input.customer?.name ?? "Patient",
      email: input.customer?.email ?? "noemail@example.com",
      phone: input.customer?.phone ? { country_code: "966", number: input.customer.phone } : undefined,
    },
    source: { id: (input.public_config.source as string) ?? "src_all" },
    redirect: { url: input.return_url },
    post: { url: input.notify_url },
    reference: { transaction: input.reference, order: input.reference },
  };
  const resp = await fetch("https://api.tap.company/v2/charges", {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await resp.json();
  if (!resp.ok || !json.id) {
    throw new Error(`Tap create failed: ${json?.errors?.[0]?.description ?? resp.statusText}`);
  }
  return {
    provider_ref: json.id,
    checkout_url: json.transaction?.url ?? null,
    client_payload: { chargeId: json.id, redirectUrl: json.transaction?.url },
    raw: json,
  };
}

async function tapStatus(providerRef: string): Promise<NormalizedStatus> {
  const [secret] = need("tap", ["TAP_SECRET_KEY"]);
  const resp = await fetch(`https://api.tap.company/v2/charges/${providerRef}`, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  const json = await resp.json();
  const s = String(json?.status ?? "").toUpperCase();
  let status: NormalizedStatus["status"] = "pending";
  if (s === "CAPTURED" || s === "AUTHORIZED") status = "succeeded";
  else if (s === "FAILED" || s === "DECLINED" || s === "ABANDONED" || s === "CANCELLED") status = "failed";
  else if (s === "REFUNDED") status = "refunded";
  else if (s === "PARTIALLY_REFUNDED") status = "partial_refund";
  return { status, failure_reason: status === "failed" ? (json?.response?.message ?? s) : undefined, raw: json };
}

async function tapVerifyWebhook(req: Request, rawBody: string): Promise<boolean> {
  // Tap signs callbacks with HMAC-SHA256 in `hashstring` header, secret = TAP_SECRET_KEY.
  const provided = req.headers.get("hashstring");
  if (!provided) return false;
  const secret = Deno.env.get("TAP_SECRET_KEY");
  if (!secret) return false;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(rawBody));
  const hex = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return hex.toLowerCase() === provided.toLowerCase();
}

/* ─────────────────────────── STC Pay ─────────────────────────── */
async function stcpayCreate(input: CreateSessionInput): Promise<CreateSessionResult> {
  const [merchantId, secret] = need("stcpay", ["STCPAY_MERCHANT_ID", "STCPAY_SECRET_KEY"]);
  const baseUrl = req("STCPAY_BASE_URL") ??
    (input.mode === "live" ? "https://api.stcpay.com.sa" : "https://sandbox.stcpay.com.sa");
  if (!input.customer?.phone) throw new Error("STC Pay requires customer mobile number");
  const body = {
    MerchantId: merchantId,
    BranchId: (input.public_config.branch_id as string) ?? merchantId,
    DeviceId: "HMIS",
    RefNum: input.reference,
    Amount: input.amount,
    MobileNo: input.customer.phone,
    Currency: input.currency,
  };
  const resp = await fetch(`${baseUrl}/Payment/DirectPayAuth`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
    body: JSON.stringify(body),
  });
  const json = await resp.json();
  if (!resp.ok || !json?.STCPayPmtReference) {
    throw new Error(`STC Pay create failed: ${json?.ErrorDescription ?? resp.statusText}`);
  }
  return {
    provider_ref: json.STCPayPmtReference,
    checkout_url: null,
    client_payload: { stcRef: json.STCPayPmtReference, otpRequired: true },
    raw: json,
  };
}

async function stcpayStatus(providerRef: string, mode: Mode): Promise<NormalizedStatus> {
  const [_merchantId, secret] = need("stcpay", ["STCPAY_MERCHANT_ID", "STCPAY_SECRET_KEY"]);
  const baseUrl = req("STCPAY_BASE_URL") ??
    (mode === "live" ? "https://api.stcpay.com.sa" : "https://sandbox.stcpay.com.sa");
  const resp = await fetch(`${baseUrl}/Payment/PaymentInquiry?RefNum=${providerRef}`, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  const json = await resp.json();
  const s = String(json?.PaymentStatus ?? "").toLowerCase();
  let status: NormalizedStatus["status"] = "pending";
  if (s === "paid" || s === "success") status = "succeeded";
  else if (s === "failed" || s === "rejected" || s === "expired") status = s === "expired" ? "expired" : "failed";
  else if (s === "refunded") status = "refunded";
  return { status, failure_reason: status === "failed" ? json?.ErrorDescription : undefined, raw: json };
}

/* ─────────────────────────── Dispatcher ─────────────────────────── */
export async function createSession(provider: Provider, input: CreateSessionInput): Promise<CreateSessionResult> {
  if (provider === "hyperpay") return hyperpayCreate(input);
  if (provider === "tap") return tapCreate(input);
  if (provider === "stcpay") return stcpayCreate(input);
  throw new Error(`Unknown provider: ${provider}`);
}

export async function fetchStatus(provider: Provider, providerRef: string, mode: Mode, publicConfig: Record<string, unknown>): Promise<NormalizedStatus> {
  if (provider === "hyperpay") return hyperpayStatus(providerRef, mode, publicConfig);
  if (provider === "tap") return tapStatus(providerRef);
  if (provider === "stcpay") return stcpayStatus(providerRef, mode);
  throw new Error(`Unknown provider: ${provider}`);
}

export async function verifyWebhook(provider: Provider, req: Request, rawBody: string): Promise<boolean> {
  // HyperPay webhooks are not signed (IP-based) → always pull status from API.
  // STC Pay callbacks are signed but in production you should validate Authorization bearer match.
  if (provider === "tap") return tapVerifyWebhook(req, rawBody);
  return true;
}
