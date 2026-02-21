

# Warehouse Module Overhaul: Put-Away Scanner, Shipment Print, Storage Map, and Picking/Packing UI

## Issues Identified

1. **Put-Away Task page** is too basic -- just shows task details with a bin selector dropdown. No barcode scanner for the employee to scan the bin code. No item details shown (item name, batch, etc.).
2. **Shipment Detail page** is very minimal -- just shows 6 fields in a card. No destination info, no items list, no dates, no cost. Print layout is basic text only with no company branding or structured layout.
3. **Shipment print** (`PrintableShipment.tsx`) is a plain text dump with no professional formatting -- no borders, no logo placeholder, no item table, no delivery address section.
4. **Picking Dashboard** shows only 4 stat cards with no links to pick lists or packing slips -- dead end page.
5. **Storage Map** shows zone cards with utilization bars but nothing is clickable -- you cannot drill into bins, see what items are stored where, or navigate anywhere.
6. **Warehouse Zones page** works (CRUD) but shows empty table when no zones exist -- no guidance on getting started.
7. **Warehouse Bins page** works (CRUD) but shows empty table similarly.
8. **Bin Assignments page** shows raw item IDs instead of item names.

## Plan

### 1. Add Barcode Scanner to Put-Away Task Page

**File: `src/pages/app/inventory/PutAwayTaskPage.tsx`**

The put-away scanner is for warehouse employees to:
- Scan the bin barcode to confirm they are placing items in the correct bin
- Scan the item barcode to verify the correct item is being put away

Changes:
- Add `InlineBarcodeScannerInput` component for scanning bin codes
- When a bin barcode is scanned, auto-select that bin in the dropdown
- Show item details: fetch and display item name, batch number, barcode from inventory_items
- Add GRN reference link if grn_id is present
- Show timestamps (started_at, completed_at)
- Full-width layout instead of half-width card

### 2. Enhance Shipment Detail Page

**File: `src/pages/app/inventory/shipping/ShipmentDetailPage.tsx`**

Changes:
- Add destination details section (destination type, address if available)
- Add shipping cost display
- Add estimated/actual delivery dates
- Add dispatched by/at and received by/at info
- Add "Packing Slip" link if packing_slip_id exists
- Add "Transfer" link if transfer_id exists
- Show shipment items (fetch from packing slip items if linked)
- Add action buttons: Mark Dispatched, Mark Delivered based on status
- Full-width layout for better information display

### 3. Professional Shipment Print Layout

**File: `src/components/inventory/PrintableShipment.tsx`**

Complete redesign:
- Bordered header with organization name and "DELIVERY NOTE" title
- Two-column info block: shipment details on left, destination on right
- Items table with borders (from linked packing slip)
- Signature blocks with lines and labels: Dispatched By, Driver/Carrier, Received By
- Date and shipment number in footer
- Proper print margins and page break handling

### 4. Make Storage Map Interactive

**File: `src/pages/app/inventory/warehouse/StorageMapPage.tsx`**

Changes:
- Make each zone card clickable -- expands to show bins within that zone
- Show bin grid inside each zone: colored squares/rectangles for occupied vs available bins
- Click a bin to see what items are stored there (show item name, qty, batch)
- Add navigation links: "Manage Zones" and "Manage Bins" buttons in the header
- Add empty state with "Create your first zone" call-to-action when no zones exist
- Add a summary bar at the top: Total Zones, Total Bins, Overall Utilization %

### 5. Enhance Picking Dashboard with Navigation

**File: `src/pages/app/inventory/PickingDashboardPage.tsx`**

Changes:
- Make stat cards clickable -- link to filtered pick list / packing slip pages
- Add recent pick lists table (last 5) with View links
- Add recent packing slips table (last 5) with View links
- Add quick action buttons: "New Pick List", "New Packing Slip"

### 6. Improve Bin Assignments Page

**File: `src/pages/app/inventory/warehouse/BinAssignmentsPage.tsx`**

Changes:
- Join item name from inventory_items instead of showing raw item_id
- Add item barcode/item_code column
- Add zone column from the bin relationship

### 7. Multi-language Support

Add all new UI text to English, Urdu, and Arabic translation files.

## Technical Details

| File | Action |
|------|--------|
| `src/pages/app/inventory/PutAwayTaskPage.tsx` | Update -- add scanner, item details, GRN link |
| `src/pages/app/inventory/shipping/ShipmentDetailPage.tsx` | Update -- add destination, dates, items, action buttons |
| `src/components/inventory/PrintableShipment.tsx` | Rewrite -- professional bordered print layout with items table |
| `src/pages/app/inventory/warehouse/StorageMapPage.tsx` | Update -- interactive zones/bins, drill-down, empty states |
| `src/pages/app/inventory/PickingDashboardPage.tsx` | Update -- clickable stats, recent tables, quick actions |
| `src/pages/app/inventory/warehouse/BinAssignmentsPage.tsx` | Update -- show item names instead of IDs |
| `src/lib/i18n/translations/en.ts` | Update -- new keys |
| `src/lib/i18n/translations/ur.ts` | Update -- Urdu translations |
| `src/lib/i18n/translations/ar.ts` | Update -- Arabic translations |

