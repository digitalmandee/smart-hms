

# Billing Session Verification — Issues Found & Fixes

## What's Working Well
- **Journal posting triggers** are correctly in place: invoices auto-post (DR AR, CR Revenue), payments auto-post (DR Cash/Payment Method, CR AR), expenses auto-post (DR Expense Account, CR Cash)
- **Session close** correctly calculates expected cash, actual cash, denominations, and payment method breakdowns
- **Daily closing** aggregates sessions, payments by method, department breakdowns, and blocks if open sessions exist
- **Day-end summary** report pulls collections and department-wise data
- **Session detail page** shows transactions, cash breakdown, denominations, and discrepancy reasons

## Issues Found

### Issue 1: Expenses Not Deducted from Expected Cash on Session Close
**Severity: High**

When closing a session, `useCloseSession` (line 275-297) only fetches `payments` linked to the session. But expenses (`expenses` table with `billing_session_id`) that were paid out in cash during the session are NOT subtracted from the expected cash calculation. This means if ₨5,000 was collected and ₨500 was paid out as a cash expense, the expected cash should be ₨4,500 + opening, but it currently shows ₨5,000 + opening — causing a phantom discrepancy.

**Fix**: In `useCloseSession`, also query `expenses` where `billing_session_id = sessionId`, sum cash expenses, and subtract from `cashTotal` (expected cash).

### Issue 2: Session Detail Page Missing Expenses Section
**Severity: Medium**

The `SessionDetailPage` shows only payment transactions. It does not show expenses recorded against the session. The `useSessionExpenses` hook exists but is never used on this page.

**Fix**: Add an "Expenses / Payouts" card to `SessionDetailPage` showing expenses linked to the session, with their amounts, categories, and recipients.

### Issue 3: Patient Deposits Not Tracked in Session
**Severity: Medium**

The `patient_deposits` table has a `billing_session_id` column, but session close calculations don't include deposits. Deposits received as cash increase the physical cash but are NOT invoice payments — they're liabilities. The expected cash calculation should include deposit amounts received via cash.

**Fix**: In `useCloseSession`, also query `patient_deposits` where `billing_session_id = sessionId`, add cash deposits to expected cash total. Also show deposits in `SessionDetailPage`.

### Issue 4: Session Detail Department Breakdown Uses Missing Field
**Severity: Low**

Line 226 references `tx.invoice?.department` but `invoices` doesn't have a `department` column in the select query. The department breakdown always falls back to "Other" for all transactions.

**Fix**: Join `invoice_items` with `service_types` to get actual department categories, or derive department from the invoice's service type categories.

### Issue 5: Daily Closing Not Accounting for Expenses/Payouts in Net Cash
**Severity: Medium**

The `useDailyClosingSummary` calculates `collections` but doesn't separately aggregate expenses paid out during the day. The daily closing page fetches expenses separately (`useBranchExpenses`) and shows them, but the summary object itself lacks an `expenses` field for the net cash calculation.

**Fix**: Add expenses total to the `DailyClosingSummary` type and calculate `netCash = collections.total - expenses` in the summary.

---

## Implementation Plan

### 1. Fix session close to include expenses and deposits in expected cash
**File**: `src/hooks/useBillingSessions.ts` (useCloseSession, ~line 275-300)
- After fetching payments, also fetch `expenses` and `patient_deposits` with `billing_session_id = sessionId`
- Subtract cash expenses from `cashTotal`
- Add cash deposits to `cashTotal`
- Keep `totalCollections` as payments-only (collections = money received for invoices)

### 2. Add expenses and deposits sections to SessionDetailPage
**File**: `src/pages/app/billing/SessionDetailPage.tsx`
- Import `useSessionExpenses` from `useExpenses`
- Add "Expenses / Payouts" card with table showing expense details
- Query and show patient deposits linked to the session
- Fix department breakdown to not rely on non-existent `tx.invoice?.department`

### 3. Add expenses to DailyClosingSummary
**File**: `src/hooks/useDailyClosing.ts`
- Add `expenses` field to `DailyClosingSummary` type
- Fetch and sum expenses for the date in `useDailyClosingSummary`
- Calculate `netCash` = collections.total - expenses

### 4. i18n keys
Add translation keys for "Expenses/Payouts", "Patient Deposits", "Net Cash" in English, Urdu, Arabic.

## Files Changed
- `src/hooks/useBillingSessions.ts` — fix expected cash calculation
- `src/pages/app/billing/SessionDetailPage.tsx` — add expenses/deposits sections, fix dept breakdown
- `src/hooks/useDailyClosing.ts` — add expenses to summary
- `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts` — new keys

