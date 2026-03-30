

# Add AR Reconciliation Report Page

## What It Does
A new report page that compares **journal entry totals** (from `journal_entry_lines`) against **account stored balances** (from `accounts.current_balance`) for every posting account. It highlights discrepancies where the computed balance from journal lines does not match the stored `current_balance`, helping auditors verify double-entry integrity.

## Implementation

### 1. New hook: `useARReconciliation` in `src/hooks/useFinancialReports.ts`
- Query all non-header active accounts with their `current_balance`, `opening_balance`, and `account_type` (category, is_debit_normal)
- Query all posted `journal_entry_lines` grouped by `account_id`, summing `debit_amount` and `credit_amount`
- For each account, compute expected balance:
  - If debit-normal: `opening_balance + total_debits - total_credits`
  - If credit-normal: `opening_balance + total_credits - total_debits`
- Compare computed vs `current_balance`; flag variance
- Return array of rows with: account_number, account_name, category, opening_balance, total_debits, total_credits, computed_balance, stored_balance, variance, is_matched

### 2. New page: `src/pages/app/accounts/ARReconciliationPage.tsx`
- Summary cards: Total Accounts, Matched, Mismatched, Total Variance Amount
- Status filter: All / Matched / Mismatched
- Category filter: All / Asset / Liability / Equity / Revenue / Expense
- Table columns: Account #, Account Name, Category, Opening Balance, Total Debits, Total Credits, Computed Balance, Stored Balance, Variance, Status (checkmark or warning icon)
- Mismatched rows highlighted in red/amber
- CSV export and print support using existing `exportToCSV` and `PrintableReport`

### 3. Wire up route in `src/App.tsx`
- Add route: `accounts/reports/ar-reconciliation`
- Add import for the new page

### 4. Add to FinancialReportsPage.tsx
- Add a card entry for "AR Reconciliation" with a Scale/Shield icon linking to the new route

### 5. i18n keys (en, ur, ar)
- Add keys for: "AR Reconciliation", "Journal vs Account Balance", "Computed Balance", "Stored Balance", "Variance", "Matched", "Mismatched", "All accounts reconciled"

## Files Changed
- `src/hooks/useFinancialReports.ts` — add `useARReconciliation` hook
- `src/pages/app/accounts/ARReconciliationPage.tsx` — new page
- `src/App.tsx` — add route + import
- `src/pages/app/accounts/FinancialReportsPage.tsx` — add report card
- `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts` — new keys

