

# Finance & Accounts Module -- Complete Audit & Workflow

## Current System Status (Live Data)

### What is Working with Real Data

| Component | Status | Live Data |
|-----------|--------|-----------|
| Chart of Accounts | Working | ~30 accounts across 5 categories (Asset, Liability, Equity, Revenue, Expense) |
| Account Types | Working | 87 types: 20 asset, 15 liability, 9 equity, 22 revenue, 21 expense |
| Journal Entries | Working (Auto) | 165 entries, all posted -- 55 from invoices, 33 from payments, 77 from POS transactions |
| Invoices | Working | 63 total: 40 paid, 3 partially paid, 20 pending |
| Fiscal Year | Working | 1 fiscal year configured (current, open) |
| Payroll Runs | Working | 3 completed payroll runs |
| Financial Reports | Working | Trial Balance, P&L, Balance Sheet, Cash Flow all render from live account balances |

### What Has No Data Yet (Feature Exists but Unused)

| Component | Status | Live Data |
|-----------|--------|-----------|
| Daily Closing | UI exists, never used | 0 closings recorded |
| Vendor Payments | UI exists, never used | 0 vendor payments |
| Expenses | UI exists, never used | 0 expenses recorded |
| Budget Allocations | UI exists, never used | 0 budget allocations |

---

## Issues Found

### 1. Chart of Accounts -- Flat Structure, No Level 4 Hierarchy
The current COA has **no parent-child hierarchy** -- all 30 accounts have `parent_account_id = NULL`. The `AccountTree` component supports nesting (it builds a tree via `useAccountsTree`), but no accounts actually use the `parent_account_id` field. This means:
- No Level 1 / Level 2 / Level 3 / Level 4 grouping exists
- The Balance Sheet and P&L show a flat list rather than grouped sub-accounts
- The system supports it structurally but the demo data was set up flat

### 2. Duplicate System Accounts Across Organizations
There are duplicate account numbers (e.g., `AR-001` appears twice with balances 185,000 and 766,023; `CASH-001` appears three times; `REV-001` appears twice). These are auto-created by the `get_or_create_default_account()` function for different organizations, which is correct behavior, but it means the dashboard aggregates across organizations since queries don't always filter by `organization_id`.

### 3. Cash Flow Statement is Mostly Placeholder
The `useCashFlow` hook (lines 258-307 of `useFinancialReports.ts`) only pulls `payments` table data for "Collections from Patients". The Investing and Financing sections return hardcoded zeros. Supplier payments, salary disbursements, equipment purchases are all `amount: 0`.

### 4. Trial Balance Uses Current Balance Only (Not Date-Range Filtered)
The `useTrialBalance` hook accepts `startDate`/`endDate` parameters but **ignores them** -- it reads `current_balance` from accounts directly (line 73). A proper trial balance should sum journal entry lines within the date range.

### 5. P&L Not Date-Filtered Either
Same issue -- `useProfitLoss` accepts date parameters but reads `current_balance` directly (lines 141-143). This means it always shows all-time figures, not period-specific.

### 6. Daily Closing Has No Data Flow
The Daily Closing page exists and works structurally (sessions, expenses, reconciliation, summary steps), but since no billing sessions or expenses have been created, it shows empty.

### 7. Payroll-to-Journal Not Connected
Payroll runs complete successfully (3 runs) but there is no trigger or function to post payroll entries to the journal. Salary expenses don't automatically create journal entries (Debit: Salaries & Wages, Credit: Salaries Payable / Cash).

---

## Complete Finance Module Workflow

### Module 1: Chart of Accounts (COA)

**Purpose**: Define the financial structure of the organization -- every money movement must map to an account.

**How it works**:
1. Admin navigates to `/app/accounts/chart-of-accounts`
2. **Account Types** define categories: Asset, Liability, Equity, Revenue, Expense (with `is_debit_normal` flag)
3. **Accounts** are created with a number (e.g., 1000), name, type, and optional parent account for hierarchy
4. The tree view (`AccountTree` component) renders nested accounts when `parent_account_id` is set
5. Accounts can be activated/deactivated, and system-created accounts (from triggers) are marked `is_system = true`
6. **Balance updates**: The DB trigger `update_account_balance()` automatically recalculates `current_balance` whenever journal entry lines are inserted/updated/deleted

**Current state**: 30 accounts, all flat (no hierarchy). Needs Level 1-4 structure for proper reporting.

---

### Module 2: Journal Entries (Double-Entry Bookkeeping)

**Purpose**: Record every financial transaction as balanced debit/credit entries.

**How it works**:
1. **Auto-generated entries** (via DB triggers):
   - `post_invoice_to_journal()` -- When an invoice is created (status pending/paid/partially_paid), auto-creates: Debit AR, Credit Revenue
   - `post_stock_writeoff_to_journal()` -- When stock is written off: Debit Write-off Expense, Credit Inventory Asset
   - `post_shipping_cost_to_journal()` -- When shipment dispatched: Debit Shipping Expense, Credit Cash
   - POS transaction entries (77 entries auto-posted from pharmacy POS)
2. **Manual entries** -- Staff can create manual journal entries via `/app/accounts/journal-entries/new`
3. Each entry has lines with `debit_amount` and `credit_amount` that must balance
4. Entries can be Draft or Posted; only posted entries affect account balances
5. The `entry_number` is auto-generated by `generate_journal_entry_number()` trigger

**Current state**: 165 entries, all posted. 55 from invoices, 33 from payments, 77 from POS. Working correctly.

---

### Module 3: General Ledger

**Purpose**: View transaction history for any specific account.

**How it works**:
1. Navigate to `/app/accounts/general-ledger`
2. Select an account from dropdown, optionally set date range
3. Shows all journal entry lines for that account with running balance
4. Uses `useAccountLedger` hook

**Current state**: Functional. Shows real transaction data.

---

### Module 4: Invoices & Billing

**Purpose**: Generate invoices for patient services, track payments.

**How it works**:
1. Invoices created from OPD consultations, IPD charges, lab orders, pharmacy POS
2. Each invoice has items (service types), total amount, paid amount, status
3. When created, the `post_invoice_to_journal()` trigger auto-creates journal entries
4. Payments update `paid_amount` and status (pending -> partially_paid -> paid)
5. The `sync_department_order_payment_status()` trigger updates lab/imaging order payment status when invoice is paid
6. `post_consultation_earning()` trigger auto-credits doctor wallets on invoice payment

**Current state**: 63 invoices (40 paid, 20 pending, 3 partial). Auto-posting to journal working.

---

### Module 5: Accounts Receivable

**Purpose**: Track unpaid patient invoices.

**How it works**:
1. Navigate to `/app/accounts/receivables`
2. Shows all invoices with status `pending` or `partially_paid`
3. Includes aging analysis (color-coded bar chart: Current, 30-60 days, 60-90 days, 90+ days)
4. Search by patient name, filter by aging bucket
5. CSV export available
6. Dashboard shows overdue alert when invoices are >30 days old

**Current state**: 23 outstanding invoices visible. Aging chart working.

---

### Module 6: Accounts Payable & Vendor Payments

**Purpose**: Track money owed to vendors (from GRNs) and record payments.

**How it works**:
1. Navigate to `/app/accounts/payables`
2. Shows GRNs (Goods Received Notes) with payment status (unpaid/partially_paid/paid)
3. Navigate to `/app/accounts/payables/payments/new` to record vendor payments
4. Payment creates journal entry: Debit AP, Credit Cash/Bank
5. `vendor_payment_number` auto-generated by trigger

**Current state**: 0 vendor payments recorded. GRNs exist from inventory module.

---

### Module 7: Expense Management

**Purpose**: Track operational expenses (petty cash, refunds, advances).

**How it works**:
1. Navigate to `/app/accounts/expenses`
2. Record expenses with category (petty_cash, refund, staff_advance, misc), amount, payment method
3. Pie chart shows category breakdown
4. Date range filter, category filter, search, CSV export
5. Expenses are linked to the billing session for daily closing reconciliation

**Current state**: 0 expenses recorded.

---

### Module 8: Daily Closing (End-of-Day Reconciliation)

**Purpose**: Close the day's financial activity -- reconcile cash, review sessions, submit for approval.

**How it works**:
1. Navigate to `/app/billing/daily-closing`
2. **Step 1 - Sessions**: Review all billing sessions for the day (open/closed)
3. **Step 2 - Expenses**: Review day's expenses
4. **Step 3 - Reconciliation**: Enter actual cash (denomination counting), system compares to expected
5. **Step 4 - Summary**: Review totals, save as draft or submit for approval
6. Uses `useDailyClosingSummary`, `useBranchSessions`, `useBranchExpenses` hooks
7. Closing record stored in `daily_closings` table with status (draft/submitted/approved)

**Current state**: 0 closings. Requires billing sessions to be used first.

---

### Module 9: Financial Reports

**Purpose**: Generate standard financial statements.

| Report | Route | Data Source | Status |
|--------|-------|-------------|--------|
| Trial Balance | `/app/accounts/reports/trial-balance` | Account balances | Working (but not date-filtered) |
| Profit & Loss | `/app/accounts/reports/profit-loss` | Revenue vs Expense accounts | Working (but not date-filtered) |
| Balance Sheet | `/app/accounts/reports/balance-sheet` | Asset, Liability, Equity accounts | Working |
| Cash Flow | `/app/accounts/reports/cash-flow` | Payments table | Mostly placeholder (zeros) |
| Revenue by Source | `/app/accounts/revenue-by-source` | Invoice data | Working |

---

### Module 10: Budgets & Fiscal Years

**Purpose**: Set budget allocations per expense account and track actual vs budget.

**How it works**:
1. Navigate to `/app/accounts/budgets`
2. Create fiscal years (name, start/end date, mark as current)
3. Allocate budgets to expense accounts (allocated amount)
4. Progress bar shows actual spend vs allocated
5. Only one fiscal year can be `is_current = true`

**Current state**: 1 fiscal year configured. 0 budget allocations.

---

### Module 11: Payroll

**Purpose**: Process monthly salary payments for all employees.

**How it works**:
1. Navigate to HR > Payroll > Process Payroll
2. Select month/year, system pulls all active employee salaries
3. Calculates: basic salary + allowances - deductions (tax, loan EMI, provident fund)
4. For doctors: integrates with wallet earnings (auto-settles unpaid consultation/surgery earnings)
5. Creates `payroll_run` record and individual `payroll_entries` per employee
6. Supports bank sheet export for bulk transfer
7. Tax slabs configurable in HR > Setup > Tax Slabs

**Current state**: 3 completed payroll runs. **Missing**: payroll-to-journal integration (salary expense not auto-posted to journal entries).

---

## Auto-Posting Triggers Summary

```text
Event                          -> Journal Entry Created
------------------------------------------------------
Invoice Created                -> Debit: AR, Credit: Revenue
Payment Received               -> Debit: Cash, Credit: AR  
POS Transaction                -> Debit: Cash, Credit: Pharmacy Revenue
Stock Write-off/Damage         -> Debit: Write-off Expense, Credit: Inventory
Shipment Dispatched            -> Debit: Shipping Expense, Credit: Cash
Invoice Paid (consultation)    -> Doctor wallet auto-credited
```

## Recommended Improvements

1. **Set up 4-level COA hierarchy** -- Create parent accounts (Level 1: 1000 Current Assets, Level 2: 1100 Cash & Bank, Level 3: 1110 Petty Cash, Level 4: 1111 Branch-A Petty Cash)
2. **Fix Trial Balance & P&L date filtering** -- Query journal_entry_lines within date range instead of using current_balance
3. **Build Cash Flow from journal data** -- Replace placeholder zeros with actual journal entry aggregations by account category
4. **Add payroll-to-journal trigger** -- Auto-post salary expense journal entries when payroll is completed
5. **Add expense-to-journal trigger** -- Auto-post expense entries to the journal
6. **Populate budget allocations** -- Create sample budgets for expense tracking

