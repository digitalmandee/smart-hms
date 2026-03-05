

# Phase 3: NPHIES Eligibility Auto-Check During Appointment Booking

## What This Does

When a receptionist selects a patient during appointment booking, the system will automatically fetch the patient's active insurance. If insurance exists, it will show an insurance status card with a one-click NPHIES eligibility check — **before** the appointment is confirmed.

## How It Works

```text
Patient Selected → Fetch patient_insurance → Insurance found?
  ├─ No insurance → Show "Self-pay" badge, proceed normally
  └─ Has insurance → Show Insurance Card with:
       ├─ Company, Plan, Policy #, Member ID
       ├─ Last eligibility status (if previously checked)
       ├─ "Verify Eligibility" button (triggers NPHIES check)
       └─ Result: Eligible ✅ or Not Eligible ❌
           ├─ Eligible → Green badge, proceed to book
           └─ Not Eligible → Warning banner, allow override
```

## Changes

### 1. New Component: `AppointmentInsuranceCheck.tsx`
A card that appears in the appointment form after patient selection:
- Fetches `patient_insurance` for the selected patient (using existing `usePatientInsurance` hook)
- Shows primary insurance details (company, plan, policy number)
- Displays last NPHIES check result if available
- Includes the `EligibilityCheckButton` for real-time verification
- Shows eligibility result inline (eligible/not eligible with coverage details)
- If not eligible, shows a warning but allows the user to proceed (override)

### 2. Update `AppointmentFormPage.tsx`
- Import and render `AppointmentInsuranceCheck` after the Patient Selection card
- Pass `selectedPatient?.id` to the component
- Track eligibility state to optionally show warnings on submit

### 3. Translations (EN/AR/UR)
Add keys for insurance check labels in the appointment context:
- "Patient Insurance", "Self-Pay Patient", "Verify Before Booking"
- "Insurance Verified", "Insurance Not Verified", "Coverage Warning"
- "Proceed Anyway", "No active insurance found"

## Files to Create/Change

| File | Action |
|------|--------|
| `src/components/appointments/AppointmentInsuranceCheck.tsx` | **New** — Insurance verification card for booking flow |
| `src/pages/app/appointments/AppointmentFormPage.tsx` | Add insurance check after patient selection |
| `src/lib/i18n/translations/en.ts` | Add appointment insurance check translations |
| `src/lib/i18n/translations/ar.ts` | Add Arabic translations |
| `src/lib/i18n/translations/ur.ts` | Add Urdu translations |

No database changes needed — uses existing `patient_insurance` table, `usePatientInsurance` hook, and `EligibilityCheckButton` component.

