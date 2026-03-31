

# Enhance Pharmacy Reports: More Data, Vendor-Product Detail, PDF Downloads

## Problems Identified

1. **Data limit**: Supabase queries default to 1000 rows max. Reports with many orders/items are silently truncated. The user wants support for ~5000+ orders.
2. **Supplier report lacks product names**: `useSupplierPurchaseSummary` only fetches PO headers with vendor info — no item-level detail showing which products were bought from which vendor.
3. **Inconsistent PDF download buttons**: Some reports have export buttons, others don't. The prominent "Download PDF" button pattern from the Daily P&L should be applied consistently.
4. **Page size too small**: Tables use `pageSize={25}` — should be larger for comprehensive reports.

## Implementation

### 1. Remove Supabase 1000-row limit on all report queries
**File: `src/hooks/usePharmacyReports.ts`**

For every query that fetches `pharmacy_pos_transactions` or `pharmacy_pos_items`, add pagination to fetch all rows (Supabase caps at 1000 per request). Create a helper function `fetchAllRows` that loops with `.range(offset, offset+999)` until fewer than 1000 rows are returned. Apply this to all hooks that aggregate transaction/item data (daily sales, hourly, profit margin, P&L, transaction log, basket size, etc.).

### 2. Add item-level detail to Supplier Purchase report
**File: `src/hooks/usePharmacyReports.ts`**

Update `useSupplierPurchaseSummary` to also fetch `purchase_order_items` with medicine/item names:
- Join `purchase_order_items` → `medicines(name)` and `inventory_items(name)` 
- Return both vendor-level summary AND item-level detail array showing: Vendor, PO Number, Product Name, Quantity, Unit Price, Total

### 3. Update Supplier Summary UI with product-level table
**File: `src/pages/app/pharmacy/PharmacyReportsPage.tsx`**

- Show the vendor summary cards at top (existing)
- Add a detailed item-level table below: Vendor | PO # | Product Name | Qty | Unit Price | Total
- Add PDF export button with both summary and detail data

### 4. Increase table page sizes and add missing PDF buttons
**File: `src/pages/app/pharmacy/PharmacyReportsPage.tsx`**

- Change all `pageSize={25}` to `pageSize={50}` for better report viewing
- Ensure every report case has a `ReportExportButton` (verify transaction-log, refund-rate, basket-size, etc.)

### 5. Translations
**Files: `en.ts`, `ar.ts`, `ur.ts`**

Add keys for "Product Name", "Purchase Details" / "اسم المنتج", "تفاصيل المشتريات" / "پروڈکٹ کا نام", "خریداری کی تفصیلات"

## Files Changed
- `src/hooks/usePharmacyReports.ts` — add `fetchAllRows` helper, update all hooks to use it, enhance supplier hook with item detail
- `src/pages/app/pharmacy/PharmacyReportsPage.tsx` — update supplier report UI, increase page sizes, add missing export buttons
- `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts` — new keys

