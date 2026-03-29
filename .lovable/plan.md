

# Add Test Share (Lab & Radiology Referral Earnings) for Doctors

## Current State

- The `doctor_compensation_plans` table has `lab_referral_percent` but **no `radiology_referral_percent`** column
- The database trigger `auto_create_doctor_earnings` **only processes consultation items** — it explicitly skips anything that doesn't match `%consultation%` in the description
- The wallet UI already has labels for `lab_referral` and `radiology_referral` source types, but they never get populated because the trigger ignores test orders
- The compensation form (EmployeeFormPage, DoctorCompensationForm, DoctorCompensationPage) only shows Lab Referral % — no Radiology Referral %

## What Changes

### Step 1: Database Migration — Add `radiology_referral_percent` column + Update trigger

**Add column:**
```sql
ALTER TABLE doctor_compensation_plans 
  ADD COLUMN IF NOT EXISTS radiology_referral_percent numeric DEFAULT 0;
```

**Rewrite the `auto_create_doctor_earnings` trigger function** to handle 3 source types:
1. **Consultation** — items with description matching `%consultation%` → uses `consultation_share_percent`
2. **Lab Referral** — items with description matching `%lab%` or `%test%` or `%pathology%` → uses `lab_referral_percent`
3. **Radiology Referral** — items with description matching `%radiology%` or `%imaging%` or `%x-ray%` or `%mri%` or `%ct%` or `%ultrasound%` → uses `radiology_referral_percent`

Each type creates a separate `doctor_earnings` row with the appropriate `source_type` and share percentage. Duplicate check updated to include `source_type` in the uniqueness check (currently only checks `source_id + doctor_id`).

### Step 2: Compensation Plan Forms — Add Radiology Referral % field

**Files to update:**
- `src/components/hr/DoctorCompensationForm.tsx` — Add a "Radiology Referrals" card section (identical to Lab Referrals card) with `radiology_referral_percent` field
- `src/pages/app/hr/payroll/DoctorCompensationPage.tsx` — Add `radiology_referral_percent` to form state, reset, and edit loading
- `src/pages/app/hr/EmployeeFormPage.tsx` — Add `radiology_referral_percent` to schema and plan submission
- `src/hooks/useDoctorCompensation.ts` — Add `radiology_referral_percent` to the `DoctorCompensationPlan` interface and `useCreateCompensationPlan` insert

### Step 3: Wallet Balances Page — Add lab/radiology breakdown columns

**File:** `src/pages/app/hr/payroll/DoctorWalletBalancesPage.tsx`
- Add `labReferrals` and `radiologyReferrals` fields to `DoctorBalance` interface
- Map `lab_referral` and `radiology_referral` source types in the switch statement (currently fall to `other`)
- Add columns in the table for Lab Referrals and Radiology Referrals amounts

### Step 4: Multilingual labels (EN/UR/AR)

Add translation keys for:
- `test_share`, `lab_referral_percent`, `radiology_referral_percent`
- Column headers and form labels in all 3 languages

## Technical Details

- The trigger change is the critical piece — without it, no lab/radiology earnings are ever auto-created
- The duplicate check becomes: `WHERE source_id = inv.id AND doctor_id = v_doctor_id AND source_type = <type>`
- Invoice items created during OPD checkout already have descriptions like "CBC Test", "X-Ray Chest" etc., so the pattern matching will catch them
- No changes needed to the checkout flow itself — the trigger fires on payment INSERT regardless

