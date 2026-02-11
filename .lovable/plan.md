
# Fix Warehouse Management Issues Found During E2E Testing

## Issues Discovered

### 1. StoreFormPage Crash (Critical)
The Create Warehouse form crashes with a Radix Select `removeChild` error. The root cause is the `branch_id` field defaulting to `profile?.branch_id || ""` -- when the profile's branch_id is null/undefined, an empty string is passed as the Select value, but no SelectItem with value `""` exists, causing Radix to crash.

### 2. TransferFormPage StoreSelector Mismatch
The transfer form uses `StoreSelector` with `value={fromStore || "all"}` but does not pass `showAll={true}`. When no store is selected, the Select value is "all" but there is no "All Warehouses" option rendered, which can cause a visual mismatch or crash.

### 3. Missing Seed Data
Only "Central Warehouse" entries exist per branch. The plan called for additional demo stores (Medical, Surgical, Pharmacy, Equipment) to enable proper testing.

---

## Fixes

### Fix 1: StoreFormPage.tsx -- Safe Select defaults
- Change `branch_id` default to `profile?.branch_id || "none"` and add a disabled placeholder `<SelectItem value="none">Select branch</SelectItem>` at the top of the branch selector
- The `manager_id` already uses `"none"` fallback, so it is fine
- Alternatively, simply use `defaultValue={undefined}` and rely on the placeholder text, but Radix requires a matching value. The safest approach is to use a sentinel value like `"none"` or `"placeholder"` when no real value is selected, then strip it before submitting

**Specific changes in StoreFormPage.tsx:**
- Line 101: Change `branch_id: profile?.branch_id || ""` to `branch_id: profile?.branch_id || ""`  -- actually the issue is that empty string has no matching SelectItem. Fix by adding a guard: if branches are loading and branch_id is empty, provide a placeholder SelectItem
- Better fix: Add `<SelectItem value="" disabled>Select a branch</SelectItem>` -- but Radix disallows empty string values
- Best fix: Change default to a sentinel value `"__none__"` and strip it in onSubmit, OR conditionally render the Select only when branches are loaded and set the first branch as default

**Chosen approach**: 
- Default `branch_id` to `""` but wrap the Select `value` with `field.value || undefined` so Radix shows the placeholder instead of trying to match an empty string
- Actually Radix Select requires `value` to be a string. The cleanest fix: default to `"none"`, add a disabled `<SelectItem value="none">` placeholder, and strip "none" in validation

### Fix 2: TransferFormPage.tsx -- StoreSelector usage
- The `StoreSelector` component already defaults to `value || "all"` internally, but when `showAll` is false, there is no "all" option in the list
- Fix: In TransferFormPage, do not pass `value={fromStore || "all"}`, instead pass `value={fromStore}` and let StoreSelector handle it. Or better: update StoreSelector to not default to "all" when showAll is false

**Specific changes:**
- In StoreSelector.tsx: Change `value={value || "all"}` to only use "all" when showAll is true: `value={showAll ? (value || "all") : value}`
- In TransferFormPage.tsx: Pass the raw value without "all" fallback

### Fix 3: Seed additional demo warehouses (SQL migration)
Insert 4 additional stores for the first branch of the demo organization:
- Medical Store (type: medical, code: MED-01)
- Surgical Store (type: surgical, code: SURG-01)  
- Pharmacy Store (type: pharmacy, code: PHAR-01)
- Equipment Store (type: equipment, code: EQUIP-01)

---

## Technical Details

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/app/inventory/StoreFormPage.tsx` | Fix branch_id default and Select value handling to prevent Radix crash |
| `src/components/inventory/StoreSelector.tsx` | Fix default value logic when `showAll` is false |
| `src/pages/app/inventory/TransferFormPage.tsx` | Remove `"all"` fallback from StoreSelector value props |

### Database Migration
- INSERT 4 demo stores for each existing branch (Medical, Surgical, Pharmacy, Equipment)

### Implementation Order
1. Fix StoreFormPage Select crash
2. Fix StoreSelector default value logic
3. Fix TransferFormPage StoreSelector usage
4. Run seed migration for demo stores
