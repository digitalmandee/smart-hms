

# Finance Module Deep Audit + OPD Linkage + Hospital Warehouse Connection

## Findings Summary

### 1. Hospital Linked Warehouse

Yes, hospital organizations already have access to the Inventory module which serves as their "linked warehouse." Hospital users can manage stock, purchase orders, GRNs, vendors, stock requisitions, and store transfers. The `facility_type` conditional rendering already hides warehouse-only columns (like "Sell Price" on GRN forms) and shows hospital-relevant ones (like "Medicine Type"). This is working correctly -- no changes needed here.

### 2. OPD Module -- Finance Linkage Status

The OPD module is **well-linked** to finance:
- OPD Checkout (`OPDCheckoutPage.tsx`) collects consultation fees, lab charges, and creates invoices + payments via `useCreateInvoice` and `useRecordPayment`
- Invoices auto-post journal entries to Accounts Receivable + Service Revenue via DB trigger `post_invoice_to_journal`
- Doctor earnings are auto-posted via `post_consultation_earning` trigger when invoice is paid
- Lab orders link back to invoices via `invoice_id` column
- Appointment links to invoice via `invoice_id` for duplicate prevention

**OPD Gaps Found:**
- No imaging order billing integration (imaging orders exist but no invoice linking in checkout)
- Prescription charges show Rs. 0 in checkout (pharmacy handles pricing) -- but no link back to confirm pharmacy dispensing revenue posts to journal
- OPD checkout has no discount controls (line-item or overall discount)
- No OPD-specific revenue reports (revenue by doctor, by department, by service type)

### 3. Finance Module -- Comprehensive Audit

**What works well:**
- Chart of Accounts with account types
- Journal Entries with posted/draft status
- General Ledger with running balance
- Trial Balance with balance check
- Profit & Loss Statement
- Balance Sheet with balance check
- Cash Flow Statement
- Accounts Receivable (patient invoices)
- Accounts Payable (GRN-linked vendor payments)
- Bank Accounts with recent transactions
- Fiscal Year management
- Invoice auto-posting to journal
- Daily Closing with expenses step

**Gaps and Enhancement Opportunities:**

#### A. Budget Module is Placeholder
`BudgetsPage.tsx` only manages fiscal years. The "Budget Overview" section says "Budget management coming soon." No actual budget allocation or budget-vs-actual tracking exists.

#### B. No Expense Management Page
Expenses can only be recorded through the Daily Closing wizard. There's no standalone Expense Management page where users can view all expenses, filter by category/date, or manage petty cash independently.

#### C. Financial Reports -- Missing Comparative Analysis
- P&L has no period comparison (current vs previous period)
- No department-wise P&L breakdown
- No revenue-by-source analysis (OPD, IPD, Lab, Pharmacy)
- No aging summary chart on Receivables (just table)
- Export buttons exist but don't actually export (placeholder)

#### D. Dashboard UI Improvements
- Summary cards use plain numbers -- no sparkline trends or percentage changes
- No overdue alerts or aging breakdown visualization
- No revenue trend chart (daily/weekly/monthly)
- Quick actions section is static -- no context-aware suggestions
- No pending approvals widget (pending vendor payments, unreconciled bank entries)

#### E. Journal Entries -- Missing Features
- No pagination (loads all entries)
- No date filter
- No bulk operations
- No reference-type filter (invoice, shipment, stock_adjustment)
- No debit/credit amount columns visible in list

#### F. General Ledger -- No Export/Print
- No export or print capability
- Running balance calculation happens client-side -- could be slow with many entries

#### G. Vendor Payments -- No Payment History Overview
- Vendor payment list exists but no consolidated view of payment aging across all vendors
- No payment scheduling/reminders

#### H. No Tax/VAT Configuration
- Invoices have tax_amount field but no tax rate configuration
- No tax report generation

---

## Implementation Plan

### Phase 1: Finance Dashboard UI Overhaul

**File:** `AccountsDashboard.tsx`

Changes:
- Add a Revenue Trend mini-chart (last 7 days) using Recharts -- query `journal_entry_lines` for revenue accounts
- Add "Overdue Receivables" alert card showing count and amount of 30+ day outstanding invoices
- Add "Pending Vendor Payments" card showing unpaid GRN count
- Add percentage change indicators on summary cards (compare current month vs previous)
- Add "Expenses (MTD)" as 6th summary card
- Make description and module links translatable (en/ur/ar)

### Phase 2: Standalone Expense Management Page

**New file:** `src/pages/app/accounts/ExpenseManagementPage.tsx`

Features:
- Full-page expense list with date range, category, and amount filters
- Summary cards: Total Expenses (MTD), by category breakdown (petty cash, utilities, salaries, supplies, etc.)
- Add Expense button (reuses existing `RecordExpenseDialog`)
- Category pie chart showing expense distribution
- Export to CSV functionality
- New route: `/app/accounts/expenses`
- Add to Accounts Dashboard module links and sidebar navigation

### Phase 3: Budget vs Actual Tracking

**Edit:** `BudgetsPage.tsx`

Changes:
- Replace the placeholder "Budget Overview" with a real budget allocation table
- New DB table: `budget_allocations` (account_id, fiscal_year_id, allocated_amount, organization_id)
- For each expense account, show: Budget Allocated, Actual Spent (from journal entries), Variance, % Used
- Progress bars for each category showing utilization
- Alert badges when budget is >80% or >100% utilized
- Overall budget utilization summary card

### Phase 4: Journal Entries List Enhancement

**Edit:** `JournalEntriesPage.tsx`

Changes:
- Add date range filter (from/to)
- Add reference_type filter dropdown (All, Invoice, Shipment, Stock Adjustment, Manual)
- Add status filter (Posted/Draft)
- Add debit/credit total columns to the table
- Add pagination (25 per page)
- Show journal entry source (e.g., "Invoice: INV-20260223-0001" as clickable link)

### Phase 5: Receivables -- Aging Chart + Insurance Receivables

**Edit:** `ReceivablesPage.tsx`

Changes:
- Add an aging summary bar chart (Current / 1-30 / 31-60 / 61-90 / 90+) using Recharts
- Link insurance receivables to insurance claims from billing module (query `insurance_claims` table)
- Make the Insurance Receivables card functional (currently hardcoded to 0)
- Add "Send Reminder" action placeholder for overdue invoices
- Add pagination

### Phase 6: Revenue by Source Report

**New file:** `src/pages/app/accounts/RevenueBySourcePage.tsx`

Features:
- Revenue breakdown by source: OPD Consultations, Lab Tests, Imaging, IPD, Pharmacy POS
- Query `invoice_items` joined with `service_types` to categorize revenue
- Date range filter
- Pie chart + table view
- Comparison with previous period
- New route: `/app/accounts/reports/revenue-by-source`
- Add to Financial Reports page cards

### Phase 7: P&L Comparative + Department-wise

**Edit:** `ProfitLossPage.tsx`

Changes:
- Add "Compare with Previous Period" toggle
- When enabled, show side-by-side columns: Current Period | Previous Period | Change %
- Add department-wise P&L breakdown tab (query journal entries by branch_id)

### Phase 8: Export Functionality

**Across multiple files:** `TrialBalancePage.tsx`, `ProfitLossPage.tsx`, `BalanceSheetPage.tsx`, `CashFlowPage.tsx`, `ReceivablesPage.tsx`, `PayablesPage.tsx`

Changes:
- Implement actual CSV export for all Export buttons (currently placeholder)
- Use a shared `exportToCSV` utility function
- Format numbers and dates properly for export

---

## Database Changes

**New table: `budget_allocations`**

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| organization_id | uuid | FK |
| fiscal_year_id | uuid | FK to fiscal_years |
| account_id | uuid | FK to accounts |
| allocated_amount | numeric(15,2) | Budget amount |
| notes | text | Optional |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**New menu_items inserts:**
- Expense Management under Accounts parent (for both hospital and warehouse)

---

## Navigation/Sidebar Updates

- Add "Expense Management" menu item under Accounts
- Add "Revenue by Source" under Financial Reports sub-menu
- Add icon mappings in DynamicSidebar

---

## Translation Keys

New keys for en.ts, ar.ts, ur.ts:
- `accounts.expenseManagement`, `accounts.revenueBySource`, `accounts.budgetVsActual`
- `accounts.overdue`, `accounts.pendingPayments`, `accounts.mtdExpenses`
- `accounts.agingSummary`, `accounts.comparePeriod`, `accounts.exportCSV`

---

## Summary of Changes

| Item | Type | Impact |
|------|------|--------|
| Dashboard revenue trend chart + alerts | UI Enhancement | All orgs |
| Expense Management page | New Page | All orgs |
| Budget vs Actual tracking | New Feature + DB table | All orgs |
| Journal Entries filters + pagination | UI Enhancement | All orgs |
| Receivables aging chart + insurance link | UI Enhancement | Hospital only |
| Revenue by Source report | New Page | Hospital only |
| P&L comparative mode | UI Enhancement | All orgs |
| CSV Export (all reports) | Feature Fix | All orgs |
| Translations (en/ur/ar) | i18n | All |

