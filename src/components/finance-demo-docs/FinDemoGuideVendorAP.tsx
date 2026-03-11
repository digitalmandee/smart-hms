import { DocPageWrapper, SectionTitle, SubSection, StepList, FeatureList, TipBox, MockupTable } from "@/components/pharmacy-docs/DocPageWrapper";

export const FinDemoGuideVendorAP = ({ totalPages }: { totalPages: number }) => (
  <DocPageWrapper pageNumber={12} totalPages={totalPages}>
    <SectionTitle icon="🤝" title="Vendor Payments & AP Flow" subtitle="Purchase-to-Payment Lifecycle" />

    <SubSection title="Procurement Flow">
      <StepList steps={[
        "Purchase Request (PR) created by department",
        "Purchase Order (PO) issued to vendor after approval",
        "Goods Received Note (GRN) recorded on delivery — inventory updated",
        "Vendor invoice verified against GRN quantities and prices",
        "Payment scheduled and processed via Vendor Payments page",
      ]} />
    </SubSection>

    <SubSection title="Vendor Payment GL Posting">
      <MockupTable
        headers={["Action", "Debit", "Credit"]}
        rows={[
          ["GRN Received", "Inventory Asset", "Accounts Payable"],
          ["Vendor Payment", "Accounts Payable", "Cash / Bank"],
        ]}
      />
    </SubSection>

    <SubSection title="AP Management Features">
      <FeatureList items={[
        "Vendor master with contact, bank details, and payment terms",
        "Outstanding balance tracking per vendor with aging analysis",
        "Payment can be linked to specific GRN or made as general payment",
        "Payment methods: Cash, Bank Transfer, Cheque (reference number tracked)",
        "Vendor payment history with full audit trail",
      ]} />
    </SubSection>

    <SubSection title="Vendor Reports">
      <FeatureList items={[
        "Accounts Payable aging (0-30, 31-60, 61-90, 90+ days)",
        "Vendor-wise outstanding balance summary",
        "Payment history report with method breakdown",
        "Unpaid GRN count visible on Accounts Dashboard",
      ]} />
    </SubSection>

    <TipBox title="Demo Route">
      Navigate to /app/accounts/vendor-payments to record payments. View outstanding balances at /app/accounts/payables.
    </TipBox>
  </DocPageWrapper>
);
