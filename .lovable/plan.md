

# Pharmacy Queue: OPD/IPD Orders — Current State & Gaps

## What Already Works

1. **Prescription Queue** — `usePrescriptionQueue` fetches ALL prescriptions with status `created`/`partially_dispensed` from the branch. Both OPD and IPD prescriptions appear here since they're all in the same `prescriptions` table.

2. **Dispensing Flow** — `useDispensePrescription` already:
   - Checks if the patient has an active admission (IPD)
   - Deducts inventory stock
   - Creates `ipd_charges` for admitted patients automatically
   - For OPD patients, just dispenses normally (charges go through OPD checkout)

3. **OPD Checkout** — `OPDCheckoutPage` fetches prescriptions linked to the consultation and includes pharmacy charges in the final bill.

4. **IPD Billing** — IPD charges are auto-created when dispensing to admitted patients.

## What's Missing

1. **No OPD/IPD source badge** — The prescription queue doesn't show whether an order is OPD or IPD. Pharmacist has no visual way to know the source.

2. **No admission/ward info in queue** — For IPD prescriptions, pharmacy should see bed/ward so they can deliver meds to the right place.

3. **No filter by source** — Can't filter queue by OPD vs IPD orders.

4. **No priority indicator** — IPD urgent orders look the same as routine OPD prescriptions.

## Plan

### 1. Add OPD/IPD source badge to Prescription Queue
**File: `src/pages/app/pharmacy/PrescriptionQueuePage.tsx`**
- Add a "Source" column after the patient column
- Query active admissions for each patient to determine if they're IPD
- Show badge: **OPD** (blue) or **IPD** (orange) with ward/bed info for IPD patients

### 2. Add source detection to `usePrescriptionQueue`
**File: `src/hooks/usePharmacy.ts`**
- After fetching prescriptions, batch-query `admissions` table for all patient IDs with `status = 'admitted'`
- Merge admission info (ward, bed) into each prescription queue item
- Add `source: 'opd' | 'ipd'` and optional `admission?: { ward, bed }` to `PrescriptionQueueItem`

### 3. Add source filter to queue page
**File: `src/pages/app/pharmacy/PrescriptionQueuePage.tsx`**
- Add a third filter dropdown: "All Sources" / "OPD Only" / "IPD Only"
- Filter the queue based on the `source` field

### 4. Show ward/bed delivery info on Dispensing Page
**File: `src/pages/app/pharmacy/DispensingPage.tsx`**
- Already has `usePatientActiveAdmission` — just needs to display ward/bed prominently in the header when patient is IPD
- Add "IPD Patient — Ward: X, Bed: Y" banner at top

### 5. i18n updates
**Files: `en.ts`, `ar.ts`, `ur.ts`**
- Keys: "Source", "OPD", "IPD", "All Sources", "OPD Only", "IPD Only", "Ward", "Bed", "Deliver to Ward"

## Files Changed
- `src/hooks/usePharmacy.ts` — add admission lookup to queue, extend `PrescriptionQueueItem` type
- `src/pages/app/pharmacy/PrescriptionQueuePage.tsx` — source column, source filter
- `src/pages/app/pharmacy/DispensingPage.tsx` — IPD delivery banner
- `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts` — new keys

