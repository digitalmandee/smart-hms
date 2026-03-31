

# Populate Medicine Prices & Enhance Daily P&L Report

## What This Does
1. Populate `cost_price` and `sale_price` for all 51 medicines using latest inventory batch prices
2. Ensure the Daily P&L report uses accurate cost data (already works via inventory join, but medicine-level prices provide a better fallback)
3. Improve the report UI with a more prominent PDF download button

## Implementation

### 1. Data Population (SQL Updates via insert tool)
Update all medicines with latest batch prices from `medicine_inventory`:
```sql
UPDATE medicines m
SET cost_price = sub.cost, sale_price = sub.sell
FROM (
  SELECT DISTINCT ON (medicine_id) medicine_id, unit_price AS cost, selling_price AS sell
  FROM medicine_inventory
  ORDER BY medicine_id, created_at DESC
) sub
WHERE m.id = sub.medicine_id AND m.is_active = true;
```
This takes the most recent inventory batch's `unit_price` (cost) and `selling_price` (sale) for each medicine.

### 2. Improve `useDailyProfitLoss` Hook Fallback
**File: `src/hooks/usePharmacyReports.ts`**

Currently the COGS fallback uses `unit_price * 0.65` (guessing). Update it to also check `medicine.cost_price` before falling back:
- Join `medicine:medicines(cost_price)` via `medicine_id` on `pharmacy_pos_items`
- Fallback chain: `inventory.unit_price` → `medicine.cost_price` → `unit_price * 0.65`

### 3. Enhance Report UI with Prominent PDF Button
**File: `src/pages/app/pharmacy/PharmacyReportsPage.tsx`**

- Move the `ReportExportButton` from below the chart to the top of the report (next to the title/header area) so it's immediately visible
- Add a standalone "Download PDF" button alongside the existing export dropdown for quicker one-click access
- Style it prominently with an icon

### 4. Translations
**Files: `en.ts`, `ar.ts`, `ur.ts`**
- Add key for "Download Report" / "تنزيل التقرير" / "رپورٹ ڈاؤن لوڈ کریں"

## Files Changed
- `src/hooks/usePharmacyReports.ts` — improve COGS fallback with medicine.cost_price
- `src/pages/app/pharmacy/PharmacyReportsPage.tsx` — move export button to top, add prominent PDF button
- `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts` — new keys
- Data update: populate cost_price/sale_price for all medicines from inventory

