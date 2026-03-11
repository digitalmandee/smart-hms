import { DocPageWrapper, SectionTitle, SubSection, StepList, FeatureList, TipBox, MockupTable } from "@/components/pharmacy-docs/DocPageWrapper";

export const FinDemoGuideDailyClosing = ({ totalPages }: { totalPages: number }) => (
  <DocPageWrapper pageNumber={8} totalPages={totalPages}>
    <SectionTitle icon="📅" title="Daily Closing & Reconciliation" subtitle="4-Step End-of-Day Wizard" />

    <SubSection title="Step 1: Review Billing Sessions">
      <FeatureList items={[
        "All billing sessions for the day are listed with their totals",
        "Sessions must be closed before proceeding (open sessions block wizard)",
        "Each session shows: cashier name, shift, transaction count, collections total",
        "Session totals auto-updated by update_session_on_payment trigger",
      ]} />
    </SubSection>

    <SubSection title="Step 2: Record Expenses & Payouts">
      <FeatureList items={[
        "Enter any expenses incurred during the day (petty cash, refunds, advances)",
        "Categories: Petty Cash, Refund, Staff Advance, Miscellaneous",
        "Each expense auto-posts to GL: Debit Expense, Credit Cash",
      ]} />
    </SubSection>

    <SubSection title="Step 3: Cash Denomination Reconciliation">
      <FeatureList items={[
        "Physical cash counting by denomination (1000, 500, 100, 50, 20, 10, 5, 2, 1)",
        "System calculates expected cash = Total Collections - Card/UPI - Payouts",
        "Difference highlighted: Over/Short amount shown immediately",
      ]} />
    </SubSection>

    <SubSection title="Step 4: Summary & Submission">
      <MockupTable
        headers={["Metric", "Calculation"]}
        rows={[
          ["Total Collections", "Sum of all payments across all sessions"],
          ["Total Payouts", "Expenses + Refunds + Advances"],
          ["Net Cash", "Collections - Payouts"],
          ["Physical Cash", "Sum of denomination count"],
          ["Difference", "Physical Cash - Expected Cash"],
        ]}
      />
    </SubSection>

    <TipBox title="Approval Flow">
      Once submitted, the daily closing record is sent for supervisor approval. Closing number auto-generated: EOD-YYMMDD-XX format. Historical closings visible in Closing History tab.
    </TipBox>
  </DocPageWrapper>
);
