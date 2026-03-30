

# Procurement Lifecycle — Full Verification & Manual Testing Scenarios

## Current State Assessment

After reviewing all hooks (`useGRN`, `usePurchaseOrders`, `usePurchaseRequests`, `useVendorPayments`), pages (PR, PO, GRN, Payables, VendorPayments), and the recently added fixes (GRN→AP journal trigger, double-approval guard, reversal logic, batch/qty validation), here is the complete verification plan and manual testing guide.

---

## A. Process Flow Verification (Screen-by-Screen)

### Screen 1: Purchase Request (PR)
**Pages**: PRListPage → PRFormPage → PRDetailPage
**Flow**: Draft → Submit (pending_approval) → Approve/Reject → Convert to PO

| Check | Status |
|-------|--------|
| PR form creates draft with items | ✅ Working |
| Submit changes status to pending_approval | ✅ Working |
| Approve/Reject with reason dialog | ✅ Working |
| Convert to PO navigates to PO form with `?from_pr=` | ✅ Working |
| PR hook has no status guard on convert | ⚠️ Risk — hook allows converting draft/rejected PR |

### Screen 2: Purchase Order (PO)
**Pages**: POListPage → POFormPage → PODetailPage
**Flow**: Draft → Pending Approval → Approved → Ordered → Partially Received → Received

| Check | Status |
|-------|--------|
| PO form pre-fills from PR items | ✅ Working |
| Vendor selection and item addition | ✅ Working |
| Approve/Order status transitions | ✅ Working |
| "Receive Goods" button links to GRN form | ✅ Working |
| No vendor `is_active` check on creation | ⚠️ Risk |

### Screen 3: GRN (Goods Received Note)
**Pages**: GRNListPage → GRNFormPage → GRNDetailPage
**Flow**: Create from PO → Draft → Verify (stock update) → Post (AP journal fires)

| Check | Status |
|-------|--------|
| GRN form loads remaining PO quantities | ✅ Working |
| Batch number required for medicines | ✅ Fixed (just added) |
| Qty validation (≤ ordered) | ✅ Fixed (just added) |
| Verify creates stock entries | ✅ Working |
| Verify updates PO received_quantity | ✅ Working |
| PO auto-transitions to partially_received/received | ✅ Working |
| QC pass/fail/quarantine per item | ✅ Working (GRNDetailPage) |
| Barcode scan to highlight items | ✅ Working |
| GRN→AP journal trigger on verify | ✅ Fixed (just added) |
| Stock adjustment `previous_quantity` always 0 | ⚠️ Known issue |

### Screen 4: Accounts Payable
**Pages**: PayablesPage
**Flow**: Shows posted GRNs with outstanding amounts

| Check | Status |
|-------|--------|
| Lists posted GRNs with vendor info | ✅ Working |
| Calculates outstanding = invoice_amount - payments | ✅ Working |
| Aging filter (0-30, 31-60, 61-90, 90+) | ✅ Working |
| "Record Payment" links to vendor payment form | ✅ Working |

### Screen 5: Vendor Payments
**Pages**: VendorPaymentsListPage → VendorPaymentFormPage → VendorPaymentDetailPage
**Flow**: Create → Pending → Approve (journal posted) → or Cancel (journal reversed)

| Check | Status |
|-------|--------|
| Payment form with vendor/GRN/PO link | ✅ Working |
| Approve creates DR AP / CR Cash journal | ✅ Working |
| Double-approval guard (status check) | ✅ Fixed (just added) |
| Cancel creates reversing journal entry | ✅ Fixed (just added) |
| Cancel guard (already cancelled check) | ✅ Working |

### Screen 6: GL Verification
**Pages**: JournalEntriesPage, TrialBalancePage, GeneralLedgerPage

| Check | Status |
|-------|--------|
| GRN verification posts DR Inventory / CR AP | ✅ Fixed (trigger added) |
| Vendor payment posts DR AP / CR Cash | ✅ Working |
| Payment cancel reverses journal | ✅ Fixed |
| Trial balance shows opening/movement/closing | ✅ Enhanced |

---

## B. Manual Testing Scenarios

### Scenario 1: Happy Path — Full Cycle
```
1. Go to /app/inventory/purchase-requests → New PR
2. Add 3 items (mix inventory + medicines), set quantities and estimated costs
3. Submit PR → Status becomes "Pending Approval"
4. Approve PR → Status becomes "Approved"
5. Click "Convert to PO" → Redirected to PO form with items pre-filled
6. Select vendor, confirm items/prices → Save PO (Draft)
7. Submit PO → Approve PO → Mark as Ordered
8. Go to /app/inventory/grn → New GRN
9. Select the PO → Items auto-populate with remaining quantities
10. Enter received qty, batch numbers (required for medicines), expiry dates
11. Save GRN → Status: Draft
12. Open GRN Detail → Verify GRN
    ✓ Stock updated in inventory_stock / medicine_inventory
    ✓ PO status changes to "received" (or "partially_received")
    ✓ stock_adjustments records created
13. Post GRN → Status: Posted
    ✓ Journal entry created: DR Inventory Asset, CR Accounts Payable
14. Go to /app/accounts/payables → See the GRN with outstanding amount
15. Click "Record Payment" → Fill amount, payment method
16. Save → Payment status: Pending
17. Open payment → Approve
    ✓ Journal entry: DR AP, CR Cash/Bank
    ✓ Outstanding amount reduces on payables page
18. Verify in Trial Balance: AP and Inventory accounts reflect correctly
```

### Scenario 2: Partial Delivery
```
1. Create PO with Item A (qty 100) and Item B (qty 50)
2. Order the PO
3. Create GRN #1: Receive Item A = 60, Item B = 30
4. Verify GRN #1 → PO status should be "partially_received"
5. Create GRN #2: Receive remaining Item A = 40, Item B = 20
6. Verify GRN #2 → PO status should change to "received"
7. Both GRNs should appear in Payables with separate outstanding amounts
```

### Scenario 3: Medicine Batch Validation
```
1. Create PO with medicine items
2. Create GRN → Try to save with blank batch number for medicine
   ✓ Should show error: "Batch number is required for medicine items"
3. Enter batch number but leave expiry blank → Should still save (warning only)
4. Try entering received qty > ordered qty
   ✓ Should show error about exceeding ordered quantity
```

### Scenario 4: Payment Cancellation & Journal Reversal
```
1. Complete a full cycle up to vendor payment approval
2. Note the journal entry number on the payment
3. Cancel the payment
   ✓ A reversing journal entry should be created (DR Cash, CR AP)
   ✓ Payment status changes to "cancelled"
4. Check Trial Balance → AP and Cash should return to pre-payment state
5. Try cancelling the same payment again
   ✓ Should show error: "Payment is already cancelled"
```

### Scenario 5: Double-Approval Prevention
```
1. Create and submit a vendor payment
2. Approve it once → Should succeed
3. Try approving the same payment again (e.g., via browser back + re-click)
   ✓ Should show error: "Payment is already approved"
4. No duplicate journal entries should exist
```

### Scenario 6: GRN QC Workflow
```
1. Create and save a GRN (status: Draft)
2. Open GRN Detail → Use QC buttons (Pass/Fail/Quarantine) per item
3. Mark some items as "Failed"
4. Verify GRN → All items still get stocked (QC is informational only currently)
   ⚠️ Note: QC rejection doesn't reduce accepted quantity — this is a known gap
```

### Scenario 7: PR Without Approval
```
1. Create a PR (Draft status)
2. Try "Convert to PO" button
   ✓ Button should only appear when status = "approved"
   ⚠️ Risk: The hook itself has no guard — direct API call could bypass
```

### Scenario 8: Inactive Vendor
```
1. Deactivate a vendor (set is_active = false)
2. Try creating a PO for that vendor
   ⚠️ Current behavior: PO creation succeeds — no active check in hook
   Expected: Should prevent or warn about inactive vendor
```

### Scenario 9: GL Reconciliation Check
```
1. Run full cycle: PO → GRN (verify + post) → Vendor Payment (approve)
2. Go to Trial Balance (/app/accounts/trial-balance)
3. Check:
   - Inventory Asset account: should show debit increase = GRN value
   - AP account: should show credit increase (GRN) then debit decrease (payment)
   - Cash account: should show credit decrease = payment amount
4. If full payment made: AP net change = 0 for this transaction
```

### Scenario 10: Reporting Verification
```
1. Go to /app/accounts/payables → Verify aging buckets
2. Go to /app/accounts/vendor-payments → Verify payment list and filters
3. Go to /app/accounts/trial-balance → Verify account grouping and totals
4. Go to /app/accounts/journal-entries → Search for GRN journal entries
5. Go to /app/accounts/ledger → Check AP account transaction history
6. Go to /app/inventory/reports → Check stock levels reflect GRN receipts
```

---

## C. Known Gaps (Not Blocking, For Awareness)

| # | Gap | Severity |
|---|-----|----------|
| 1 | `previous_quantity` in stock adjustments hardcoded to 0 | Low |
| 2 | QC fail/quarantine doesn't reduce accepted quantity | Medium |
| 3 | No vendor `is_active` check on PO creation | Medium |
| 4 | PR convert hook has no status guard | Medium |
| 5 | GRN verification not wrapped in DB transaction | Low |
| 6 | No 3-way match report (PO vs GRN vs Invoice) | Medium |
| 7 | No advance payment workflow | Low |

---

## D. What Was Fixed in This Session

1. **GRN→AP Journal Trigger** — `post_grn_to_journal` creates DR Inventory / CR AP on verify
2. **Double-Approval Guard** — `useApproveVendorPayment` checks status before approving
3. **Payment Cancellation Reversal** — `useCancelVendorPayment` creates reversing journal entry
4. **Batch Number Validation** — Required for medicine items in GRN form
5. **Quantity Over-Receive Guard** — Prevents receiving more than ordered in GRN form
6. **Invoice balance_amount Fix** — Now updates on every payment recording

No code changes needed — this is a verification and testing reference document.

