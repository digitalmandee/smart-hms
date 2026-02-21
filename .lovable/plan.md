

# Comprehensive Warehouse Module Restructuring

## Summary

The warehouse module has a solid foundation (42 pages, 18 components) but suffers from three systemic problems:

1. **Hospital contamination** -- HR, Finance, and clinical terminology leak into warehouse mode
2. **Missing warehouse-standard features** -- No cycle counting, no RTV, no quality hold, no FEFO picking
3. **Print/UI quality issues** -- Hardcoded "Hospital" in print layouts, basic zone/bin UI, disconnected workflows

---

## Problem 1: Hospital Modules Visible in Warehouse Mode

The `facility-type-filter.ts` blocks clinical paths (`/app/opd`, `/app/ipd`, `/app/lab`, etc.) and pharmacy for warehouse mode, but **does not block**:

- `/app/hr` (HR Dashboard, Employees, Attendance, Payroll, Duty Rosters, Doctor Compensation)
- `/app/accounts` (Chart of Accounts, Journal Entries, Accounts Payable)
- `/app/billing` (Patient billing, invoices)

Additionally, the HR module contains hospital-specific sub-items:
- "Doctors", "Nurses", "Paramedical Staff", "OT Roster", "Emergency Roster", "Doctor Compensation", "Doctor Earnings"

### Fix

**A. Block non-warehouse paths in `facility-type-filter.ts`:**

Add to `BLOCKED_PREFIXES.warehouse`:
- `/app/billing` (patient billing is irrelevant)
- Selectively hide HR sub-items that are clinical (Doctor Compensation, OT Roster, Emergency Roster, Visiting Doctors)

**B. Keep relevant HR/Finance available but relabel:**

HR and Finance are valid for warehouse operations (employees, attendance, payroll). Add label overrides:
- "Doctors" -> hidden for warehouse
- "Nurses" -> hidden for warehouse  
- "OT Roster" -> hidden for warehouse
- "Emergency Roster" -> hidden for warehouse
- "Doctor Compensation" -> hidden for warehouse
- "Doctor Earnings" -> hidden for warehouse
- "Visiting Doctors" -> hidden for warehouse
- "Paramedical Staff" -> hidden for warehouse

---

## Problem 2: Hardcoded "Hospital" in Print Layouts

Three print components default `organizationName` to "Hospital":
- `PrintableGRN.tsx` (line 12): `organizationName = "Hospital"`
- `PrintablePO.tsx` (line 12): `organizationName = "Hospital"`
- `PrintablePR.tsx` (line 12): `organizationName = "Warehouse"` (already fixed for PR only)

The pages that render these components (`GRNDetailPage`, `PODetailPage`, `PRDetailPage`) need to pass the actual organization name fetched from the database.

### Fix

- Change default from "Hospital" to the actual org name by fetching it from `useOrganization` in the detail pages
- Pass `organizationName={organization?.name || "Organization"}` to each print component

---

## Problem 3: Hospital-Centric Vendor Types

`VendorsListPage.tsx` uses vendor types: `pharmaceutical, equipment, consumables, surgical, services, general`

These are hospital categories. For warehouse mode, appropriate types would be:
- `raw_materials, packaging, logistics, distributor, manufacturer, general`

### Fix

- Conditionally switch vendor type labels based on `facility_type`
- The vendor form (`VendorFormPage.tsx`) also needs updated type options

---

## Problem 4: Pharmacy Reports Visible in Warehouse Mode

`InventoryReportsPage.tsx` line 73 uses `stats?.isHospital && stats?.hasPharmacyModule` to show pharmacy reports. This check may not correctly handle warehouse mode.

### Fix

- Add explicit `!isWarehouse` check: `showPharmacySection = !isWarehouse && stats?.isHospital && stats?.hasPharmacyModule`

---

## Problem 5: Zone/Bin Pages UX Issues

Current issues:
- Must select a store before seeing any data -- no auto-selection
- Empty states just say "No zones found" with no guidance
- Zone form is a basic dialog -- no capacity fields, no description, no floor/aisle info
- Bins page lacks bulk creation option
- Storage Map shows raw item IDs instead of item names in bin assignments

### Fix

- Use `useDefaultStore` hook (already created) to auto-select the user's warehouse
- Add illustrated empty states with CTAs ("Create Your First Zone" with an icon and description)
- Enhance zone form with: description field, floor/aisle info, capacity (max bins, max weight)
- Storage Map: resolve item names from bin assignments (join with inventory_items)

---

## Problem 6: Missing Core Warehouse Features

### A. Cycle Count / Physical Inventory (High Priority)
No way to do periodic stock counts. Standard WMS always includes this.

**New pages needed:**
- `CycleCountListPage.tsx` -- list of cycle count sessions with status filter
- `CycleCountFormPage.tsx` -- create a cycle count (select zone/bins, assign counter)
- `CycleCountPage.tsx` -- execute count with barcode scanning, record variances

**New database table:** `cycle_counts` (id, store_id, zone_id, status, counted_by, started_at, completed_at)
**New database table:** `cycle_count_items` (id, cycle_count_id, bin_id, item_id, expected_qty, counted_qty, variance, notes)

### B. Return to Vendor (RTV) (High Priority)
No flow for returning rejected/damaged goods. GRN captures rejected quantities but there's no next step.

**New pages needed:**
- `RTVListPage.tsx` -- list of return authorizations
- `RTVFormPage.tsx` -- create RTV from GRN rejected items
- `RTVDetailPage.tsx` -- view RTV with status workflow (draft -> approved -> shipped -> completed)

**New database table:** `return_to_vendor` (id, grn_id, vendor_id, status, reason, notes)
**New database table:** `rtv_items` (id, rtv_id, item_id, quantity, reason)

### C. Quality Hold / Quarantine Status (Medium Priority)
GRN has accepted/rejected counts but no "quality hold" intermediate state.

**Enhancement to GRN:**
- Add "quarantine" status option for GRN items
- Add quarantine zone concept -- items in QC go to quarantine zone until released
- Add "Release from QC" action on GRN detail page

### D. FEFO Picking Logic (Medium Priority)
Pick lists don't consider expiry dates. Standard WMS uses First-Expired-First-Out.

**Enhancement to pick list creation:**
- When creating a pick list, auto-suggest bins with earliest expiry items first
- Show expiry date on pick list items
- Warning when picking non-FEFO order

---

## Problem 7: Disconnected Workflows

### PR -> PO flow
Works (PO form pre-fills from PR via `from_pr` param), but:
- PR detail page should show "Converted to PO: PO-XXXX" link when converted
- No visual indicator on PR list showing which PRs have been converted

### PO -> GRN flow
Works (GRN form loads PO items via `poId` param), but:
- PO detail page should show partial delivery status per line item
- No way to create multiple GRNs against one PO (partial deliveries)

### GRN -> Put-Away flow
Partially connected. GRN creates stock, but:
- No automatic put-away task generation after GRN completion
- Put-away worklist requires manual creation

### Pick -> Pack -> Ship flow
Loosely connected:
- Pick list -> Packing slip link exists
- Packing slip -> Shipment link is weak
- No single "Order Fulfillment" view showing the complete chain

### Fix
- Add status indicators and cross-reference links throughout the chain
- Auto-generate put-away tasks when GRN is completed
- Add "Fulfillment Timeline" view on shipment detail showing the complete chain

---

## Problem 8: GRN Form Issues

- The GRN form shows "Medicine" type column and "Sell Price" column -- irrelevant for warehouse
- Hardcoded "Rs." currency instead of using the currency formatter
- No barcode scanner integration on the GRN form itself (only on detail page)

### Fix
- Hide "Medicine" type and "Sell Price" columns when `facility_type === "warehouse"`
- Use `useCurrencyFormatter` hook instead of hardcoded "Rs."
- Add inline barcode scanner to GRN form items table

---

## Implementation Plan

### Phase 1: Fix Hospital Contamination (Priority: Critical)
1. Update `facility-type-filter.ts` to hide clinical HR sub-items and billing for warehouse
2. Fix all 3 print components to use actual org name
3. Fix vendor types for warehouse mode
4. Hide pharmacy reports section in warehouse mode
5. Hide Medicine/Sell Price columns in GRN form for warehouse

### Phase 2: Improve Existing Module UX (Priority: High)
6. Enhance zone/bin pages with better empty states and forms
7. Fix Storage Map to show item names instead of IDs
8. Add cross-reference links between PR/PO/GRN/Put-Away
9. Use currency formatter everywhere instead of hardcoded "Rs."

### Phase 3: Add Missing Core Features (Priority: High)
10. Build Cycle Count module (3 pages + 2 tables)
11. Build Return to Vendor module (3 pages + 2 tables)
12. Add Quality Hold/Quarantine status to GRN

### Phase 4: Workflow Optimization (Priority: Medium)
13. Auto-generate put-away tasks from completed GRN
14. FEFO picking logic
15. Fulfillment timeline view on shipments

## Technical Details

| Change | Files Affected |
|--------|---------------|
| Block clinical HR sub-items for warehouse | `src/lib/facility-type-filter.ts` |
| Fix print org name | `src/components/inventory/PrintableGRN.tsx`, `PrintablePO.tsx`, `GRNDetailPage.tsx`, `PODetailPage.tsx` |
| Warehouse vendor types | `src/pages/app/inventory/VendorsListPage.tsx`, `VendorFormPage.tsx` |
| Hide pharmacy reports | `src/pages/app/inventory/InventoryReportsPage.tsx` |
| Hide medicine columns in GRN | `src/pages/app/inventory/GRNFormPage.tsx` |
| Enhanced zone form | `src/pages/app/inventory/warehouse/WarehouseZonesPage.tsx` |
| Cycle Count module | 3 new pages + 1 new hook + migration for 2 tables |
| RTV module | 3 new pages + 1 new hook + migration for 2 tables |
| Quality Hold on GRN | `src/hooks/useGRN.ts`, `GRNDetailPage.tsx` |
| Cross-reference links | `PRDetailPage.tsx`, `PODetailPage.tsx`, `GRNDetailPage.tsx` |
| Currency formatter | `GRNFormPage.tsx` and other pages with hardcoded "Rs." |
| Translations | `en.ts`, `ur.ts`, `ar.ts` -- new keys for Cycle Count, RTV, Quality Hold |

