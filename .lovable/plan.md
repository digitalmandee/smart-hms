

# Fix Procurement Flow: Remove PO from Pharmacy, Complete Requisition-Based Workflow

## Problem

1. **Pharmacy has direct PO creation** — pharmacists should NOT create POs. The correct flow is:
   - Pharmacy submits a **Requisition** (requesting stock)
   - Branch admin/accounts **approves** the requisition
   - Accounts/procurement creates a **PO from the approved requisition**
   - Vendor delivers → **GRN** is created
   - Stock is updated in inventory
   - Pharmacy receives notification and **accepts/declines** the received stock

2. **PO creation may be broken** — form ref warnings in console, but the deeper issue is that PO shouldn't be on the pharmacy side at all.

3. **Missing links in the chain** — no "Convert Requisition to PO" button on the requisition detail page for accounts/admin, and no acceptance step for pharmacy after GRN.

## Changes

### 1. Remove PO/GRN from pharmacist sidebar, keep only Requisitions
**File: `src/config/role-sidebars.ts`**

Replace the pharmacist "Procurement" section:
- Remove "Purchase Orders" and "GRN" links
- Replace with "Requisitions" → `/app/inventory/requisitions` and "New Requisition" → `/app/inventory/requisitions/new`
- This forces pharmacists to use the proper requisition flow

### 2. Add "Convert to PO" action on Requisition Detail page (for admin/accounts)
**File: `src/pages/app/inventory/RequisitionDetailPage.tsx`**

- When requisition status is `approved`, show a "Create PO from Requisition" button (visible to branch_admin, org_admin, accountant roles only)
- On click, navigate to `/app/inventory/purchase-orders/new?from_requisition={id}` pre-filling items from the approved requisition

### 3. Update POFormPage to accept `from_requisition` param
**File: `src/pages/app/inventory/POFormPage.tsx`**

- Already supports `from_pr` (purchase request). Add `from_requisition` param that reads from `stock_requisitions` + `requisition_items` and pre-fills the PO form with those items.

### 4. Add pharmacy stock acceptance flow after GRN
**File: New `src/components/inventory/RequisitionAcceptanceDialog.tsx`**

- After GRN is completed for items linked to a requisition, pharmacy users see a notification on their requisition detail
- Simple "Accept" / "Decline" buttons that update requisition status to `received` or `disputed`
- This closes the loop for the pharmacist

### 5. Add requisition status for received/disputed
**Migration**: Add `received` and `disputed` to the `requisition_status` enum if not already present.

### 6. i18n updates
**Files: `en.ts`, `ar.ts`, `ur.ts`**

New keys: "Create PO from Requisition", "Accept Stock", "Decline Stock", "Stock Received", "Disputed", "New Requisition"

## Technical Details

- The `useRequisitions` hook already has all CRUD operations including approve, reject, issue stock
- The `useCreatePurchaseOrder` hook works and can be pre-filled from requisition items
- `requisition_items` have `item_id` referencing `inventory_items`, which maps to PO item's `item_id`
- The `RequisitionsListPage` already has a Submit button for draft requisitions

## Files Changed
- `src/config/role-sidebars.ts` — replace pharmacist Procurement section with Requisitions only
- `src/pages/app/inventory/RequisitionDetailPage.tsx` — add "Create PO" button for admin roles on approved requisitions, add accept/decline for pharmacy roles
- `src/pages/app/inventory/POFormPage.tsx` — support `from_requisition` search param
- Migration — add `received`, `disputed` to `requisition_status` enum
- `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts` — new keys

