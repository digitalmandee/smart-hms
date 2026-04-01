

# Procurement-to-P&L: Gap Analysis & Testing Flow

## Current GL Trigger Map

```text
STEP                    TRIGGER EXISTS?   GL ENTRY
─────────────────────── ───────────────── ──────────────────────────────
1. Create PO            No trigger        No GL (correct — commitment only)
2. GRN (Receive Goods)  ❌ NO TRIGGER     MISSING: DR Inventory, CR AP
3. Vendor Payment       ✅ Exists         DR AP, CR Cash/Bank
4. POS Sale             ✅ Exists         DR Cash, CR Revenue + DR COGS, CR Inventory
5. Stock Write-off      ✅ Exists         DR Write-off Expense, CR Inventory
```

## ❌ CRITICAL GAP: No GRN Journal Posting

When goods are received via GRN, the system should post:
- **DR** `INV-001` (Inventory Asset) — stock value increases
- **CR** `AP-001` (Accounts Payable) — liability to vendor created

**Without this**, the entire procurement chain is broken:
- Inventory Asset account never increases when stock arrives
- Accounts Payable never shows vendor liability from purchases
- Vendor Payment trigger debits AP, but AP was never credited → AP balance goes wrong
- P&L COGS deduction (on POS sale) reduces an Inventory account that was never loaded

## Fix: Create `post_grn_to_journal` Trigger

A new database trigger on `goods_received_notes` that fires when `status` changes to `'accepted'` (or on insert if no approval flow):

```text
DR  INV-001  Inventory Asset       (total GRN value)
CR  AP-001   Accounts Payable      (total GRN value)
```

GRN value = `SUM(quantity_received × unit_price)` from `grn_items`.

Entry number format: `JE-GRN-YYMMDD-XXXX`

## Complete Procurement → P&L Flow After Fix

```text
STEP 1: PO Created
  → No GL entry (commitment only, off-balance sheet)

STEP 2: GRN Received (goods arrive)
  → DR Inventory Asset (INV-001)     +10,000
  → CR Accounts Payable (AP-001)     +10,000
  P&L impact: NONE (asset ↔ liability)

STEP 3: Vendor Payment
  → DR Accounts Payable (AP-001)     -10,000
  → CR Cash in Hand (CASH-001)       -10,000
  P&L impact: NONE (liability ↔ asset)

STEP 4: POS Sale (medicine sold to patient)
  → DR Cash (CASH-001)               +15,000
  → CR Pharmacy Revenue (REV-PHARM)  +15,000
  → DR COGS (EXP-COGS-001)          +10,000
  → CR Inventory Asset (INV-001)     -10,000
  P&L impact: Revenue +15,000, COGS +10,000 = Gross Profit +5,000
```

## Testing Flow for User

1. **Add a vendor** in Inventory → Vendors
2. **Create a Purchase Order** for medicines (e.g., 100 × Paracetamol @ Rs. 10)
3. **Receive GRN** against the PO → Check GL: Inventory +1,000, AP +1,000
4. **Make Vendor Payment** → Check GL: AP -1,000, Cash -1,000
5. **Sell via POS** → Check GL: Cash +1,500, Revenue +1,500, COGS +1,000, Inventory -1,000
6. **Check P&L** → Revenue 1,500, COGS 1,000, Gross Profit 500

## Technical Details

### Migration: `post_grn_to_journal` trigger function

- Fires `AFTER UPDATE` on `goods_received_notes` when `status` changes to `'accepted'`
- Also fires `AFTER INSERT` if inserted directly with `status = 'accepted'`
- Calculates total from `grn_items`: `SUM(quantity_received * unit_price)`
- Uses `get_or_create_default_account` for `INV-001` and `AP-001`
- Entry number: `JE-GRN-YYMMDD-XXXX`
- Reference type: `'grn'`
- No manual balance updates (handled by `update_account_balance` trigger)

### Also need to add `'grn'` to journal_entries reference_type constraint

Check if the constraint exists and add `'grn'` to the allowed values.

## Files Changed
- `supabase/migrations/new.sql` — create `post_grn_to_journal` trigger function + trigger + constraint update

