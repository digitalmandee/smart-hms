

## Problem Analysis

**Error**: `Cannot coerce the result to a single JSON object` — this occurs in `useUpdateLabOrderItem` (line 376 of `useLabOrders.ts`) because `.single()` is used after an `.update().eq("id", id)` call. If the item ID matches zero or multiple rows (e.g., due to RLS filtering or duplicate items), `.single()` fails.

**User's request**: When saving results for multiple tests, each save should work. Once all tests are saved, the report should auto-complete and become available in patient profile.

## Plan

### 1. Fix `.single()` error in `useUpdateLabOrderItem`
**File**: `src/hooks/useLabOrders.ts` (line ~376)
- Remove `.single()` from the update query — `.select()` alone is sufficient since we're updating by primary key `id`
- Use `.select().maybeSingle()` instead, or just drop `.single()` and take `data[0]`

### 2. Auto-complete order when all tests are saved
**File**: `src/pages/app/lab/LabResultEntryPage.tsx`
- After each successful test result save in `handleSaveTestResult`, check if all items are now completed
- If yes, automatically trigger `completeOrder.mutateAsync()` to finalize the order
- Show a toast indicating auto-completion

### 3. Ensure report availability after completion
The existing `useCompleteLabOrder` already sets `status: "completed"` and `completed_at`, and `PatientLabHistory` already queries by `patient_id` — so once the order is completed, it will appear in the patient profile. No additional changes needed here.

### Technical Details

**Fix 1 — `useLabOrders.ts`**:
```typescript
// Change from:
.select().single()
// To:
.select()
// Then use data[0]
```

**Fix 2 — `LabResultEntryPage.tsx`**:
After `updateItem.mutateAsync()` succeeds in `handleSaveTestResult`, count how many items are already completed (from current state + the one just saved). If all are done, call `handleCompleteOrder()` automatically.

