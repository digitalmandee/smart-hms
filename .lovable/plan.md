

# Phase 2: NPHIES Integration with Patient Profile & Clinical Workflows

## Current Gaps

Phase 1 delivered the **NPHIES config panel**, **edge function**, and **EligibilityCheckButton** — but none of these are wired into the actual patient or clinical workflows:

1. **Patient Profile** has no Insurance tab — no way to see/manage patient insurance or check NPHIES eligibility from the profile
2. **EligibilityCheckButton** exists but is imported nowhere — it's an orphan component
3. **Claims table** has no NPHIES tracking fields (`nphies_claim_id`, `nphies_status`, `nphies_response`)
4. **Appointment booking** doesn't trigger eligibility checks
5. **No eligibility history** — results are shown in a dialog and lost

## Plan

### 1. Database: Add NPHIES tracking to claims + eligibility log table

**Migration:**
```sql
-- Add NPHIES fields to insurance_claims
ALTER TABLE insurance_claims 
  ADD COLUMN IF NOT EXISTS nphies_claim_id TEXT,
  ADD COLUMN IF NOT EXISTS nphies_status TEXT,
  ADD COLUMN IF NOT EXISTS nphies_response JSONB;

-- Eligibility verification log
CREATE TABLE IF NOT EXISTS nphies_eligibility_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  patient_insurance_id UUID REFERENCES patient_insurance(id),
  checked_at TIMESTAMPTZ DEFAULT now(),
  checked_by UUID REFERENCES auth.users(id),
  eligible BOOLEAN,
  status TEXT,
  coverage_start DATE,
  coverage_end DATE,
  plan_name TEXT,
  copay NUMERIC,
  deductible NUMERIC,
  benefits JSONB,
  raw_response JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE nphies_eligibility_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org eligibility logs"
  ON nphies_eligibility_logs FOR SELECT TO authenticated
  USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert own org eligibility logs"
  ON nphies_eligibility_logs FOR INSERT TO authenticated
  WITH CHECK (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Add verification fields to patient_insurance
ALTER TABLE patient_insurance
  ADD COLUMN IF NOT EXISTS nphies_eligible BOOLEAN,
  ADD COLUMN IF NOT EXISTS nphies_last_checked TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS nphies_coverage_end DATE;
```

### 2. New Component: `PatientInsuranceTab`

Create `src/components/patients/PatientInsuranceTab.tsx` — a new tab for the Patient Profile that shows:
- List of patient's insurance policies (from `patient_insurance`)
- Each policy card shows: company, plan, policy number, member ID, CCHI number, status
- **"Check Eligibility" button** per policy (uses existing `EligibilityCheckButton`)
- Last eligibility check result & timestamp
- Eligibility verification history (from `nphies_eligibility_logs`)
- Link to add new insurance

### 3. Wire Insurance Tab into Patient Profile

**`src/pages/app/patients/PatientDetailPage.tsx`:**
- Add `Shield` icon import
- Add new `TabsTrigger value="insurance"` between Billing and Certificates tabs
- Add `TabsContent value="insurance"` rendering `<PatientInsuranceTab patientId={patient.id} />`
- Also add to mobile view's `tabContent` map

### 4. Update EligibilityCheckButton to Save Results

**`src/components/insurance/EligibilityCheckButton.tsx`:**
- After successful eligibility check, save result to `nphies_eligibility_logs`
- Update `patient_insurance` record with `nphies_eligible`, `nphies_last_checked`, `nphies_coverage_end`
- Accept optional `onResult` callback so parent components can react

### 5. Update Edge Function to Return Richer Data

**`supabase/functions/nphies-gateway/index.ts`:**
- In the eligibility response, also save the log server-side for audit trail
- No major changes needed — the current FHIR parsing is already structured correctly

### 6. Translations (EN/AR/UR)

Add keys for the new Insurance tab and eligibility history labels.

## Files to Create/Change

| File | Action |
|------|--------|
| DB migration | Add NPHIES fields to claims, create eligibility logs table, add fields to patient_insurance |
| `src/components/patients/PatientInsuranceTab.tsx` | **New** — Insurance tab with eligibility checks & history |
| `src/pages/app/patients/PatientDetailPage.tsx` | Add Insurance tab trigger + content |
| `src/components/insurance/EligibilityCheckButton.tsx` | Save results to DB, add onResult callback |
| `src/hooks/useInsurance.ts` | Add `useEligibilityLogs` hook |
| `src/lib/i18n/translations/en.ts` | Add insurance tab translations |
| `src/lib/i18n/translations/ar.ts` | Add Arabic translations |
| `src/lib/i18n/translations/ur.ts` | Add Urdu translations |

