---
name: finance-gl-posting
description: General Ledger posting rules for HealthOS 24 — 4-level Chart of Accounts, idempotent DB triggers (never manual journals in app code), prefix-based revenue routing (IPD-/LAB-/DLY-), expense and vendor payment routing, deposit lifecycle (LIA-DEP-001 → AR-001), pharmacy COGS, IPD accrual lifecycle, and daily closing constraints. Apply whenever working on invoices, journals, vouchers, POS, GRN, payroll posting, or any accounting-touching code.
---

# Finance / GL Posting Rules

This codebase has 15+ financial modules feeding one ledger. The rules below are what keep it consistent. Break them and the trial balance breaks silently.

## 1. Golden rule — no manual journals in app code

Application code **never inserts into `journal_entries` or `journal_entry_lines`** except for explicit manual vouchers (CPV/CRV/BPV/BRV/JV) created through the voucher UI.

All operational postings (invoices, POS sales, GRN acceptance, payroll, deposits, surgery completion, expense approval…) are handled by **idempotent DB triggers**:

```sql
-- Canonical idempotency guard
IF EXISTS (
  SELECT 1 FROM journal_entries
  WHERE source_type = 'invoice' AND source_id = NEW.id
) THEN
  RETURN NEW;
END IF;
```

If a posting is missing or wrong, fix it at the trigger level via a migration. Do **not** patch by inserting from the app. See `references/trigger-pattern.md`.

## 2. Chart of Accounts — 4 levels

```
Level 1: 1000 Assets
  Level 2: 1100 Current Assets
    Level 3: 1110 Cash & Bank
      Level 4: 1110-01 Cash on Hand   ← posting allowed ONLY here
```

- Journals post **only to Level 4** accounts.
- `entry_number` field must be **empty string `""`** on insert — the DB sequence generates it. Passing a value breaks the chain.

## 3. `account_types.category` is lowercase

Always normalize:

```ts
.eq("account_types.category", category.toLowerCase())
// or in JS filtering:
accounts.filter(a => a.account_types.category.toLowerCase() === "revenue")
```

Reporting hooks that skip this silently return empty arrays.

## 4. Prefix-based revenue routing

Service codes encode their destination ledger. The trigger reads the prefix and routes:

| Prefix | Routes to | Module |
|---|---|---|
| `OPD-` | Revenue – OPD | OPD consultations |
| `IPD-` | Revenue – IPD | Inpatient services |
| `LAB-` | Revenue – Lab | Laboratory |
| `RAD-` / `IMG-` | Revenue – Radiology | Imaging |
| `DLY-` | Revenue – Dialysis | Dialysis sessions |
| `OT-` / `SRG-` | Revenue – Surgery | OT procedures |
| `RX-` / `PHM-` | Revenue – Pharmacy | POS / dispensing |
| `DEN-` | Revenue – Dental | Dental |
| `BB-` | Revenue – Blood Bank | Blood services |

See `references/account-prefixes.md` for the full table including expense routing.

## 5. Expense routing

`expenses.expense_type` drives the debit account:

| `expense_type` | Debit account |
|---|---|
| `petty_cash` | Routed dynamically based on linked petty-cash account |
| `refund` | Reverse of original revenue account |
| `staff_advance` | Staff Advances (asset) |
| `vendor_payment` | AP-001 (Accounts Payable) |
| *anything else* | `5500` (General Expenses) |

Credit side: Cash or Bank, resolved from the payment method.

## 6. Deposit lifecycle

Patient deposits are a **liability** until consumed:

```
Receipt:   DR Cash/Bank        CR LIA-DEP-001 (Patient Deposits)
Apply:     DR LIA-DEP-001      CR AR-001 (Accounts Receivable)   ← internal transfer
Settle:    DR AR-001           CR Revenue – <module>
```

IPD deposits **must** link to the active `billing_session_id` for daily reconciliation. Missing link = session can't close.

## 7. Pharmacy COGS

POS sale triggers two postings:

```
Revenue:  DR Cash/Card         CR Revenue – Pharmacy
COGS:     DR EXP-COGS-001      CR INV-001 (Inventory)   ← cost basis
```

Cost basis comes from `medicine_inventory.unit_cost` (note: pharmacy schema uses `unit_cost` + `created_at`, not the generic `cost_price` + `inserted_at`).

## 8. Procurement (GRN acceptance)

```
GRN verified: DR INV-001 (Inventory)   CR AP-001 (Accounts Payable)
```

GRN verification is an **atomic RPC** with a unique-index idempotency guard. The same GRN cannot post twice even under concurrent verification.

## 9. Vendor payment

```
DR AP-001 (Accounts Payable)   CR Cash / Bank (resolved from payment_method)
```

Never debit an expense account on vendor payment — the expense was already recognized at GRN time.

## 10. IPD accrual lifecycle

IPD is **accrual basis**:
- During stay: `ipd_charges` accumulate **off-ledger**. `is_billed = false`.
- On discharge: the discharge invoice trigger sweeps unbilled `ipd_charges`, marks them `is_billed = true`, and posts the consolidated revenue entry.
- Never insert ad-hoc journals for in-progress IPD stays.

## 11. Doctor earnings

Auto-calculated by `trg_unified_doctor_earnings` on `invoices`. Do not compute or insert into `doctor_earnings` from app code.

## 12. Digital wallets

JazzCash / EasyPaisa / STC Pay map to the **Bank Account (1010)** ledger, not cash. The payment method → ledger mapping lives in DB config — don't hardcode.

## 13. Daily closing

The daily closing job is **blocked** if any `billing_sessions` for the day are still `status = 'open'`. Force-close UI exists for admins; never bypass the check programmatically.

## 14. ZATCA chaining (KSA)

Phase 2 invoices must chain via SHA-256 of the previous invoice's XML. Missing or out-of-order chain = ZATCA rejection. The `zatca-einvoice` edge function handles this — do not generate XML in the frontend.

## 15. Voucher immutability

Vouchers in `Posted` status are **immutable**. To correct: issue a **reversing entry** as a new voucher referencing the original. Never UPDATE a posted voucher.
