

# Add Refund Button to Pharmacy POS Transaction Pages

## Problem
The pharmacy POS transaction detail page only has a "Void Transaction" button. There is no way to initiate a refund directly from a transaction — the pharmacist must navigate separately to `/app/pharmacy/returns` and search for the transaction manually.

## Plan

### 1. Add Refund Button to Transaction Detail Page
**File: `src/pages/app/pharmacy/POSTransactionDetailPage.tsx`**
- Add a "Refund" button (with `RotateCcw` icon) next to "Void Transaction" for completed transactions
- Clicking opens the same return dialog flow used on `PharmacyReturnsPage` — shows items with quantity selector and refund method
- Pre-populate the dialog with the transaction's items (no search needed since we already have the data)
- After successful refund, refresh transaction data and show success toast

### 2. Add Refund Action to Transactions List
**File: `src/pages/app/pharmacy/POSTransactionsPage.tsx`**
- Add a `RotateCcw` icon button in the actions column next to the existing "View" (eye) button, only for `completed` status transactions
- Clicking navigates to the transaction detail page (where the refund dialog lives)

### 3. Refund Dialog Component (extract for reuse)
**New file: `src/components/pharmacy/POSRefundDialog.tsx`**
- Extract the return dialog logic from `PharmacyReturnsPage` into a reusable component
- Props: `transaction` data (with items), `open`, `onOpenChange`, `onSuccess`
- Includes `ReturnItemSelector` for choosing items/quantities and `RefundMethodSelector` for refund method
- Calls `useProcessReturn` mutation on submit

### 4. i18n Keys
**Files: `en.ts`, `ar.ts`, `ur.ts`**
- Add keys: "Refund", "Process Refund", "Refund Items"

## Technical Details
- The `ReturnItemSelector` and `RefundMethodSelector` components already exist and work correctly
- The `useProcessReturn` hook handles stock restoration and return record creation
- The refund dialog will map `transaction.items` to `ReturnableItem[]` format directly — no additional API call needed
- Only show refund button for transactions with status `completed` (not already voided/refunded)

## Files Changed
- `src/components/pharmacy/POSRefundDialog.tsx` — new reusable refund dialog
- `src/pages/app/pharmacy/POSTransactionDetailPage.tsx` — add Refund button that opens dialog
- `src/pages/app/pharmacy/POSTransactionsPage.tsx` — add refund icon in actions column
- `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts` — new keys

