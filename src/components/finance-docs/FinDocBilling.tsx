import { DocPageWrapper, SectionTitle, FeatureList, SubSection, StepList, TipBox } from "@/components/shared-docs/DocPageWrapper";

export const FinDocBilling = () => (
  <DocPageWrapper pageNumber={5} totalPages={6} moduleTitle="Finance Module Guide">
    <SectionTitle icon="💳" title="Billing — Invoice, Payment, Daily Closing" subtitle="End-to-end billing lifecycle from service delivery to cash reconciliation" />
    <SubSection title="Invoice Lifecycle">
      <StepList steps={[
        "Services rendered (OPD/IPD/Lab/Pharmacy/etc.) → Line items auto-generated",
        "Invoice created — Auto or manual, with tax calculation (VAT/ZATCA)",
        "Payment collection — Cash, card, mobile wallet, insurance",
        "Receipt generated with QR code (ZATCA Phase 2 compliant)",
        "Journal auto-posted: DR Receivable/Cash, CR Revenue",
        "Insurance claims auto-submitted for insured patients (NPHIES)",
      ]} />
    </SubSection>
    <SubSection title="Payment Features">
      <FeatureList items={[
        "Split payment — Part cash, part card, part insurance",
        "Advance/deposit collection with running balance",
        "Credit limit management for corporate accounts",
        "Refund workflow with approval and journal reversal",
        "Payment reconciliation — Match payments to invoices",
        "Overdue tracking with aging reports (30/60/90 days)",
      ]} />
    </SubSection>
    <SubSection title="Daily Closing">
      <FeatureList items={[
        "End-of-day report — Total collections by payment method",
        "Cash drawer reconciliation with variance tracking",
        "Session-based billing — Staff accountability per shift",
        "Auto-journal for daily closing totals",
        "Historical closing reports with date range filter",
        "Branch-level and organization-level closing summaries",
      ]} />
    </SubSection>
    <TipBox title="ZATCA Compliance">All invoices auto-generate ZATCA Phase 2 compliant QR codes with TLV-encoded seller, VAT, and total information.</TipBox>
  </DocPageWrapper>
);
