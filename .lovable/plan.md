

# Fix: Invoice Form — Auto-Load Patient & Pending Procedure Charges

## Problem
When navigating to `/app/billing/invoices/new?patientId=xxx`, the form:
1. Does NOT auto-select the patient from the URL parameter
2. Does NOT load pending unbilled charges (lab orders, imaging orders, consultations)
3. Shows "Available Deposit" which is confusing — user thinks deposit reduces the invoice total

The invoice should always be for the **full procedure amount**. Deposits stay separate. If patient pays less, the balance remains unpaid on the invoice.

## Changes

### File: `src/pages/app/billing/InvoiceFormPage.tsx`

**1. Read `patientId` from URL and auto-select patient**
- Extract `patientId` from `searchParams`
- Fetch patient data from Supabase when `patientId` is present
- Auto-set `selectedPatient` state

**2. Auto-load pending unbilled charges for selected patient**
- Add a query to fetch unbilled lab orders (`invoice_id IS NULL`) for the patient
- Add a query to fetch unbilled imaging orders (`invoice_id IS NULL`) for the patient
- Add a query to fetch unpaid appointments (consultation fees) for the patient
- When patient is selected and has pending charges, auto-populate the `items` array with those charges
- Show an info banner: "X pending charges found for this patient" with a button to load them

**3. Clarify deposit display in PatientBalanceCard**
- Update the "Available Deposit" card description to say: "Available credit — will NOT be auto-deducted from this invoice. Can be applied during payment collection."

### File: `src/components/billing/PatientBalanceCard.tsx`
- Change deposit description text from "Available credit that can be applied to invoices" to "Available credit — apply during payment collection. Invoice total stays unchanged."

### Translation files (en.ts, ur.ts, ar.ts)
- Add keys: `billing.depositNote`, `billing.pendingChargesFound`, `billing.loadPendingCharges`

## Technical Detail
- Pending charges query: fetch from `lab_orders` (where `invoice_id IS NULL`, `patient_id = X`), `imaging_orders` (same), and `appointments` (where `payment_status != 'paid'`, `invoice_id IS NULL`)
- Each charge maps to an invoice item with description, quantity=1, unit_price from service_type default_price
- User can still add/remove items manually before submitting
- Invoice is always created with `paid_amount: 0` — no deposit auto-deduction

## Files to Change
- `src/pages/app/billing/InvoiceFormPage.tsx` — read patientId param, auto-load pending charges
- `src/components/billing/PatientBalanceCard.tsx` — clarify deposit description
- `src/lib/i18n/translations/en.ts` — new labels
- `src/lib/i18n/translations/ur.ts` — new labels
- `src/lib/i18n/translations/ar.ts` — new labels

