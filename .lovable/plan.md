

# Complete Remaining Phases: KSA/UAE Multi-Country Readiness

## Status Summary

Session 1 (DONE): Database columns added, `CountryConfigProvider`, `useCountryConfig()`, `countryPresets.ts`, dynamic `currency.ts`, and Super Admin country selection UI.

Remaining: Sessions 2, 3, and 4. Given the massive scope (~170+ files touched), this plan covers all three sessions but will implement in priority order within a single pass.

---

## Session 2: Hardcoded Currency Fix + Patient Config + Cash Denominations

### 2.1 Create a `useCurrencyFormatter` Hook

A convenience hook that reads from `useCountryConfig()` and returns pre-bound formatting functions, so components don't need to manually pass config every time.

**New file: `src/hooks/useCurrencyFormatter.ts`**

Returns: `{ formatCurrency, formatCurrencyFull, formatCurrencyCompact, currencySymbol, currencyCode }`

### 2.2 Fix Hardcoded "Rs." in ~46 Component Files

Replace all inline `Rs. ${amount}` patterns with `formatCurrency(amount)` using the new hook. Key files include:

| Category | Files |
|----------|-------|
| Pharmacy POS | `POSCart.tsx`, `POSPaymentModal.tsx`, `POSReceipt.tsx`, `POSHeldTransactions.tsx` |
| Billing | `PrintablePaymentReceipt.tsx`, `PrintableReceipt.tsx`, `PrintableInvoice.tsx`, `InvoiceTotals.tsx`, `CollectionsWidget.tsx`, `PatientBalanceCard.tsx`, `CloseSessionDialog.tsx`, `DailyClosingSummary.tsx`, `ExpenseEntryCard.tsx` |
| HR/Payroll | `DoctorEarningsPage.tsx`, `TaxSlabsPage.tsx`, `PayrollPage.tsx`, `DoctorSettlementPage.tsx` |
| Inventory | `ItemDetailPage.tsx`, `PurchaseOrderFormPage.tsx`, `GRNFormPage.tsx` |
| OT/Surgery | `SurgeryFormPage.tsx` |
| Billing Reports | `BillingReportsPage.tsx` |
| Dashboard widgets | Various dashboard metric cards |
| Landing page | `HeroSection.tsx` stat badges |

For print templates (receipt, invoice), the hook can't be used directly (they're forwardRef). These will accept `currencySymbol` as a prop from the parent.

### 2.3 Dynamic Cash Denominations (`CashDenominationInput.tsx`)

Replace the hardcoded PKR denomination array with country-aware denominations from `useCountryConfig().cash_denominations`. The denomination keys will be generated dynamically (e.g., `note_500`, `note_200`) instead of the current fixed `note_5000`...`note_10` structure.

Also update `useBillingSessions.ts` `CashDenominations` type and `calculateDenominationTotal` to work with dynamic denomination values.

### 2.4 Country-Aware Patient Config (`usePatientConfig.ts`)

Add country-based default fallbacks when the database config tables are empty:

- **Cities**: KSA gets Riyadh, Jeddah, Makkah, Madinah, Dammam, etc. UAE gets Dubai, Abu Dhabi, Sharjah, Ajman, etc.
- **Languages**: KSA/UAE get Arabic, English, Urdu, Hindi. UAE also gets Malayalam, Tagalog.
- **Insurance Providers**: KSA gets Bupa Arabia, Tawuniya, MedGulf. UAE gets Daman, Oman Insurance, AXA Gulf.

### 2.5 Patient Form Adaptations (`PatientFormPage.tsx`)

- Change "CNIC / National ID" label to dynamic `national_id_label` from country config
- Change placeholder from "XXXXX-XXXXXXX-X" to `national_id_format` from country config
- Auto-prefix phone input with `phone_country_code`
- Default nationality based on country (Pakistani / Saudi / Emirati)

---

## Session 3: Arabic RTL + Translation Infrastructure + Bilingual Receipts

### 3.1 RTL Support Infrastructure

**New file: `src/lib/i18n/index.ts`** -- Lightweight translation engine:
- Load translations from JSON objects (not files, to avoid async complexity)
- `useTranslation()` hook returns `t('key')` function
- Direction detection: `useDirection()` returns `'ltr'` or `'rtl'` based on `default_language`

**Modify: `src/App.tsx`** -- Set `document.documentElement.dir` and `document.documentElement.lang` dynamically based on `default_language` from `CountryConfigProvider`.

**Modify: `tailwind.config.ts`** -- Ensure RTL plugin is conceptually supported (Tailwind v3 has built-in `rtl:` variant when `dir="rtl"` is on html element).

### 3.2 Translation Files

**New: `src/lib/i18n/translations/en.ts`** -- English strings for priority screens:
- Common: Save, Cancel, Submit, Delete, Search, Loading, etc.
- Patient form labels
- Billing labels (Invoice, Receipt, Payment, Balance Due, etc.)
- Navigation items

**New: `src/lib/i18n/translations/ar.ts`** -- Arabic equivalents for all the above.

Initial translation scope: ~150 strings covering patient registration, billing/invoices, navigation, and common actions. Not full app translation -- that's an ongoing effort.

### 3.3 Bilingual Receipts/Invoices

**Modify: `PrintablePaymentReceipt.tsx`** and **`PrintableInvoice.tsx`**:
- When country is SA or AE, render labels in both English and Arabic (e.g., "Invoice / فاتورة")
- Add Arabic organization name field (new column `name_ar` on organizations table -- requires migration)
- Legal footer in Arabic for KSA: VAT registration info
- For UAE: TRN display on all invoices

**Database migration**: Add `name_ar` column to `organizations` table for Arabic name.

### 3.4 Tax Label Dynamism

All places showing "GST" or "Tax" will read from `countryConfig.tax_label` (already available). Files include:
- `InvoiceTotals.tsx`
- `PrintablePaymentReceipt.tsx`
- `PrintableInvoice.tsx`
- Various billing forms

---

## Session 4: ZATCA E-Invoicing + Tabeebi Country Context

### 4.1 ZATCA E-Invoicing Foundation (KSA Only)

**Database migration**: Add columns to `invoices` table:
- `zatca_invoice_type` (TEXT, default 'simplified')
- `zatca_uuid` (UUID)
- `zatca_icv` (INTEGER -- Invoice Counter Value)
- `zatca_pih` (TEXT -- Previous Invoice Hash)
- `zatca_qr_code` (TEXT -- Base64 QR data)
- `zatca_status` (TEXT -- 'pending', 'reported', 'cleared')

**New edge function: `supabase/functions/zatca-einvoice/index.ts`**:
- Accepts invoice ID
- Generates TLV-encoded QR code containing: seller name, VAT TIN, timestamp, total with VAT, VAT amount
- Generates Base64 QR string and stores it on the invoice
- Phase 1: QR generation only (no XML signing or ZATCA API integration -- that requires CSID certificates from ZATCA)

**Modify: `PrintableInvoice.tsx`** and **`PrintablePaymentReceipt.tsx`**:
- When `e_invoicing_enabled === true` and `zatca_qr_code` exists, render QR code on the printed receipt
- Show VAT breakdown (15%) separately

### 4.2 Tabeebi Country-Aware Prompts (`ai-assistant/index.ts`)

Enhance the system prompt with country context passed from the frontend:
- Accept `country_code` in the request body
- Append country-specific context to the system prompt:
  - **KSA**: "Patient is in Saudi Arabia. Common OTC brands: Panadol, Adol, Brufen. Emergency: 997. Currency: SAR."
  - **UAE**: "Patient is in UAE. Common OTC brands: Panadol, Adol. Emergency: 998/999. Currency: AED."
  - **PK**: "Patient is in Pakistan. Common OTC brands: Panadol, Disprin. Emergency: 1166/115. Currency: PKR."

**Modify: `src/hooks/useAIChat.ts`** -- Pass `country_code` from `useCountryConfig()` in the API request body.

### 4.3 Tabeebi Landing Page (`TabeebiLandingPage.tsx`)

- Default language selector shows only languages from `supported_languages` (e.g., KSA shows EN/AR, not UR)
- Voice consultation language adapts accordingly

---

## Technical Details

### Files to Create (7 new files)

| File | Purpose |
|------|---------|
| `src/hooks/useCurrencyFormatter.ts` | Convenience hook wrapping currency.ts with country config |
| `src/lib/i18n/index.ts` | Translation engine + useTranslation hook + useDirection hook |
| `src/lib/i18n/translations/en.ts` | English translation strings |
| `src/lib/i18n/translations/ar.ts` | Arabic translation strings |
| `supabase/functions/zatca-einvoice/index.ts` | ZATCA QR code generation for KSA invoices |

### Files to Modify (~50+ files)

| File | Changes |
|------|---------|
| `src/hooks/useBillingSessions.ts` | Dynamic CashDenominations type |
| `src/components/billing/CashDenominationInput.tsx` | Country-aware denominations |
| `src/hooks/usePatientConfig.ts` | Country-aware default fallbacks |
| `src/pages/app/patients/PatientFormPage.tsx` | Dynamic ID label/format/phone prefix |
| `src/components/billing/PrintablePaymentReceipt.tsx` | Dynamic currency + bilingual + QR |
| `src/components/billing/PrintableInvoice.tsx` | Dynamic currency + bilingual + QR |
| `src/components/billing/PrintableReceipt.tsx` | Dynamic currency |
| `src/components/pharmacy/POSCart.tsx` | Replace Rs. with formatCurrency |
| `src/components/pharmacy/POSPaymentModal.tsx` | Replace Rs. with formatCurrency |
| `src/components/pharmacy/POSReceipt.tsx` | Replace Rs. with formatCurrency |
| `src/components/pharmacy/POSHeldTransactions.tsx` | Replace Rs. with formatCurrency |
| `src/pages/app/hr/payroll/DoctorEarningsPage.tsx` | Replace Rs. with formatCurrency |
| `src/pages/app/hr/setup/TaxSlabsPage.tsx` | Replace Rs. with formatCurrency |
| `src/pages/app/inventory/ItemDetailPage.tsx` | Replace Rs. with formatCurrency |
| `src/pages/app/ot/SurgeryFormPage.tsx` | Replace Rs. with formatCurrency |
| `src/pages/app/billing/BillingReportsPage.tsx` | Replace Rs. with formatCurrency |
| `src/App.tsx` | Add RTL direction + lang attribute |
| `supabase/functions/ai-assistant/index.ts` | Country context in prompts |
| `src/hooks/useAIChat.ts` | Pass country_code to edge function |
| `supabase/config.toml` | Add zatca-einvoice function config |
| ~30 additional files with hardcoded Rs. | Replace with formatCurrency |

### Database Migrations

1. Add `name_ar TEXT` to `organizations` table
2. Add ZATCA columns to `invoices` table (`zatca_uuid`, `zatca_icv`, `zatca_pih`, `zatca_qr_code`, `zatca_status`, `zatca_invoice_type`)

### Implementation Order

Given the volume of changes, implementation will proceed in this order:
1. `useCurrencyFormatter` hook (enables everything else)
2. Fix hardcoded Rs. in billing/pharmacy components (highest user impact)
3. Dynamic cash denominations
4. Patient config country defaults + form adaptations
5. i18n infrastructure + RTL support
6. Arabic translations for priority screens
7. Bilingual receipt templates + tax label dynamism
8. ZATCA edge function + QR code on receipts
9. Tabeebi country-aware prompts

