

# Add Blood Bank Order Tab to OPD Consultation

## Problem
The OPD Consultation page has 5 tabs (Clinical, Rx, Labs, Imaging, AI) but **no Blood Bank tab**. Doctors cannot order blood products (cross-match, transfusion requests) during consultation. They must go to the standalone Blood Bank module separately.

## What to Build

### 1. New component: `BloodBankOrderBuilder.tsx`
- Component type selector (Whole Blood, Packed RBCs, FFP, Platelets, Cryoprecipitate) using the existing `blood_component_type` enum
- Blood group display from patient record
- Units required (number input)
- Priority selector (Routine/Urgent/Emergency) using existing `blood_request_priority` enum
- Clinical indication text field
- Hemoglobin level input
- Add/remove multiple blood product requests

### 2. Add "Blood" tab to ConsultationPage
- Change grid from `grid-cols-5` to `grid-cols-6`
- Add 6th tab with Droplets icon labeled "Blood"
- New state: `bloodBankItems` array
- On "Complete Consultation": insert each item into `blood_requests` table using existing `useCreateBloodRequest` from `useBloodBank.ts`
- Include blood requests in the `VisitSummaryDialog` confirmation

### 3. Update VisitSummaryDialog
- Add a "Blood Requests" section showing ordered blood products before the doctor confirms completion

### 4. Update OPDCheckoutPage
- Query `blood_requests` for the patient/consultation and display as a charge category

### 5. i18n keys (en, ur, ar)
- Add keys for: Blood Products, Blood Request, Component Type, Units Required, Clinical Indication, Hemoglobin Level, cross-match labels

## Technical Details

- The `blood_requests` table already exists with all required fields: `blood_group`, `component_type`, `units_requested`, `priority`, `clinical_indication`, `hemoglobin_level`, `requesting_department`, `requested_by`, `patient_id`, `organization_id`, `branch_id`
- The `useCreateBloodRequest` mutation already exists in `useBloodBank.ts`
- `request_number` is required — will generate using a pattern like `BR-{timestamp}`

## Files Changed
- `src/components/consultation/BloodBankOrderBuilder.tsx` — new component
- `src/pages/app/opd/ConsultationPage.tsx` — add Blood tab + save logic
- `src/components/consultation/VisitSummaryDialog.tsx` — show blood orders
- `src/pages/app/opd/OPDCheckoutPage.tsx` — add blood request charges
- `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts` — new keys

