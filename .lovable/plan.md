

# Fix: P&L Reports Missing COGS Separation

## Problem
Both P&L reports (`ProfitLossPage` and `DetailedPnLPage`) treat COGS accounts (like `EXP-COGS-001`) as regular expenses. The `useDetailedPnL` hook hardcodes `cogsGroups: []` and `totalCOGS: 0`. The `useProfitLoss` hook has no COGS concept at all. This means:
- COGS is buried inside "Expenses" instead of shown separately
- Gross Profit = Revenue (wrong — should be Revenue minus COGS)
- Net Income calculation is still correct (since COGS is included in expenses), but the breakdown is misleading

## Fix

### 1. Identify COGS accounts by account_number pattern
COGS accounts use codes starting with `EXP-COGS`. We'll filter on `account_number LIKE 'EXP-COGS%'` to separate them from operating expenses.

### 2. Update `useDetailedPnL` in `src/hooks/useFinancialReports.ts`
- After building expense groups, split out any accounts where `account_number` starts with `EXP-COGS` into `cogsGroups`
- Calculate `totalCOGS` from those groups
- Set `grossProfit = totalRevenue - totalCOGS`
- Remove COGS accounts from `expenseGroups` so they aren't double-counted
- `netIncome = grossProfit - totalExpenses`

### 3. Update `useProfitLoss` in `src/hooks/useFinancialReports.ts`
- Add a COGS section between Revenue and Expenses
- Filter COGS accounts out of expense accounts
- Add `cogs` section, `grossProfit`, recalculate `netIncome`

### 4. Update `ProfitLossPage.tsx`
- Add a "Cost of Goods Sold" section between Revenue and Expenses
- Show Gross Profit subtotal line after COGS
- Only if COGS items exist (so it doesn't show empty section for non-pharmacy orgs)

### 5. Translation keys
Add `en/ar/ur` keys for: `costOfGoodsSold`, `grossProfit`

## Result
```text
Revenue
  OPD Revenue          100,000
  IPD Revenue          250,000
  Laboratory Revenue    50,000
  Pharmacy Revenue      80,000
  Total Revenue                    480,000

Cost of Goods Sold
  Cost of Goods Sold    45,000
  Total COGS                        45,000

Gross Profit                       435,000

Expenses
  Salaries             200,000
  Utilities             30,000
  Total Expenses                   230,000

Net Income                         205,000
```

## Files Changed
- `src/hooks/useFinancialReports.ts` — separate COGS from expenses in both hooks
- `src/pages/app/accounts/ProfitLossPage.tsx` — add COGS section + Gross Profit line
- `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts` — new labels

