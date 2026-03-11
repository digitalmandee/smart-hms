import { DocPageWrapper, SectionTitle, MockupTable } from "@/components/pharmacy-docs/DocPageWrapper";

export const FinDemoGuideNavRef = ({ totalPages }: { totalPages: number }) => (
  <DocPageWrapper pageNumber={17} totalPages={totalPages}>
    <SectionTitle icon="🗺️" title="Quick Navigation Reference" subtitle="All Finance Module Routes" />
    <MockupTable
      headers={["Route", "Page", "Key Feature"]}
      rows={[
        ["/app/accounts", "Accounts Dashboard", "KPIs, DSO, AR Aging, Revenue Trend"],
        ["/app/accounts/chart-of-accounts", "Chart of Accounts", "4-level tree with expand/collapse"],
        ["/app/accounts/journal-entries", "Journal Entries", "List, create, post, reverse"],
        ["/app/accounts/journal-entries/new", "New Journal Entry", "Multi-line with balance validation"],
        ["/app/accounts/ledger", "General Ledger", "Account-level transaction history"],
        ["/app/accounts/reports", "Financial Reports Hub", "All report cards with navigation"],
        ["/app/accounts/reports/profit-loss", "P&L Statement", "Period comparison mode"],
        ["/app/accounts/reports/balance-sheet", "Balance Sheet", "Assets = Liabilities + Equity"],
        ["/app/accounts/reports/cash-flow", "Cash Flow Statement", "Operating / Investing / Financing"],
        ["/app/accounts/reports/trial-balance", "Trial Balance", "Balanced indicator + export"],
        ["/app/accounts/reports/revenue-by-source", "Revenue by Source", "Pie chart breakdown"],
        ["/app/accounts/reports/cost-center-pnl", "Cost Center P&L", "Department profitability"],
        ["/app/accounts/reports/consolidated-pnl", "Consolidated P&L", "Multi-branch comparison"],
        ["/app/accounts/reports/vat-return", "VAT Return", "Output vs Input VAT for ZATCA"],
        ["/app/accounts/reports/payroll-cost", "Payroll Cost", "GOSI + ESB provisions"],
        ["/app/accounts/bank-reconciliation", "Bank Reconciliation", "CSV import + auto-match"],
        ["/app/accounts/bank-accounts", "Bank & Cash", "Account management"],
        ["/app/accounts/receivables", "Accounts Receivable", "Patient outstanding tracking"],
        ["/app/accounts/payables", "Accounts Payable", "Vendor outstanding tracking"],
        ["/app/accounts/vendor-payments", "Vendor Payments", "Record payments with GL posting"],
        ["/app/accounts/expenses", "Expense Management", "Categories + auto GL posting"],
        ["/app/accounts/credit-notes", "Credit / Debit Notes", "ZATCA types 381/383"],
        ["/app/accounts/fixed-assets", "Fixed Assets", "Depreciation schedules"],
        ["/app/accounts/patient-deposits", "Patient Deposits", "Advance wallet system"],
        ["/app/accounts/cost-centers", "Cost Centers", "Department tracking"],
        ["/app/accounts/budgets", "Budgets", "Variance analysis"],
        ["/app/accounts/period-management", "Period Management", "Lock/unlock fiscal periods"],
        ["/app/accounts/audit-log", "Financial Audit Log", "Change tracking + diffing"],
        ["/app/billing/daily-closing", "Daily Closing", "4-step reconciliation wizard"],
        ["/app/reports/day-end-summary", "Day-End Summary", "Department-wise collections"],
      ]}
    />
  </DocPageWrapper>
);
