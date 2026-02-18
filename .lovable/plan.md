
# Comprehensive Audit: Security Impact, Arabic/RTL, KSA Compliance & Insurance

---

## 1. Security Changes — Functionality Impact Assessment

### What Was Broken: Public Lab Report Portal

The previous security fix correctly dropped 3 overly-permissive anon policies. However, this has **broken the public patient-facing lab report portal** at `/lab-reports`.

**How the feature works:**
- Patient visits `/lab-reports`, enters their Order Number + last 4 digits of phone (or access code)
- `usePublicLabReport.ts` queries `lab_orders` (with `.eq("is_published", true)`) and `lab_order_items` without any auth token
- This requires the `anon` role to be able to SELECT from `lab_orders`, `lab_order_items`, and `patients`

**What's broken now:**
- The 3 dropped policies were the only way the anon role could query those tables
- Current policies use `get_user_organization_id()` which returns NULL for anon users — so ALL anon queries now return 0 rows
- The public lab report search will fail silently (returns "not found") for every patient

**The existing policies that remain are correct** — they use `get_user_organization_id()` and are properly scoped for authenticated staff. The anon access was legitimately needed but was implemented poorly (no filter, just `USING(true)`).

**Proper fix:** Restore narrow anon access with strict filters:
- `lab_orders`: anon can SELECT only rows where `is_published = true`
- `lab_order_items`: anon can SELECT only items belonging to published lab orders
- `patients`: anon can SELECT only `first_name, last_name, date_of_birth, gender, phone, patient_number` — no medical/ID/insurance data — and only for patients linked to published lab orders

This is far more secure than the original `USING(true)` policies that were dropped, because:
- Scope is limited to published-only records
- Cross-table join restricts patient access to only those with a published lab order
- Application then validates access_code / phone-last-4 before displaying results

### Other Security Changes: No Broken Functionality

- `setup-demo-users` password via env: Works (env var set or falls back gracefully)
- `heygen-token` JWT check: Works (HeyGenAvatar now passes token)
- `test-email-config` JWT check: Works (called from authenticated settings page)
- DOMPurify on EmailTemplates: Works, no visual change
- `search_path = public` on DB functions: Works, purely server-side, no frontend impact
- Lab/Patient anon policies dropped: **BROKEN** (public lab report portal)

---

## 2. Arabic Language Switching — Current State & Gaps

### How Language Currently Works

The language is driven by `default_language` stored in the `organizations` table. The `CountryConfigContext` reads it and the `RTLDirectionSetter` in `App.tsx` applies `dir="rtl"` and `lang="ar"` to `<html>`.

**When you select Saudi Arabia (SA) or UAE (AE) in Country & Region Settings** and save, `default_language` is set to `"en"` (not `"ar"`) — this is hardcoded in `COUNTRY_PRESETS`:

```ts
// src/lib/countryPresets.ts
SA: { default_language: 'en', ... }
AE: { default_language: 'en', ... }
```

So **there is no toggle to switch to Arabic UI** currently — the country preset always forces English as the UI language, even for KSA/UAE.

**The missing piece:** A Language Switcher toggle in the top navigation bar (or Settings) that lets the user change `default_language` to `"ar"` for their organization without changing the whole country preset.

### Translation Quality Assessment

The `ar.ts` file has **140 keys** covering: common actions, navigation, patient form, billing, receipts, settings, and dashboard.

**Quality rating: Good for covered areas — but very limited coverage**

| Area | Arabic Translation Quality | Notes |
|------|--------------------------|-------|
| Common actions | Excellent | حفظ، إلغاء، بحث — all correct |
| Navigation | Excellent | المرضى، المواعيد، الصيدلية — correct |
| Patient form | Very good | All fields correctly translated |
| Billing/Receipts | Very good | Standard financial terms accurate |
| Settings | Good | 5 keys only |
| Dashboard | Good | 4 summary cards |

**Critical gap:** `useTranslation()` is defined in `src/lib/i18n/index.ts` but **is never actually called anywhere in the app pages or components**. Zero pages use `const { t } = useTranslation()`. The translation infrastructure exists but is not wired up. Every page in `/src/pages/app/` is hardcoded in English.

**Verdict:** The Arabic translation is well-structured and accurate, but functionally inactive. The RTL CSS direction is applied at the `<html>` level (which helps layout), but all UI text remains English.

### What Would RTL Look Like Today

If you changed `default_language` to `"ar"` in the DB manually:
- The entire app layout would flip right-to-left (sidebar on right, text alignment changes)
- All text labels would still display in English (no component uses `t()`)
- This would be visually broken (RTL layout + English text)

---

## 3. KSA Compliance — What's Done and What's Missing

### Done

| Feature | Status |
|---------|--------|
| 15% VAT configured as default | Done |
| ZATCA QR code generation (TLV-encoded) | Done — `zatca-einvoice` edge function |
| QR on printed invoices when e_invoicing_enabled=true | Done |
| Bilingual (EN/AR) receipt templates | Done |
| SAR currency formatting | Done |
| Iqama/National ID label | Done |
| Working days: Sun–Thu | Done |
| Riyadh timezone | Done |
| KSA insurance providers (Bupa Arabia, Tawuniya, etc.) | Done — in `usePatientConfig.ts` |

### Missing / Incomplete for KSA

| Feature | Status | Notes |
|---------|--------|-------|
| **NPHIES integration** | Not implemented | Saudi mandatory health info exchange for claims submission. Currently zero code. Technically complex — requires XML HL7 FHIR + NPHIES portal credentials |
| **CCHI membership number field** | Missing | KSA requires CCHI (Council of Cooperative Health Insurance) member number on patient records |
| **Arabic UI language toggle** | Missing | As described above — no way to switch UI to Arabic |
| **Hijri calendar support** | Missing | KSA hospitals frequently use Hijri dates alongside Gregorian |
| **Unified National Number (UNN)** | Partial | Iqama/National ID label is set but no format validation for Saudi 10-digit ID |
| **VAT invoice XML (UBL 2.1)** | Missing | ZATCA Phase 2 requires UBL XML e-invoice in addition to QR. Currently only QR is generated |
| **Deductible/co-insurance on receipts** | Partial | Schema has deductible_amount on claims, but receipts do not show the insurance split |

---

## 4. Insurance Module — Integration Status by Country

### What's Built (All Countries)

The insurance module has solid foundational architecture:

| Layer | Implementation |
|-------|---------------|
| Insurance Companies | Full CRUD — `InsuranceCompaniesPage.tsx` |
| Insurance Plans | Full CRUD with coverage %, copay, deductible, annual limit — `InsurancePlansPage.tsx` |
| Patient Insurance | Linked to patient record, policy number, primary/secondary — `PatientFormPage.tsx` |
| Claim Creation | From invoice, with line items and coverage estimation — `ClaimFormPage.tsx` |
| Claims List | With status tracking (draft → submitted → approved/rejected → paid) |
| Claim Detail | Status updates, rejection reasons, appeal notes, payment recording |
| Claims Report | Analytics and aging report — `ClaimsReportPage.tsx` |
| Pre-auth Number | Field exists on claims table and on `PaymentModeSelector.tsx` |

### Country-Specific Gaps

**KSA (most important):**
- No NPHIES electronic claims submission — the biggest gap. Claims are manually recorded, not electronically filed to the Health Insurance Portal
- No CCHI network number on patient/insurance records
- No automated eligibility verification (real-time benefit check before treatment)
- No authorization workflow (submit pre-auth → receive approval number → proceed with treatment)
- No DRG (Diagnosis Related Groups) coding fields on claims — required for in-patient billing under KSA insurance
- No ICD-10 / CPT coding interface on claims (the schema doesn't store diagnosis codes on claims)

**UAE:**
- DHA/HAAD network validation missing
- TRN on insurance company records is not a field
- No real-time eligibility check

**Pakistan:**
- NHIS (National Health Insurance Scheme) / Sehat Sahulat Program integration absent
- State Life group insurance batch claims not supported
- No EFU/Jubilee API connectivity (all manual entry)

### Summary: What the Insurance Module Is vs. What It Needs to Be

**Current state:** A solid internal claims management system — you can record claims, track status, and report. Good for paper-based or email-based claim submission workflows.

**Missing for KSA compliance:** Electronic claims submission via NPHIES (mandatory for licensed hospitals), automated eligibility checks, ICD-10/DRG coding on claims, and pre-authorization workflow tracking.

---

## Implementation Plan

### Phase 1 (Immediate — Fix the Security Break)
Restore narrow, secure anon access for the public lab report portal:

- **New migration**: Add 3 new anon policies with tight `is_published = true` filters, replacing the old blanket `USING(true)` policies that were dropped

### Phase 2 (Arabic Language Switch)
Add a language toggle that actually works:

- **`src/components/layout/LanguageSwitcher.tsx`** — New component: a toggle (EN / AR) in the top navbar
- **`src/contexts/CountryConfigContext.tsx`** — Add `setLanguage()` method that updates `organizations.default_language` in Supabase and refreshes the query
- **`src/pages/app/settings/CountryRegionSettingsPage.tsx`** — Add a Language section with EN/AR toggle, separate from the country preset

### Phase 3 (KSA Insurance — Priority Gaps)
Add the most critical missing KSA fields without requiring NPHIES integration:

- **CCHI Number field** on `patient_insurance` table and patient insurance form
- **ICD-10 / Diagnosis Code** field on `insurance_claims` table and claim form
- **Pre-Authorization Workflow**: Add a proper pre-auth request form (payer, date, auth number, approval/rejection) linked to claims
- **Insurance split on receipts**: Show insurer portion vs. patient responsibility on printed receipts

### Technical Files Affected

| File | Change |
|------|--------|
| New migration SQL | Restore secure anon RLS for lab reports |
| `src/components/layout/LanguageSwitcher.tsx` | New EN/AR toggle component |
| `src/contexts/CountryConfigContext.tsx` | Add setLanguage + persist to DB |
| `src/pages/app/settings/CountryRegionSettingsPage.tsx` | Language section |
| Migration SQL | Add `cchi_number` to `patient_insurance`, `icd_codes` to `insurance_claims` |
| `src/pages/app/billing/ClaimFormPage.tsx` | ICD-10 field, CCHI display |
| `src/components/ipd/PaymentModeSelector.tsx` | Pre-auth workflow fields |
| Print templates | Insurance split line on receipts |

---

## Priority Recommendation

**Must fix now (breaks live users):** Phase 1 — the public lab report portal is currently returning no results for all patients.

**High value, low risk:** Phase 2 (Language switcher) — the infrastructure is 90% there, just needs the toggle and the `setLanguage` persistence.

**KSA dealbreaker for licensed hospitals:** NPHIES integration is required by Saudi law for licensed facilities, but is a large external integration requiring NPHIES portal credentials and FHIR XML — best treated as a separate sprint.
