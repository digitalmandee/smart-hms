

# Warehouse Module -- Remaining Gaps and Enhancements

## Current State Summary

The warehouse module is **functionally complete** in terms of pages, hooks, routes, sidebar, demo accounts, and database tables. However, several integration and isolation gaps remain.

---

## Gap 1: `facility_type = 'warehouse'` Not Selectable in Admin Forms

The `CreateOrganizationPage.tsx` and `OrganizationDetailPage.tsx` both use a Zod enum that only allows `["hospital", "clinic", "diagnostic_center", "pharmacy"]`. The DB constraint was updated to allow `'warehouse'`, but the frontend forms don't include it.

**Fix:** Add `"warehouse"` to the Zod enum and the dropdown options in both files.

---

## Gap 2: No Facility-Type Isolation Logic (Batch E -- Critical)

Currently, there is **zero runtime logic** that hides clinical modules when `facility_type = 'warehouse'`. A warehouse org user with `org_admin` role would still see OPD, IPD, OT, Lab, Radiology, etc. Similarly, `pharmacy` facility type doesn't fully isolate either (it relies on role-based sidebars rather than facility filtering).

**Fix:** Add a facility-type-aware sidebar filter:
- In the sidebar rendering logic (or in `role-sidebars.ts` consumer), check the user's `organization.facility_type`
- When `warehouse`: hide all clinical paths (`/app/opd`, `/app/ipd`, `/app/ot`, `/app/lab`, `/app/radiology`, `/app/pharmacy`, `/app/emergency`, `/app/blood-bank`, `/app/certificates`, `/app/appointments`)
- When `pharmacy`: same but keep pharmacy paths
- This ensures `org_admin` in a warehouse org only sees Inventory, HR, Finance, Settings

---

## Gap 3: Warehouse Sidebar Missing HR and Finance Sections

The `warehouse_admin` sidebar currently has only inventory/warehouse modules. An independent warehouse organization also needs:
- **HR section** (Employees, Attendance, Leaves, Payroll) -- for warehouse staff management
- **Finance section** (Accounts, Expenses, Vendor Payments, Reports)
- **My Work section** (My Schedule, My Attendance, My Leaves, My Payslips) -- like `store_manager` already has
- **Settings** (Organization Settings, Users, Roles)

The `warehouse_user` sidebar should get the "My Work" section only.

**Fix:** Extend both `warehouse_admin` and `warehouse_user` sidebar configs.

---

## Gap 4: Hospital Warehouse Linked with Hospital Inventory

For **hospital** facility_type, the warehouse modules (Zones, Bins, Put-Away, Picking, Shipping) are already linked -- the `store_manager` role sidebar includes all these modules alongside the traditional inventory. The `org_admin` sidebar should also include warehouse modules within its inventory section. This is partially done but needs verification.

For **pharmacy** facility_type, the existing pharmacy rack/shelf system works independently (store_racks table, RackLocationBadge). Pharmacy users see only their own warehouse/rack system via the pharmacist sidebar -- this is already correct and should remain isolated.

For **independent warehouse** (`facility_type = 'warehouse'`), everything goes through `/app/inventory/` paths which is correct.

**No code change needed** -- the linkage works via shared `/app/inventory/*` routes. The `store_id` filter on all queries ensures data isolation between branches/stores.

---

## Gap 5: Dynamic Inventory Context (Hospital vs Warehouse vs Pharmacy)

The inventory pages should adapt their labels/context based on facility type:
- Hospital: "Inventory Management" with medical supply context
- Warehouse: "Warehouse Management" with logistics context  
- Pharmacy: "Stock Management" with retail context

Currently, `InventoryReportsPage.tsx` already reads `organization?.facility_type` for stats. Other pages don't adapt.

**Fix (minor enhancement):** Add facility_type awareness to the inventory dashboard page header and a few key pages. Low priority.

---

## Implementation Plan

### Step 1: Add `warehouse` to facility_type forms
- `CreateOrganizationPage.tsx` -- add `"warehouse"` to Zod enum and dropdown
- `OrganizationDetailPage.tsx` -- same

### Step 2: Extend warehouse_admin sidebar with HR, Finance, My Work, Settings
- Add HR submenu (Employees, Attendance, Leaves, Payroll, Shifts)
- Add Finance submenu (Accounts, Expenses, Vendor Payments)
- Add My Work section
- Add Settings section (Organization, Users, Roles & Permissions)

### Step 3: Add My Work section to warehouse_user sidebar
- My Schedule, My Attendance, My Leaves, My Payslips

### Step 4: Facility-type isolation logic
- Create a utility function `filterSidebarByFacilityType(items, facilityType)` 
- Define blocked path prefixes per facility type
- Apply the filter in the sidebar rendering component so `org_admin` / `branch_admin` in a warehouse org don't see clinical menus

### Step 5: Org Settings page -- show appropriate module badge
- Update the "Full Modules" / "Limited Modules" badge to show "Warehouse Modules", "Pharmacy Modules" etc.

---

## Files Changed

| File | Change |
|------|--------|
| `src/pages/super-admin/CreateOrganizationPage.tsx` | Add `"warehouse"` to facility_type enum |
| `src/pages/super-admin/OrganizationDetailPage.tsx` | Add `"warehouse"` to facility_type enum |
| `src/config/role-sidebars.ts` | Extend warehouse_admin with HR/Finance/Settings/MyWork; warehouse_user with MyWork |
| `src/components/AppSidebar.tsx` (or wherever sidebar renders) | Add facility_type filtering utility |
| `src/pages/app/settings/OrganizationSettingsPage.tsx` | Update facility badge display |

## Technical Notes

- HR in warehouse context is specifically for warehouse employees (pickers, packers, drivers, admin staff). Same HR module, just scoped to the warehouse organization's employees via `organization_id`.
- Finance in warehouse context covers vendor payments (for goods received), expense tracking, and accounting -- all standard modules reused.
- The `store_id` / `organization_id` filters on all queries already ensure data isolation. A hospital's warehouse data never leaks to an independent warehouse org and vice versa.
- Pharmacy rack system (`store_racks` table) remains independent under the pharmacist role -- it is NOT mixed with the warehouse zone/bin system.
