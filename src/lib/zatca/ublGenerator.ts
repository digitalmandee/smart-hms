/**
 * ZATCA UBL 2.1 Invoice XML Generator
 * Generates compliant XML for Phase 2 e-invoicing
 */

export interface ZatcaInvoiceData {
  // Invoice details
  invoiceNumber: string;
  invoiceUUID: string;
  issueDate: string;
  issueTime: string;
  invoiceTypeCode: '388' | '381' | '383'; // 388=Standard, 381=Credit, 383=Debit
  
  // Seller (supplier) info
  sellerName: string;
  sellerVatNumber: string;
  sellerStreet?: string;
  sellerCity?: string;
  sellerPostalCode?: string;
  sellerCountry: string;
  sellerBuildingNumber?: string;
  sellerDistrictName?: string;
  
  // Buyer info
  buyerName: string;
  buyerVatNumber?: string;
  buyerStreet?: string;
  buyerCity?: string;
  buyerPostalCode?: string;
  buyerCountry: string;
  
  // Amounts
  lineItems: ZatcaLineItem[];
  taxableAmount: number;
  taxAmount: number;
  totalAmount: number;
  currencyCode: string;
  
  // Hashing
  previousInvoiceHash?: string;
  icv: number;
}

export interface ZatcaLineItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  taxAmount: number;
  lineTotal: number;
  taxCategory: 'S' | 'Z' | 'E' | 'O'; // S=Standard, Z=Zero, E=Exempt, O=Out of scope
  taxPercent: number;
}

// ZATCA namespace URIs
const NAMESPACES = {
  ubl: 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
  cac: 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
  cbc: 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
  ext: 'urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2',
  sig: 'urn:oasis:names:specification:ubl:schema:xsd:CommonSignatureComponents-2',
  sac: 'urn:oasis:names:specification:ubl:schema:xsd:SignatureAggregateComponents-2',
  sbc: 'urn:oasis:names:specification:ubl:schema:xsd:SignatureBasicComponents-2',
  ds: 'http://www.w3.org/2000/09/xmldsig#',
  xades: 'http://uri.etsi.org/01903/v1.3.2#'
};

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

function generatePartyXml(
  prefix: string,
  name: string,
  vatNumber?: string,
  street?: string,
  city?: string,
  postalCode?: string,
  country?: string,
  buildingNumber?: string,
  districtName?: string
): string {
  return `
    <cac:${prefix}>
      <cac:PartyIdentification>
        <cbc:ID schemeID="VAT">${escapeXml(vatNumber || '')}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PostalAddress>
        <cbc:StreetName>${escapeXml(street || '')}</cbc:StreetName>
        <cbc:BuildingNumber>${escapeXml(buildingNumber || '')}</cbc:BuildingNumber>
        <cbc:CitySubdivisionName>${escapeXml(districtName || '')}</cbc:CitySubdivisionName>
        <cbc:CityName>${escapeXml(city || '')}</cbc:CityName>
        <cbc:PostalZone>${escapeXml(postalCode || '')}</cbc:PostalZone>
        <cac:Country>
          <cbc:IdentificationCode>${escapeXml(country || 'SA')}</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${escapeXml(vatNumber || '')}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${escapeXml(name)}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:${prefix}>`;
}

function generateLineItemXml(item: ZatcaLineItem, currency: string): string {
  return `
    <cac:InvoiceLine>
      <cbc:ID>${escapeXml(item.id)}</cbc:ID>
      <cbc:InvoicedQuantity unitCode="PCE">${formatDecimal(item.quantity, 4)}</cbc:InvoicedQuantity>
      <cbc:LineExtensionAmount currencyID="${currency}">${formatDecimal(item.lineTotal - item.taxAmount)}</cbc:LineExtensionAmount>
      <cac:TaxTotal>
        <cbc:TaxAmount currencyID="${currency}">${formatDecimal(item.taxAmount)}</cbc:TaxAmount>
        <cbc:RoundingAmount currencyID="${currency}">${formatDecimal(item.lineTotal)}</cbc:RoundingAmount>
      </cac:TaxTotal>
      <cac:Item>
        <cbc:Name>${escapeXml(item.name)}</cbc:Name>
        <cac:ClassifiedTaxCategory>
          <cbc:ID>${item.taxCategory}</cbc:ID>
          <cbc:Percent>${formatDecimal(item.taxPercent)}</cbc:Percent>
          <cac:TaxScheme>
            <cbc:ID>VAT</cbc:ID>
          </cac:TaxScheme>
        </cac:ClassifiedTaxCategory>
      </cac:Item>
      <cac:Price>
        <cbc:PriceAmount currencyID="${currency}">${formatDecimal(item.unitPrice)}</cbc:PriceAmount>
      </cac:Price>
    </cac:InvoiceLine>`;
}

/**
 * Generate ZATCA-compliant UBL 2.1 XML invoice
 */
export function generateUBLXml(data: ZatcaInvoiceData): string {
  const lineItemsXml = data.lineItems.map(item => 
    generateLineItemXml(item, data.currencyCode)
  ).join('');

  // Calculate tax subtotals by category
  const taxCategories = new Map<string, { amount: number; percent: number; taxableAmount: number }>();
  for (const item of data.lineItems) {
    const key = `${item.taxCategory}-${item.taxPercent}`;
    const existing = taxCategories.get(key) || { amount: 0, percent: item.taxPercent, taxableAmount: 0 };
    existing.amount += item.taxAmount;
    existing.taxableAmount += (item.lineTotal - item.taxAmount);
    taxCategories.set(key, existing);
  }

  const taxSubtotalsXml = Array.from(taxCategories.entries()).map(([key, value]) => {
    const category = key.split('-')[0];
    return `
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID="${data.currencyCode}">${formatDecimal(value.taxableAmount)}</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID="${data.currencyCode}">${formatDecimal(value.amount)}</cbc:TaxAmount>
        <cac:TaxCategory>
          <cbc:ID>${category}</cbc:ID>
          <cbc:Percent>${formatDecimal(value.percent)}</cbc:Percent>
          <cac:TaxScheme>
            <cbc:ID>VAT</cbc:ID>
          </cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="${NAMESPACES.ubl}"
         xmlns:cac="${NAMESPACES.cac}"
         xmlns:cbc="${NAMESPACES.cbc}"
         xmlns:ext="${NAMESPACES.ext}">
  <ext:UBLExtensions>
    <ext:UBLExtension>
      <ext:ExtensionURI>urn:oasis:names:specification:ubl:dsig:enveloped:xades</ext:ExtensionURI>
      <ext:ExtensionContent>
        <!-- Signature placeholder for Phase 2 -->
        <sig:UBLDocumentSignatures xmlns:sig="${NAMESPACES.sig}"
                                    xmlns:sac="${NAMESPACES.sac}"
                                    xmlns:sbc="${NAMESPACES.sbc}">
          <sac:SignatureInformation>
            <cbc:ID>urn:oasis:names:specification:ubl:signature:1</cbc:ID>
            <sbc:ReferencedSignatureID>urn:oasis:names:specification:ubl:signature:Invoice</sbc:ReferencedSignatureID>
            <!-- ds:Signature will be inserted here -->
          </sac:SignatureInformation>
        </sig:UBLDocumentSignatures>
      </ext:ExtensionContent>
    </ext:UBLExtension>
  </ext:UBLExtensions>
  <cbc:ProfileID>reporting:1.0</cbc:ProfileID>
  <cbc:ID>${escapeXml(data.invoiceNumber)}</cbc:ID>
  <cbc:UUID>${escapeXml(data.invoiceUUID)}</cbc:UUID>
  <cbc:IssueDate>${data.issueDate}</cbc:IssueDate>
  <cbc:IssueTime>${data.issueTime}</cbc:IssueTime>
  <cbc:InvoiceTypeCode name="0211">${data.invoiceTypeCode}</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>${data.currencyCode}</cbc:DocumentCurrencyCode>
  <cbc:TaxCurrencyCode>${data.currencyCode}</cbc:TaxCurrencyCode>
  <cac:AdditionalDocumentReference>
    <cbc:ID>ICV</cbc:ID>
    <cbc:UUID>${data.icv}</cbc:UUID>
  </cac:AdditionalDocumentReference>
  <cac:AdditionalDocumentReference>
    <cbc:ID>PIH</cbc:ID>
    <cac:Attachment>
      <cbc:EmbeddedDocumentBinaryObject mimeCode="text/plain">${data.previousInvoiceHash || 'NWZlY2ViNjZmZmM4NmYzOGQ5NTI3ODZjNmQ2OTZjNzljMmRiYzIzOWRkNGU5MWI0NjcyOWQ3M2EyN2ZiNTdlOQ=='}</cbc:EmbeddedDocumentBinaryObject>
    </cac:Attachment>
  </cac:AdditionalDocumentReference>
  <cac:Signature>
    <cbc:ID>urn:oasis:names:specification:ubl:signature:Invoice</cbc:ID>
    <cbc:SignatureMethod>urn:oasis:names:specification:ubl:dsig:enveloped:xades</cbc:SignatureMethod>
  </cac:Signature>
  ${generatePartyXml('AccountingSupplierParty', data.sellerName, data.sellerVatNumber, data.sellerStreet, data.sellerCity, data.sellerPostalCode, data.sellerCountry, data.sellerBuildingNumber, data.sellerDistrictName)}
  ${generatePartyXml('AccountingCustomerParty', data.buyerName, data.buyerVatNumber, data.buyerStreet, data.buyerCity, data.buyerPostalCode, data.buyerCountry)}
  <cac:PaymentMeans>
    <cbc:PaymentMeansCode>10</cbc:PaymentMeansCode>
  </cac:PaymentMeans>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${data.currencyCode}">${formatDecimal(data.taxAmount)}</cbc:TaxAmount>
    ${taxSubtotalsXml}
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${data.currencyCode}">${formatDecimal(data.taxableAmount)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="${data.currencyCode}">${formatDecimal(data.taxableAmount)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${data.currencyCode}">${formatDecimal(data.totalAmount)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="${data.currencyCode}">${formatDecimal(data.totalAmount)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  ${lineItemsXml}
</Invoice>`;
}

/**
 * Calculate SHA-256 hash of XML content (for invoice chaining)
 */
export async function calculateInvoiceHash(xmlContent: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(xmlContent);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return btoa(hashArray.map(b => String.fromCharCode(b)).join(''));
}
