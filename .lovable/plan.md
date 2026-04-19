

# CFO-Grade Finance Audit — Phase 5: Procurement, GL Posting & Menu Coverage

## Audit Findings

I queried the live DB (419 JE, 14 posting triggers, 49 finance pages) and identified concrete gaps.

### A. GL Posting Integrity Gaps (P0 — Material)

**Verified data:**
| Source | Total | Posted to GL | Gap |
|--------|-------|--------------|-----|
| Invoices (paid) | 115 | 113 | 2 zero-value (OK) |
| GRNs (verified/posted) | 7 | 6 | **1 missed** |
| POS | 82 | 82 | OK |
| Vendor Payments | 8 | 8 | OK |
| Expenses | 13 | 13 | OK |

**Root causes in `post_grn_to_journal` trigger:**
1. **Fires only on `status='verified'` UPDATE** — GRNs that go directly to `posted` (e.g. created already-posted) bypass GL. Missed: `GRN-20260401-0001`.
2. **Uses `CURRENT_DATE` not `received_date`** — wrong fiscal period assignment.
3. **No idempotency guard** — uses `RANDOM()` for entry_number, collision risk; violates the `IF EXISTS` rule in memory (`finance/trigger-hardening-and-idempotency`).
4. **No INSERT trigger** — only AFTER UPDATE.

### B. Menu Coverage Gaps (P0 — Visibility)

49 finance pages exist; **only 14 are wired into the menu**. Users cannot reach 35 working pages without typing URLs.

**Missing menu items under Accounts & Finance:**

*Operations (no entry):*
- Year-End Closing, Recurring Entries, PDC Register, Fixed Assets, Patient Deposits, Cost Centers, Credit Notes, Bank Reconciliation, AR Reconciliation, VAT Return, Cash-to-Bank Report, Period Management, Audit Log, Vendor Statement

*Reports (no entry — Financial Reports hub has dead code in DB):*
- Trial Balance, Balance Sheet, Cash Flow, Revenue by Source, Revenue Drill-Down, Cost Center P&L, Department P&L, Detailed P&L, Consolidated P&L, Budget Variance, Payroll Cost Allocation

### C. Procurement → Inventory → GL Flow (Verified Working)
PR → PO → GRN → `verified` → trigger → DR Inventory(1101) / CR AP(2010) → Vendor Payment → DR AP / CR Bank. **Flow is correct** when trigger fires; only edge case above is broken.

### D. Daily Sales Closing Check
`daily_closing` workflow blocks if billing sessions open (per memory). Verified — no gaps in flow logic.

---

## Plan

### Phase 5A — Trigger Hardening (Migration)
Rewrite `post_grn_to_journal` to:
- Fire on **INSERT OR UPDATE** when status enters `verified` OR `posted`
- Use `received_date` instead of `CURRENT_DATE`
- Add `IF EXISTS (SELECT 1 FROM journal_entries WHERE reference_type='grn' AND reference_id=NEW.id)` idempotency guard (per memory rule)
- Use deterministic entry_number: `'JE-GRN-' || NEW.grn_number`
- **Backfill**: post the missing GRN-20260401-0001 retroactively

### Phase 5B — Menu Restructuring (Data Migration)
Reorganize "Accounts & Finance" into 3 sub-groups for clarity:

```text
Accounts & Finance
├── Dashboard
├── Chart of Accounts
├── Journal Entries
├── General Ledger
├── Operations  (NEW group)
│   ├── Accounts Payable
│   ├── Accounts Receivable
│   ├── Vendor Payments
│   ├── Vendor Statement
│   ├── Patient Deposits
│   ├── Credit Notes
│   ├── Expense Management
│   ├── PDC Register
│   ├── Bank & Cash
│   └── Bank Reconciliation
├── Assets & Budgets  (NEW group)
│   ├── Fixed Assets
│   ├── Cost Centers
│   ├── Budgets & Fiscal Years
│   ├── Recurring Entries
│   └── Period Management
├── Reports  (NEW group, replaces orphan codes)
│   ├── Trial Balance
│   ├── Balance Sheet
│   ├── Profit & Loss
│   ├── Cash Flow
│   ├── Revenue by Source
│   ├── Revenue Drill-Down
│   ├── Department P&L
│   ├── Cost Center P&L
│   ├── Detailed P&L
│   ├── Consolidated P&L
│   ├── Budget Variance
│   ├── AR Reconciliation
│   ├── Cash-to-Bank
│   ├── Payroll Cost Allocation
│   └── VAT Return
└── Compliance  (NEW group)
    ├── Year-End Closing
    ├── Account Types
    └── Audit Log
```

Single data migration: deletes 2 orphan duplicate "Financial Reports" rows, inserts ~30 new menu rows with correct parent_id and sort_order, keeps existing 14 entries.

### Phase 5C — i18n
Add ~30 new translation keys to `en.ts`, `ar.ts`, `ur.ts` for the new menu labels.

### Phase 5D — Verification
- Re-query post-deploy: all 14 trigger functions, 0 GL gaps
- Confirm sidebar shows full 4-group structure in all 3 languages

## Files to Change

| Type | Files |
|------|-------|
| Migration (schema) | 1 — `post_grn_to_journal` v3 hardening |
| Data (insert tool) | 1 — menu_items restructure + GRN backfill |
| Code | 3 — `en.ts`, `ar.ts`, `ur.ts` |

No UI components changed — all 49 pages already exist and are routed in `App.tsx`. This phase only fixes **discoverability** and **trigger reliability**.

## Recommendation
Approve to proceed. Phase 5 closes the last audit gap: every built feature becomes reachable, every transaction is GL-posted reliably.

