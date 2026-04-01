

# Patient Financial Ledger Page

## What exists today
- **Patient Detail Page** has a "Billing" tab (`PatientBillingHistory`) showing invoices, payments, and pharmacy credits
- **No GL/journal visibility** — invoices link to invoice detail but don't show the corresponding journal entries
- Journal entries exist in DB with `reference_type = 'invoice'` / `'payment'` / `'patient_deposit'` linked via `reference_id`
- DB triggers auto-post: Invoice → DR AR / CR Revenue; Payment → DR Cash / CR AR

## What we'll build

### New component: `PatientFinancialLedger`
A comprehensive financial ledger tab added to the Patient Detail Page showing **all financial transactions in chronological order** with their GL journal entries.

### Layout
1. **Summary row** — Total billed, Total paid, Outstanding balance, Deposits balance
2. **Unified ledger table** — Every financial event in date order:

```text
Date       | Type      | Reference     | Description            | Debit    | Credit   | Balance  | GL Entry
-----------+-----------+---------------+------------------------+----------+----------+----------+-----------
Mar 15     | Invoice   | INV-260315-01 | Consultation + Lab     |  5,200   |          |  5,200   | JE-INV-...
Mar 15     | Payment   | PAY-001       | Cash payment           |          |  3,000   |  2,200   | JE-PAY-...
Mar 20     | Invoice   | INV-260320-02 | Radiology              |  1,800   |          |  4,000   | JE-INV-...
Mar 22     | Payment   | PAY-002       | Card payment           |          |  4,000   |      0   | JE-PAY-...
```

3. **GL Entry column** — Clickable link showing journal entry number, navigates to `/app/accounts/journal-entries/{id}`
4. **Expandable row** — Click any row to see the journal entry lines (DR/CR accounts and amounts) inline
5. **Filters** — Date range, type (Invoice/Payment/Deposit/Credit Note)
6. **Export** — CSV download of the ledger
7. **Print** — Printable patient statement with hospital branding

### Data queries
- Fetch invoices for patient → join with `journal_entries` where `reference_type = 'invoice'` and `reference_id = invoice.id`
- Fetch payments for patient → join with `journal_entries` where `reference_type = 'payment'` and `reference_id = payment.id`
- Fetch patient deposits → join with `journal_entries` where `reference_type = 'patient_deposit'`
- Merge all into a single sorted array by date

### Integration
- Add as a new tab "Financial Ledger" (with BookOpen icon) on PatientDetailPage alongside existing Billing tab
- The existing Billing tab stays as-is for quick invoice/payment actions
- Trilingual labels (en/ar/ur)

## Files changed
- `src/components/patients/PatientFinancialLedger.tsx` — new ledger component
- `src/pages/app/patients/PatientDetailPage.tsx` — add new tab
- `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts` — trilingual keys

