
# Add Filters, Search, and Date Ranges Across All Warehouse List Pages

## Problem

Many list pages are missing filters that users need to find specific records quickly. The inconsistency is:

| Page | Has Search | Has Status Filter | Has Store Filter | Has Date Filter |
|------|-----------|-------------------|-----------------|-----------------|
| Zones | No | No | Yes | No |
| Bins | No | No | Yes | No |
| Bin Assignments | No | No | Yes | No |
| Put-Away Worklist | No | Yes | Yes | No |
| Pick Lists | No | Yes | Yes | No |
| Packing Slips | No | Yes | Yes | No |
| Shipments | No | Yes | Yes | No |
| Dispatch Dashboard | No | No | Yes | No |
| PO List | No | Yes | No | No |
| GRN List | No | Yes | No | No |
| PR List | No | Yes | No | No |
| Vendors | Yes | No | No | No |
| Transfers | No | Yes | No | No |
| Stock Adjustments | No | Yes (type) | No | No |
| Items | Yes | No (category) | No | No |

## Plan

### 1. Create a Reusable Filter Bar Component

Create `src/components/inventory/ListFilterBar.tsx` -- a standardized horizontal filter bar that accepts optional slots for:
- Search input (text search with search icon)
- Store selector (warehouse filter)
- Status dropdown
- Date range picker (from/to date inputs)
- Type/category dropdown

This ensures visual consistency across all list pages.

### 2. Add Missing Filters to Each Page

**Zones Page** (`WarehouseZonesPage.tsx`)
- Add: Search (by zone code/name), Zone Type filter, Active/Inactive status filter

**Bins Page** (`WarehouseBinsPage.tsx`)
- Add: Search (by bin code), Bin Type filter, Status filter (active/occupied/available)

**Bin Assignments Page** (`BinAssignmentsPage.tsx`)
- Add: Search (by item name or bin code)

**Put-Away Worklist** (`PutAwayWorklistPage.tsx`)
- Add: Search (by bin code), Date range filter

**Pick Lists** (`PickListsPage.tsx`)
- Add: Search (by pick list number), Date range filter

**Packing Slips** (`PackingSlipsPage.tsx`)
- Add: Search (by packing slip number), Date range filter

**Shipments** (`ShipmentsPage.tsx`)
- Add: Search (by shipment number or tracking number), Date range filter

**Dispatch Dashboard** (`DispatchDashboardPage.tsx`)
- Add: Date range filter, recent shipments table with links (fix dead-end)
- Add: Quick action buttons (New Shipment, View All Shipments)

**PO List** (`POListPage.tsx`)
- Add: Search (by PO number or vendor name), Store filter, Date range filter

**GRN List** (`GRNListPage.tsx`)
- Add: Search (by GRN number or vendor name), Store filter, Date range filter

**PR List** (`PRListPage.tsx`)
- Add: Search (by PR number), Date range filter

**Vendors** (`VendorsListPage.tsx`)
- Add: Vendor Type filter, City filter

**Transfers** (`TransfersListPage.tsx`)
- Add: Search (by transfer number), Date range filter

**Stock Adjustments** (`StockAdjustmentsPage.tsx`)
- Add: Search (by item name), Date range filter, Store filter

**Items** (`ItemsListPage.tsx`)
- Add: Store filter (to see stock per store)

### 3. Auto-Select Logged-In User's Warehouse

For pages that require a store selection (Zones, Bins, Bin Assignments, etc.):
- Use `useMyStores()` to check if the logged-in user is a store manager
- If they manage exactly one store, auto-select it as default
- If they manage multiple, show a selector pre-filled with their first store
- If they are an admin (not assigned to a specific store), show "All" by default
- This eliminates the "Select a warehouse first" dead state

### 4. Fix Dispatch Dashboard Dead End

Add a recent shipments table below the stat cards with View links, plus quick action buttons for "New Shipment" and "View All Shipments."

### 5. Multi-Language Support

Add all new filter labels (Search, Date From, Date To, All Types, All Statuses, etc.) to English, Urdu, and Arabic translation files.

## Technical Details

| File | Changes |
|------|---------|
| `src/components/inventory/ListFilterBar.tsx` | **New** -- reusable filter bar component |
| `src/hooks/useDefaultStore.ts` | **New** -- hook to auto-select user's assigned store |
| `src/pages/app/inventory/warehouse/WarehouseZonesPage.tsx` | Add search, type filter, status filter, auto-store |
| `src/pages/app/inventory/warehouse/WarehouseBinsPage.tsx` | Add search, type filter, status filter, auto-store |
| `src/pages/app/inventory/warehouse/BinAssignmentsPage.tsx` | Add search, auto-store |
| `src/pages/app/inventory/PutAwayWorklistPage.tsx` | Add search, date range, auto-store |
| `src/pages/app/inventory/PickListsPage.tsx` | Add search, date range |
| `src/pages/app/inventory/PackingSlipsPage.tsx` | Add search, date range |
| `src/pages/app/inventory/shipping/ShipmentsPage.tsx` | Add search, date range |
| `src/pages/app/inventory/shipping/DispatchDashboardPage.tsx` | Add date filter, shipments table, quick actions |
| `src/pages/app/inventory/POListPage.tsx` | Add search, store filter, date range |
| `src/pages/app/inventory/GRNListPage.tsx` | Add search, store filter, date range |
| `src/pages/app/inventory/PRListPage.tsx` | Add search, date range |
| `src/pages/app/inventory/VendorsListPage.tsx` | Add vendor type filter |
| `src/pages/app/inventory/TransfersListPage.tsx` | Add search, date range |
| `src/pages/app/inventory/StockAdjustmentsPage.tsx` | Add search, date range, store filter |
| `src/pages/app/inventory/ItemsListPage.tsx` | Add store filter |
| `src/lib/i18n/translations/en.ts` | New filter label keys |
| `src/lib/i18n/translations/ur.ts` | Urdu translations |
| `src/lib/i18n/translations/ar.ts` | Arabic translations |

All filtering will be done client-side on the already-fetched data (search, type, date range) to keep things fast. Store filtering uses the existing query parameter pattern already in the hooks.
