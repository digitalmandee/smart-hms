

# Accounting Module — Complete Test Suite & Demo Verification Guide

## Module Scope

The accounting module spans **40+ pages** across two main areas:
- **Accounts** (`/app/accounts/*`) — 40 pages covering COA, journals, ledger, receivables, payables, expenses, bank accounts, budgets, fixed assets, cost centers, credit notes, patient deposits, period management, audit log, and 10 financial reports
- **Billing** (`/app/billing/*`) — 20 pages covering invoices, payments, sessions, daily closing, insurance/claims, NPHIES

## Part 1: Automated E2E Tests to Build

Expand the existing 5 finance tests to **50+ comprehensive tests** in `tests/e2e/finance-flow.spec.ts`:

### Test Categories

**A. Page Load & Navigation (20 tests)** — Verify every accounting page loads without error:
- Accounts Dashboard, Chart of Accounts, Journal Entries, General Ledger
- Receivables, Payables, Vendor Payments, Expense Management
- Bank Accounts, Budgets, Financial Reports hub
- Trial Balance, P&L, Balance Sheet, Cash Flow, Detailed P&L
- Revenue by Source, Cost Center P&L, Consolidated P&L, VAT Return, Payroll Cost
- Credit Notes, Fixed Assets, Patient Deposits, Period Management, Audit Log, Cost Centers

**B. Chart of Accounts (5 tests)**:
- View tree structure with category filtering (asset/liability/equity/revenue/expense)
- Search accounts by name/code
- Create new Level 4 account via form
- Toggle account active/inactive status
- Verify Level 1-3 accounts cannot be posted to

**C. Journal Entries (6 tests)**:
- List view with date/status/type filters
- Create manual journal entry with balanced debit/credit
- Verify unbalanced entry is rejected
- View journal entry detail with lines
- Export journal entries to CSV
- Post draft entry and verify status change

**D. Billing & Invoices (5 tests)**:
- View invoices list with filters
- Open invoice detail page
- Process payment against invoice
- View payment history
- Billing sessions page loads

**E. Daily Closing (3 tests)**:
- Open daily closing wizard
- View closing history with date filters
- Verify wizard blocks if open sessions exist

**F. Financial Reports (6 tests)**:
- Trial Balance renders with account rows
- P&L shows revenue/expense groupings
- Balance Sheet shows assets = liabilities + equity
- Cash Flow report loads
- Detailed P&L with drill-down
- Export report to CSV/PDF

**G. Advanced Features (5 tests)**:
- Credit Notes: create draft, approve
- Patient Deposits: record deposit, view balance
- Fixed Assets: view asset register
- Bank Reconciliation: page loads
- Vendor Payments: create and view detail

## Part 2: Step-by-Step Manual Demo Verification Checklist

This is a **printable document** for manual QA — organized by sub-module, with exact steps, expected results, and pass/fail checkboxes.

### Deliverable
Generate a detailed **PDF document** at `/mnt/documents/accounting-test-guide.pdf` containing:

1. **Module Overview** — All 40+ pages listed with URLs
2. **Demo Script** — Step-by-step walkthrough for each sub-module (login as Accountant, navigate, verify data, perform action, verify result)
3. **Test Matrix** — Spreadsheet-style grid: Test ID, Module, Test Case, Steps, Expected Result, Status column
4. **Known Dependencies** — What seed data must exist (demo invoices, accounts, fiscal years)

## Implementation Steps

### Step 1: Expand `tests/e2e/finance-flow.spec.ts`
- Add ~45 new test cases covering all accounting pages and key interactions
- Group tests using `test.describe()` blocks per sub-module
- Reuse `demoLogin(page, "Accountant")` for all tests

### Step 2: Generate Test Guide Document
- Create a comprehensive PDF at `/mnt/documents/accounting-test-guide.pdf`
- Include module-by-module demo scripts with screenshots placeholders
- Include test matrix with 80+ test cases for manual verification

### Step 3: Run the E2E tests
- Execute the expanded test suite
- Document any failures as issues to fix

## Technical Notes
- All tests use the existing `demoLogin` utility with "Accountant" role
- Page load tests verify URL match + h1 visibility (existing pattern)
- Interaction tests use Playwright locators for buttons, forms, tables
- The daily closing wizard requires today's billing sessions — noted as a dependency

