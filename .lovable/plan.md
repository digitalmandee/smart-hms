

# Add Daily Pharmacy Profit & Loss Report

## What
Add a new "Daily P&L" report to the Pharmacy Reports page that shows day-by-day revenue, cost of goods sold (COGS), gross profit, and margin percentage. This gives a clear daily view of pharmacy profitability beyond the existing per-medicine profit margin report.

## Data Source
- `pharmacy_pos_items` joined with `medicine_inventory` (via `inventory_id`) to get `unit_price` (cost price)
- `pharmacy_pos_transactions` filtered by `status = 'completed'` and date range
- Aggregated by date: sum of `line_total` = revenue, sum of `inventory.unit_price × quantity` = COGS
- Profit = Revenue − COGS, Margin = (Profit / Revenue) × 100

## Implementation

### 1. New Hook: `useDailyProfitLoss` in `src/hooks/usePharmacyReports.ts`
- Query `pharmacy_pos_items` with inventory join and transaction date filter
- Group by `created_at` date → produce array of `{ date, revenue, cogs, profit, marginPercent, transactionCount }`
- Fallback: if inventory cost not available, use 65% of selling price (same pattern as existing `useProfitMarginReport`)

### 2. Add Report Definition in `PharmacyReportsPage.tsx`
- Add `{ id: "daily-pnl", name: "Daily Profit & Loss", description: "Day-by-day revenue, cost & profit", icon: TrendingUp }` to the Financial Reports category
- Add render case with:
  - Summary cards: Total Revenue, Total COGS, Gross Profit, Avg Margin %
  - Bar chart: Revenue vs COGS per day with profit line overlay
  - Export button (PDF/CSV)
  - Table: Date, Transactions, Revenue, COGS, Profit, Margin %

### 3. Translations
- Add keys for `daily_pnl`, `cogs`, `gross_profit`, `margin` in en.ts, ar.ts, ur.ts

## Files Changed
- `src/hooks/usePharmacyReports.ts` — add `useDailyProfitLoss` hook
- `src/pages/app/pharmacy/PharmacyReportsPage.tsx` — add report definition + render case
- `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts` — new translation keys

