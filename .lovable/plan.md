

# Phase 5: NPHIES Enhancements — Pre-Authorization, Dashboard, and Claim Resubmission

## What's Already Done (Phases 1-4)
- NPHIES config panel + edge function (test, eligibility, submit_claim)
- Patient profile insurance tab with eligibility checks + history
- Appointment booking insurance auto-check
- Claim submission to NPHIES with FHIR bundle + status tracking
- Saudi payer seeding (10 companies)

## Enhancement Areas

### 1. NPHIES Pre-Authorization Workflow
The DB already has `pre_auth_number`, `pre_auth_date`, `pre_auth_status` columns on `insurance_claims`. The claim form has pre-auth fields. But there's no **automated NPHIES pre-auth request** — it's all manual entry.

**Add:**
- New `submit_preauth` action in `nphies-gateway` edge function — builds a FHIR `Claim` with `use: "preauthorization"` and submits to NPHIES
- `useSubmitPreAuth` hook in `useNphiesConfig.ts`
- "Request Pre-Auth" button on `ClaimFormPage` and `ClaimDetailPage` — submits pre-auth to NPHIES, stores response in `pre_auth_number`, `pre_auth_status`
- Pre-auth status badges (approved/pending/denied) on claim cards

### 2. NPHIES Insurance Dashboard Widget
The Billing Dashboard exists but has zero NPHIES/insurance metrics.

**Add a new `NphiesDashboardCard` component** rendered on `BillingDashboard.tsx`:
- Claims submitted to NPHIES (total count)
- Approved / Rejected / Pending breakdown (pie or bar chart using recharts)
- Eligibility checks performed (last 30 days)
- Total approved amount from NPHIES
- Quick-action links to Claims List, NPHIES Settings

### 3. Claim Resubmission + Error Details
Currently if a claim is rejected, there's no way to fix and resubmit.

**Add:**
- "Resubmit to NPHIES" button on rejected claims in `ClaimDetailPage`
- Display NPHIES rejection reasons from `nphies_response` JSON (adjudication notes, error codes)
- Clear `nphies_claim_id` on resubmission to allow fresh tracking

### 4. NPHIES Claim Status Polling
Claims submitted as "pending" have no follow-up mechanism.

**Add:**
- New `check_claim_status` action in `nphies-gateway` — queries NPHIES for claim status update
- "Refresh Status" button on pending claims in `ClaimDetailPage`

### 5. Translations (EN/AR/UR)
Add all new keys for pre-auth, dashboard widget, resubmission, and status polling labels.

## Files to Create/Change

| File | Action |
|------|--------|
| `supabase/functions/nphies-gateway/index.ts` | Add `submit_preauth` and `check_claim_status` actions |
| `src/hooks/useNphiesConfig.ts` | Add `useSubmitPreAuth` and `useCheckClaimStatus` hooks |
| `src/components/insurance/NphiesDashboardCard.tsx` | **New** — Dashboard widget with NPHIES stats + charts |
| `src/pages/app/billing/BillingDashboard.tsx` | Render `NphiesDashboardCard` |
| `src/pages/app/billing/ClaimDetailPage.tsx` | Add pre-auth button, resubmit button, rejection details, refresh status |
| `src/pages/app/billing/ClaimFormPage.tsx` | Add "Request Pre-Auth via NPHIES" option |
| `src/lib/i18n/translations/en.ts` | Add new keys |
| `src/lib/i18n/translations/ar.ts` | Add Arabic translations |
| `src/lib/i18n/translations/ur.ts` | Add Urdu translations |

No database schema changes needed — `pre_auth_number`, `pre_auth_status`, `pre_auth_date` and `nphies_response` columns already exist.

