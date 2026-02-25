

# Fix Trial Balance & P&L Reports + Verify Expand/Collapse

## Expand All / Collapse All -- Status: Already Implemented Correctly

The `AccountTree.tsx` component has:
- `expandedIds` state lifted to parent level (line 212)
- `collectParentIds()` recursive helper (line 60)
- "Expand All" and "Collapse All" buttons rendering at lines 246-253
- Default initialization expands levels 1-2 (line 213)

No code changes needed -- this is working.

## Trial Balance & P&L -- Two Bugs Found

### Bug 1: Fallback to `current_balance` when no journal entries exist in period

**File**: `src/hooks/useFinancialReports.ts`, line 103

```typescript
const useDateFilter = startDate && endDate && Object.keys(journalTotals).length > 0;
```

The condition `Object.keys(journalTotals).length > 0` means: if the user selects a date range that has zero journal entries (e.g., a future month), the report falls back to showing `current_balance` (all-time balances) instead of showing zeros. This defeats the purpose of date filtering.

**Fix**: Remove the length check. When dates are provided, always use date-filtered data even if it results in an empty report.

```typescript
const useDateFilter = !!(startDate && endDate);
```

Same fix needed in `useProfitLoss` (line 174 already has the correct logic: `const useDateFilter = !!(startDate && endDate);`). So only the Trial Balance needs this fix.

### Bug 2: Header accounts (L1-L3) appear in Trial Balance and P&L

After the COA hierarchy migration, the `accounts` table now contains ~25 header accounts per organization (Level 1-3). These are grouping accounts with `is_header = true` and `current_balance = 0`. They never have journal entry lines posted to them (enforced by the `check_posting_account` trigger).

Currently both `useTrialBalance` and `useProfitLoss` fetch ALL active accounts regardless of `is_header`. This means:
- Trial Balance shows ~25 extra rows with zero balances (cluttering the report)
- P&L includes header accounts like "Service Revenue" (L2) and "OPD Revenue" (L3) alongside the actual posting accounts

**Fix**: Add `.eq("is_header", false)` to both queries so only Level 4 posting accounts appear in these reports.

## Changes Summary

### `src/hooks/useFinancialReports.ts`

1. **Line 68** (Trial Balance query): Add `.eq("is_header", false)` filter
2. **Line 103**: Change `useDateFilter` to `!!(startDate && endDate)` 
3. **Line 168** (P&L query): Add `.eq("is_header", false)` filter

Three single-line changes total. No migration needed. No UI changes needed.

