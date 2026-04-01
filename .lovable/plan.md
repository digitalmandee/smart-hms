

# Fix: GRN Medicine Stock Not Added to Pharmacy Inventory

## Problem
When a GRN with medicine items is verified, the code at `src/hooks/useGRN.ts` line 275 tries to insert `organization_id` into `medicine_inventory`, but that table has no `organization_id` column. This causes the insert to **fail silently** (the error is thrown but the GRN status was already changed to "verified" before the stock insert). Result: GRN shows as posted, but no medicine stock appears in Pharmacy Inventory.

## Root Cause
```text
medicine_inventory columns: id, branch_id, medicine_id, batch_number, quantity,
  unit_price, selling_price, expiry_date, supplier_name, reorder_level,
  vendor_id, store_id, created_at, updated_at

Code inserts: organization_id  ← DOES NOT EXIST
```

## Fix

### 1. Remove `organization_id` from the medicine_inventory insert (`src/hooks/useGRN.ts`, line 275)
Remove the `organization_id` field from the insert object. All other fields are valid.

### 2. Backfill the missing medicine stock for already-posted GRNs
The two GRNs (`GRN-20260401-0001` and `GRN-20260401-0002`) were verified/posted but their medicine stock was never inserted. Need to manually insert:
- GRN-0001: medicine `...0003`, qty 1, batch "21"
- GRN-0002: medicine `...0003`, qty 40, batch "2" + medicine `...0006`, qty 10, batch "2"

This will be a migration that inserts the missing `medicine_inventory` rows.

### 3. Ensure GRN verify is transactional
Currently the GRN status is updated before stock insertion. If stock insert fails, the GRN is stuck as "verified" with no stock. Move the status update to after successful stock insertion, or add a check during verify to detect and retry failed stock inserts.

## Files Changed
- `src/hooks/useGRN.ts` — remove `organization_id` from medicine_inventory insert
- `supabase/migrations/new.sql` — backfill missing medicine_inventory rows for the 2 posted GRNs

