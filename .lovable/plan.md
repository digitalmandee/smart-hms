

# Fix: Pharmacy Refund Button Not Working

## Problems Found

### Problem 1: Prescription Return Search Completely Broken (Silent Failure)
The `useSearchDispensedPrescriptions` query references columns that don't exist:
- `patients.full_name` → actual column: `first_name` + `last_name`
- `patients.mrn` → actual column: `patient_number`
- `prescriptions.dispensed_at` → does not exist at all
- `prescription_items.unit_price`, `total_price`, `dispensed_quantity`, `inventory_id`, `batch_number` → none of these exist

The query fails silently, returning no results. The fallback patient-name search also fails because it references the same wrong columns.

### Problem 2: Prescription Items Have No Price/Inventory Data
`prescription_items` only has: `id, prescription_id, medicine_id, medicine_name, dosage, frequency, duration, quantity, instructions, is_dispensed, created_at`. No pricing columns exist, so even if the query worked, we can't calculate refund amounts from prescription data alone.

### Problem 3: POS Flow — Potential Dialog Items Empty
When a POS transaction has items, the mapping looks correct, but if the join to `pharmacy_pos_items` returns an empty array (e.g., RLS issue or missing FK), the dialog shows no items to select and the refund button stays disabled.

## Fix Plan

### 1. Fix Prescription Return Search Query
**File: `src/hooks/usePharmacyReturns.ts`**
- Change `patient:patients(id, full_name, mrn)` → `patient:patients(id, first_name, last_name, patient_number)`
- Remove `dispensed_at` from select and order by `created_at` instead
- Fix `prescription_items` select to only use existing columns: `id, medicine_name, medicine_id, quantity, is_dispensed`
- For pricing: look up `medicine_inventory` by `medicine_id` to get `selling_price` for each item at map time
- Update `mapPrescriptionResults` to construct `full_name` from `first_name + last_name`, use `patient_number` as MRN
- Fix fallback patient search to use `first_name` and `patient_number` instead of `full_name` and `mrn`

### 2. Add Price Lookup for Prescription Items
**File: `src/hooks/usePharmacyReturns.ts`**
- In `mapPrescriptionResults`, for items without pricing, fetch latest `medicine_inventory` price by `medicine_id`
- Alternatively, do a bulk price lookup before mapping
- Set `unit_price` from inventory `selling_price`, `total_price = unit_price * quantity`
- Set `inventory_id` from the matching inventory record

### 3. Ensure POS Return Dialog Works
**File: `src/pages/app/pharmacy/PharmacyReturnsPage.tsx`**
- Add a safety check: if `dialogItems` is empty after mapping, show a message "No items found" instead of silently disabling the button
- Add error handling feedback if the search or mutation fails

### 4. Improve Error Visibility
- Add console/toast feedback when search queries fail so issues don't fail silently

## Files Changed
- `src/hooks/usePharmacyReturns.ts` — fix column references in prescription search, add price lookup
- `src/pages/app/pharmacy/PharmacyReturnsPage.tsx` — add empty items feedback in dialog

