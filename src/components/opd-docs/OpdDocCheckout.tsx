import { DocPageWrapper, SectionTitle, FeatureList, SubSection, StepList, TipBox } from "@/components/shared-docs/DocPageWrapper";

export const OpdDocCheckout = () => (
  <DocPageWrapper pageNumber={9} totalPages={9} moduleTitle="OPD Module Guide">
    <SectionTitle icon="💳" title="Checkout & Billing" subtitle="End-of-visit billing, payment collection, and follow-up scheduling" />
    <SubSection title="Checkout Workflow">
      <StepList steps={[
        "Doctor marks consultation complete → Patient appears in checkout queue",
        "Cashier reviews charges — Consultation fee, lab tests, imaging, medications",
        "Apply insurance/corporate discount if applicable",
        "Collect payment — Cash, card, mobile wallet, or insurance claim",
        "Generate invoice + receipt → Print or send via SMS/email",
        "Schedule follow-up appointment if needed",
      ]} />
    </SubSection>
    <SubSection title="Billing Features">
      <FeatureList items={[
        "Auto-generated invoice from consultation services and orders",
        "Doctor fee lookup by appointment type (new vs follow-up)",
        "Tax calculation (VAT) with ZATCA Phase 2 QR code on receipt",
        "Split payment support — partial cash + card",
        "Fee waiver with approval workflow and reason tracking",
        "Pending checkout queue for patients who left without payment",
      ]} />
    </SubSection>
    <SubSection title="Follow-Up">
      <FeatureList items={[
        "Schedule follow-up during checkout with pre-selected doctor",
        "SMS/email reminder sent before follow-up date",
        "Follow-up appointments auto-linked to previous consultation",
      ]} />
    </SubSection>
    <TipBox title="Daily Closing">Run daily closing report to reconcile all OPD collections — cash, card, and insurance — with auto-journal entries to finance.</TipBox>
  </DocPageWrapper>
);
