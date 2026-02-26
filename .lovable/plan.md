

# Fix Daily Closing & Financial Summary -- Complete End-of-Day Flow

## Problem Analysis

After investigating the codebase and database, I found several issues:

1. **Bug in `useDailyClosingSummary`**: The payment classification is broken. The query fetches `payment_method_id` but then tries to read `p.payment_method?.name` (which doesn't exist in the response). A `methodMap` is fetched but never used. Result: all collections show as 0 for Cash/Card/UPI and everything goes to "Other".

2. **Department totals hardcoded to 0**: Lines 191-196 in `useDailyClosing.ts` set all department totals to 0 with a comment "we'll aggregate all as other for now."

3. **No Daily Closing History page**: Once a closing is submitted, there's no way to browse past closings.

4. **Orphaned billing session**: There's an open session from Feb 17 that was never closed. Payments made today (Feb 26) aren't linked to any session, so session-based totals show 0.

5. **Day End Summary Report exists but is hidden**: A comprehensive report already exists at `/app/reports/day-end-summary` with invoices, collections by method/department, payouts (doctor settlements, vendor payments, expenses), and reconciliation. But there's no easy link from the Billing module to reach it.

6. **Daily Closing doesn't show key financial items**: The closing summary step doesn't show doctor settlements, vendor payments, or net cash calculation.

## Plan

### 1. Fix `useDailyClosingSummary` Hook (Critical Bug Fix)
**File: `src/hooks/useDailyClosing.ts`**

Fix `fetchPaymentsForDate` to join payment_methods:
```sql
SELECT amount, payment_method_id, payment_method:payment_methods(name, code)
```

Fix the `forEach` loop to use the joined data or the `methodMap`:
```typescript
payments?.forEach((p: any) => {
  const amount = Number(p.amount);
  const methodName = methodMap.get(p.payment_method_id) || '';
  if (methodName.includes('cash')) cashTotal += amount;
  else if (...) cardTotal += amount;
  ...
});
```

Remove department hardcoding -- use the same approach as `useDayEndSummary` to derive departments from invoice items via `service_types.category`.

### 2. Enhance Daily Closing Page with Payouts Summary
**File: `src/pages/app/billing/DailyClosingPage.tsx`**

In the **Summary step** (step 4), add:
- **Payouts section** showing doctor settlements, vendor payments, and expenses for the day (data from `useDayEndSummary`)
- **Net Cash Calculation** table:
  - Total Cash Collected
  - Minus: Doctor Settlements (cash)
  - Minus: Vendor Payments (cash)
  - Minus: Expenses/Petty Cash
  - = Net Cash to Submit
- Link to "View Full Day-End Report" → `/app/reports/day-end-summary`

### 3. Create Daily Closing History Page
**File: `src/pages/app/billing/DailyClosingHistoryPage.tsx`** (New)

A table showing past daily closings with:
- Date, closing number, grand total, net cash, status (draft/submitted/approved/rejected)
- Approved by, closed by
- Click to view detail
- Filter by date range

### 4. Add Navigation Links
**Files: `src/App.tsx`, Billing Dashboard, Sidebar**

- Add route: `billing/daily-closing/history` → `DailyClosingHistoryPage`
- Add "Closing History" button on Daily Closing page header
- Add "Day End Summary" quick action to Billing Dashboard
- Insert "Closing History" menu item in sidebar under Billing (sort_order 21)

### 5. Translations (~15 new keys)
**Files: `en.ts`, `ar.ts`, `ur.ts`**

Keys for:
- Closing history labels, net cash, payouts section, doctor settlements, vendor payments, status filters
- "View Full Report", "Closing History"

## Files to Create/Edit

| File | Action |
|------|--------|
| `src/hooks/useDailyClosing.ts` | Fix payment method classification bug, add department breakdown |
| `src/pages/app/billing/DailyClosingPage.tsx` | Add payouts summary + net cash in step 4, link to full report |
| `src/pages/app/billing/DailyClosingHistoryPage.tsx` | **New** -- closing history table |
| `src/pages/app/billing/BillingDashboard.tsx` | Add "Day End Summary" quick action |
| `src/App.tsx` | Add closing history route |
| `src/lib/i18n/translations/en.ts` | ~15 new keys |
| `src/lib/i18n/translations/ar.ts` | ~15 new keys |
| `src/lib/i18n/translations/ur.ts` | ~15 new keys |
| Menu items insert | Add "Closing History" sidebar entry |

## Technical Details

The critical bug is in `useDailyClosing.ts` lines 113-121 and 176-187. The `fetchPaymentsForDate` function queries only `amount, payment_method_id, created_at` without joining `payment_methods`. The loop then tries `p.payment_method?.name` which is always undefined, causing all payments to be classified as "other" (the else branch). The fix is to use the already-fetched `methodMap` (line 165) to look up payment method names by ID.

