import { DocPageWrapper, SectionTitle, FeatureList, SubSection, MockupTable, TipBox } from "@/components/shared-docs/DocPageWrapper";

export const FinDocReports = () => (
  <DocPageWrapper pageNumber={6} totalPages={6} moduleTitle="Finance Module Guide">
    <SectionTitle icon="📊" title="Financial Reports — P&L, Balance Sheet, Cash Flow" subtitle="Real-time financial statements from general ledger data" />
    <SubSection title="Core Financial Statements">
      <MockupTable headers={["Report", "Purpose", "Period"]} rows={[
        ["Trial Balance", "Verify debits = credits for all accounts", "Any date range"],
        ["Profit & Loss (P&L)", "Revenue minus expenses = Net Income", "Monthly / Annual"],
        ["Balance Sheet", "Assets = Liabilities + Equity snapshot", "As of date"],
        ["Cash Flow Statement", "Operating + Investing + Financing activities", "Period"],
        ["General Ledger", "All transactions per account", "Any date range"],
      ]} />
    </SubSection>
    <SubSection title="Operational Reports">
      <FeatureList items={[
        "Revenue by Source — OPD, IPD, Lab, Pharmacy, Insurance breakdown",
        "Department Revenue — Revenue per clinical department",
        "Expense Analysis — Category-wise expense breakdown with trends",
        "Accounts Receivable Aging — 30/60/90/120 day buckets",
        "Accounts Payable Aging — Vendor payment due tracking",
        "Budget vs Actual — Variance analysis per department",
        "Doctor Revenue — Per-doctor revenue contribution report",
      ]} />
    </SubSection>
    <SubSection title="Report Features">
      <FeatureList items={[
        "Real-time calculation from journal entries — No batch processing",
        "Date range filter with quick presets (This Month, Last Quarter, YTD)",
        "Branch filter — Individual branch or consolidated view",
        "Export to PDF and Excel for external sharing",
        "Drill-down — Click any total to see underlying journal entries",
        "Comparison — Current period vs previous period side by side",
        "Bank reconciliation — Match bank statement with system records",
      ]} />
    </SubSection>
    <TipBox title="Executive Dashboard">The executive finance dashboard provides a single-screen overview of revenue, expenses, receivables, payables, and cash position.</TipBox>
  </DocPageWrapper>
);
