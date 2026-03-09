

## Problem

1. **LabOrderCard button labels are wrong** — the button always shows "Enter Results" for paid orders regardless of status (processing, completed, published). After publishing, it should say "View Report", not "Enter Results".
2. **No preview/print before completion** — the Print Report button is disabled until the order is completed. Users want to preview the report template while entering results.
3. **No distinction for published orders** — the card doesn't reflect whether a report has been published.

## Plan

### 1. Fix button labels in `src/components/lab/LabOrderCard.tsx`

Update the button label logic from the current simple ternary to proper status-based labels:

- `completed` + published → **"View Report"**
- `completed` → **"View Results"**  
- `processing` → **"Enter Results"** (still entering/editing)
- `collected` → **"Enter Results"**
- `ordered` (paid) → **"Enter Results"**
- `ordered` (unpaid) → **"View Order"**

Add a "Published" badge to the card when `is_published` is true.

### 2. Enable report preview in `src/pages/app/lab/LabResultEntryPage.tsx`

- Change the Print Report button to always be enabled (remove `disabled={!isOrderCompleted}`)
- Rename it to **"Preview Report"** when the order is not yet completed, and **"Print Report"** when completed
- This lets users preview the report template at any stage

### 3. Query `is_published` in `src/hooks/useLabOrders.ts`

Ensure the `useLabOrders` hook fetches the `is_published` field so the card can display the correct label. If it's already in the select query, no change needed.

