

## Current Workflow Location

The **Save → Submit → Publish** workflow is all on the **Lab Result Entry Page**, which you access by clicking **"Enter Results"** on any order card in the Lab Queue.

Here's where each step lives:

1. **Save Results** — Each individual test has a "Save Results" button inside its form on the result entry page
2. **"Complete & Finalize Report"** — A green card appears at the bottom after ALL tests are saved. This is your "submit" step
3. **"Publish & Share Report"** — A blue card with a toggle switch appears after the order is finalized. Turning the switch on makes the report visible to patients

## Issues to Fix

### 1. Button label mismatch
The submit button currently says **"Complete & Finalize Report"** — it should say **"Submit for Approval"** per your request.

### 2. RLS migration may not have applied
The SQL migration to fix update permissions was just created. If it hasn't been applied, saves will silently fail (no data persists). This would explain why results aren't saving and the submit button never appears.

### 3. Missing "processing" status transition
When results start being entered (first save on a "collected" order), the order status should transition to **"processing"**. Currently the order stays in "collected" status — the submit button only checks `allItemsCompleted` and `!isOrderCompleted`, which is correct, but the status badge doesn't reflect work-in-progress.

## Plan

### File: `src/pages/app/lab/LabResultEntryPage.tsx`
- Rename "Complete & Finalize Report" → **"Submit for Approval"**
- Update success toast to say "Order submitted for approval"

### File: `src/hooks/useLabOrders.ts`
- In `useUpdateLabOrderItem`, after saving a result, if the parent order status is "collected", auto-update it to "processing" (so the queue reflects work has started)

### File: `src/components/lab/LabOrderCard.tsx`  
- Add "processing" to the statuses that allow navigation (the "Enter Results" button should work for processing orders too)

### Verify RLS migration
- Confirm the migration file is correct and will be applied on next deploy

