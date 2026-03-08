import { KsaDocPageWrapper, KsaSectionTitle, KsaSubSection, KsaFeatureList, KsaStepList, KsaTipBox, KsaMockupTable } from "./KsaDocPageWrapper";

export const KsaDocZatca = () => (
  <KsaDocPageWrapper pageNumber={5} totalPages={12}>
    <KsaSectionTitle icon="🧾" title="ZATCA Phase 2 — E-Invoicing" subtitle="Zakat, Tax & Customs Authority — Integration Phase (Clearance & Reporting)" />

    <KsaSubSection title="UBL 2.1 Invoice Generation">
      <KsaFeatureList items={[
        "Automatic UBL 2.1 XML generation for all invoices and credit/debit notes",
        "Digital signature using X.509 certificates (ECDSA with SHA-256)",
        "QR code generation with TLV-encoded seller, VAT, timestamp, and hash",
        "Invoice counter and UUID for sequential tracking compliance",
        "Support for both simplified (B2C) and standard (B2B) invoices",
      ]} />
    </KsaSubSection>

    <KsaSubSection title="Clearance & Reporting Flow">
      <KsaStepList steps={[
        "Invoice created in HealthOS → UBL 2.1 XML auto-generated",
        "XML signed with cryptographic stamp (CSID) from ZATCA portal",
        "Standard invoices → sent for Clearance (real-time approval required)",
        "Simplified invoices → sent for Reporting (within 24 hours)",
        "Response received — cleared/reported status updated on invoice",
      ]} />
    </KsaSubSection>

    <KsaSubSection title="Invoice Types">
      <KsaMockupTable
        headers={["Type", "Code", "Flow", "Deadline"]}
        rows={[
          ["Standard (B2B)", "388", "Clearance", "Real-time"],
          ["Simplified (B2C)", "388", "Reporting", "24 hours"],
          ["Credit Note", "381", "Per original", "Per original"],
          ["Debit Note", "383", "Per original", "Per original"],
        ]}
      />
    </KsaSubSection>

    <KsaTipBox title="Auto-Compliance">
      Every invoice printed from POS, billing, or pharmacy automatically generates ZATCA-compliant XML. No manual steps needed — the QR code appears on the printed receipt.
    </KsaTipBox>
  </KsaDocPageWrapper>
);
