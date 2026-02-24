

# Remaining Finance Module Enhancements

## Status Check
Phases 2, 4, 7, and 8 are complete. Four phases remain:

---

## Phase 1: Finance Dashboard UI Overhaul

**File:** `src/pages/app/accounts/AccountsDashboard.tsx`

- Add a 6th summary card: "Expenses (MTD)" showing current month expenses
- Add an "Overdue Receivables" alert card below fiscal year info, querying invoices older than 30 days with status pending/partially_paid -- shows count and total overdue amount with a red warning style
- Add a "Revenue Trend (Last 7 Days)" mini line chart using Recharts, querying `journal_entry_lines` joined with revenue-type accounts grouped by date
- Add "Pending Vendor Payments" count card showing unpaid GRN-linked payables
- Add Expense Management to the module links grid
- All new text will have translation keys in en/ur/ar

---

## Phase 3: Budget vs Actual Tracking

**File:** `src/pages/app/accounts/BudgetsPage.tsx`

Replace the placeholder "Budget management coming soon" section with:

- A budget allocation form: select an expense account, enter allocated amount for current fiscal year, save to `budget_allocations` table
- A table showing all budget allocations: Account Name | Budget Allocated | Actual Spent (sum of posted debit journal entry lines for that account in the fiscal year period) | Variance | % Used
- Progress bars for each row (green < 80%, amber 80-100%, red > 100%)
- An overall budget utilization summary card at top
- Uses existing `budget_allocations` table (already created in prior migration)

---

## Phase 5: Receivables Aging Chart

**File:** `src/pages/app/accounts/ReceivablesPage.tsx`

- Add an aging summary bar chart between summary cards and filters, using Recharts BarChart
- Buckets: Current, 1-30, 31-60, 61-90, 90+ days
- Each bar shows total outstanding amount for that bucket
- Color-coded bars (green to red gradient)

---

## Phase 6: Revenue by Source Report

**New file:** `src/pages/app/accounts/RevenueBySourcePage.tsx`

- Revenue breakdown by source derived from `invoice_items` joined with `service_types` category
- Categories: Consultation, Lab, Imaging, Pharmacy, IPD, Other
- Date range filter (default: current month)
- Pie chart (Recharts PieChart) showing distribution
- Table below with: Source | Count | Amount | % of Total
- Route: `/app/accounts/reports/revenue-by-source` (add to App.tsx)
- Link from Financial Reports page or Accounts Dashboard

---

## Translations

New keys for all 3 languages (en/ur/ar):
- `accounts.expensesMTD`, `accounts.overdueReceivables`, `accounts.revenueTrend`
- `accounts.pendingVendorPayments`, `accounts.budgetAllocation`, `accounts.actualSpent`
- `accounts.variance`, `accounts.percentUsed`, `accounts.revenueBySource`
- `accounts.agingChart`

---

## Files Modified/Created

| File | Action |
|------|--------|
| `AccountsDashboard.tsx` | Edit -- add charts, alert cards, MTD expenses |
| `BudgetsPage.tsx` | Edit -- replace placeholder with budget-vs-actual UI |
| `ReceivablesPage.tsx` | Edit -- add aging bar chart |
| `RevenueBySourcePage.tsx` | Create -- new report page |
| `App.tsx` | Edit -- add revenue-by-source route |
| `en.ts` / `ar.ts` / `ur.ts` | Edit -- add translation keys |
| `DynamicSidebar.tsx` | Edit -- add icon mapping if needed |

No database changes needed -- `budget_allocations` table already exists.

