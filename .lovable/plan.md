

# Demo Flow: Complete Accounts & Finance Module Walkthrough

## Current Data Status
The database already has substantial seed data:
- **63 accounts** in Chart of Accounts (4-level hierarchy)
- **316 journal entries** (Aug 2025 – Apr 2026) across 9 reference types
- **127 invoices** (97 paid, 26 pending, 4 partially paid)
- **13 expenses**, **8 vendor payments**, **5 fixed assets**, **5 patient deposits**
- **10 billing sessions**, **10 daily closings**, **3 credit notes**

This is enough to demonstrate the full module. The plan creates an **interactive Demo Flow page** that guides the presenter through every finance feature step-by-step.

## What We'll Build

### New Page: `/app/accounts/demo-flow`
A guided walkthrough page with numbered steps organized into sections. Each step has:
- Step number and title (trilingual)
- What to show / what to say
- Direct navigation button to the relevant page
- Checkmark when completed

### Demo Flow Sections (18 steps)

**Section 1 — Foundation**
1. **Accounts Dashboard** → `/app/accounts` — Show KPIs, revenue trend chart, AR aging pie chart
2. **Chart of Accounts** → `/app/accounts/chart-of-accounts` — Expand 4-level tree, show posting vs header accounts
3. **Account Types** → `/app/accounts/types` — Show asset/liability/equity/revenue/expense categories

**Section 2 — Transaction Recording**
4. **Create Journal Entry** → `/app/accounts/journal-entries/new` — Post a manual entry (e.g., office supplies expense)
5. **Journal Entries List** → `/app/accounts/journal-entries` — Show all entries with reference type badges
6. **General Ledger** → `/app/accounts/ledger` — Select an account, show running balance with opening balance

**Section 3 — Billing & Revenue**
7. **Billing Dashboard** → `/app/billing` — Today's collections, pending invoices, quick actions
8. **Create Invoice** → `/app/billing/invoices/new` — Walk through patient selection, line items, insurance
9. **Invoice Detail** → `/app/billing/invoices` — Show paid/pending invoices, print with hospital branding
10. **Payment Collection** → `/app/billing/payment-collection` — Collect payment, show split payment support

**Section 4 — Operations**
11. **Daily Closing** → `/app/billing/daily-closing` — Department-wise reconciliation, cash variance
12. **Billing Sessions** → `/app/billing/sessions` — Open/close session lifecycle
13. **Patient Deposits** → `/app/accounts/patient-deposits` — Advance deposit, application to invoice

**Section 5 — Payables & Expenses**
14. **Expense Management** → `/app/accounts/expenses` — Record and approve expenses
15. **Vendor Payments** → `/app/accounts/vendor-payments` — Pay vendor, link to GRN
16. **Accounts Payable** → `/app/accounts/payables` — Aging breakdown

**Section 6 — Reports & Compliance**
17. **Financial Reports Hub** → `/app/accounts/reports` — P&L, Balance Sheet, Cash Flow, Trial Balance
18. **Bank Reconciliation** → `/app/accounts/bank-reconciliation` — Import CSV, auto-match

**Bonus Steps** (collapsed by default):
- Fixed Assets & Depreciation → `/app/accounts/fixed-assets`
- Credit Notes → `/app/accounts/credit-notes`
- VAT Return → `/app/accounts/vat-return`
- Cost Center P&L → `/app/accounts/cost-center-pnl`
- AR Reconciliation → `/app/accounts/ar-reconciliation`
- Financial Audit Log → `/app/accounts/audit-log`
- Payroll Cost Allocation → `/app/accounts/payroll-allocation`

### Design
- Card-based layout with step numbers in colored circles
- Each card: title, description, "talking points" for presenter, and a "Go →" button
- Progress bar at top showing completed steps
- Collapsible sections
- Trilingual support (en/ar/ur) for all labels

### Technical Details
- Pure client-side page — no new DB tables needed
- Add route to existing router config
- Add sidebar link under Accounts for finance_manager and accountant roles
- Use localStorage to persist completed steps
- All 3 language translation keys added

## Files Changed
- `src/pages/app/accounts/FinanceDemoFlowPage.tsx` — new guided demo page
- `src/App.tsx` or router config — add route `/app/accounts/demo-flow`
- `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts` — trilingual labels for all 18+ steps

