

# Fix: GL Shows Empty for Header/Parent Accounts

## Problem
The General Ledger page only lists Level 4 (posting) accounts in the dropdown — it filters out all header accounts with `allAccounts.filter(a => !a.is_header)`. When the user selects a head account like "Service Revenue" or "Current Assets", they see **no transactions** because journal entries are posted to Level 4 children (e.g., REV-001), not to the parent.

The user expects to select any account (including headers like "Service Revenue", "IPD Revenue", etc.) and see **all child account transactions rolled up**.

## Fix

### File 1: `src/pages/app/accounts/GeneralLedgerPage.tsx`
- **Show all accounts in the dropdown** — remove the `!a.is_header` filter. Group them visually by level (indent or prefix with level indicator).
- When a **header account** is selected, collect all descendant Level 4 account IDs recursively, then pass them to the ledger query.
- When a **posting account** is selected, query as before (single account).
- Add a helper function `getDescendantIds(accountId, allAccounts)` that walks the `parent_account_id` tree to find all leaf accounts.

### File 2: `src/hooks/useAccounts.ts` — `useAccountLedger`
- Accept `accountId: string | string[]` — when an array is passed, use `.in("account_id", ids)` instead of `.eq("account_id", accountId)`.
- Add the account name to each line so the user can see which child account each transaction belongs to when viewing a header.

### File 3: Translation keys (`en.ts`, `ar.ts`, `ur.ts`)
- Add `accounts.allChildTransactions` label for the header account view context.

## Result
Selecting "Service Revenue" in the GL will show all invoice CR entries from REV-001 and any other revenue child accounts. Same for all other header accounts — Assets, Liabilities, Expenses, etc. will all roll up correctly.

## Files Changed
- `src/pages/app/accounts/GeneralLedgerPage.tsx` — include headers in dropdown, resolve descendant IDs
- `src/hooks/useAccounts.ts` — support array of account IDs in `useAccountLedger`
- `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts` — new label

