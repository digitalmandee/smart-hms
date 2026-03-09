import { DocPageWrapper, SectionTitle, FeatureList, SubSection, MockupTable, TipBox } from "@/components/shared-docs/DocPageWrapper";

export const FinDocBudgets = () => (
  <DocPageWrapper pageNumber={13} totalPages={14} moduleTitle="Finance Module Guide">
    <SectionTitle icon="📅" title="Budgets & Fiscal Years" subtitle="Fiscal period management, budget allocation, and variance analysis" />
    <SubSection title="Fiscal Year Setup">
      <MockupTable headers={["Field", "Description", "Example"]} rows={[
        ["Fiscal Year Name", "Descriptive label for the period", "FY 2025-26"],
        ["Start Date", "First day of the fiscal year", "01 Jan 2025"],
        ["End Date", "Last day of the fiscal year", "31 Dec 2025"],
        ["Status", "Open (active) or Closed (locked)", "Open"],
        ["Auto-Periods", "System generates 12 monthly periods automatically", "Jan–Dec"],
      ]} />
    </SubSection>
    <SubSection title="Budget Allocation">
      <FeatureList items={[
        "Account-level budgets — Allocate annual budget to specific Chart of Accounts entries",
        "Department budgets — Set spending limits per department per fiscal period",
        "Monthly distribution — Spread annual budget evenly or custom-allocate by month",
        "Budget categories — Revenue budgets (targets) and expense budgets (limits)",
        "Revision tracking — Record budget amendments with approval and reason",
        "Multi-branch budgets — Separate budget allocations per branch if required",
        "Copy previous year — Clone last year's budget as starting point for new year",
      ]} />
    </SubSection>
    <SubSection title="Variance Analysis">
      <MockupTable headers={["Metric", "Formula", "Interpretation"]} rows={[
        ["Budget Amount", "Allocated budget for the period", "Planned spending"],
        ["Actual Amount", "Sum of journal entries for the account/period", "Real spending"],
        ["Variance", "Budget − Actual", "Positive = under budget"],
        ["Variance %", "(Variance / Budget) × 100", "% deviation from plan"],
        ["YTD Budget", "Cumulative budget to current month", "Year-to-date plan"],
        ["YTD Actual", "Cumulative actuals to current month", "Year-to-date spend"],
      ]} />
    </SubSection>
    <SubSection title="Budget Control Features">
      <FeatureList items={[
        "Warning alerts — Notification when spending reaches 80% of budget allocation",
        "Hard limits — Optional block on transactions exceeding budget (requires override)",
        "Executive dashboard — Budget vs actual summary across all departments",
        "Trend analysis — Monthly spending trends compared to budget trajectory",
        "Forecast projection — Project year-end actuals based on current run rate",
      ]} />
    </SubSection>
    <TipBox title="Real-Time Tracking">Budget variance is calculated in real-time from journal entries — no batch processing or month-end close required to see current position.</TipBox>
  </DocPageWrapper>
);
