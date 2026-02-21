

# Fix Stock Module: Missing Icon, Truncated Columns, and Organization Filter

## Issues Found

### 1. Stock Adjustments menu icon is missing
The sidebar config uses `icon: "Sliders"` for Stock Adjustments, but the `Sliders` icon is not imported in `DynamicSidebar.tsx`'s `iconMap`. This causes the menu item to render without an icon.

### 2. Stock Levels table columns are cut off
The Stock Levels page has 9 columns (Item Code, Item Name, Category, Current Stock, Reorder Level, Status, Standard Cost, Stock Value, Adjust button) but the table overflows on the right side. The "Standard Cost", "Stock Value", and "Adjust" columns are hidden/clipped because the table is not wrapped in a horizontally scrollable container.

### 3. Items query missing organization_id filter
`useInventoryItems` in `useInventory.ts` does not filter by `organization_id`. While RLS handles security, adding an explicit filter is best practice and prevents unnecessary data transfer.

---

## Technical Changes

### File 1: `src/components/DynamicSidebar.tsx`
- Import `Sliders` from `lucide-react`
- Add `Sliders` to the `iconMap` object

### File 2: `src/pages/app/inventory/StockLevelsPage.tsx`
- Wrap the `<Table>` in a `<div className="overflow-x-auto">` so all columns are accessible via horizontal scroll on smaller screens
- Add a "Warehouse" column to show which store holds the stock (requires fetching store info alongside stock data)

### File 3: `src/hooks/useInventory.ts` (useInventoryItems function)
- Add `.eq("organization_id", profile!.organization_id)` to the inventory_items query so only the current organization's items are returned

These 3 targeted fixes will resolve the missing icon, hidden columns, and data isolation issues in the Stock module.

