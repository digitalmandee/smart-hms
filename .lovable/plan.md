

# Make Warehouse Module Fully Independent from Hospital Context

## Problem
When logged in as a standalone warehouse organization (`facility_type: 'warehouse'`), the inventory module still shows hospital/clinical-specific options:

1. **Store Types** include hospital-specific options: "Medical Store", "Surgical Store", "Dental Store", "Pharmacy Store"
2. **Vendor Types** show clinical terms: "Pharmaceutical", "Medical Equipment", "Surgical Supplies"
3. **Reports Page** shows a "Pharmacy Inventory Reports" section (conditional but still checks for it)
4. **Category placeholder** says "e.g., Medical Supplies"

For a standalone warehouse, these should be replaced with general warehouse/logistics terminology.

## Solution

Make the inventory pages facility-type-aware so that warehouse organizations see warehouse-relevant options, while hospital/clinic organizations continue seeing the current options.

---

## Technical Changes

### File 1: `src/pages/app/inventory/StoreFormPage.tsx`
- Make the `storeTypes` array dynamic based on `facility_type`
- For warehouse: show "Central Warehouse", "Distribution Center", "Cold Storage", "Bulk Storage", "Equipment Store", "General Store"
- For hospital/clinic: keep existing types (Medical, Surgical, Dental, Pharmacy, etc.)

### File 2: `src/pages/app/inventory/StoresListPage.tsx`
- Add warehouse-specific store type labels to the `storeTypeLabels` mapping (e.g., "distribution" -> "Distribution", "cold_storage" -> "Cold Storage", "bulk" -> "Bulk Storage")

### File 3: `src/pages/app/inventory/VendorFormPage.tsx`
- Make vendor types dynamic based on facility_type
- For warehouse: show "Manufacturer", "Distributor", "Wholesaler", "Raw Materials", "Packaging", "Logistics", "General"
- For hospital/clinic: keep existing types (Pharmaceutical, Medical Equipment, Surgical, etc.)

### File 4: `src/pages/app/inventory/CategoriesPage.tsx`
- Change placeholder from "e.g., Medical Supplies" to a facility-aware placeholder
- Warehouse: "e.g., Electronics, Raw Materials"
- Hospital: "e.g., Medical Supplies"

### File 5: `src/pages/app/inventory/InventoryReportsPage.tsx`
- The pharmacy section is already conditionally shown (`showPharmacySection`), which is correct
- No changes needed here as the condition `stats?.isHospital && stats?.hasPharmacyModule` already handles it

### Data Access
- All pages already use `useAuth()` to get the profile
- `useOrganization(profile?.organization_id)` is already available in some pages and will be added where needed to access `facility_type`
- HR and Finance modules are already scoped by `organization_id` so warehouse employees and finances are isolated

### Summary of Changes

| File | What Changes |
|------|-------------|
| `StoreFormPage.tsx` | Dynamic store types based on facility_type |
| `StoresListPage.tsx` | Add warehouse store type labels |
| `VendorFormPage.tsx` | Dynamic vendor types based on facility_type |
| `CategoriesPage.tsx` | Context-aware placeholder text |

