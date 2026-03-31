

# Fix: POS Session Close Dialog Uses Wrong Transaction Source

## Problem
In `POSTerminalPage.tsx` (line 732), the close dialog receives `transactions={recentTransactions || []}`. This comes from `usePOSTransactions` which fetches ALL recent transactions for the branch — not just those belonging to the current session. This means:
- Cash reconciliation numbers could be wrong (including sales from previous sessions)
- The payment breakdown in the close dialog is inaccurate

## Fix

### File: `src/pages/app/pharmacy/POSTerminalPage.tsx`
1. Add a query to fetch transactions specifically for the current session using `session_id` filter
2. Pass session-specific transactions to `POSSessionCloseDialog` instead of `recentTransactions`

Option A (preferred): Add a new hook call or inline query that filters `pharmacy_pos_transactions` by `session_id = currentSession.id`

Option B: Use the existing `usePOSSessionDetail` hook which already fetches session-linked transactions, but that would be redundant with other data on the page.

**Concrete change:**
- Import and use a session-filtered transaction query
- Replace line 732: `transactions={recentTransactions || []}` with `transactions={sessionTransactions || []}`
- Add query near line 117:
```typescript
const { data: sessionTransactions } = useQuery({
  queryKey: ["pos-session-transactions", currentSession?.id],
  queryFn: async () => {
    const { data } = await queryPOSTable("pharmacy_pos_transactions")
      .select("*, payments:pharmacy_pos_payments(*)")
      .eq("session_id", currentSession!.id);
    return data as POSTransaction[];
  },
  enabled: !!currentSession?.id,
});
```

### No other issues found
- Session open/close flow is correct
- Journal entry posting logic follows the vendor payment pattern correctly
- Closings report page has proper filters, summary cards, and PDF export
- Routes and navigation are properly registered

## Files Changed
- `src/pages/app/pharmacy/POSTerminalPage.tsx` — fetch session-specific transactions for the close dialog

