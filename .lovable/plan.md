

# Fix: Aging Report Shows All Zeros + Remove "CFO" Text

## Root Cause

The **insurance_claims query fails with 400 error**, which causes the entire `queryFn` to throw (line 173: `if (clErr) throw clErr`). Since the query throws, React Query treats the whole result as an error and the UI falls back to default zeros.

**Why it fails**: The Supabase join `patient_insurance(insurance_company:insurance_companies(name))` is invalid. `patient_insurance` has no FK to `insurance_companies`. The actual path is:

```text
insurance_claims → patient_insurance → insurance_plans → insurance_companies
```

So the correct nested join is:
```
patient_insurance:patient_insurance(
  patient:patients(first_name, last_name),
  insurance_plan:insurance_plans(
    insurance_company:insurance_companies(name)
  )
)
```

## Changes

### 1. Fix insurance_claims query in `src/hooks/useAgingReport.ts`

**Line 166-169**: Replace the broken join with the correct 3-level path through `insurance_plans`:
```
patient_insurance:patient_insurance(
  patient:patients(first_name, last_name),
  insurance_plan:insurance_plans(
    insurance_company:insurance_companies(name)
  )
)
```

**Line 185**: Update the insurer name extraction to traverse the new path:
```
pi?.insurance_plan?.insurance_company?.name || "Unknown"
```

### 2. Remove "CFO" text from translations

**3 files** — update `aging.subtitle` key:

- `src/lib/i18n/translations/en.ts`: Change to `"Receivable tracking with department & insurance breakdown"`
- `src/lib/i18n/translations/ur.ts`: Remove "CFO" from Urdu subtitle
- `src/lib/i18n/translations/ar.ts`: Remove "CFO" from Arabic subtitle
- Also remove "CFO" from `demo.step.accountsDashboard.talk` in en.ts and ur.ts

### 3. Remove fallback "CFO" text in `src/pages/app/accounts/ReceivablesPage.tsx`

**Line 145**: Update the fallback string from `"CFO-grade receivable tracking..."` to `"Receivable tracking with department & insurance breakdown"`

## Files to Change
- `src/hooks/useAgingReport.ts` — fix insurance_claims join path
- `src/pages/app/accounts/ReceivablesPage.tsx` — remove CFO from fallback
- `src/lib/i18n/translations/en.ts` — remove CFO from 2 keys
- `src/lib/i18n/translations/ur.ts` — remove CFO from 2 keys
- `src/lib/i18n/translations/ar.ts` — remove CFO from 1 key

