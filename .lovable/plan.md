
## Goal
Fix PO-from-requisition flow so medicine names show correctly, prices/quantities are editable, PO actually saves, and vendor records are maintained properly.

## What I found (root causes)
1. **Unknown medicine name**: `POFormPage` pre-fills items with IDs only; `UnifiedPOItemsBuilder` displays `item.medicine?.name` / `item.item?.name`, so prefilled medicine rows show **Unknown Medicine**.
2. **Cannot change vendor price/quantity**: existing rows in `UnifiedPOItemsBuilder` are read-only text; only the “new row” is editable.
3. **PO not created (user-facing)**: form gives weak feedback when required fields/rows are invalid; also vendor prefill has a parameter mismatch (`vendorId` vs `vendor_id`) causing confusion.
4. **Vendor profile maintenance**: vendor module exists, but PO flow does not tightly connect to vendor master maintenance and record quality.

## Implementation plan
### 1) Fix medicine/item hydration for prefilled PO rows
**Files**
- `src/pages/app/inventory/POFormPage.tsx`
- `src/hooks/usePurchaseRequests.ts`
- `src/pages/app/inventory/PRDetailPage.tsx`

**Changes**
- While mapping `sourcePR` / `sourceRequisition` to PO items, include nested `medicine`/`item` object (name, generic, unit) in each row.
- Normalize IDs: use `undefined/null` (not empty string) for non-applicable refs.
- In `usePurchaseRequest`, fetch medicine relation too (`medicine:medicines(...)`) so PR-based PO prefill gets proper medicine names.
- Update PR detail item rendering to show medicine fallback (`item.medicine?.name || item.item?.name`).

### 2) Make existing PO rows editable (price + quantity + tax + discount)
**File**
- `src/components/inventory/UnifiedPOItemsBuilder.tsx`

**Changes**
- Convert existing row cells (Qty, Unit Price, Tax, Disc) from static text to editable inputs when `disabled !== true`.
- Recalculate `total_price` live per row after edits.
- Keep delete action.
- Keep type badge and robust name fallback by ID lookup if nested object is missing.
- Preserve mobile usability (horizontal overflow wrapper if needed).

### 3) Harden PO create validation + clearer errors
**Files**
- `src/hooks/usePurchaseOrders.ts`
- `src/pages/app/inventory/POFormPage.tsx`

**Changes**
- Before insert, normalize each row:
  - `item_type = item.item_type ?? (item.medicine_id ? "medicine" : "inventory")`
  - enforce valid ref by type (medicine needs `medicine_id`, inventory needs `item_id`)
- Validate quantity > 0 and unit price >= 0 (optionally require > 0 for requisition-converted rows).
- Return user-friendly errors with row number + reason.
- Keep orphan-header cleanup already present.
- Add inline form-level error surface in PO form (not toast-only).

### 4) Fix vendor linkage and improve vendor maintenance flow
**Files**
- `src/pages/app/inventory/POFormPage.tsx`
- `src/pages/app/inventory/VendorDetailPage.tsx`
- `src/pages/app/inventory/VendorFormPage.tsx` (minor UX only if needed)

**Changes**
- Accept both query params: `vendor_id` and legacy `vendorId`.
- Fix Vendor Detail “Create PO” link to use `vendor_id`.
- Add clear “Add Vendor / Edit Vendor” shortcut from PO form so users can maintain vendor profile without losing PO context.
- Keep vendor records complete using existing profile + documents + history screens, with stronger required field guidance (name/contact/phone).

### 5) 3-language support for all new labels/messages
**Files**
- `src/lib/i18n/translations/en.ts`
- `src/lib/i18n/translations/ar.ts`
- `src/lib/i18n/translations/ur.ts`

**Add keys**
- Unknown medicine/item fallback, validation messages, editable row labels, add/edit vendor shortcuts, and PO error hints.

## Verification checklist (must pass)
1. Open requisition with medicine item → Create PO.
2. PO form shows actual medicine name (not Unknown).
3. Edit quantity + vendor unit price directly on prefilled row.
4. Select vendor and submit → PO is created and navigates to PO detail.
5. PO detail + print show medicine names correctly.
6. Vendor link from vendor profile preselects vendor in PO form.
7. Same flow works in English, Urdu, and Arabic.
