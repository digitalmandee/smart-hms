

# Complete Remaining Multi-Country Work

## What's Left

The foundation is solid (database, config provider, presets, hooks, i18n files, ZATCA function all exist). But the actual adoption across components is incomplete:

1. **92 files still have hardcoded "Rs."** -- the `useCurrencyFormatter` hook exists but only 2 components use it
2. **i18n system exists but is unused** -- no component imports `useTranslation`
3. **Bilingual receipts** not implemented
4. **ZATCA QR rendering** on printed invoices not wired up
5. **PrintablePaymentReceipt** and **PrintableInvoice** still fully hardcoded

---

## Implementation Batches

### Batch 1: High-Impact Currency Fixes (Print Templates + Pharmacy POS)

These are customer-facing and break the experience for KSA/UAE users.

**Print templates (accept `currencySymbol` as prop since they're `forwardRef`):**

| File | Hardcoded "Rs." count |
|------|----------------------|
| `PrintablePaymentReceipt.tsx` | ~7 instances |
| `PrintableInvoice.tsx` | ~15+ instances |
| `PrintableGRN.tsx` | ~4 instances |

**Pharmacy POS (use `useCurrencyFormatter` hook):**

| File | Instances |
|------|-----------|
| `POSCart.tsx` | ~8 |
| `POSReceiptPreview.tsx` | ~8 |
| `POSPaymentModal.tsx` | ~5 |
| `POSHeldTransactions.tsx` | ~3 |

### Batch 2: Billing Components

| File | Changes |
|------|---------|
| `PatientBalanceCard.tsx` | Replace `Rs.` with `formatCurrency` |
| `CollectionsWidget.tsx` | Replace `Rs.` with `formatCurrency` |
| `CloseSessionDialog.tsx` | Replace `Rs.` with `formatCurrency` |
| `DailyClosingSummary.tsx` | Replace `Rs.` with `formatCurrency` |
| `ExpenseEntryCard.tsx` | Replace `Rs.` with `formatCurrency` |
| `BillingReportsPage.tsx` | Replace `Rs.` with `formatCurrency` |

### Batch 3: HR/Payroll + Inventory + OT

| File | Changes |
|------|---------|
| `DoctorEarningsPage.tsx` | Replace `Rs.` |
| `TaxSlabsPage.tsx` | Replace `Rs.` throughout (labels + formatter) |
| `PayrollPage.tsx` | Replace `Rs.` |
| `DoctorSettlementPage.tsx` | Replace `Rs.` |
| `ItemDetailPage.tsx` | Replace `Rs.` |
| `PurchaseOrderFormPage.tsx` | Replace `Rs.` |
| `GRNFormPage.tsx` | Replace `Rs.` |
| `SurgeryFormPage.tsx` | Replace `Rs.` |
| `SurgeonFeesPage.tsx` | Replace `Rs.` |
| `SurgeryPricingBreakdown.tsx` | Replace `Rs.` |

### Batch 4: Services, Dashboard, Settings, Landing

| File | Changes |
|------|---------|
| `ServicesListPage.tsx` | Replace `Price (Rs.)` header |
| `HeroSection.tsx` | Landing page stat badges |
| Various dashboard metric cards | Replace `Rs.` |
| Any remaining files found in the 92-file list |

### Batch 5: Bilingual Receipts + ZATCA QR Rendering

**PrintablePaymentReceipt.tsx** and **PrintableInvoice.tsx**:
- Accept `countryCode`, `currencySymbol`, `taxLabel`, `orgNameAr`, `zatcaQrCode` as props
- When country is SA or AE, show bilingual labels (English / Arabic side by side)
- When `zatcaQrCode` exists and `e_invoicing_enabled`, render QR code image on the receipt
- Add VAT/TRN registration line in footer for KSA/UAE
- Arabic legal footer for KSA invoices

### Batch 6: Wire Up i18n in Key Screens

Import `useTranslation` from `src/lib/i18n` in priority screens:
- Patient registration form labels
- Billing page headers and button labels
- Navigation sidebar items (where applicable)

This is an incremental effort -- full app translation is ongoing, but the infrastructure needs at least some adoption to validate it works.

---

## Technical Approach

**For forwardRef print components** (can't use hooks directly):
- Parent components pass `currencySymbol`, `countryCode`, `taxLabel`, `orgNameAr` as props
- Print templates use string interpolation: `` `${currencySymbol} ${amount.toLocaleString()}` ``

**For regular components** (can use hooks):
- Import `useCurrencyFormatter` at the top
- Destructure `{ formatCurrency }` from the hook
- Replace all `Rs. ${amount}` patterns with `formatCurrency(amount)`

**For ZATCA QR rendering:**
- Use an `<img>` tag with a QR code library URL (already have `generateQRCodeUrl` utility)
- The QR data is Base64 TLV from the ZATCA edge function, rendered as a data URL

---

## Files Modified Summary

~45 component files will be touched, all with the same pattern: import the hook, replace "Rs." strings. Plus 2 print templates get bilingual + QR enhancements.

No new files needed. No database changes needed. All infrastructure already exists.
