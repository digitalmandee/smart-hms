

# Fix: Branch Missing Error on PO Creation

## Problem
`POFormPage` calls `useBranches()` without passing `profile?.organization_id`, which may return empty results due to RLS. When branches list is empty, the branch selector shows no options, and submission fails with "Branch is required".

Additionally, when `isSingleBranch` evaluates incorrectly (because branches array is empty/undefined), the auto-select logic on line 80-85 sets an empty string, and the hidden selector means the user can't fix it.

## Fix

**File: `src/pages/app/inventory/POFormPage.tsx`**

1. Pass `profile?.organization_id` to `useBranches()`:
```ts
const { data: branches } = useBranches(profile?.organization_id);
```

2. Improve auto-select logic — if `profile?.branch_id` exists, always use it as default regardless of branch count:
```ts
const autoSelectedBranchId = profile?.branch_id || (branches?.length === 1 ? branches[0]?.id : "") || "";
```

3. If branch is auto-selected but selector is hidden (`isSingleBranch`), ensure the form value is set before submit by also setting it in the `onSubmit` handler as a fallback:
```ts
const finalBranchId = data.branch_id || autoSelectedBranchId;
if (!finalBranchId) {
  setFormError("Branch is required");
  toast.error("Branch is required");
  return;
}
```
Then pass `finalBranchId` instead of `data.branch_id` to `createPO.mutateAsync`.

## Files Changed
- `src/pages/app/inventory/POFormPage.tsx` — pass org ID to useBranches, add branch fallback in submit

