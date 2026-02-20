

# Warehouse Module Completion -- Audit Results and Required Fixes

## Audit Summary

### What is COMPLETE (verified working):
- All 10 database tables exist (warehouse_zones, warehouse_bins, inventory_bin_assignments, putaway_tasks, pick_lists, pick_list_items, packing_slips, packing_slip_items, shipments, shipment_tracking_events)
- Both roles exist in app_role enum: `warehouse_admin`, `warehouse_user`
- All 7 warehouse permissions exist in the permissions table
- All 16 warehouse page components are created and routed in App.tsx
- Sidebar configurations for `warehouse_admin` and `warehouse_user` are defined in role-sidebars.ts
- `getPrimaryRole` includes both warehouse roles
- Role labels and constants are registered

### What is MISSING:
1. **No warehouse demo accounts on the Login Page** -- The login page has Hospital, Clinic, and Pharmacy demo sections but no "Independent Warehouse" section
2. **No warehouse demo users created in Supabase** -- Need to create actual auth users with warehouse roles

---

## Implementation Plan

### Step 1: Create Warehouse Demo Users via Edge Function

Use the existing `create-staff-user` edge function (or direct Supabase admin calls) to create two demo users:

| Email | Role | Organization |
|-------|------|-------------|
| `warehouse.admin@healthos.demo` | warehouse_admin | New "Central Distribution Warehouse" org with facility_type = warehouse |
| `warehouse.user@healthos.demo` | warehouse_user | Same org |

This requires:
- Creating a new organization record with a "warehouse" facility type
- Creating a branch for it
- Creating 2 auth users with password `Demo@123`
- Assigning the `warehouse_admin` and `warehouse_user` roles respectively

A small SQL migration will handle this setup.

### Step 2: Add "Independent Warehouse" Demo Section to Login Page

Update `src/pages/auth/LoginPage.tsx`:
- Add a new `warehouseDemoAccounts` array with 2 entries (Warehouse Admin, Warehouse User) using the `Warehouse` and `Package` icons
- Add a new separator section titled "Independent Warehouse (Central Distribution Warehouse)" after the Pharmacy section
- Render the warehouse demo account buttons in the same grid pattern as other sections

### Step 3: Create Warehouse Demo Organization via Migration

A SQL migration to:
- Insert a new organization "Central Distribution Warehouse" with facility_type = 'warehouse'
- Insert a default branch
- The edge function `create-staff-user` will be called to create the actual auth users and assign roles

Since auth user creation requires the Supabase Admin API (not raw SQL), we will create the demo users via the `create-staff-user` edge function after the organization/branch exist.

---

## Files Changed

| File | Change |
|------|--------|
| `src/pages/auth/LoginPage.tsx` | Add warehouseDemoAccounts array + new demo section UI |
| New SQL migration | Create "Central Distribution Warehouse" organization + branch |
| Edge function call | Create 2 demo auth users with warehouse roles |

## Technical Notes

- The demo password remains `Demo@123` consistent with all other demo accounts
- The warehouse organization will use facility_type = 'warehouse' to trigger clinical module hiding (future Batch E work)
- All existing warehouse pages, hooks, routes, and sidebar configs are already complete and functional

