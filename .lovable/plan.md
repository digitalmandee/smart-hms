

# Finance & Accounting Module — Complete Audit

## What's Fully Working (Confirmed)

| Area | Status | Details |
|------|--------|---------|
| Chart of Accounts (4-level) | Done | Level 4 posting restriction, active/inactive, opening balances |
| Journal Entries / Vouchers | Done | CPV/CRV/BPV/BRV/JV, status-based immutability, cancellation reversal |
| General Ledger | Done | Running balance, source document clickable badges, drill-down |
| Trial Balance | Done | Opening/Movement/Closing columns, zero-balance toggle, export |
| Profit & Loss | Done | Standard + Detailed + Department + Cost Center + Consolidated |
| Balance Sheet | Done | Assets/Liabilities/Equity snapshot |
| Cash Flow Statement | Done | Operating/Investing/Financing |
| Revenue Drill-Down | Done | GL → Invoice → Doctor/Patient/Service traceability |
| Revenue by Source | Done | Revenue stream breakdown |
| Accounts Receivable / Aging | Done | Patient + Insurance + Vendor aging buckets |
| Accounts Payable | Done | Vendor balances from GRN |
| AR Reconciliation | Done | Journal totals vs account balances verification |
| Vendor Payments | Done | List + Detail + Form, GL auto-posting |
| Expense Management | Done | Categories with GL routing (petty cash, refund, advance) |
| Patient Deposits | Done | Liability-based wallet, application, refund |
| Credit/Debit Notes | Done | ZATCA-compliant 381/383 |
| Bank Accounts | Done | List + Detail + Transaction history |
| Bank Reconciliation | Done | CSV import, auto-matching, reconcile |
| Cash to Bank Deposits | Done | Dialog + Report page |
| Fixed Asset Register | Done | Straight-line + Reducing balance, schedule viewer |
| Cost Centers | Done | Dimensional accounting on journal lines |
| Fiscal Period Management | Done | Lock/unlock periods |
| Budget Management | Done | Fiscal year creation, budget vs actual |
| Daily Closing (Billing) | Done | 4-step wizard, denomination counting, variance |
| Payroll Cost Allocation | Done | GOSI + ESB department breakdown |
| VAT Return Report | Done | Output vs Input VAT for ZATCA |
| Financial Audit Log | Done | Change tracking with side-by-side diffs |
| Multi-currency | Done | Currency + exchange rate on journal entries |
| ZATCA e-Invoicing | Done | Phase 1 + Phase 2 clearance |
| Insurance Claims/Reconciliation | Done | ERA posting workflow |
| Payroll GL Integration | Done | Auto-post trigger on payroll completion |
| All triggers (15 modules) | Done | Idempotent single-posting pattern |

## Remaining Gaps (What's Missing)

### Gap 1: Year-End Closing Process
No automated year-end closing workflow exists. There's no mechanism to:
- Close revenue/expense accounts to Retained Earnings at fiscal year-end
- Generate the closing journal entry (DR all revenue accounts, CR all expense accounts, net to Retained Earnings)
- Carry forward opening balances to the new fiscal year
- Lock the closed year permanently

This is a **critical accounting requirement** — without it, the Balance Sheet's Equity section cannot show proper Retained Earnings.

### Gap 2: Fixed Asset Depreciation Auto-Posting
The Fixed Asset module calculates depreciation schedules but has **no "Run Monthly Depreciation" action** that posts journal entries (DR Depreciation Expense, CR Accumulated Depreciation). It's purely a viewer — the GL never receives depreciation entries automatically.

### Gap 3: Cheque / PDC (Post-Dated Cheque) Management
Bank vouchers collect cheque number and date, but there's no:
- PDC register to track post-dated cheques received/issued
- Maturity alerts for cheques approaching deposit date
- Status tracking (received → deposited → cleared → bounced)
- Bounced cheque handling with reversal entries

### Gap 4: Inter-Branch Accounting
Mentioned in documentation ("inter-branch stock transfers", "consolidated financials") but no inter-branch journal entry or transfer mechanism exists. No due-to / due-from accounts between branches.

### Gap 5: Recurring Journal Entries
No way to set up recurring entries (monthly rent, insurance amortization, etc.) that auto-post on schedule.

### Gap 6: Accrual & Prepayment Schedules
No amortization schedule for prepaid expenses (insurance, rent paid in advance) or accrued liabilities. These need monthly auto-entries to recognize expenses over time.

---

## Recommended Priority

**Must-Have (Core Accounting Integrity):**
1. Year-End Closing Process — Without this, financial statements are incomplete across fiscal years
2. Fixed Asset Depreciation Posting — Assets depreciate but GL never reflects it

**Should-Have (Operational Completeness):**
3. Recurring Journal Entries — Saves significant manual work
4. PDC / Cheque Register — Important for cash management

**Nice-to-Have (Advanced):**
5. Accrual & Prepayment Schedules
6. Inter-Branch Accounting

---

## Implementation Plan (Priority 1 & 2)

### 1. Year-End Closing Page
**New file**: `src/pages/app/accounts/YearEndClosingPage.tsx`
- Select fiscal year to close
- System auto-calculates: total revenue, total expenses, net income
- Preview closing journal entry (DR Revenue accounts, CR Expense accounts, Net → Retained Earnings equity account)
- One-click "Post Closing Entry" creates the journal and locks the fiscal year
- Carry-forward: updates opening balances on all Balance Sheet accounts for the next fiscal year
- Route: `/app/accounts/year-end-closing`

**New hook**: `src/hooks/useYearEndClosing.ts`
- Fetches all revenue/expense accounts with their period totals
- Creates closing journal entry with one line per account
- Updates `fiscal_years.is_active = false` and locks all budget periods
- Updates `chart_of_accounts.opening_balance` for next year

### 2. Fixed Asset Depreciation Posting
**Edit**: `src/pages/app/accounts/FixedAssetsPage.tsx`
- Add "Run Monthly Depreciation" button
- Calculates current month's depreciation for all active assets
- Posts journal entry: DR Depreciation Expense (per asset category), CR Accumulated Depreciation
- Updates `fixed_assets.accumulated_depreciation` and `net_book_value`
- Prevents double-posting for same month (idempotency check)

**New hook**: `src/hooks/useDepreciationPosting.ts`

### 3. Recurring Journal Entries
**New file**: `src/pages/app/accounts/RecurringEntriesPage.tsx`
- Create templates: account lines, frequency (monthly/quarterly), start/end dates
- "Generate Pending" button creates draft entries for the current period
- Route: `/app/accounts/recurring-entries`

**Migration**: Create `recurring_journal_templates` table

### 4. PDC Register
**New file**: `src/pages/app/accounts/PDCRegisterPage.tsx`
- List all post-dated cheques with maturity dates and status
- Actions: Mark as Deposited → Cleared / Bounced
- Bounced creates reversal journal entry
- Route: `/app/accounts/pdc-register`

**Migration**: Create `pdc_register` table

### File Summary

| Item | New Files | Edits | Migration |
|------|-----------|-------|-----------|
| Year-End Closing | 2 (page + hook) | App.tsx, sidebar, translations | None (uses existing tables) |
| Depreciation Posting | 1 (hook) | FixedAssetsPage.tsx, translations | None |
| Recurring Entries | 2 (page + hook) | App.tsx, sidebar, translations | 1 (template table) |
| PDC Register | 1 (page) | App.tsx, sidebar, translations | 1 (pdc table) |

**Total: ~6 new files, ~8 edits, 2 migrations**

