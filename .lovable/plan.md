

# NPHIES Integration — SaaS Multi-Tenant Architecture

## Yes, NPHIES is Per-Hospital

Each hospital/facility registers separately with CCHI and receives its own:
- **NPHIES Facility ID** (licensed healthcare provider ID)
- **API credentials** (client ID, client secret, digital certificate)
- **CCHI License Number**

Since you are running as SaaS, each organization in your system needs its own NPHIES configuration stored in the database — not as global secrets.

## Architecture

```text
┌──────────────────────────────────────────────┐
│  Frontend (per-org settings page)            │
│  ┌────────────────────────────────────────┐  │
│  │ NPHIES Configuration Panel             │  │
│  │ - Facility ID                          │  │
│  │ - CCHI License Number                  │  │
│  │ - NPHIES Client ID / Secret            │  │
│  │ - Base URL (sandbox vs production)     │  │
│  │ - Enable/Disable toggle                │  │
│  └────────────────────────────────────────┘  │
└──────────────┬───────────────────────────────┘
               │ stored per organization
               ▼
┌──────────────────────────────────────────────┐
│  organization_settings table                 │
│  key: nphies_facility_id, nphies_client_id,  │
│       nphies_client_secret (encrypted),      │
│       nphies_enabled, nphies_environment     │
└──────────────┬───────────────────────────────┘
               │ read by edge function
               ▼
┌──────────────────────────────────────────────┐
│  Edge Function: nphies-gateway               │
│  - Reads org credentials from DB             │
│  - Authenticates with NPHIES OAuth           │
│  - Sends FHIR requests (eligibility, claims) │
│  - Returns response to frontend              │
└──────────────────────────────────────────────┘
```

## Implementation Plan

### 1. Database: Add NPHIES config columns to `insurance_companies`
Each insurance company record already belongs to an organization. Add NPHIES-specific fields:
- `cchi_payer_code` — the CCHI code for this payer (e.g., Bupa = specific code)
- `nphies_payer_id` — NPHIES identifier for this payer

### 2. Database: Store org-level NPHIES credentials in `organization_settings`
Using the existing `organization_settings` key-value table:
- `nphies_enabled` (true/false)
- `nphies_environment` (sandbox/production)
- `nphies_facility_id`
- `nphies_cchi_license`
- `nphies_client_id`
- `nphies_client_secret` (sensitive — stored encrypted or via Vault)
- `nphies_base_url`

### 3. Frontend: NPHIES Configuration Panel
New component in the Insurance settings area where org admins can:
- Toggle NPHIES integration on/off
- Enter their facility credentials
- Select sandbox vs production environment
- Test connectivity
- View integration status

### 4. Frontend: Eligibility Check Component
Add an "Eligibility Check" button on:
- Patient registration (when insurance is selected)
- Appointment booking
- Admission form
Shows real-time eligibility status from NPHIES.

### 5. Edge Function: `nphies-gateway`
Single gateway function that:
- Receives org_id + action (eligibility/claim/preauth)
- Reads that org's NPHIES credentials from `organization_settings`
- Authenticates with NPHIES OAuth2
- Converts data to HL7 FHIR format
- Sends request and returns response

### Files to Create/Change

| File | Change |
|------|--------|
| DB migration | Add `cchi_payer_code` to `insurance_companies` |
| `src/components/insurance/NphiesConfigPanel.tsx` | New — org-level NPHIES settings UI (3 languages) |
| `src/components/insurance/EligibilityCheckButton.tsx` | New — real-time eligibility check UI |
| `src/hooks/useNphiesConfig.ts` | New — read/write NPHIES org settings |
| `src/pages/app/insurance/InsuranceSettingsPage.tsx` | Add NPHIES configuration tab |
| `supabase/functions/nphies-gateway/index.ts` | New — NPHIES API gateway edge function |

### Security Note
The `nphies_client_secret` is sensitive. Two options:
- **Option A**: Store in `organization_settings` with a flag marking it sensitive (simpler, credentials in DB)
- **Option B**: Use Supabase Vault for encryption (more secure, but Vault stores per-project not per-org)

For SaaS multi-tenant, Option A with DB-level encryption is more practical since each org has different credentials.

