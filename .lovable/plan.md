
# KSA + UAE Multi-Country Readiness Plan

## Overview

This plan makes the HMS and Tabeebi dynamically configurable per country (Pakistan, KSA, UAE). The super admin selects the country at the organization level, and everything -- currency, tax, language, ID formats, working days, regulatory labels -- adapts automatically. No code changes needed per deployment.

---

## Phase 1: Country Configuration Foundation

### 1.1 Database Schema Changes

Add new columns to the `organizations` table to store country-specific configuration:

```
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS currency_code TEXT DEFAULT 'PKR';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS currency_symbol TEXT DEFAULT 'Rs.';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS currency_locale TEXT DEFAULT 'en-PK';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS tax_label TEXT DEFAULT 'GST';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS national_id_label TEXT DEFAULT 'CNIC';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS national_id_format TEXT DEFAULT 'XXXXX-XXXXXXX-X';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS supported_languages TEXT[] DEFAULT ARRAY['en', 'ur'];
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS default_language TEXT DEFAULT 'en';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS date_format TEXT DEFAULT 'DD/MM/YYYY';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS fiscal_year_start TEXT DEFAULT '07';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS e_invoicing_enabled BOOLEAN DEFAULT false;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS e_invoicing_provider TEXT; -- 'zatca' for KSA, null for others
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS tax_registration_label TEXT DEFAULT 'NTN';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS phone_country_code TEXT DEFAULT '+92';
```

### 1.2 Country Presets (applied on country selection)

When the super admin selects a country, a preset fills all the above fields:

| Field | Pakistan | KSA | UAE |
|-------|----------|-----|-----|
| currency_code | PKR | SAR | AED |
| currency_symbol | Rs. | SAR | AED |
| currency_locale | en-PK | ar-SA | ar-AE |
| tax_label | GST | VAT | VAT |
| default_tax_rate | 17 | 15 | 5 |
| national_id_label | CNIC | Iqama / National ID | Emirates ID |
| national_id_format | XXXXX-XXXXXXX-X | XXXXXXXXXX | 784-XXXX-XXXXXXX-X |
| supported_languages | [en, ur] | [en, ar] | [en, ar] |
| default_language | en | en | en |
| working_days | Mon-Sat | Sun-Thu | Mon-Fri |
| timezone | Asia/Karachi | Asia/Riyadh | Asia/Dubai |
| fiscal_year_start | 07 (July) | 01 (January) | 01 (January) |
| e_invoicing_enabled | false | true | false |
| e_invoicing_provider | null | zatca | null |
| tax_registration_label | NTN | VAT TIN | TRN |
| phone_country_code | +92 | +966 | +971 |

---

## Phase 2: Dynamic Currency System

### 2.1 Refactor `src/lib/currency.ts`

Replace hardcoded "Rs." with a context-aware system:

- Create a new hook `useCountryConfig()` that reads the organization's country settings from the `organizations` table
- Expose a `CountryConfigProvider` React context at the app root
- Refactor `formatCurrency()`, `formatCurrencyFull()`, `formatCurrencyCompact()`, `parseCurrency()` to accept config or read from context
- For KSA: "SAR 1,500.00" (no Lakh/Crore -- use K/M/B)
- For UAE: "AED 1,500.00" (same Western numbering)
- For PK: Keep existing Rs. with Lakh/Crore system

### 2.2 Fix Hardcoded "Rs." References

There are ~30 files with hardcoded `Rs.` strings (e.g., `CashDenominationInput.tsx`, `PrintablePaymentReceipt.tsx`, toast messages, landing pages). All will be updated to use `formatCurrency()` from context.

Cash denomination input (`CashDenominationInput.tsx`) will be made dynamic:
- PK: 5000, 1000, 500, 100, 50, 20, 10 notes
- KSA: 500, 200, 100, 50, 20, 10, 5, 1 Riyals
- UAE: 1000, 500, 200, 100, 50, 20, 10, 5 Dirhams

---

## Phase 3: Tax Compliance

### 3.1 VAT for KSA (15%)

- Tax label throughout the app changes from "GST" to "VAT" dynamically based on `tax_label` field
- Default tax rate set to 15% for KSA, 5% for UAE, 17% for PK
- Tax registration number label: "NTN" (PK) vs "VAT TIN" (KSA) vs "TRN" (UAE)

### 3.2 ZATCA E-Invoicing Readiness (KSA Only)

This is a significant sub-project. Phase 1 will lay the groundwork:

- Add `zatca_invoice_type` column to `invoices` table (standard / simplified)
- Add `zatca_uuid`, `zatca_icv` (Invoice Counter Value), `zatca_pih` (Previous Invoice Hash) columns
- Create a new edge function `zatca-einvoice` that:
  - Generates UBL 2.1 XML from invoice data
  - Creates TLV-encoded QR code (Base64) containing: seller name, VAT number, timestamp, total with VAT, VAT amount
  - Signs the XML with the organization's cryptographic stamp (CSID) -- initially stored as a secret
  - Reports/clears invoices with ZATCA sandbox API
- Add QR code to printed invoices when `e_invoicing_enabled = true`
- This will be implemented as a separate module that activates only for KSA organizations

### 3.3 UAE Compliance

- UAE has no mandatory e-invoicing system yet (as of 2025), but the FTA (Federal Tax Authority) requires TRN on invoices
- Ensure TRN is displayed on all receipts/invoices for UAE organizations
- Support Dhareeba (Qatar-style) if UAE mandates e-invoicing in future -- the architecture supports plugging in new providers

---

## Phase 4: Localization (Arabic RTL Support)

### 4.1 RTL Layout Support

- Add `dir` attribute to the root `<html>` element dynamically based on `default_language`
- When Arabic is the selected UI language: `dir="rtl"`
- Use Tailwind's RTL plugin (`rtl:` prefix) for layout-sensitive styles (margins, paddings, text alignment)
- All Radix UI components already support RTL natively

### 4.2 Arabic Translation Layer

- Create `src/lib/i18n/` with translation files:
  - `en.json` -- English (default, current strings)
  - `ar.json` -- Arabic translations for all UI labels
- Use a lightweight `useTranslation()` hook (no heavy i18n library needed)
- Priority screens for Arabic translation:
  - Patient registration form
  - Billing / invoices / receipts
  - Tabeebi chat interface (already supports Arabic)
  - Print templates (receipts, prescriptions)

### 4.3 Bilingual Receipts/Invoices

For KSA and UAE, receipts and invoices must show both Arabic and English:
- Organization name in both languages
- Line item descriptions in both languages (if available)
- Legal footer in Arabic
- Update `PrintablePaymentReceipt.tsx` and all print templates

---

## Phase 5: Country-Specific Patient Config

### 5.1 Dynamic Defaults in `usePatientConfig.ts`

Replace hardcoded Pakistani cities/languages/insurance providers with country-aware defaults:

| Config | Pakistan | KSA | UAE |
|--------|----------|-----|-----|
| Cities | Lahore, Karachi, ... | Riyadh, Jeddah, Makkah, Madinah, Dammam | Dubai, Abu Dhabi, Sharjah, Ajman |
| Languages | Urdu, English, Punjabi, ... | Arabic, English, Urdu, Hindi | Arabic, English, Hindi, Urdu, Malayalam, Tagalog |
| Insurance | State Life, Jubilee, ... | Bupa Arabia, Tawuniya, MedGulf | Daman, Oman Insurance, AXA Gulf |
| ID Label | CNIC | Iqama / National ID | Emirates ID |
| ID Format | XXXXX-XXXXXXX-X | 10-digit number | 784-XXXX-XXXXXXX-X |

### 5.2 Patient Form Adaptations

- `PatientFormPage.tsx`: Change "CNIC / National ID" label dynamically
- Change placeholder format based on country
- Change nationality default based on country
- Phone input: auto-prefix with country code

---

## Phase 6: Tabeebi Multi-Country Support

### 6.1 Edge Function Updates (`ai-assistant/index.ts`)

- Add country context to the system prompt so Tabeebi knows:
  - Which medications are available in that country
  - Local emergency numbers (999 PK, 997 KSA, 998/999 UAE)
  - Local pharmacy brands and drug names
  - Currency for any cost references

### 6.2 Tabeebi Landing Page

- Update `TabeebiLandingPage.tsx` to show relevant languages based on country
- For KSA/UAE: default to Arabic interface with English toggle
- Voice consultation language options adapt to country's `supported_languages`

---

## Phase 7: Super Admin Country Selection UI

### 7.1 New Settings Page Section

Add a "Country & Region" section to the organization settings (accessible only to super_admin):

- Country selector dropdown: Pakistan, Saudi Arabia, UAE
- On selection: auto-fills all preset values (currency, tax, timezone, working days, etc.)
- Allow manual override of individual fields after preset
- Preview panel showing: "Currency: SAR, Tax: VAT 15%, ID: Iqama, Timezone: Asia/Riyadh"
- Warning dialog: "Changing country will update currency, tax rates, and regional settings. Existing financial data will not be converted."

### 7.2 Working Days Configuration

- PK default: Monday-Saturday
- KSA default: Sunday-Thursday (Friday-Saturday weekend)
- UAE default: Monday-Friday (Saturday-Sunday weekend)
- These are already stored in `working_days` column, just need proper defaults

---

## Implementation Priority & Phasing

Given the scope, implementation should be split into multiple sessions:

**Session 1 (This Session):**
1. Database migration -- add country config columns
2. Country presets logic
3. `useCountryConfig` hook + `CountryConfigProvider`
4. Refactor `currency.ts` to be dynamic
5. Super admin country selection UI

**Session 2:**
1. Fix all hardcoded "Rs." references (30 files)
2. Dynamic cash denominations
3. Patient config country defaults
4. Patient form adaptations (ID label, format)

**Session 3:**
1. Arabic RTL support infrastructure
2. Translation system (`i18n/`)
3. Bilingual receipt/invoice templates

**Session 4:**
1. ZATCA e-invoicing edge function
2. QR code generation for KSA invoices
3. Tabeebi country-aware prompts

---

## Technical Details

### Files to Create

| File | Purpose |
|------|---------|
| `src/contexts/CountryConfigContext.tsx` | React context providing country config to all components |
| `src/hooks/useCountryConfig.ts` | Hook to read organization's country settings |
| `src/lib/countryPresets.ts` | Country preset definitions (PK, KSA, UAE) |
| `src/lib/i18n/en.json` | English translations (Session 3) |
| `src/lib/i18n/ar.json` | Arabic translations (Session 3) |
| `src/lib/i18n/useTranslation.ts` | Lightweight translation hook (Session 3) |
| `supabase/functions/zatca-einvoice/index.ts` | ZATCA XML generation + QR (Session 4) |

### Files to Modify

| File | Changes |
|------|---------|
| `src/lib/currency.ts` | Make all functions country-config-aware |
| `src/hooks/usePatientConfig.ts` | Country-aware defaults for cities, languages, insurance |
| `src/hooks/useBranchSettings.ts` | Read country from org, adjust timezone/working day defaults |
| `src/hooks/useOrganizationDefaults.ts` | Include new country config fields |
| `src/pages/app/patients/PatientFormPage.tsx` | Dynamic ID label, format, nationality |
| `src/components/billing/CashDenominationInput.tsx` | Country-specific denominations |
| `src/components/billing/PrintablePaymentReceipt.tsx` | Dynamic currency + bilingual support |
| `src/pages/app/settings/BranchFormPage.tsx` | Auto-select timezone from country |
| `supabase/functions/ai-assistant/index.ts` | Add country context to Tabeebi prompts |
| ~30 files with hardcoded "Rs." | Replace with `formatCurrency()` |

### Database Migration SQL (Session 1)

```sql
ALTER TABLE organizations 
  ADD COLUMN IF NOT EXISTS currency_code TEXT DEFAULT 'PKR',
  ADD COLUMN IF NOT EXISTS currency_symbol TEXT DEFAULT 'Rs.',
  ADD COLUMN IF NOT EXISTS currency_locale TEXT DEFAULT 'en-PK',
  ADD COLUMN IF NOT EXISTS tax_label TEXT DEFAULT 'GST',
  ADD COLUMN IF NOT EXISTS national_id_label TEXT DEFAULT 'CNIC',
  ADD COLUMN IF NOT EXISTS national_id_format TEXT DEFAULT 'XXXXX-XXXXXXX-X',
  ADD COLUMN IF NOT EXISTS supported_languages TEXT[] DEFAULT ARRAY['en', 'ur'],
  ADD COLUMN IF NOT EXISTS default_language TEXT DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS date_format TEXT DEFAULT 'DD/MM/YYYY',
  ADD COLUMN IF NOT EXISTS fiscal_year_start TEXT DEFAULT '07',
  ADD COLUMN IF NOT EXISTS e_invoicing_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS e_invoicing_provider TEXT,
  ADD COLUMN IF NOT EXISTS tax_registration_label TEXT DEFAULT 'NTN',
  ADD COLUMN IF NOT EXISTS phone_country_code TEXT DEFAULT '+92';
```

### CountryConfigProvider Architecture

```text
App.tsx
  |-- CountryConfigProvider (reads org country settings, provides to tree)
        |-- All pages/components
              |-- useCountryConfig() --> { currency, taxLabel, idLabel, ... }
              |-- formatCurrency(amount) --> uses context automatically
```

This ensures every component in the app can access country-specific settings without prop-drilling or hardcoded values.
