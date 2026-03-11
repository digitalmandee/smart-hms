

## Enhanced Detailed P&L Report

### Current State
The existing P&L page (`ProfitLossPage.tsx`) shows a basic two-section layout: flat list of Revenue accounts and flat list of Expense accounts, with totals and period comparison. No transaction-level detail, no sub-groupings, no charts, and no drill-down capability.

### What We Will Build

**A comprehensive "Detailed P&L" page** with these enhancements:

#### 1. Account Sub-Grouping by Account Type
Instead of a flat list, group expenses by their account type name (e.g., "Cost of Goods Sold", "Administrative Expenses", "Salary & Wages", "Depreciation") with sub-totals per group. Revenue similarly grouped. This gives proper intermediate totals like:
- **Gross Profit** = Revenue - COGS
- **Operating Profit** = Gross Profit - Operating Expenses
- **Net Income** = Operating Profit - Other Expenses + Other Income

#### 2. Transaction Drill-Down
Clicking any account row expands to show the underlying journal entry lines for that account within the selected period — date, journal reference, narration, debit, credit. Uses a collapsible/accordion pattern.

#### 3. Summary Charts
Add a tab or section with:
- Revenue vs Expenses bar chart (monthly breakdown within selected period using Recharts)
- Expense composition pie/donut chart

#### 4. Enhanced Filters
- Quick presets: This Month, Last Month, This Quarter, YTD, Last Year
- Branch filter (if multi-branch)

#### 5. Better Export
- PDF export with proper formatting (using jsPDF + html-to-image already available)

### Technical Plan

**New page**: `src/pages/app/accounts/DetailedPnLPage.tsx`
- Tabs: "Statement" | "Charts" | "Transactions"
- Statement tab: grouped P&L with sub-totals, gross/operating/net profit lines
- Charts tab: monthly revenue/expense bar chart + expense breakdown donut (Recharts)
- Transactions tab: full searchable/filterable table of all revenue & expense journal lines
- Date presets + date range picker + branch filter
- Drill-down: click any account row in Statement tab to expand and see journal lines
- PDF and CSV export

**New hook additions** in `src/hooks/useFinancialReports.ts`:
- `useDetailedPnL(startDate, endDate, branchId?)` — fetches journal lines grouped by account and account_type, returns hierarchical data with sub-totals
- `useMonthlyPnLTrend(startDate, endDate)` — monthly revenue/expense aggregation for charts

**Route**: `/app/accounts/reports/detailed-pnl` added to `App.tsx`

**Navigation**: Add card to `FinancialReportsPage.tsx` reports array

### File Changes
1. **Create** `src/pages/app/accounts/DetailedPnLPage.tsx` — Full detailed P&L with tabs, drill-down, charts
2. **Update** `src/hooks/useFinancialReports.ts` — Add `useDetailedPnL` and `useMonthlyPnLTrend` hooks
3. **Update** `src/App.tsx` — Add route
4. **Update** `src/pages/app/accounts/FinancialReportsPage.tsx` — Add report card entry

