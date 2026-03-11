import { DocPageWrapper, SectionTitle, SubSection, FeatureList, TipBox, MockupTable } from "@/components/pharmacy-docs/DocPageWrapper";

export const FinDemoGuideBudgets = ({ totalPages }: { totalPages: number }) => (
  <DocPageWrapper pageNumber={14} totalPages={totalPages}>
    <SectionTitle icon="📈" title="Budget & Fiscal Period Management" subtitle="Financial Planning & Period Control" />

    <SubSection title="Budget Management">
      <FeatureList items={[
        "Create annual or quarterly budgets by GL account",
        "Budget vs Actual comparison with variance analysis",
        "Variance shown as amount and percentage deviation",
        "Visual indicators: green (under budget), red (over budget), yellow (near limit)",
        "Department-wise budget allocation supported via cost centers",
      ]} />
    </SubSection>

    <SubSection title="Fiscal Year Configuration">
      <MockupTable
        headers={["Setting", "Description", "Example"]}
        rows={[
          ["Fiscal Year", "12-month accounting period", "Jan 2026 - Dec 2026"],
          ["Period Type", "Monthly or Quarterly sub-periods", "Monthly (12 periods)"],
          ["Year Status", "Active, Closed, or Archived", "Active"],
        ]}
      />
    </SubSection>

    <SubSection title="Period Locking">
      <FeatureList items={[
        "Lock individual fiscal periods to prevent backdated entries",
        "Locked periods block all journal postings (manual and auto-triggered)",
        "Unlock requires supervisor authorization",
        "Year-end closing creates retained earnings entry",
        "Period status visible on Accounts Dashboard fiscal year banner",
      ]} />
    </SubSection>

    <SubSection title="Budget Variance Analysis">
      <FeatureList items={[
        "Real-time comparison of budgeted vs actual spending",
        "Drill-down by account to see contributing transactions",
        "Exportable variance reports for management review",
        "Located at /app/accounts/budgets",
      ]} />
    </SubSection>

    <TipBox title="Demo Route">
      Navigate to /app/accounts/budgets for budget planning. Period locking at /app/accounts/period-management.
    </TipBox>
  </DocPageWrapper>
);
