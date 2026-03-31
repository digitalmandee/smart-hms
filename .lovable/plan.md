

# Fix: Lab Queue 404 — Wrong Navigation Path

## Problem
In `LabQueuePage.tsx` line 158, clicking a lab order navigates to `/app/lab/results/${r.id}`, but that route does not exist. The correct route (defined in `App.tsx` line 1042) is `/app/lab/orders/:orderId`.

## Fix
**File: `src/pages/app/lab/LabQueuePage.tsx`**
- Change `navigate(\`/app/lab/results/${r.id}\`)` to `navigate(\`/app/lab/orders/${r.id}\`)`

Single line change. No other files reference the wrong path.

## Files Changed
- `src/pages/app/lab/LabQueuePage.tsx` — fix navigation path from `lab/results` to `lab/orders`

