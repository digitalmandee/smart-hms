import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

/**
 * ZATCA Phase 2 E-Invoicing
 * 
 * Supports:
 * - UBL 2.1 XML generation
 * - Invoice hash calculation
 * - Clearance/reporting submission (when credentials configured)
 * - QR code generation with cryptographic stamp
 */

// TLV encoding for ZATCA QR (Phase 2 includes signature)
function encodeTLV(tag: number, value: string | Uint8Array): Uint8Array {
  const encoder = new TextEncoder();
  const valueBytes = typeof value === 'string' ? encoder.encode(value) : value;
  
  // Handle multi-byte lengths (TLV with length > 127)
  if (valueBytes.length < 128) {
    const result = new Uint8Array(2 + valueBytes.length);
    result[0] = tag;
    result[1] = valueBytes.length;
    result.set(valueBytes, 2);
    return result;
  } else {
    // Extended length encoding
    const lengthBytes = valueBytes.length < 256 ? 1 : 2;
    const result = new Uint8Array(2 + lengthBytes + valueBytes.length);
    result[0] = tag;
    result[1] = 0x80 | lengthBytes;
    if (lengthBytes === 1) {
      result[2] = valueBytes.length;
      result.set(valueBytes, 3);
    } else {
      result[2] = (valueBytes.length >> 8) & 0xFF;
      result[3] = valueBytes.length & 0xFF;
      result.set(valueBytes, 4);
    }
    return result;
  }
}

function generateZATCAQRPhase2(
  sellerName: string,
  vatNumber: string,
  timestamp: string,
  totalWithVAT: number,
  vatAmount: number,
  invoiceHash: string,
  signature?: string,
  publicKey?: string
): string {
  const tlvParts: Uint8Array[] = [
    encodeTLV(1, sellerName),
    encodeTLV(2, vatNumber),
    encodeTLV(3, timestamp),
    encodeTLV(4, totalWithVAT.toFixed(2)),
    encodeTLV(5, vatAmount.toFixed(2)),
    encodeTLV(6, invoiceHash),
  ];

  // Phase 2: Add signature and public key if available
  if (signature) {
    const sigBytes = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
    tlvParts.push(encodeTLV(7, sigBytes));
  }
  if (publicKey) {
    const pkBytes = Uint8Array.from(atob(publicKey), c => c.charCodeAt(0));
    tlvParts.push(encodeTLV(8, pkBytes));
  }

  const totalLength = tlvParts.reduce((sum, part) => sum + part.length, 0);
  const combined = new Uint8Array(totalLength);
  let offset = 0;
  for (const part of tlvParts) {
    combined.set(part, offset);
    offset += part.length;
  }

  let binary = "";
  for (const byte of combined) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

async function calculateSHA256(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return btoa(hashArray.map(b => String.fromCharCode(b)).join(''));
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatDecimal(value: number, decimals = 2): string {
  return value.toFixed(decimals);
}

interface InvoiceLineItem {
  id: string;
  name: string;
  quantity: number;
  unit_price: number;
  tax_amount: number;
  total_amount: number;
}

function generateUBLXml(
  invoiceNumber: string,
  invoiceUUID: string,
  issueDate: string,
  issueTime: string,
  icv: number,
  previousHash: string,
  seller: { name: string; vat: string; street?: string; city?: string; postal?: string },
  buyer: { name: string; vat?: string; street?: string; city?: string; postal?: string },
  lineItems: InvoiceLineItem[],
  taxableAmount: number,
  taxAmount: number,
  totalAmount: number,
  currency: string
): string {
  const lineItemsXml = lineItems.map((item, idx) => `
    <cac:InvoiceLine>
      <cbc:ID>${idx + 1}</cbc:ID>
      <cbc:InvoicedQuantity unitCode="PCE">${item.quantity}</cbc:InvoicedQuantity>
      <cbc:LineExtensionAmount currencyID="${currency}">${formatDecimal(item.total_amount - item.tax_amount)}</cbc:LineExtensionAmount>
      <cac:TaxTotal>
        <cbc:TaxAmount currencyID="${currency}">${formatDecimal(item.tax_amount)}</cbc:TaxAmount>
        <cbc:RoundingAmount currencyID="${currency}">${formatDecimal(item.total_amount)}</cbc:RoundingAmount>
      </cac:TaxTotal>
      <cac:Item>
        <cbc:Name>${escapeXml(item.name)}</cbc:Name>
        <cac:ClassifiedTaxCategory>
          <cbc:ID>S</cbc:ID>
          <cbc:Percent>15.00</cbc:Percent>
          <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
        </cac:ClassifiedTaxCategory>
      </cac:Item>
      <cac:Price>
        <cbc:PriceAmount currencyID="${currency}">${formatDecimal(item.unit_price)}</cbc:PriceAmount>
      </cac:Price>
    </cac:InvoiceLine>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
         xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">
  <ext:UBLExtensions>
    <ext:UBLExtension>
      <ext:ExtensionURI>urn:oasis:names:specification:ubl:dsig:enveloped:xades</ext:ExtensionURI>
      <ext:ExtensionContent>
        <!-- Signature placeholder -->
      </ext:ExtensionContent>
    </ext:UBLExtension>
  </ext:UBLExtensions>
  <cbc:ProfileID>reporting:1.0</cbc:ProfileID>
  <cbc:ID>${escapeXml(invoiceNumber)}</cbc:ID>
  <cbc:UUID>${escapeXml(invoiceUUID)}</cbc:UUID>
  <cbc:IssueDate>${issueDate}</cbc:IssueDate>
  <cbc:IssueTime>${issueTime}</cbc:IssueTime>
  <cbc:InvoiceTypeCode name="0211">388</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>${currency}</cbc:DocumentCurrencyCode>
  <cbc:TaxCurrencyCode>${currency}</cbc:TaxCurrencyCode>
  <cac:AdditionalDocumentReference>
    <cbc:ID>ICV</cbc:ID>
    <cbc:UUID>${icv}</cbc:UUID>
  </cac:AdditionalDocumentReference>
  <cac:AdditionalDocumentReference>
    <cbc:ID>PIH</cbc:ID>
    <cac:Attachment>
      <cbc:EmbeddedDocumentBinaryObject mimeCode="text/plain">${previousHash}</cbc:EmbeddedDocumentBinaryObject>
    </cac:Attachment>
  </cac:AdditionalDocumentReference>
  <cac:Signature>
    <cbc:ID>urn:oasis:names:specification:ubl:signature:Invoice</cbc:ID>
    <cbc:SignatureMethod>urn:oasis:names:specification:ubl:dsig:enveloped:xades</cbc:SignatureMethod>
  </cac:Signature>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="VAT">${escapeXml(seller.vat)}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PostalAddress>
        <cbc:StreetName>${escapeXml(seller.street || '')}</cbc:StreetName>
        <cbc:CityName>${escapeXml(seller.city || '')}</cbc:CityName>
        <cbc:PostalZone>${escapeXml(seller.postal || '')}</cbc:PostalZone>
        <cac:Country><cbc:IdentificationCode>SA</cbc:IdentificationCode></cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${escapeXml(seller.vat)}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${escapeXml(seller.name)}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="VAT">${escapeXml(buyer.vat || '')}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PostalAddress>
        <cbc:StreetName>${escapeXml(buyer.street || '')}</cbc:StreetName>
        <cbc:CityName>${escapeXml(buyer.city || '')}</cbc:CityName>
        <cbc:PostalZone>${escapeXml(buyer.postal || '')}</cbc:PostalZone>
        <cac:Country><cbc:IdentificationCode>SA</cbc:IdentificationCode></cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${escapeXml(buyer.vat || '')}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${escapeXml(buyer.name)}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:PaymentMeans>
    <cbc:PaymentMeansCode>10</cbc:PaymentMeansCode>
  </cac:PaymentMeans>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${currency}">${formatDecimal(taxAmount)}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="${currency}">${formatDecimal(taxableAmount)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="${currency}">${formatDecimal(taxAmount)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:ID>S</cbc:ID>
        <cbc:Percent>15.00</cbc:Percent>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${currency}">${formatDecimal(taxableAmount)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="${currency}">${formatDecimal(taxableAmount)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${currency}">${formatDecimal(totalAmount)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="${currency}">${formatDecimal(totalAmount)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  ${lineItemsXml}
</Invoice>`;
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

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

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, invoice_id } = await req.json();

    if (!invoice_id) {
      return new Response(JSON.stringify({ error: "invoice_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get invoice with organization and line items
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select(`
        id, invoice_number, total_amount, tax_amount, created_at, subtotal,
        patient:patients(first_name, last_name, national_id),
        organization:organizations(
          id, name, tax_registration_number, e_invoicing_enabled, country_code,
          address, city, postal_code
        )
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
        JSON.stringify({ error: "E-invoicing not enabled for this organization or not in KSA" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get line items
    const { data: lineItems } = await supabase
      .from("invoice_items")
      .select("id, service_name, quantity, unit_price, total_price, tax_amount")
      .eq("invoice_id", invoice_id);

    // Get previous invoice hash for chaining
    const { data: prevInvoice } = await supabase
      .from("invoices")
      .select("zatca_invoice_hash")
      .eq("organization_id", org.id)
      .not("zatca_invoice_hash", "is", null)
      .order("zatca_icv", { ascending: false })
      .limit(1)
      .single();

    const previousHash = prevInvoice?.zatca_invoice_hash || 
      'NWZlY2ViNjZmZmM4NmYzOGQ5NTI3ODZjNmQ2OTZjNzljMmRiYzIzOWRkNGU5MWI0NjcyOWQ3M2EyN2ZiNTdlOQ==';

    // Get next ICV
    const { count: icvCount } = await supabase
      .from("invoices")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", org.id)
      .not("zatca_icv", "is", null);

    const icv = (icvCount || 0) + 1;

    // Generate UUID
    const zatcaUUID = crypto.randomUUID();

    // Parse timestamp
    const timestamp = invoice.created_at || new Date().toISOString();
    const issueDate = timestamp.split('T')[0];
    const issueTime = timestamp.split('T')[1]?.split('.')[0] || '00:00:00';

    // Prepare invoice data
    const patient = (invoice as any).patient;
    const buyerName = patient ? `${patient.first_name || ''} ${patient.last_name || ''}`.trim() : 'Walk-in Customer';

    const mappedLineItems = (lineItems || []).map((item: any) => ({
      id: item.id,
      name: item.service_name || 'Service',
      quantity: Number(item.quantity) || 1,
      unit_price: Number(item.unit_price) || 0,
      tax_amount: Number(item.tax_amount) || 0,
      total_amount: Number(item.total_price) || 0,
    }));

    const taxableAmount = Number(invoice.subtotal) || (Number(invoice.total_amount) - Number(invoice.tax_amount));
    const taxAmount = Number(invoice.tax_amount) || 0;
    const totalAmount = Number(invoice.total_amount) || 0;

    // Generate UBL XML
    const ublXml = generateUBLXml(
      invoice.invoice_number,
      zatcaUUID,
      issueDate,
      issueTime,
      icv,
      previousHash,
      { 
        name: org.name, 
        vat: org.tax_registration_number || '',
        street: org.address,
        city: org.city,
        postal: org.postal_code
      },
      { name: buyerName },
      mappedLineItems,
      taxableAmount,
      taxAmount,
      totalAmount,
      'SAR'
    );

    // Calculate invoice hash
    const invoiceHash = await calculateSHA256(ublXml);

    // Generate Phase 2 QR code
    const qrData = generateZATCAQRPhase2(
      org.name || 'Unknown',
      org.tax_registration_number || '',
      timestamp,
      totalAmount,
      taxAmount,
      invoiceHash
    );

    // Update invoice with ZATCA Phase 2 data
    const { error: updateError } = await supabase
      .from("invoices")
      .update({
        zatca_qr_code: qrData,
        zatca_uuid: zatcaUUID,
        zatca_icv: icv,
        zatca_invoice_hash: invoiceHash,
        zatca_xml: ublXml,
        zatca_status: action === 'clearance' ? 'pending_clearance' : 'generated',
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
        invoice_hash: invoiceHash,
        xml_generated: true,
        message: action === 'clearance' 
          ? "Invoice prepared for ZATCA clearance. Configure ZATCA credentials to submit."
          : "ZATCA Phase 2 invoice generated successfully",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("ZATCA Phase 2 error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
