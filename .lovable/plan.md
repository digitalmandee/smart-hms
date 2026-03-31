

# Add Cost Price & Sale Price to Medicines

## Problem
The `medicines` table has no pricing fields. The user needs cost price and sale price on each medicine for profit tracking.

## Implementation

### 1. Database Migration
Add two columns to `medicines`:
```sql
ALTER TABLE public.medicines ADD COLUMN cost_price NUMERIC(12,2) DEFAULT 0;
ALTER TABLE public.medicines ADD COLUMN sale_price NUMERIC(12,2) DEFAULT 0;
```

### 2. Medicine Form (`src/pages/app/pharmacy/MedicineFormPage.tsx`)
- Add `cost_price` and `sale_price` to the Zod schema as optional numbers
- Add two input fields in the form grid (Cost Price, Sale Price)
- Show calculated profit and margin below the price fields
- Pass values through in create/update mutations

### 3. Medicines List (`src/pages/app/pharmacy/MedicinesListPage.tsx`)
- Add Cost Price, Sale Price, and Profit Margin columns to the table

### 4. Hook Updates (`src/hooks/useMedicines.ts`)
- Add `cost_price` and `sale_price` to the `MedicineWithCategory` interface

### 5. Translations (`en.ts`, `ar.ts`, `ur.ts`)
- Add keys: `costPrice`, `salePrice`, `profitMargin`

## Files Changed
- 1 migration — add `cost_price` and `sale_price` columns
- `src/pages/app/pharmacy/MedicineFormPage.tsx` — price inputs + profit display
- `src/pages/app/pharmacy/MedicinesListPage.tsx` — price/margin columns
- `src/hooks/useMedicines.ts` — interface update
- `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts` — new keys

