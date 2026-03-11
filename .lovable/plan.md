

## UX Fixes: Patient Deposits + Credit Notes

### 1. Patient Deposits — Replace UUID input with PatientSearch component

**File**: `PatientDepositsPage.tsx`

- Replace the raw `patient_id` text input with the existing `PatientSearch` component from `src/components/appointments/PatientSearch.tsx`
- Store selected patient object in state; pass `patient.id` to the mutation
- Show selected patient card (already built into PatientSearch) with "Change" button

### 2. Credit Notes — Add Invoice + Patient selectors

**File**: `CreditNotesPage.tsx`

- Add `PatientSearch` component to the dialog (optional — user can pick patient directly or via invoice)
- Add an invoice selector: query `invoices` table filtered by org (and optionally by selected patient), show invoice number + amount in a searchable dropdown
- When an invoice is selected, auto-fill patient_id from the invoice
- Pass `invoice_id` and `patient_id` to the `useCreateCreditNote` mutation

### Files Modified
- `PatientDepositsPage.tsx` — swap UUID input for PatientSearch
- `CreditNotesPage.tsx` — add PatientSearch + invoice select dropdown

No database or schema changes needed.

