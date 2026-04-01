

# Vendor Management Overhaul + GRN Flow Fixes

## Problems Identified

1. **Vendor Detail Page is incomplete** — only shows contact info, bank details, and PO history. Missing:
   - Outstanding balance / credits summary
   - Vendor payment history
   - Current active POs (only shows last 20, no status filter)
   - No ledger account link
   - No aging breakdown (0-30, 31-60, 61-90, 90+ days)

2. **GRN Detail Page** — medicine names may still show blank in some edge cases; the `item.item?.name` fallback chain needs verification across all render points

3. **Arabic (AR) translations** — vendor-related keys exist for nav but NOT for the new vendor profile sections (outstanding, credits, payment history, aging, etc.)

## Plan

### Step 1: Enhance Vendor Detail Page with full financial profile
**File: `src/pages/app/inventory/VendorDetailPage.tsx`**

Add 3 new sections below the existing cards:

- **Outstanding Balance Card** — use existing `useVendorOutstandingBalance(id)` hook from `useVendorPayments.ts` to show:
  - Total Payable (from posted GRNs)
  - Total Paid
  - Outstanding Balance
  - Credit balance (if overpaid)

- **Aging Summary Card** — break outstanding into 0-30, 31-60, 61-90, 90+ day buckets based on GRN `received_date`

- **Payment History Tab/Section** — fetch vendor payments using `useVendorPayments` filtered by vendor ID, show table with: Payment #, Date, Amount, Method, Status, GRN reference

- **Active POs Section** — filter `purchaseHistory` to show pending/approved POs separately from completed ones, with clear status badges

### Step 2: Add `useVendorPaymentHistory` hook
**File: `src/hooks/useVendorPayments.ts`**

Add a new query function:
```ts
export function useVendorPaymentsByVendor(vendorId: string)
```
Fetches all payments for a specific vendor with joined vendor/GRN data.

### Step 3: Fix GRN Detail medicine name display
**File: `src/pages/app/inventory/GRNDetailPage.tsx`**

Audit all item name render points (not just line 313) to ensure the fallback `item.item?.name || item.medicine?.name || 'Unknown Item'` is applied everywhere.

### Step 4: Translations (EN/AR/UR)
**Files: `en.ts`, `ar.ts`, `ur.ts`**

Add keys for:
- `vendor.outstandingBalance`, `vendor.totalPayable`, `vendor.totalPaid`, `vendor.creditBalance`
- `vendor.aging`, `vendor.aging0_30`, `vendor.aging31_60`, `vendor.aging61_90`, `vendor.aging90Plus`
- `vendor.paymentHistory`, `vendor.activeOrders`, `vendor.completedOrders`
- `vendor.noPayments`, `vendor.noOutstanding`

## Files Changed
- `src/pages/app/inventory/VendorDetailPage.tsx` — add outstanding, aging, payment history, active PO sections
- `src/hooks/useVendorPayments.ts` — add `useVendorPaymentsByVendor` query
- `src/pages/app/inventory/GRNDetailPage.tsx` — medicine name fallback audit
- `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts` — new vendor profile keys

