

# Fix: GL Entries Not Found on Deposit Detail Page

## Root Cause
The `DepositDetailPage.tsx` queries journal entries with `reference_type = 'deposit'`, but the database trigger stores them as `reference_type = 'patient_deposit'`. This mismatch means the query always returns zero results.

## Fix
One-line change in `src/pages/app/billing/DepositDetailPage.tsx` — line 53:

Change `.eq("reference_type", "deposit")` to `.eq("reference_type", "patient_deposit")`

Also update `src/components/billing/DepositDetailDialog.tsx` if it still exists with the same bug.

## Files Changed
- `src/pages/app/billing/DepositDetailPage.tsx` — fix reference_type filter
- `src/components/billing/DepositDetailDialog.tsx` — fix reference_type filter (if still used)

