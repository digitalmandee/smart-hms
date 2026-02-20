

# Fix: Provision Warehouse Stores for Independent Warehouse Organization

## Problem

The warehouse organization (`a1111111-1111-1111-1111-111111111111` / "Central Distribution Warehouse") has **zero stores** in the `stores` table. Every form in the warehouse flow (New Pick List, New Packing Slip, New Shipment, New GRN) requires a warehouse/store selection, but the dropdown shows "No warehouses found" -- blocking the entire workflow.

All existing stores belong to hospital orgs (`a0eebc99...`, `b1111111...`, `b2222222...`).

## Solution

Insert seed stores for the warehouse organization via a SQL migration, and verify the warehouse admin can also create new stores through the UI (Warehouse Settings > Warehouses).

### Step 1: Create seed data migration

Insert stores for the warehouse org with a matching branch. Need to first check if the warehouse org has a branch, and if not, create one.

**Data to insert:**

| Store Name | Store Type | Is Central | Description |
|------------|-----------|------------|-------------|
| Main Distribution Center | central | Yes | Primary distribution warehouse |
| Cold Storage Unit | cold_storage | No | Temperature-controlled storage |
| Bulk Storage Area | bulk | No | Bulk item storage |

### Step 2: Verify Warehouse Settings > Warehouses page

Confirm the warehouse admin can view and create additional stores from the UI at `/app/inventory/warehouses`.

## Files Changed

| File | Action |
|------|--------|
| SQL seed migration (via Supabase) | INSERT branch + 3 stores for warehouse org |

## Technical Details

- The `stores` table requires: `organization_id`, `branch_id`, `name`, `store_type`, `is_central`, `is_active`
- Need to check/create a branch for org `a1111111-1111-1111-1111-111111111111` first
- The `useStores` hook filters by `organization_id` and `is_active = true`, so new stores will appear automatically
- No code changes needed -- this is purely a data provisioning fix

