

# Add Cost Price to Services for Profit Calculation

## Problem
The `service_types` table only has `default_price` (selling price). There's no `cost_price` field to track the actual cost, making profit calculation impossible.

## Implementation

### 1. Database Migration
Add `cost_price` column to `service_types`:
```sql
ALTER TABLE public.service_types ADD COLUMN cost_price NUMERIC(12,2) DEFAULT 0;
```

### 2. Update Service Edit Dialog
**File: `src/components/settings/ServiceEditDialog.tsx`**
- Add `cost_price` state field
- Add "Cost Price (Rs.)" input field below the existing price field
- Show calculated profit margin: `Profit: Rs. X (Y%)`
- Pass `cost_price` through `onSave`

### 3. Update Services Table
**File: `src/pages/app/settings/ServicesPage.tsx`**
- Add "Cost Price" and "Profit" columns to the table
- Show profit as `default_price - cost_price` with percentage
- Pass `cost_price` through `handleSave`

### 4. Update Hooks
**File: `src/hooks/useUnifiedServices.ts`**
- Add `cost_price` to `UnifiedService` interface
- Include `cost_price` in create and update mutations

### 5. Update OT Services Hook
**File: `src/hooks/useOTServices.ts`**
- Add `cost_price` to `OTService` interface and select query

### 6. i18n
**Files: `en.ts`, `ar.ts`, `ur.ts`**
- Keys: "Cost Price", "Profit", "Profit Margin"

## Files Changed
- 1 migration — add `cost_price` column to `service_types`
- `src/components/settings/ServiceEditDialog.tsx` — add cost price input + profit display
- `src/pages/app/settings/ServicesPage.tsx` — add cost/profit columns to table
- `src/hooks/useUnifiedServices.ts` — add `cost_price` to interface and mutations
- `src/hooks/useOTServices.ts` — add `cost_price` to interface
- `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts` — new keys

