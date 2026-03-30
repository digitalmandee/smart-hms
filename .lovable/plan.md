

# Enhance Trial Balance Report

## Current State
The trial balance page already has: date range filter, balanced/unbalanced indicator, flat account list with debit/credit columns, totals row, print and CSV export. It works correctly with journal entry data.

## Enhancements to Add

### 1. Group accounts by category (Asset, Liability, Equity, Revenue, Expense)
Currently all accounts are in one flat list. Group them with subtotals per category so accountants can quickly spot which category is off-balance.

### 2. Add date presets (This Month, Last Quarter, YTD, Last Year)
Currently requires manual date entry. Add quick preset buttons like the Detailed P&L report has.

### 3. Add opening balance, period movement, and closing balance columns
Currently only shows net debit/credit. A proper trial balance should show:
- Opening Balance (DR/CR) — balance before start date
- Period Movement (DR/CR) — activity within the date range  
- Closing Balance (DR/CR) — net result

### 4. Add search/filter for accounts
Allow filtering by account name/number within the table.

### 5. Add summary cards (total accounts, total with activity, zero-balance count)

### 6. i18n — all new labels in English, Urdu, Arabic

## Technical Approach

### File: `src/hooks/useFinancialReports.ts` (useTrialBalance)
- Extend the query to also fetch journal lines BEFORE startDate for opening balances
- Return enriched rows with `openingDebit`, `openingCredit`, `movementDebit`, `movementCredit`, `closingDebit`, `closingCredit`
- Group rows by `category` field (already available in the data)

### File: `src/pages/app/accounts/TrialBalancePage.tsx`
- Add date preset buttons (This Month, Last Quarter, YTD, Last Year)
- Add search input to filter accounts by name/number
- Add toggle: "Show zero balances" checkbox
- Render grouped sections with category headers and subtotals
- Add summary cards at top (total accounts, accounts with activity)
- Expand table columns for opening/movement/closing
- Add collapsible category sections

### File: `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts`
- Add keys for: Opening Balance, Period Movement, Closing Balance, date preset labels, Show Zero Balances, category names, summary card labels

## Files Changed
- `src/hooks/useFinancialReports.ts` — enhanced useTrialBalance with opening/closing balances
- `src/pages/app/accounts/TrialBalancePage.tsx` — full UI enhancement
- 3 i18n files — new translation keys

