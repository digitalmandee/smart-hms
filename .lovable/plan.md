

# Plan: Wire KSA Integration Components Into Actual Workflows

## Problem Found

All 5 KSA action components exist but **4 of them are orphaned** — never imported into any workflow page:

| Component | Where It Should Be | Currently Used? |
|---|---|---|
| `WasfatySubmitButton` | DispensingPage | **Yes** — already wired |
| `TatmeenScanButton` | DispensingPage (during dispensing) | **No** — orphaned |
| `NafathVerifyButton` | PatientDetailPage, PatientFormPage | **No** — orphaned |
| `SehhatyPushButton` | AppointmentDetailPage, LabResultEntryPage | **No** — orphaned |
| `HesnReportButton` | ConsultationPage (after diagnosis) | **No** — orphaned |

Additionally, patient profiles don't show Nafath verification status anywhere.

## Changes

### 1. PatientDetailPage — Add Nafath Verify + Status Badge
**File**: `src/pages/app/patients/PatientDetailPage.tsx`
- Import `NafathVerifyButton` and `useCountryConfig`
- Next to `national_id` display, show a "Nafath Verified" badge if `nafath_verified === true`, or a `NafathVerifyButton` if the patient has a `national_id` and country is SA
- Show `nafath_verified_at` timestamp when verified

### 2. DispensingPage — Add Tatmeen Scan Button
**File**: `src/pages/app/pharmacy/DispensingPage.tsx`
- Import `TatmeenScanButton`
- Add it next to the Wasfaty card (conditionally for SA orgs), allowing pharmacists to scan GS1 DataMatrix barcodes during dispensing for drug track & trace compliance

### 3. ConsultationPage — Add HESN Report Button
**File**: `src/pages/app/opd/ConsultationPage.tsx`
- Import `HesnReportButton` and `useCountryConfig`
- After diagnosis is entered and consultation is being saved/completed, show `HesnReportButton` conditionally (SA only) so doctors can report communicable diseases to MOH

### 4. AppointmentDetailPage — Add Sehhaty Push Button
**File**: `src/pages/app/appointments/AppointmentDetailPage.tsx`
- Import `SehhatyPushButton` and `useCountryConfig`
- When appointment status is `completed`, show a "Push to Sehhaty" button to sync the appointment to the patient's Sehhaty app

### 5. LabResultEntryPage — Add Sehhaty Push for Lab Results
**File**: `src/pages/app/lab/LabResultEntryPage.tsx`
- Import `SehhatyPushButton` and `useCountryConfig`
- When lab results are published (`is_published = true`), show "Push to Sehhaty" button to sync lab results

### 6. PatientFormPage — Show Nafath verification status on edit
**File**: `src/pages/app/patients/PatientFormPage.tsx`
- For SA patients with a national ID, show an info note about Nafath verification availability after registration

## Files Modified

| File | Change |
|---|---|
| `src/pages/app/patients/PatientDetailPage.tsx` | Add NafathVerifyButton + verification badge |
| `src/pages/app/pharmacy/DispensingPage.tsx` | Add TatmeenScanButton card |
| `src/pages/app/opd/ConsultationPage.tsx` | Add HesnReportButton |
| `src/pages/app/appointments/AppointmentDetailPage.tsx` | Add SehhatyPushButton |
| `src/pages/app/lab/LabResultEntryPage.tsx` | Add SehhatyPushButton for published results |

All additions are conditional on `country_code === 'SA'` so they only appear for Saudi organizations.

