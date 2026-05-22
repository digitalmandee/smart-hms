---
name: billing-revenue-ops
description: Invoicing, payments, deposits, split tenders, daily closing, doctor earnings, and pending-charges automation. Auto-loads for any work on invoices, billing sessions, patient deposits, split payments, daily reconciliation, or revenue recognition.
---

# Billing & Revenue Operations

## 1. Pending charges auto-load on invoice

When opening a new invoice for a patient, the form auto-loads **all unbilled** items:
- Lab orders without `invoice_id`.
- Imaging orders without `invoice_id`.
- Completed appointments not yet billed.
- IPD charges with `is_billed = false` (on discharge invoice).

Don't re-implement this lookup per-screen; use the shared `usePendingCharges(patientId)` hook so the cache invalidates correctly after checkout.

## 2. Invoice totals breakdown formula

User-visible breakdown — keep it exactly this way (changing it breaks audit reconciliation):

```
Total Settled = Deposit Applied + Previous Cash + Current Payment
Outstanding   = Invoice Total − Total Settled
```

Always display both **Outstanding Balance** and **Available Deposit** on patient screens (UX rule from `mem://ux/patient-balance-display-standard`).

## 3. Split payments — individual rows, not concatenated

A single settlement using cash + card + wallet creates **three rows** in `invoice_payments`, not one row with `"cash+card+wallet"`. GL trigger reads each row and routes per payment method. Concatenation breaks ledger routing.

## 4. Deposit lifecycle

```
Receipt:  DR Cash/Bank        CR LIA-DEP-001 (Patient Deposits — liability)
Apply:    DR LIA-DEP-001      CR AR-001                ← internal transfer
Settle:   DR AR-001           CR Revenue – <module>
```

**IPD deposits must link to the active `billing_session_id`** — daily reconciliation fails without it. See `mem://finance/billing-session-audit-rules`.

## 5. Billing session concurrency

One **open** `billing_sessions` row per (user, counter). Opening a second one for the same pair is blocked by unique partial index. Pharmacy uses its own `pharmacy_pos_sessions` (see `pharmacy-operations`).

## 6. Daily closing — blocked by open sessions

The daily closing job refuses to run if any `billing_sessions` for the day are still `status='open'`. There is a force-close admin UI; **never bypass programmatically**. Audit trail required.

## 7. Doctor earnings — auto-calculated

`trg_unified_doctor_earnings` on `invoices` writes to `doctor_earnings`. Don't compute or insert from app code. If the number looks wrong, fix the trigger via migration, not by patching rows.

## 8. Dynamic revenue routing by service prefix

Service codes (`OPD-`, `IPD-`, `LAB-`, `RAD-`, `DLY-`, `OT-`, `RX-`, `DEN-`, `BB-`) route to module-specific revenue accounts via the invoice trigger. See `finance-gl-posting` section 4 for the full table. **Never** hardcode a revenue account in app code.

## 9. OPD checkout — fuzzy service matching + cache invalidation

When `service_type_id` is missing on an invoice line, fuzzy-match by service name/code before posting. After checkout, invalidate the pending-charges and patient-balance query keys — stale UI otherwise shows the same charges as still pending.

## 10. Walk-in invoice integrity

- Atomic insert: invoice + line items + payment + token in a single transaction.
- Use **UTC `invoice_date`** to avoid timezone shifts that misclassify the day for daily closing.
- See `clinical-workflow-conventions` for the 4-step wizard rules.

## 11. Vouchers — immutable when posted

CPV/CRV/BPV/BRV/JV in `Posted` status cannot be UPDATEd. To correct: issue a reversing voucher referencing the original. See `finance-gl-posting` section 15.

## 12. Refund handling

Refunds route via `expenses.expense_type = 'refund'` and post the reverse of the original revenue account. Never insert a manual journal to "fix" a refund.

## 13. Digital wallets ≠ cash

JazzCash, EasyPaisa, STC Pay all map to the **Bank Account (1010)** ledger. Mapping lives in DB config — don't hardcode payment-method → ledger in app code.

## See also

- `finance-gl-posting` — full revenue routing, deposit/voucher rules, trigger pattern
- `clinical-workflow-conventions` — OPD walk-in flow, lab/imaging ↔ invoice ordering
- `insurance-claims` — coverage vs copay, claim prompt timing
- `pharmacy-operations` — pharmacy-specific POS sessions
- `supabase-patterns` — `.single()` ban, empty-UUID → null, cache invalidation
