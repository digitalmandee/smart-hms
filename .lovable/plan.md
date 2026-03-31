
Goal: Fix “Create PO” action so it always gives clear feedback, creates the PO reliably, and shows medicine/vendor data correctly (EN/AR/UR).

What I verified
- Current requisition `24620017-5c23-4808-8873-67e9be6d32d3` is valid and has a medicine item (`Augmentin 625mg`).
- `purchase_order_items` supports medicine rows (`medicine_id` exists, `item_id` nullable, `item_type` check allows `medicine`).
- No backend error evidence was captured for the click, which strongly suggests a client-side blocked submit (validation/UI feedback issue) instead of a DB schema failure.

Implementation plan

1) Make submit failures visible (no more “nothing happens”)
- File: `src/pages/app/inventory/POFormPage.tsx`
- Use `form.handleSubmit(onSubmit, onInvalid)` and add a form-level error box above the Create button.
- On invalid submit, show exact reason (missing vendor/branch/items) and auto-scroll/focus first invalid field.
- Keep toast, but also show inline error text near submit for mobile users.

2) Harden PO item normalization before create
- File: `src/hooks/usePurchaseOrders.ts`
- Before insert, normalize each row:
  - infer `item_type` from ids if missing
  - enforce exactly one reference (`medicine_id` xor `item_id`)
  - quantity > 0, unit_price >= 0
- Return row-numbered messages (e.g., “Row 1: Medicine reference missing”).
- Keep orphan PO cleanup logic on item insert failure.

3) Remove “Unknown Medicine” fallback gaps
- Files: `src/pages/app/inventory/POFormPage.tsx`, `src/components/inventory/UnifiedPOItemsBuilder.tsx`
- Ensure prefilled requisition/PR rows always carry nested `medicine` / `item` object.
- In item builder, add reliable id-based fallback lookup for names/codes/units so prefilled medicine names never show “Unknown” when id is present.

4) Improve vendor flow for PO creation
- Files: `src/pages/app/inventory/POFormPage.tsx`, `src/pages/app/inventory/VendorDetailPage.tsx`
- Keep `vendor_id` and legacy `vendorId` support.
- Add quick actions near vendor selector: Add Vendor / Edit Vendor (open in new tab or route-safe navigation).
- Show vendor summary (contact/phone/payment terms) after selection for record quality.

5) 3-language coverage
- Files: `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts`
- Add keys for:
  - form-level submit errors
  - row validation errors
  - unknown item/medicine fallback
  - vendor quick-action labels

Technical details
- No DB migration is required for this fix path (schema already supports medicine PO items).
- Main code paths touched:
  - `POFormPage` (submit UX + invalid handler + hydration reliability)
  - `usePurchaseOrders` (strict row validation + safer error messaging)
  - `UnifiedPOItemsBuilder` (name fallback robustness)
  - translations (EN/AR/UR)

Verification checklist
1. Open requisition → Create PO.
2. Medicine name is visible (not “Unknown”).
3. Select vendor and submit with valid rows → PO created and navigates to PO detail.
4. Try invalid submit (no vendor / bad qty) → clear inline error + toast appears.
5. Repeat in English, Urdu, Arabic.
