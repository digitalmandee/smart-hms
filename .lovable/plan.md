

# NPHIES Claim Resubmission Workflow with Rejection Tracking & Auto-Correction

## Current State
- `ClaimDetailPage` has a basic resubmit button that clears NPHIES data and resubmits
- `NphiesRejectionDetails` component parses `ClaimResponse.error[]` and `processNote[]` from `nphies_response`
- No `denial_reasons` or `resubmission_count` columns on `insurance_claims`
- No structured denial code mapping or correction suggestions
- Edge function stores raw `nphies_response` but doesn't extract denial codes

## Changes

### 1. Database: Add denial tracking columns
Add to `insurance_claims`:
- `denial_reasons jsonb DEFAULT NULL` — parsed array of `{code, display, category, suggested_action}`
- `resubmission_count integer DEFAULT 0` — tracks how many times claim was resubmitted

### 2. Edge Function: Parse & store denial reasons
In `nphies-gateway/index.ts`, after receiving `ClaimResponse` in both `submit_claim` and `check_claim_status`:
- Extract `error[]` codes, `adjudication[].reason`, and `processNote[]`
- Map to structured `denial_reasons` array with suggested corrections
- Store in the new column alongside `nphies_response`
- Increment `resubmission_count` when resubmitting a previously rejected claim

### 3. New Component: `DenialManagementPanel.tsx`
Replace the simple `NphiesRejectionDetails` with a comprehensive panel:
- Shows each denial reason with NPHIES code, description, severity
- Maps common NPHIES denial codes to auto-correction suggestions (e.g., "Missing diagnosis" → "Add ICD-10 codes", "Invalid member ID" → "Verify insurance details")
- Shows resubmission count and history
- "Edit & Resubmit" button that opens editable fields for the claim before resubmitting

### 4. NPHIES Denial Code Map
New utility `src/lib/nphiesDenialCodes.ts` with ~20 common Saudi NPHIES rejection codes mapped to:
- Code + display text (EN/AR/UR)
- Category (clinical, administrative, eligibility, coding)
- Suggested corrective action

### 5. Update ClaimDetailPage
- Replace `NphiesRejectionDetails` with `DenialManagementPanel`
- Add edit-before-resubmit dialog (edit ICD codes, notes, service codes)
- Show resubmission count badge
- Track resubmission in `handleResubmitToNphies` by incrementing counter

### 6. Translations
Add EN/AR/UR keys for denial panel labels, correction suggestions, resubmission UI.

## Files

| File | Action |
|------|--------|
| SQL migration | Add `denial_reasons`, `resubmission_count` to `insurance_claims` |
| `supabase/functions/nphies-gateway/index.ts` | Parse denial codes, store structured reasons, increment resubmit count |
| `src/lib/nphiesDenialCodes.ts` | **New** — denial code map with corrections |
| `src/components/insurance/DenialManagementPanel.tsx` | **New** — structured denial display + edit & resubmit |
| `src/pages/app/billing/ClaimDetailPage.tsx` | Integrate DenialManagementPanel, edit-before-resubmit |
| `src/lib/i18n/translations/{en,ar,ur}.ts` | Add denial/resubmission translations |
| `src/integrations/supabase/types.ts` | Auto-updated after migration |

