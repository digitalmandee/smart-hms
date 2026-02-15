import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * ZATCA Phase 2 E-Invoicing - QR Code Generation
 * 
 * Generates TLV-encoded QR code data for KSA invoices containing:
 * 1. Seller name
 * 2. VAT registration number
 * 3. Timestamp (ISO 8601)
 * 4. Invoice total (with VAT)
 * 5. VAT amount
 */

// TLV (Tag-Length-Value) encoding for ZATCA QR
function encodeTLV(tag: number, value: string): Uint8Array {
  const encoder = new TextEncoder();
  const valueBytes = encoder.encode(value);
  const result = new Uint8Array(2 + valueBytes.length);
  result[0] = tag;
  result[1] = valueBytes.length;
  result.set(valueBytes, 2);
  return result;
}

function generateZATCAQR(
  sellerName: string,
  vatNumber: string,
  timestamp: string,
  totalWithVAT: number,
  vatAmount: number
): string {
  const tlvParts = [
    encodeTLV(1, sellerName),
    encodeTLV(2, vatNumber),
    encodeTLV(3, timestamp),
    encodeTLV(4, totalWithVAT.toFixed(2)),
    encodeTLV(5, vatAmount.toFixed(2)),
  ];

  // Concatenate all TLV parts
  const totalLength = tlvParts.reduce((sum, part) => sum + part.length, 0);
  const combined = new Uint8Array(totalLength);
  let offset = 0;
  for (const part of tlvParts) {
    combined.set(part, offset);
    offset += part.length;
  }

  // Base64 encode
  let binary = "";
  for (const byte of combined) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { invoice_id } = await req.json();
    if (!invoice_id) {
      return new Response(JSON.stringify({ error: "invoice_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get invoice with organization details
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select(`
        id, invoice_number, total_amount, tax_amount, created_at,
        organization:organizations(name, tax_registration_number, e_invoicing_enabled, country_code)
      `)
      .eq("id", invoice_id)
      .single();

    if (invoiceError || !invoice) {
      return new Response(
        JSON.stringify({ error: "Invoice not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const org = (invoice as any).organization;
    if (!org?.e_invoicing_enabled || org?.country_code !== "SA") {
      return new Response(
        JSON.stringify({ error: "E-invoicing not enabled for this organization" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sellerName = org.name || "Unknown";
    const vatNumber = org.tax_registration_number || "";
    const timestamp = invoice.created_at || new Date().toISOString();
    const totalWithVAT = Number(invoice.total_amount) || 0;
    const vatAmount = Number(invoice.tax_amount) || 0;

    // Generate QR code data
    const qrData = generateZATCAQR(sellerName, vatNumber, timestamp, totalWithVAT, vatAmount);

    // Generate unique UUID for ZATCA
    const zatcaUUID = crypto.randomUUID();

    // Get next ICV (Invoice Counter Value)
    const { count: icvCount } = await supabase
      .from("invoices")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", org.id)
      .not("zatca_icv", "is", null);

    const icv = (icvCount || 0) + 1;

    // Update invoice with ZATCA data
    const { error: updateError } = await supabase
      .from("invoices")
      .update({
        zatca_qr_code: qrData,
        zatca_uuid: zatcaUUID,
        zatca_icv: icv,
        zatca_status: "generated",
      })
      .eq("id", invoice_id);

    if (updateError) {
      console.error("Failed to update invoice:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to store ZATCA data" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        qr_code: qrData,
        zatca_uuid: zatcaUUID,
        icv,
        message: "ZATCA QR code generated successfully",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("ZATCA E-Invoice error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
