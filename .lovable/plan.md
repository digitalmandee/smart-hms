

# Fix: General Ledger Page — Missing Data & Running Balance

## Problem
The General Ledger page shows "-" for Date, Entry #, and Description, and shows 0 for Balance. This is because:

1. **Wrong field paths**: The hook returns `journal_entry_lines` with a nested `journal_entry` object, so data is at `entry.journal_entry.entry_date`, but the GL page reads `entry.entry_date` (flat). The AccountDetailPage already does this correctly.
2. **No running balance calculation**: The GL page reads `entry.running_balance` which doesn't exist on the raw data. AccountDetailPage correctly computes it using opening balance + cumulative debit/credit.
3. **Each line showing only debit OR credit is correct** — this IS proper double-entry bookkeeping. Each journal entry line records one side. The counterpart line appears on a different account's ledger.

## Fix

### File: `src/pages/app/accounts/GeneralLedgerPage.tsx`

**Fix 1 — Field paths**: Change all references from flat to nested:
- `entry.entry_date` → `entry.journal_entry?.entry_date`
- `entry.entry_number` → `entry.journal_entry?.entry_number`
- `entry.description` → `entry.description || entry.journal_entry?.description`

**Fix 2 — Running balance**: Add running balance calculation (same pattern as AccountDetailPage):
- Start from `selectedAccount.opening_balance`
- For each entry, accumulate based on `is_debit_normal` from account type
- Need to fetch account type info — use `useAccount(selectedAccountId)` instead of finding in the list

**Fix 3 — Add Reference column**: Show `entry.journal_entry?.reference_type` as a badge so users can see the source (invoice, payment, payroll, etc.)

**Fix 4 — Add Opening Balance row**: Same as AccountDetailPage, show opening balance as first row

**Fix 5 — Add totals row**: Show total debits and credits at the bottom

### Additional: Fetch account with type info
Replace the `accounts.find()` lookup with `useAccount(selectedAccountId)` to get full account data including `account_type.is_debit_normal` for correct balance calculation.

## Result
- Date, Entry #, Description all display correctly
- Running balance calculated properly based on account's normal balance direction
- Reference type badge shows transaction source
- Opening balance and totals rows for completeness
- Double-entry system is confirmed correct — each line is one side of a balanced journal entry

## Files Changed
- `src/pages/app/accounts/GeneralLedgerPage.tsx` — fix field paths, add running balance calc, add reference column, opening balance row, totals row

