

# Fix Procurement Flow: Missing Menu Items & Requisition Submission

## Problems Found

1. **Purchase Requests missing from branch_admin sidebar** — The Inventory section has Purchase Orders, GRN, Requisitions but NO "Purchase Requests" link. The full procurement chain is: **Requisition → Purchase Request → Purchase Order → GRN → Stock**. Without PR in the menu, the flow is broken.

2. **Requisition "Submit for Approval" works but is buried** — The detail page has a "Submit for Approval" button when status is `draft`, and the hooks (`useSubmitRequisition`) exist. The flow works: create requisition (draft) → submit (pending) → approve → issue stock. But users may not know to click into the detail page to submit.

3. **No "Purchase Requests" in branch_admin Inventory section** — line 147-161 shows Inventory children missing Purchase Requests entirely.

4. **Stock Adjustments and Reorder Alerts missing from branch_admin** — These exist as pages but aren't in the sidebar.

5. **Requisition Form creates as "draft" but no department selector** — The form has no `department_id` field, so requisitions lack department context.

## Changes

### 1. Add missing menu items to branch_admin Inventory sidebar
**File: `src/config/role-sidebars.ts`** (lines 147-161)

Add to Inventory children:
- `Purchase Requests` → `/app/inventory/purchase-requests`
- `Reorder Alerts` → `/app/inventory/reorder-alerts`
- `Stock Adjustments` → `/app/inventory/adjustments`

Reorder so the procurement chain is logical: Dashboard → Items → Stock Levels → Categories → Vendors → **Purchase Requests** → Purchase Orders → GRN → Requisitions → **Stock Adjustments** → **Reorder Alerts** → Reports

### 2. Add department selector to RequisitionFormPage
**File: `src/pages/app/inventory/RequisitionFormPage.tsx`**

- Add `useDepartments()` hook import
- Add `department_id` to form schema
- Add department dropdown in the form grid
- Pass `department_id` to `createRequisition.mutateAsync()`

### 3. Add "Submit" action to RequisitionsListPage
**File: `src/pages/app/inventory/RequisitionsListPage.tsx`**

Add an Actions column to the table with:
- "Submit" button for `draft` status rows (calls `useSubmitRequisition`)
- "View" link for all rows

### 4. Add i18n keys
**Files: `en.ts`, `ar.ts`, `ur.ts`**

New keys for: "Purchase Requests", "Reorder Alerts", "Stock Adjustments", "Submit", "Department"

## Files Changed
- `src/config/role-sidebars.ts` — add missing Inventory menu items for branch_admin
- `src/pages/app/inventory/RequisitionFormPage.tsx` — add department selector
- `src/pages/app/inventory/RequisitionsListPage.tsx` — add Actions column with Submit button
- `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts` — new keys

