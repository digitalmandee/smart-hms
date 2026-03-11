import { DocPageWrapper, SectionTitle, SubSection, FeatureList, TipBox, MockupTable } from "@/components/pharmacy-docs/DocPageWrapper";

export const FinDemoGuideVAT = ({ totalPages }: { totalPages: number }) => (
  <DocPageWrapper pageNumber={13} totalPages={totalPages}>
    <SectionTitle icon="🏛️" title="VAT / ZATCA Compliance" subtitle="Saudi Tax Authority Integration" />

    <SubSection title="VAT Implementation">
      <MockupTable
        headers={["VAT Type", "Source", "Rate", "GL Account"]}
        rows={[
          ["Output VAT", "Patient invoices (sales)", "15%", "VAT Output Payable"],
          ["Input VAT", "Purchase GRNs", "15%", "VAT Input Receivable"],
          ["Net VAT", "Output - Input", "-", "Due to ZATCA"],
        ]}
      />
    </SubSection>

    <SubSection title="ZATCA E-Invoicing (Phase 1 & 2)">
      <FeatureList items={[
        "Phase 1 (QR Code): All invoices include ZATCA-compliant QR codes with 8 TLV fields",
        "Phase 2 (Clearance): UBL 2.1 XML generation with SHA-256 hash chaining",
        "Previous Invoice Hash: Each invoice references the hash of its predecessor",
        "Clearance API: Invoices submitted to ZATCA for real-time validation",
        "Status tracking: Cleared, Reported, Failed — visible on invoice detail page",
      ]} />
    </SubSection>

    <SubSection title="QR Code Contents (8 TLV Fields)">
      <FeatureList items={[
        "Seller Name (organization name)",
        "VAT Registration Number",
        "Invoice Date & Time (ISO 8601)",
        "Invoice Total (including VAT)",
        "VAT Amount",
        "Invoice Hash (SHA-256)",
        "ECDSA Signature",
        "Public Key",
      ]} />
    </SubSection>

    <SubSection title="VAT Return Report">
      <FeatureList items={[
        "Automated summary of Output VAT vs Input VAT for filing period",
        "Downloadable report format matching ZATCA filing requirements",
        "Date range selector for quarterly or monthly reporting",
        "Located at /app/accounts/reports/vat-return",
      ]} />
    </SubSection>

    <TipBox title="Demo Note">
      QR codes are visible on printed invoices and the Invoice Detail page. NPHIES integration is separate from ZATCA — NPHIES handles insurance claims, ZATCA handles tax compliance.
    </TipBox>
  </DocPageWrapper>
);
