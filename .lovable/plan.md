

# Fix: Admin Missing Inventory/Procurement Menu + Pharmacy Requisition Uses Medicines

## Problems Found

### Problem 1: Inventory module missing from `available_modules`
The `menu_items` table has inventory items with `required_module: 'inventory'`, but **no `inventory` module exists in the `available_modules` table**. This means it can never be enabled in `organization_modules`, so the `canViewItem` filter in `useMenuItems.ts` hides ALL inventory menu items for `branch_admin`.

Similarly, `warehouse`, `dialysis`, `requisitions` modules referenced in menu_items don't exist in `available_modules`.

### Problem 2: Permission code mismatches
Menu items require `inventory.po.view` but `branch_admin` has `inventory.po`. The `hasPermission` function does exact string matching, so these don't match.

### Problem 3: Pharmacy requisition uses inventory items instead of medicines
The `RequisitionFormPage.tsx` uses `useInventoryItems()` for item selection. Pharmacists should select from the `medicines` table instead. This was the previously approved but not yet implemented plan.

## Solution

### 1. Migration: Add missing modules to `available_modules`
Insert `inventory`, `warehouse`, `dialysis`, `requisitions` into `available_modules` with appropriate metadata.

### 2. Migration: Enable inventory module for all existing organizations
Insert `inventory` into `organization_modules` for all existing orgs with `is_enabled: true`.

### 3. Migration: Fix permission code mismatches
Either update the `menu_items` required_permission to match existing permission codes, OR add the missing permission codes. Simpler to update menu_items:
- `inventory.po.view` → `inventory.po`
- Check and fix any other mismatches

### 4. Migration: Add `medicine_id` to `requisition_items`
- Make `item_id` nullable
- Add `medicine_id UUID REFERENCES medicines(id)`

### 5. Update RequisitionFormPage for pharmacy role detection
- Detect if user is pharmacist
- Show medicine search (from `useMedicines`) instead of inventory items dropdown
- Pass `medicine_id` instead of `item_id` when pharmacist

### 6. Update RequisitionDetailPage to show medicine names
- Join `medicines` table when `medicine_id` is set

### 7. i18n updates
New keys: "Select Medicine", "Medicine", "Search medicines..." in en/ar/ur

## Files Changed
- 1 migration: add `inventory`, `warehouse`, `dialysis` to `available_modules`; enable for all orgs; fix permission mismatches in `menu_items`
- 1 migration: add `medicine_id` to `requisition_items`, make `item_id` nullable
- `src/pages/app/inventory/RequisitionFormPage.tsx` — role-based item selector (medicines vs inventory)
- `src/hooks/useRequisitions.ts` — extend `RequisitionItem` to support `medicine_id`
- `src/pages/app/inventory/RequisitionDetailPage.tsx` — show medicine name when applicable
- `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts` — new keys

