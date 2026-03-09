

## Problem
The current flow has issues:
1. The `.single()` error on `useCompleteLabOrder` (line 454 in `useLabOrders.ts`) can crash
2. Auto-completing the order immediately after all tests are saved skips any review step
3. User wants a proper workflow: **Save results → Submit for Approval → Review/Edit → Publish**

## New Workflow

```text
ordered → collected → processing (results being entered)
  → pending_approval (all saved, submitted)
  → completed (approved)
  → published (visible to patient/public)
```

## Changes

### 1. Fix `.single()` error in `useCompleteLabOrder` (`src/hooks/useLabOrders.ts`)
Replace `.select().single()` with `.select()` and use `data?.[0]` — same fix pattern already applied to `useUpdateLabOrderItem`.

### 2. Rename button labels in `TestResultForm` (`src/components/lab/TestResultForm.tsx`)
- Change "Save & Complete Test" → **"Save Results"**
- Change "Update Results" stays the same for post-approval edits
- The save action sets item status to `"completed"` (results saved) but does NOT auto-finalize the order

### 3. Remove auto-complete logic from `handleSaveTestResult` (`src/pages/app/lab/LabResultEntryPage.tsx`)
Remove the block (lines 140-156) that auto-calls `completeOrder.mutateAsync` after all items are saved. Instead, once all items are saved, show a **"Submit for Approval"** button.

### 4. Add "Submit for Approval" step (`src/pages/app/lab/LabResultEntryPage.tsx`)
- When all tests have results saved (`allItemsCompleted`), show a card with "Submit for Approval" button
- This sets the order status to `"completed"` (finalized) via `completeOrder.mutateAsync`
- After submission, results are locked from editing unless user clicks "Edit" explicitly

### 5. Publish step remains as-is
- The existing publish toggle (Switch) already handles `is_published` — this makes the report visible publicly and in PatientLabHistory
- PatientLabHistory already shows published badge; it shows all completed orders but the "Published" badge indicates public availability

### 6. Update `LabOrderCard` to handle the "View Results" action for completed orders
Currently the "View Results" button is disabled for completed orders (line 119: `disabled={... || order.status === "completed"}`). Change to allow navigation for completed orders so approvers can review and publish.

### Files Modified
- `src/hooks/useLabOrders.ts` — fix `.single()` in `useCompleteLabOrder`
- `src/components/lab/TestResultForm.tsx` — rename button from "Save & Complete Test" to "Save Results"
- `src/pages/app/lab/LabResultEntryPage.tsx` — remove auto-complete, add "Submit for Approval" step, keep publish flow
- `src/components/lab/LabOrderCard.tsx` — enable "View Results" button for completed orders

