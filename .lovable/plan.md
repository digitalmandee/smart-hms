

# Accounts Module Comprehensive Audit

## Issues Found

### 1. BROKEN LINKS (Navigation goes to non-existent routes)

| Link Source | Broken Path | Status |
|---|---|---|
| AccountsDashboard.tsx (Quick Actions) | `/app/accounts/payables/payments/new` | No route exists (correct route is `/app/accounts/vendor-payments/new`) |
| AccountsDashboard.tsx (Module Links) | `/app/accounts/general-ledger` | No route (actual route is `/app/accounts/ledger`) |
| AccountSettingsPage.tsx | `/app/accounts/settings/types` | No route (actual route is `/app/accounts/types`) |
| AccountSettingsPage.tsx | `/app/accounts/settings/numbering` | No route exists at all (dead link) |
| FinancialReportsPage.tsx (Quick Actions) | `/app/accounts/journal-entries` → works, `/app/accounts/ledger` → works, `/app/accounts/chart` → **BROKEN** (actual route is `/app/accounts/chart-of-accounts`) |

**Fix**: Update 5 broken navigation paths to match the actual route definitions in App.tsx.

---

### 2. BALANCE SHEET includes header accounts (L1-L3)

The `useBalanceSheet` hook (line 269-281) does **NOT** filter `is_header = false`. It fetches all accounts and renders L1-L3 grouping headers alongside L4 posting accounts, showing duplicate/inflated totals.

**Fix**: Add `.eq("is_header", false)` to the Balance Sheet query, same as was done for Trial Balance and P&L.

---

### 3. DASHBOARD summary double-counts header accounts

`AccountsDashboard.tsx` (line 52-66) uses `useAccounts({ isActive: true })` which returns ALL accounts including headers. The `summary.totalAssets`, `totalRevenue`, etc. are summed from `current_balance` of every account -- but L1-L3 headers have `current_balance = 0`, so this is mostly benign. However, the "Chart of Accounts" card shows `count: accounts?.length || 0` which inflates the total count with ~25 header accounts.

**Fix**: Filter the count display to exclude headers: `accounts?.filter(a => !a.is_header).length`.

---

### 4. CASH FLOW investing/financing sections are hardcoded stubs

The `useCashFlow` hook (lines 439-446) returns hardcoded zeros for investing and financing activities:
```
investing: [{ description: "Equipment Purchases", amount: 0, category: "investing" }]
financing: [{ description: "Loan Receipts", amount: 0 }, { description: "Loan Repayments", amount: 0 }]
```
These are never populated from real data. The operating section works correctly.

**Fix (enhancement)**: Populate investing items from asset account journal entries (fixed asset purchases). Populate financing from liability/equity account journal entries. Filter out zero-amount items.

---

### 5. FISCAL YEAR CLOSE is a dead menu action

In `BudgetsPage.tsx`, the "Close Year" dropdown menu item (line 257) has no `onClick` handler -- it does nothing when clicked. "Set as Current" (line 255) also has no handler.

**Fix**: Implement `onClick` handlers for both actions. "Set as Current" should update `is_current` on the selected fiscal year. "Close Year" should set `is_closed = true` and optionally run closing entries.

---

### 6. REVENUE BY SOURCE not linked from Financial Reports page

The route `/app/accounts/reports/revenue-by-source` exists and `RevenueBySourcePage` works, but it's not listed in the `FinancialReportsPage.tsx` report cards. Users can only find it if they know the URL.

**Fix**: Add a 5th report card for "Revenue by Source" to the reports listing page.

---

### 7. JOURNAL ENTRY creation route missing

The dashboard links to `/app/accounts/journal-entries/new` but there is no route for it in App.tsx. The JournalEntriesPage has a "New Entry" button pointing there too.

**Status**: Need to verify if a `JournalEntryFormPage` component exists or if the creation dialog is inline.

---

### 8. BALANCE SHEET does not use date filtering

The `useBalanceSheet` hook accepts `asOfDate` but never uses it -- it just reads `current_balance` regardless of what date the user picks. The date picker in the UI is purely decorative.

**Fix**: Calculate balances from journal entries up to `asOfDate`, similar to how Trial Balance was fixed. This requires summing all posted journal entry lines with `entry_date <= asOfDate`.

---

## Summary of Fixes (Priority Order)

| # | Issue | Severity | Effort |
|---|---|---|---|
| 1 | Fix 5 broken navigation links | High | Small (5 string changes) |
| 2 | Balance Sheet: add `is_header=false` filter | High | Small (1 line) |
| 3 | Balance Sheet: implement actual date filtering | High | Medium (same pattern as TB) |
| 4 | Fiscal Year Close/Set Current: wire up handlers | Medium | Medium |
| 5 | Dashboard: fix inflated account count | Low | Small (1 line) |
| 6 | Add Revenue by Source to reports listing | Low | Small |
| 7 | Cash Flow: populate investing/financing from real data | Low | Medium |
| 8 | Verify journal entry creation route | Medium | Small |

### Files to Change

- `src/pages/app/accounts/AccountsDashboard.tsx` -- fix 2 broken links + account count
- `src/pages/app/accounts/AccountSettingsPage.tsx` -- fix 2 broken links  
- `src/pages/app/accounts/FinancialReportsPage.tsx` -- fix 1 broken link + add Revenue by Source card
- `src/hooks/useFinancialReports.ts` -- Balance Sheet: add `is_header=false` + date filtering
- `src/pages/app/accounts/BudgetsPage.tsx` -- wire up Close Year + Set as Current handlers
- Translation files (`en.ts`, `ur.ts`, `ar.ts`) -- add any new keys

