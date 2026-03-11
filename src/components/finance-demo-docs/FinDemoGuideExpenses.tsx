import { DocPageWrapper, SectionTitle, SubSection, StepList, FeatureList, TipBox, MockupTable } from "@/components/pharmacy-docs/DocPageWrapper";

export const FinDemoGuideExpenses = ({ totalPages }: { totalPages: number }) => (
  <DocPageWrapper pageNumber={11} totalPages={totalPages}>
    <SectionTitle icon="💸" title="Expense Management Flow" subtitle="Tracking, Categorization & Auto GL Posting" />

    <SubSection title="Expense Categories">
      <MockupTable
        headers={["Category", "Use Case", "GL Account"]}
        rows={[
          ["Petty Cash", "Small daily expenses (tea, stationery)", "Petty Cash Expense"],
          ["Refund", "Patient refunds processed at counter", "Refund Expense"],
          ["Staff Advance", "Salary advances given to employees", "Staff Advances"],
          ["Miscellaneous", "Maintenance, utilities, travel", "Admin Expenses"],
          ["Other", "Any uncategorized expense", "General Expense"],
        ]}
      />
    </SubSection>

    <SubSection title="Expense Recording Flow">
      <StepList steps={[
        "Staff records expense with: amount, category, description, date",
        "Optional: link to billing session for daily closing reconciliation",
        "Expense saved → auto GL trigger fires: Debit Expense Account, Credit Cash",
        "Expense appears in daily closing payout summary",
        "Monthly expense reports aggregated by category",
      ]} />
    </SubSection>

    <SubSection title="Key Features">
      <FeatureList items={[
        "Expenses linked to billing sessions for shift-level tracking",
        "Daily closing wizard aggregates all expenses as 'payouts'",
        "Net Cash calculation: Collections - Expenses = Expected Cash",
        "Expense trend analysis available in Accounts Dashboard",
      ]} />
    </SubSection>

    <TipBox title="Demo Route">
      Navigate to /app/accounts/expenses to view and create expenses. Expenses are also visible in the Daily Closing wizard (Step 2).
    </TipBox>
  </DocPageWrapper>
);
