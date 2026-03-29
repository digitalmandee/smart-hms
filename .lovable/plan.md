

# Fix Accounts Dashboard — Two Failing API Queries

## Issues Found

Two queries on the Accounts Dashboard (`/app/accounts`) return HTTP 400 errors:

### Bug 1: `goods_received_notes.payment_status` does not exist
- **Location**: `AccountsDashboard.tsx` line 100-103
- **Problem**: Queries `.eq("payment_status", "unpaid")` but `goods_received_notes` has no `payment_status` column. Payment status is computed client-side in `useVendorPayments.ts` based on `invoice_amount` vs paid amounts.
- **Fix**: Replace with a query that counts GRNs with `status = 'received'` (verified/accepted but not yet paid). Alternatively, use a subquery approach — but simplest is to count GRNs where `status` is `'received'` or `'verified'` since those represent unpaid goods.

### Bug 2: `journal_entries.status` does not exist
- **Location**: `AccountsDashboard.tsx` line 69-70 and `BudgetsPage.tsx` line 106-108
- **Problem**: Queries filter on `journal_entry.status = 'posted'` but the column is `is_posted` (boolean).
- **Fix**: Change `.eq("journal_entry.status", "posted")` to `.eq("journal_entry.is_posted", true)` and update the select to use `is_posted` instead of `status`.

## Files to Change

### 1. `src/pages/app/accounts/AccountsDashboard.tsx`
- Line 69: Change select from `(status, entry_date)` to `(is_posted, entry_date)`
- Line 70: Change `.eq("journal_entry.status", "posted")` to `.eq("journal_entry.is_posted", true)`
- Lines 100-103: Remove the `payment_status` filter. Instead query GRNs with `status` in `('received', 'verified')` as a proxy for unpaid, or remove the `as any` cast and use proper status values.

### 2. `src/pages/app/accounts/BudgetsPage.tsx`
- Line 106: Change select from `(status, entry_date)` to `(is_posted, entry_date)`
- Line 108: Change `.eq("journal_entry.status", "posted")` to `.eq("journal_entry.is_posted", true)`

### 3. Scan for same pattern elsewhere
- Check all other files using `journal_entries.*status` in joins — `ConsolidatedPnLPage.tsx`, `CostCenterPnLPage.tsx`, `useAccounts.ts`, `useExecutiveSummary.ts` may have the same bug.

## Impact
These fixes resolve the two 400 errors visible on the Accounts Dashboard, allowing MTD expenses and pending vendor payment counts to load correctly.

