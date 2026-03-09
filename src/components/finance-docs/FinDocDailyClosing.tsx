import { DocPageWrapper, SectionTitle, FeatureList, SubSection, StepList, MockupTable, TipBox } from "@/components/shared-docs/DocPageWrapper";

export const FinDocDailyClosing = () => (
  <DocPageWrapper pageNumber={9} totalPages={14} moduleTitle="Finance Module Guide">
    <SectionTitle icon="🔒" title="Daily Closing & Cash Reconciliation" subtitle="Multi-step wizard for end-of-day financial closure with denomination counting" />
    <SubSection title="Closing Wizard Steps">
      <StepList steps={[
        "Step 1 — Session Review: View all open/closed sessions for the day with collection totals",
        "Step 2 — Expense Review: Review all expenses recorded during the day (petty cash, refunds, advances)",
        "Step 3 — Cash Reconciliation: Enter physical cash count by denomination (500, 200, 100, 50, 20, 10, 5, 1)",
        "Step 4 — Variance Calculation: System compares expected cash (collections minus expenses) vs counted cash",
        "Step 5 — Summary & Approval: Final report with variance explanation, supervisor approval if variance exceeds threshold",
        "Step 6 — Lock Period: All transactions for the day are locked — no further modifications allowed",
      ]} />
    </SubSection>
    <SubSection title="Cash Denomination Counting">
      <MockupTable headers={["Denomination", "Count", "Subtotal"]} rows={[
        ["500 SAR", "User enters count", "Auto-calculated"],
        ["200 SAR", "User enters count", "Auto-calculated"],
        ["100 SAR", "User enters count", "Auto-calculated"],
        ["50 SAR", "User enters count", "Auto-calculated"],
        ["20 SAR", "User enters count", "Auto-calculated"],
        ["10 SAR", "User enters count", "Auto-calculated"],
        ["5 SAR", "User enters count", "Auto-calculated"],
        ["1 SAR", "User enters count", "Auto-calculated"],
      ]} />
    </SubSection>
    <SubSection title="Net Cash Calculation">
      <FeatureList items={[
        "Total Collections — Sum of all payment receipts (cash, card, bank transfer)",
        "Minus: Doctor Settlements — Amounts paid out to visiting doctors",
        "Minus: Vendor Payments — Supplier payments made during the day",
        "Minus: Expenses — Petty cash, refunds, staff advances, miscellaneous",
        "= Net Cash — Expected cash in drawer for reconciliation",
        "Variance = Counted Cash − Net Cash — Overage (positive) or Shortage (negative)",
      ]} />
    </SubSection>
    <SubSection title="Closing History">
      <FeatureList items={[
        "Historical closing reports accessible at /app/billing/daily-closing/history",
        "Date range filter with quick presets (Today, This Week, This Month)",
        "Department-wise collection breakdown (OPD, Lab, Pharmacy, IPD)",
        "Variance trend tracking — Identify patterns in cash discrepancies",
        "Export to PDF and Excel for external audit requirements",
        "Branch-level and organization-level consolidated closing summaries",
      ]} />
    </SubSection>
    <TipBox title="Audit Trail">Every daily closing record includes: who performed it, who approved it, timestamp, variance amount, and explanation notes — fully auditable.</TipBox>
  </DocPageWrapper>
);
