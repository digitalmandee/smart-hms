

# Fix: Pharmacy POS Data + GRN Visibility in Department P&L

## Issues Found

### Issue 1: Pharmacy POS query fails (400 error)
The `useDepartmentPnL.ts` hook queries `pharmacy_pos_transactions` using `transaction_date` (line 243), but this column does not exist. The actual column is `created_at`. This causes the entire pharmacy medicine profit section to silently fail and return empty.

### Issue 2: GRN/PO transactions not visible
This is **by design** in the current P&L — GRN posting creates journal entries that hit `INV-001` (Asset) and `AP-001` (Liability). The P&L filter at line 148 only keeps `revenue` and `expense` category accounts, so asset/liability entries are excluded. This is correct accounting — inventory purchases are balance sheet items, not P&L items. However, the COGS entries from pharmacy sales (EXP-COGS-001) should appear when medicines are sold.

The user likely expects to see procurement cost reflected. The proper flow is: GRN hits balance sheet (INV-001/AP-001), then when medicines are sold via POS, the COGS trigger posts to EXP-COGS-001 which IS a P&L expense. If COGS entries exist, they will show once Issue 1 is fixed.

### Issue 3: Stale query with `journal_number`
Network shows a 400 error for a `journal_number` reference. The hook code is already fixed to use `entry_number`, so this is likely a cached/stale query from an older build. No code change needed — it resolves on reload.

## Fix

### File: `src/hooks/useDepartmentPnL.ts`

**Single change** — line 243: replace `transaction_date` with `created_at` in the pharmacy POS items query select and all filter references.

```
// Current (line 243):
pos_transaction:pharmacy_pos_transactions!inner(transaction_date, organization_id, branch_id)

// Fixed:
pos_transaction:pharmacy_pos_transactions!inner(created_at, organization_id, branch_id)
```

Also update the date filter references on lines 247-248:
```
// Current:
posQuery.gte("pos_transaction.transaction_date", startDate)
posQuery.lte("pos_transaction.transaction_date", endDate)

// Fixed:
posQuery.gte("pos_transaction.created_at", startDate)
posQuery.lte("pos_transaction.created_at", endDate)
```

And the branch filter on line 249 stays the same.

This single fix will:
- Restore pharmacy medicine-level profit data (medicine name, qty sold, cost, revenue, margin)
- Show pharmacy COGS in the department breakdown (already working from journal entries)
- The GRN procurement entries correctly stay off the P&L (they are balance sheet entries) but their downstream effect (COGS when sold) will now be visible

## Files to Change
- `src/hooks/useDepartmentPnL.ts` — replace `transaction_date` with `created_at` (3 occurrences)

