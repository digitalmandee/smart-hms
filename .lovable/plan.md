

# Fix: Branch Dropdown Always Visible & Auto-Selected

## Problem
When `isSingleBranch` is true or `branches` array is empty/loading, the branch selector is hidden (line 264: `{!isSingleBranch && ...}`). If `profile?.branch_id` is also null, the form silently fails validation with "Branch is required" and nothing happens.

## Fix

**File: `src/pages/app/inventory/POFormPage.tsx`**

1. **Always show the branch dropdown** — remove the `{!isSingleBranch && ...}` wrapper so the user can always see and select their branch.
2. **Auto-select the user's branch** — keep the existing `useEffect` that sets `autoSelectedBranchId` from `profile?.branch_id` or first branch, but also handle the case where branches load after the effect runs by adding `branches` to the dependency array.
3. **Show selected branch name** — when auto-selected, the dropdown will display the branch name instead of being invisible, giving clear feedback.

## Changes
- Line 264: Remove `{!isSingleBranch && (` wrapper
- Line 293: Remove matching `)}` closing
- Line 80-85: Update useEffect to also trigger when `branches` data loads:
  ```ts
  useEffect(() => {
    const branchId = profile?.branch_id || branches?.[0]?.id || "";
    if (branchId && !form.getValues("branch_id")) {
      form.setValue("branch_id", branchId);
      setSelectedBranch(branchId);
    }
  }, [profile?.branch_id, branches, form]);
  ```

**Result**: Branch dropdown is always visible, auto-selects the user's assigned branch, and user can change it if needed. No more silent failures.

