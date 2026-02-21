

# Reorganize Warehouse/Inventory Menu Structure

## Problem

The current menu under **Inventory** has only 9 flat items with no logical grouping:

```text
Current Order (sort_order):
1. Dashboard
2. Item Catalog
3. Categories
4. Stock Levels
5. Vendors
6. Purchase Orders
7. Goods Receipt (GRN)
8. Requisitions
9. Reports          <-- Reports stuck in middle, before warehouse/shipping pages
```

**Missing from menu entirely:**
- Picking Dashboard, Pick Lists, Packing Slips
- Shipping / Dispatch
- Warehouse Zones, Bins, Storage Map, Bin Assignments
- Put-Away Worklist
- Barcode Labels, Barcode Scanner
- Stock Adjustments, Reorder Alerts
- Integrations / API Keys

## Proposed Menu Structure

Reorganize into logical **sub-groups** using parent menu items:

```text
Inventory (or "Warehouse" when facility_type=warehouse)
|
+-- Dashboard                          (sort: 1)
+-- Item Catalog                       (sort: 2)
+-- Categories                         (sort: 3)
|
+-- Procurement (sub-group)            (sort: 10)
|   +-- Purchase Requisitions          (sort: 11)
|   +-- Purchase Orders                (sort: 12)
|   +-- Goods Receipt (GRN)            (sort: 13)
|   +-- Vendors                        (sort: 14)
|
+-- Stock Management (sub-group)       (sort: 20)
|   +-- Stock Levels                   (sort: 21)
|   +-- Stock Adjustments              (sort: 22)
|   +-- Reorder Alerts                 (sort: 23)
|   +-- Store Transfers                (sort: 24)
|   +-- Warehouses / Stores            (sort: 25)
|
+-- Warehouse Operations (sub-group)   (sort: 30)
|   +-- Storage Map                    (sort: 31)
|   +-- Zones                          (sort: 32)
|   +-- Bins                           (sort: 33)
|   +-- Bin Assignments                (sort: 34)
|   +-- Put-Away Worklist              (sort: 35)
|
+-- Picking & Packing (sub-group)      (sort: 40)
|   +-- Picking Dashboard              (sort: 41)
|   +-- Pick Lists                     (sort: 42)
|   +-- Packing Slips                  (sort: 43)
|
+-- Shipping (sub-group)               (sort: 50)
|   +-- Dispatch Dashboard             (sort: 51)
|   +-- Shipments                      (sort: 52)
|
+-- Barcode & Integrations (sub-group) (sort: 60)
|   +-- Barcode Labels                 (sort: 61)
|   +-- Barcode Scanner                (sort: 62)
|   +-- API Keys                       (sort: 63)
|
+-- Reports                           (sort: 70)
```

## Implementation

### 1. Database: Insert Missing Menu Items

Run SQL to:
- Create 6 new **parent sub-group** menu items (Procurement, Stock Management, Warehouse Operations, Picking and Packing, Shipping, Barcode and Integrations) under the Inventory parent
- Insert ~15 missing leaf menu items (Stock Adjustments, Reorder Alerts, Storage Map, Zones, Bins, Bin Assignments, Put-Away, Picking Dashboard, Pick Lists, Packing Slips, Dispatch Dashboard, Shipments, Barcode Labels, Barcode Scanner, API Keys)
- Update existing items to move under correct sub-group parents (move Vendors under Procurement, move Requisitions under Procurement, etc.)
- Fix sort_order for all items to match the structure above
- Move "Warehouses" and "Store Transfers" from under Dashboard to Stock Management sub-group

### 2. Update DynamicSidebar Icon Mapping

Add icon mappings in `DynamicSidebar.tsx` for new menu item codes so each sub-group and leaf item gets a proper icon (e.g., `Map` for Storage Map, `ScanLine` for Barcode Scanner, `Truck` for Shipping).

### 3. No Translation Changes Needed

Menu item names come from the database `menu_items.name` field, not from translation files. The menu rendering already handles nested parent-child relationships.

## Technical Details

| Change | Details |
|--------|---------|
| Database SQL | Insert ~6 parent groups + ~15 leaf items, update ~5 existing items (re-parent + re-sort) |
| `src/components/DynamicSidebar.tsx` | Add icon mappings for ~20 new menu codes |
| No new files | All pages already exist, just not linked in the menu |

