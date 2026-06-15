# Sprint 2 / BIL-01 — Unified Cashier Workspace

Goal: a single page where a cashier handles every patient money interaction — OPD bill, IPD deposit/balance, pharmacy credits, outstanding lab/imaging invoices, refunds — without hopping between Invoices, Patient Deposits, Pharmacy POS, and IPD pages.

## What exists today
- **Invoices page** — creates invoices, applies deposit, records payment.
- **Patient Deposits page** (BIL-02) — `usePatientLedger`, `useDepositBalance`, `RecordDepositDialog`, `RefundDepositDialog`, `PatientDepositLedger` component.
- **IPD Running Bill panel** (IPD-01) — `useAdmissionRunningBill` with realtime, in-context deposit/refund.
- **Pharmacy patient credits** — `usePharmacyCredits`, settled at pharmacy POS.
- **Outstanding lab/imaging invoices** — `useOutstandingInvoices`.
- **Billing sessions** — `useRequireSession` gates every cash action.

Everything works in isolation but cashiers context-switch constantly.

## Scope

### 1. Page: `/app/billing/cashier`
New `src/pages/app/billing/CashierWorkspacePage.tsx`. Three-pane layout:

```text
┌─────────────────────────────────────────────────────────────┐
│ Session strip: counter, cashier, opened-at, drawer total   │
├──────────────┬──────────────────────────────────────────────┤
│ Patient      │ Tabs: [Summary] [Charges] [Deposits] [Pay]  │
│ search +     │                                              │
│ recent (10)  │  Active tab content                          │
│              │                                              │
│ Selected     │                                              │
│ patient card │  Action bar (sticky bottom):                 │
│  - balance   │  Collect Deposit | Refund | Pay Invoice |   │
│  - deposit   │  Settle Pharmacy Credit | Print Receipt     │
│  - active    │                                              │
│    admission │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

### 2. Hook: `useCashierPatientSnapshot(patientId)`
New in `src/hooks/useCashierWorkspace.ts`. Composes existing hooks (no new queries where avoidable):
- `useDepositBalance(patientId)` — deposit.available
- `usePatientLedger(patientId)` — recent deposit/refund/apply rows
- `useOutstandingInvoices(patientId)` — unpaid invoice list
- `usePharmacyCredits(patientId)` — open credit lines
- Live admission lookup (`admissions` where `patient_id` + status `admitted`) → if found, surface `useAdmissionRunningBill(admissionId)`.

Returns `{ deposit, ledger, outstandingInvoices, pharmacyCredits, activeAdmission, totals: { totalOutstanding, depositAvailable, netDue } }`.

Realtime: subscribe to `invoices`, `patient_deposits`, `pharmacy_patient_credits` filtered by `patient_id`, invalidate the composed keys.

### 3. Tab content
- **Summary** — KPI tiles (Net Due, Deposit Available, Outstanding Invoices count, Pharmacy Credit), plus the active admission's `AdmissionRunningBillPanel` if admitted (reused, not forked).
- **Charges** — flat list merging unbilled IPD charges + outstanding lab/imaging + pharmacy credits; each row has a "Settle" inline action.
- **Deposits** — embed `PatientDepositLedger` (already built).
- **Pay** — invoice picker → existing payment form (extract from `InvoicePaymentDialog` or open dialog inline). Allows applying deposit toward invoice.

### 4. Reused dialogs (no rewrites)
- `RecordDepositDialog` (lockPatient, prefilledPatient — added in IPD-01).
- `RefundDepositDialog` — accept same `prefilledPatient` / `lockPatient` props (small edit if missing).
- `InvoicePaymentDialog` — open with selected invoice.

### 5. Navigation
- Add sidebar entry under **Billing → Cashier Workspace** (route guarded by `useRequireSession`, redirects to Open Session prompt if no active session).
- Add a small "Open in Cashier Workspace" link from the IPD Running Bill panel and Patient Deposits page (deep link `?patientId=…`).

### 6. Receipt
Single "Print Receipt" button on the action bar → calls existing receipt printer for the most recent payment/deposit in this session for the selected patient. (Full 80mm thermal layout = BIL-04, out of scope.)

### 7. i18n
Add `billing.cashier.*` keys to `en.ts`, `ar.ts`, `ur.ts` (title, tabs, KPIs, actions, empty states, deep-link CTA). RTL verified for `ar`.

## Out of scope
- BIL-04 thermal receipt layout.
- Editing posted invoices.
- Multi-patient batch operations.

## Files

**New**
- `src/pages/app/billing/CashierWorkspacePage.tsx`
- `src/hooks/useCashierWorkspace.ts`
- `src/components/billing/CashierPatientPane.tsx` (search + selected patient card)
- `src/components/billing/CashierChargesTab.tsx`
- `src/components/billing/CashierPayTab.tsx`

**Edited**
- `src/App.tsx` (or routes file) — add `/app/billing/cashier` route.
- Sidebar config — add entry.
- `src/components/billing/RefundDepositDialog.tsx` — add `prefilledPatient` / `lockPatient` (parity with RecordDepositDialog).
- `src/components/ipd/AdmissionRunningBillPanel.tsx` — add "Open in Cashier Workspace" deep link.
- `src/pages/app/accounts/PatientDepositsPage.tsx` — same deep link.
- `src/lib/i18n/translations/{en,ar,ur}.ts`.

## Verification
- Open workspace without active session → blocked with "Open billing session" CTA.
- Search a patient with admission + outstanding lab → Summary shows running bill, Net Due correct, Charges tab lists both IPD and lab lines.
- Collect deposit from action bar → ledger row appears live, deposit.available updates, GL DR Cash / CR LIA-DEP-001.
- Refund 100 when available 500 → drops to 400, button disables at 0.
- Pay an outstanding invoice applying deposit → invoice marked paid, deposit.applied increases, balance recalculates.
- Switch language to `ar`/`ur` → all labels translated, RTL layout intact.
