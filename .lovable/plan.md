

# Phase 4: NPHIES Electronic Claim Submission + Saudi Payer Codes

## Part A: NPHIES Claim Submission

### What This Does
When a user clicks "Submit Claim" on the ClaimDetailPage, the system will automatically build an HL7 FHIR `Claim` bundle and submit it to NPHIES via the existing `nphies-gateway` edge function. The response (approval/rejection/pending) is stored on the `insurance_claims` record using the existing `nphies_claim_id`, `nphies_status`, and `nphies_response` columns.

### Flow
```text
User clicks "Submit to NPHIES" on ClaimDetailPage
  → Frontend calls nphies-gateway with action: "submit_claim"
  → Edge function:
      1. OAuth2 authenticate with NPHIES
      2. Fetch claim + items + patient + insurance data
      3. Build FHIR Claim Bundle (MessageHeader + Claim resource)
      4. POST to NPHIES /nphies/fhir
      5. Parse ClaimResponse from FHIR response
      6. Update insurance_claims with nphies_claim_id, nphies_status, nphies_response
      7. Return result to frontend
  → Frontend shows result (accepted/rejected/pending) + updates UI
```

### Changes

**1. Edge Function: `nphies-gateway/index.ts`** — Add `submit_claim` action
- Fetches full claim data (claim + items + patient + insurance company CCHI code)
- Builds FHIR `Claim` Bundle with proper NPHIES coding (diagnosis, items, totals)
- Submits to NPHIES and parses `ClaimResponse`
- Updates `insurance_claims` row with `nphies_claim_id`, `nphies_status`, `nphies_response`

**2. New hook: `useSubmitClaimToNphies`** in `src/hooks/useNphiesConfig.ts`
- Mutation that calls `nphies-gateway` with `action: "submit_claim"` and `claim_id`
- On success, invalidates claim queries and shows toast

**3. Update `ClaimDetailPage.tsx`**
- Add "Submit to NPHIES" button (shown when claim status is `draft` or `submitted` and NPHIES is enabled)
- Show NPHIES status card when `nphies_status` is set (with claim ID, status, timestamp)
- Display NPHIES response details (adjudication outcome)

**4. Update `InsuranceClaim` type** in `useInsurance.ts`
- Add `nphies_claim_id`, `nphies_status`, `nphies_response` fields to the interface

---

## Part B: Pre-populate Saudi Insurance Payer Codes

### What This Does
Seed the system with major Saudi insurance companies and their CCHI payer codes so organizations don't have to manually enter them. This will be a **data insert** (not migration) using a utility or edge function approach.

Since insurance companies are per-organization, we'll create a **"Populate Saudi Payers"** button in the Insurance Companies page that inserts the standard Saudi payers for the current organization.

### Saudi Payers to Include
| Company | CCHI Code | NPHIES Payer ID |
|---------|-----------|-----------------|
| Bupa Arabia | 801 | INS-BUPA |
| Tawuniya | 802 | INS-TAWUNIYA |
| MedGulf | 803 | INS-MEDGULF |
| ACIG | 804 | INS-ACIG |
| Malath Insurance | 805 | INS-MALATH |
| Walaa Insurance | 806 | INS-WALAA |
| Al Rajhi Takaful | 807 | INS-ALRAJHI |
| GlobeMed Saudi | 808 | INS-GLOBEMED |
| SAICO | 809 | INS-SAICO |
| Arabian Shield | 810 | INS-ARABSHIELD |

### Changes

**5. New component: `PopulateSaudiPayersButton.tsx`**
- Button component that inserts the Saudi payer list for the current org
- Checks for duplicates (by `cchi_payer_code`) before inserting
- Shows count of added vs skipped

**6. Update `InsuranceCompaniesPage.tsx`**
- Add the populate button in the page header actions

---

## Part C: Translations (EN/AR/UR)

Add keys for:
- NPHIES claim submission labels ("Submit to NPHIES", "NPHIES Status", "Claim Accepted", "Claim Rejected", "Pending Review")
- Saudi payer population ("Populate Saudi Payers", "X payers added", "Already exists")

## Files to Create/Change

| File | Action |
|------|--------|
| `supabase/functions/nphies-gateway/index.ts` | Add `submit_claim` action with FHIR Claim bundle |
| `src/hooks/useNphiesConfig.ts` | Add `useSubmitClaimToNphies` mutation |
| `src/hooks/useInsurance.ts` | Add NPHIES fields to `InsuranceClaim` interface |
| `src/pages/app/billing/ClaimDetailPage.tsx` | Add NPHIES submit button + status display |
| `src/components/insurance/PopulateSaudiPayersButton.tsx` | **New** — Saudi payer seeding button |
| `src/pages/app/billing/InsuranceCompaniesPage.tsx` | Add populate button |
| `src/lib/i18n/translations/en.ts` | Add claim submission + payer translations |
| `src/lib/i18n/translations/ar.ts` | Add Arabic translations |
| `src/lib/i18n/translations/ur.ts` | Add Urdu translations |

No database schema changes needed — `nphies_claim_id`, `nphies_status`, `nphies_response` already exist on `insurance_claims`.

