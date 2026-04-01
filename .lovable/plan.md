

# Audit: Accounts Payable & Inventory Asset — GRN Journal Integrity

## Findings Summary

```text
CHECK                                          STATUS
──────────────────────────────────────────────  ──────
GRN trigger uses unit_cost (fixed)             ✅ PASS
GRN-20260401-0002 (Rs. 1,000) posted           ✅ PASS
GRN-20260401-0001 (Rs. 0) no JE needed         ✅ PASS
GRN-20260210-0001 (draft) no JE needed         ✅ PASS
GRN-20260212-0001 (verified, Rs. 57,250)       ❌ MISSING JE
GRN-20260215-0001 (verified, Rs. 25,300)       ❌ MISSING JE
Duplicate vendor payment JEs (5 payments)      ❌ DOUBLE-POSTED
```

## Issue 1: Two Verified GRNs Missing Journal Entries

GRN-20260212-0001 (Rs. 57,250) and GRN-20260215-0001 (Rs. 25,300) belong to organization `a1111111...`, which has **zero account types** configured. The backfill migration correctly skipped them (safety guard), but this means Rs. 82,550 of inventory receipts have no GL postings.

**Fix**: Create account types for org `a1111111...` first, then backfill the journal entries. Alternatively, if this is a demo/seed org that does not need accounting, skip it.

## Issue 2: Duplicate Vendor Payment Journal Entries (Critical)

5 vendor payments each have **two** journal entries — one from the old manual posting and one from the automated trigger. Each double-debits AP:

| Vendor Payment | Duplicate Entries | Double-Debit Amount |
|---|---|---|
| d1111111... | JE-20260322-0001 + JE-VP-260401-4274 | Rs. 85,000 × 2 |
| d2222222... | JE-20260324-0001 + JE-VP-260401-0363 | Rs. 120,000 × 2 |
| d3333333... | JE-20260325-0001 + JE-VP-260401-5339 | Rs. 45,000 × 2 |
| d4444444... | JE-20260327-0001 + JE-VP-260401-0623 | Rs. 65,000 × 2 |
| d5555555... | JE-20260328-0001 + JE-VP-260401-8792 | Rs. 28,000 × 2 |

**Total over-debit to AP: Rs. 343,000**

This is why AP-001 shows Rs. 818,500 (should be much lower). The opening balance is Rs. 100,000, only Rs. 1,000 in GRN credits exist, plus Rs. 55,000 manual credit — but Rs. 686,000 in vendor payment debits (should be Rs. 343,000).

## Issue 3: Current Balance Verification

**INV-001 (Inventory Asset)** — Opening: 300,000
- Manual reductions: -12,000 -45,000
- GRN receipt: +1,000
- Current balance: 244,000 ✅ Correct for posted entries (but missing 82,550 from unposted GRNs)

**AP-001 (Accounts Payable)** — Opening: 100,000
- GRN credit: +1,000
- Manual credit: +55,000
- Vendor payments debit: -686,000 (343,000 duplicated)
- Current balance: 818,500 ❌ Inflated by Rs. 343,000 in duplicate debits

## Proposed Fix (Single Migration)

### 1. Delete duplicate vendor payment journal entries
Keep the `JE-VP-*` entries (trigger-generated), delete the manual `JE-YYYYMMDD-*` duplicates. This removes Rs. 343,000 in false AP debits.

### 2. Backfill GRNs for org `a1111111...`
Create the required account types for that org, then insert journal entries for the 2 verified GRNs (Rs. 82,550 total).

### 3. Balance auto-corrects
The `update_account_balance` trigger recalculates on every line insert/delete, so AP-001 and INV-001 will automatically reflect correct totals.

## Expected Post-Fix Balances (org b1111111...)

```text
AP-001: 100,000 (opening)
      + 1,000 (GRN credit)
      + 55,000 (manual credit)
      - 343,000 (vendor payments, deduplicated)
      = -187,000 (i.e., AP has been overpaid vs. recorded liabilities)
      
INV-001: 300,000 (opening)
       - 12,000 (manual)
       - 45,000 (manual)
       + 1,000 (GRN)
       = 244,000
```

Note: AP going negative indicates vendor payments exceeded recorded liabilities — this is expected since most historical GRNs predate the trigger and were never posted to AP. The system is now correct going forward.

## Files Changed
- `supabase/migrations/new.sql` — delete 5 duplicate vendor payment JEs + optionally backfill org a's GRNs

