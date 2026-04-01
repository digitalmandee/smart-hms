

# IPD Admission Workflow Overhaul — Procedure-Based Admission, Child Gender, Guardian, Split Payment

## Summary

Three major changes to the admission workflow:
1. Add "Child" gender option with auto-appearing Guardian fields
2. Make admission procedure-based (mandatory procedure + doctor) instead of just ward/bed
3. Add split payment support in the payment dialog

## Current State

- **Gender enum** in DB: `male`, `female`, `other` — no `child` value
- **Patient table**: no `guardian_name`, `guardian_phone`, `guardian_relation` columns
- **Admissions table**: no `primary_procedure_id` or `procedure_charge` columns
- **Service types table** has `category = 'procedure'` with existing procedure records (Surgeon Fee, Anesthesia, etc.)
- **AdmissionPaymentDialog** uses single `PaymentMethodSelector` — no split payment
- **Admission form** requires ward but doctor is optional, no procedure field

## Plan

### 1. Database Migration

**Alter gender enum**: Add `'child'` to the `gender` enum type.

**Add patient guardian columns**:
```text
patients:
  + guardian_name TEXT
  + guardian_phone TEXT  
  + guardian_relation TEXT
```

**Add admission procedure columns**:
```text
admissions:
  + primary_procedure_id UUID REFERENCES service_types(id)
  + procedure_charges NUMERIC DEFAULT 0
```

### 2. Patient Registration — Child Gender + Guardian

**Files**: `PatientFormPage.tsx`, `QuickPatientModal.tsx`, `OPDWalkInPage.tsx`, `ClinicTokenPage.tsx`

- Add `"child"` to gender enum options in all patient forms
- When gender = `"child"`, show 3 guardian fields: Guardian Name, Guardian Phone, Guardian Relation (dropdown: Father, Mother, Grandparent, Other)
- Update zod schemas to include `guardian_name`, `guardian_phone`, `guardian_relation`
- Save guardian fields to the patients table

### 3. Admission Form — Procedure-Based + Mandatory Doctor

**File**: `AdmissionFormPage.tsx`

- Add **Primary Procedure** dropdown (mandatory) — populated from `service_types` where `category = 'procedure'`
- When procedure selected, show its charge and auto-add to estimated cost
- Make **Attending Doctor** mandatory (change schema from optional to required)
- Keep Ward & Bed section (room assignment is still needed) but rename card to "Procedure & Room Assignment"
- Add procedure charge to `ipd_charges` on admission creation
- Update zod schema: `primary_procedure_id: z.string().min(1)`, `attending_doctor_id: z.string().min(1)`

### 4. Split Payment in Payment Dialog

**File**: `AdmissionPaymentDialog.tsx`

- Add "Split Payment" toggle above the payment method selector
- When enabled, show multiple payment rows: each row has Amount + Payment Method + Reference
- Add "Add Another Method" button
- Total of all splits must equal the payment amount
- Pass array of payment splits to `onPaymentComplete`

**File**: `PaymentModeSelector.tsx` — no changes needed (this is cash/insurance/corporate mode, not payment method)

### 5. Translations (en.ts, ar.ts, ur.ts)

New keys:
- `gender.child` — Child / طفل / بچہ
- `patient.guardianName` — Guardian Name / اسم الوصي / سرپرست کا نام
- `patient.guardianPhone` — Guardian Phone / هاتف الوصي / سرپرست کا فون
- `patient.guardianRelation` — Guardian Relation / علاقة الوصي / سرپرست کا رشتہ
- `admission.primaryProcedure` — Primary Procedure / الإجراء الرئيسي / بنیادی طریقہ کار
- `admission.procedureCharges` — Procedure Charges / رسوم الإجراء / طریقہ کار کے چارجز
- `billing.splitPayment` — Split Payment / دفع مقسم / تقسیم ادائیگی
- `billing.addPaymentMethod` — Add Another Method / إضافة طريقة أخرى / مزید ادائیگی کا طریقہ

## Files Changed

- `supabase/migrations/new.sql` — enum alter, patient columns, admission columns
- `src/pages/app/patients/PatientFormPage.tsx` — child gender + guardian fields
- `src/components/appointments/QuickPatientModal.tsx` — child gender + guardian
- `src/pages/app/opd/OPDWalkInPage.tsx` — child gender + guardian
- `src/pages/app/clinic/ClinicTokenPage.tsx` — child gender + guardian
- `src/pages/app/ipd/AdmissionFormPage.tsx` — procedure selector, mandatory doctor, procedure charge on admission
- `src/components/ipd/AdmissionPaymentDialog.tsx` — split payment UI
- `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts` — new labels

