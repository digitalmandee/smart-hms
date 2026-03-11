import { DocPageWrapper, SectionTitle, SubSection, StepList, FeatureList, TipBox } from "@/components/pharmacy-docs/DocPageWrapper";

export const FinDemoGuideInvoices = ({ totalPages }: { totalPages: number }) => (
  <DocPageWrapper pageNumber={5} totalPages={totalPages}>
    <SectionTitle icon="🧾" title="Invoice & Payment Flow" subtitle="End-to-End Revenue Cycle" />

    <SubSection title="Invoice Creation Flow">
      <StepList steps={[
        "Patient visits OPD / Lab / Radiology / IPD department",
        "Services are selected from service catalog (service_types table)",
        "Invoice auto-generates with line items, pricing, and VAT calculation",
        "Invoice number auto-generated: INV-YYYYMMDD-XXXX format",
        "Status starts as 'pending' — auto GL posting: Debit AR, Credit Revenue",
      ]} />
    </SubSection>

    <SubSection title="Payment Collection">
      <StepList steps={[
        "Receptionist opens a Billing Session (required for payment collection)",
        "Selects invoice → enters payment amount (full or partial)",
        "Chooses payment method: Cash, Card, JazzCash, EasyPaisa, Bank Transfer",
        "Payment recorded → auto GL posting: Debit Cash/Bank, Credit AR",
        "Invoice status updates: pending → partially_paid → paid",
        "Receipt printable with QR code (ZATCA compliant)",
      ]} />
    </SubSection>

    <SubSection title="Invoice Categories & Filtering">
      <FeatureList items={[
        "Invoices tagged by service category: Consultation, Lab, Radiology, Procedure",
        "Tab-based filtering on Invoice List page for quick category views",
        "Status filters: Draft, Pending, Partially Paid, Paid, Cancelled",
        "Each payment linked to billing session for end-of-day reconciliation",
      ]} />
    </SubSection>

    <TipBox title="Session Security">
      Payments are blocked without an active billing session. This ensures every transaction is tied to a specific cashier/shift for audit trail and daily closing.
    </TipBox>
  </DocPageWrapper>
);
