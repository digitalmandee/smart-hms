

# Reports Breakdown & Shortcomings Analysis

## What's Working Well

| Report | GL-Sourced | Drill-Down | Export | Filters |
|--------|-----------|------------|--------|---------|
| Revenue Drill-Down | Yes (GL) | GL → Invoice → Items (clickable to invoice detail) | CSV/PDF | Account, Date, Doctor, Department |
| Department P&L | Yes (GL) | Department → Transaction list with search | CSV/PDF | Period preset, Branch, Custom dates |
| Department Revenue | Yes (GL) | Department → Invoice list | CSV/PDF | Date, Branch, Department |
| Trial Balance | Yes (GL) | Account-level balances | CSV | Date range |
| P&L Statement | Yes (GL) | Account-level with period comparison | CSV | Date range, Compare toggle |
| General Ledger | Yes (GL) | Source document badges (clickable) | Yes | Account, Date |
| AR Reconciliation | Yes (GL) | Revenue recon tab added | Yes | - |
| Receivables/Aging | Yes | Invoice-level with Pay/Write-off actions | Yes | Aging buckets |

## Identified Shortcomings (8 Issues)

### Issue 1 — CRITICAL: `BillingReportsPage` Revenue by Category Sources from `invoice_items`, NOT GL
`useRevenueByCategory()` (line 1139 of `useBilling.ts`) queries `invoice_items` directly. This can diverge from GL if triggers failed or invoices were cancelled. Same problem with `useTopServices`.

### Issue 2 — CRITICAL: `RevenueBySourcePage` Sources from `invoice_items`, NOT GL
Queries `invoice_items` with service_type join — completely bypasses the General Ledger. Totals here won't match P&L or Trial Balance.

### Issue 3 — HIGH: No Clickable Drill-Down on BillingReportsPage Charts
The pie charts for "Revenue by Category" and "Payment Methods" are static visualizations. Clicking a pie slice (e.g., "Lab") doesn't navigate to a filtered invoice list. Only the aging section at the bottom has clickable invoices.

### Issue 4 — HIGH: Department Revenue Detail Table Limits to 100 Invoices
`useDepartmentRevenueDetails` line 196: `.in("id", invoiceIds.slice(0, 100))` — silently truncates results for high-volume departments.

### Issue 5 — HIGH: Balance Sheet Has No Drill-Down
`BalanceSheetPage` renders flat account balances with no ability to click an account and see its transactions/journal entries.

### Issue 6 — HIGH: P&L Statement Has No Account-Level Drill-Down
Shows grouped totals per account but clicking an account doesn't navigate to the General Ledger filtered for that account.

### Issue 7 — MEDIUM: No Doctor-Wise Revenue Report (Standalone)
Revenue Drill-Down supports doctor filtering, but there's no dedicated "Doctor Revenue Summary" showing all doctors ranked by revenue with drill-down to their invoices.

### Issue 8 — MEDIUM: BillingReportsPage Not Translated
Hardcoded English strings: "Total Revenue", "Outstanding", "Collection Rate", "Daily Collections", etc. Not using `useTranslation()`.

---

## Fix Plan

### Fix 1: Migrate `useRevenueByCategory` to GL source
- Edit `useBilling.ts` — rewrite `useRevenueByCategory()` to query `journal_entry_lines` with revenue account category, grouped by account name/number (same pattern as `useDepartmentRevenue`)

### Fix 2: Migrate `RevenueBySourcePage` to GL source
- Edit `RevenueBySourcePage.tsx` — replace `invoice_items` query with GL-sourced data from `useDepartmentRevenue` hook (reuse existing)

### Fix 3: Add clickable drill-down on BillingReportsPage
- Make pie chart slices clickable → navigate to Department Revenue Report filtered by that category
- Add click handlers on "Revenue by Category" and "Payment Methods" charts

### Fix 4: Remove 100-invoice limit in `useDepartmentRevenueDetails`
- Edit `useDepartmentRevenue.ts` — batch invoice lookups (500 per batch) instead of slicing to 100

### Fix 5: Add Balance Sheet drill-down
- Make each account row clickable → navigate to `/app/accounts/general-ledger?accountId={id}`

### Fix 6: Add P&L drill-down
- Make each account line clickable → navigate to General Ledger filtered by that account and date range

### Fix 7: (Skip — Revenue Drill-Down already covers doctor filtering adequately)

### Fix 8: Translate BillingReportsPage
- Add translation keys to `en.ts`, `ar.ts`, `ur.ts`
- Replace all hardcoded strings in `BillingReportsPage.tsx`

---

## File Summary

| File | Change |
|------|--------|
| `src/hooks/useBilling.ts` | Rewrite `useRevenueByCategory` to GL source |
| `src/pages/app/accounts/RevenueBySourcePage.tsx` | Reuse `useDepartmentRevenue` instead of raw `invoice_items` |
| `src/pages/app/billing/BillingReportsPage.tsx` | Add chart click handlers + translate all strings |
| `src/hooks/useDepartmentRevenue.ts` | Remove 100-row invoice limit, batch to 500 |
| `src/pages/app/accounts/BalanceSheetPage.tsx` | Make account rows clickable → GL |
| `src/pages/app/accounts/ProfitLossPage.tsx` | Make account lines clickable → GL |
| `src/lib/i18n/translations/{en,ar,ur}.ts` | Add billing report translation keys |

**Total: 0 migrations, 0 new files, ~8 file edits**

