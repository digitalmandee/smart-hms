

# Procurement Lifecycle Audit Report

## Scope Tested
PR (Purchase Request) → PO (Purchase Order) → GRN (Goods Received Note) → Stock Update → AP (Accounts Payable) → Vendor Payment → GL (General Ledger)

---

## WHAT WORKS CORRECTLY

1. **PR → PO conversion**: PRDetailPage has "Convert to PO" button that navigates to `/app/inventory/purchase-orders/new?from_pr={prId}`. POFormPage pre-fills items from the PR correctly (quantity, estimated cost, branch, store, notes).

2. **PO lifecycle states**: Draft → Pending Approval → Approved → Ordered → Partially Received → Received → Cancelled. All status transitions have dedicated hooks with proper cache invalidation.

3. **GRN creation linked to PO**: GRNFormPage only shows POs with status "ordered". Auto-populates remaining quantities (`quantity - received_quantity`). Supports partial deliveries.

4. **GRN verification → stock update**: `useVerifyGRN` correctly inserts into `inventory_stock` (for inventory items) or `medicine_inventory` (for medicines) with batch, expiry, vendor, and cost. Also creates `stock_adjustments` audit records.

5. **PO received quantity tracking**: On GRN verification, `purchase_order_items.received_quantity` is updated. PO status auto-transitions to `partially_received` or `received` based on fulfillment.

6. **Item-vendor mapping**: GRN verification auto-creates/updates `item_vendor_mapping` with last purchase price and date.

7. **AP tracking via PayablesPage**: Posted GRNs serve as AP entries. Outstanding = `invoice_amount - sum(vendor_payments)`. Aging filter available.

8. **Vendor payment with GL posting**: `useApproveVendorPayment` creates journal entry (DR Accounts Payable, CR Cash/Bank) and marks payment as paid. References the vendor payment as `reference_type: "vendor_payment"`.

9. **Vendor outstanding balance**: `useVendorOutstandingBalance` correctly calculates per-GRN outstanding with breakdown.

10. **Auto-generated numbers**: Triggers exist for PR, PO, GRN, vendor payment numbers — all date-based sequential.

---

## RISKS / WEAK POINTS

### High Priority

| # | Issue | Impact |
|---|-------|--------|
| 1 | **No AP journal entry on GRN posting** — When GRN status changes to "posted", no trigger or code creates a `DR Inventory Asset / CR Accounts Payable` journal entry. The AP liability is only tracked application-side (PayablesPage queries GRNs directly). The GL balance sheet is therefore **incomplete** — AP account never increases. | Balance Sheet understates liabilities; Trial Balance won't show true AP |
| 2 | **Vendor payment approval skips status check** — `useApproveVendorPayment` does not verify that payment status is "pending" before approving. A payment could be approved twice, creating duplicate journal entries. | Duplicate GL postings, inflated AP debit |
| 3 | **Cancel payment does not reverse journal** — `useCancelVendorPayment` only sets `status: "cancelled"` but does not create a reversing journal entry or delete the posted one. GL becomes permanently wrong. | Irrecoverable GL error without manual correction |
| 4 | **No batch/expiry validation on GRN** — GRNFormPage allows blank batch numbers and expiry dates with no warning. For medicines, this breaks FEFO dispensing logic and regulatory compliance. | Untraceable batches in pharmacy, expired stock not caught |
| 5 | **GRN form allows qty > ordered** — The max attribute `max={item.ordered_quantity}` is on the input but is a soft HTML constraint only; no server-side validation prevents over-receiving. | Phantom stock, PO quantity mismatch |

### Medium Priority

| # | Issue | Impact |
|---|-------|--------|
| 6 | **No duplicate GRN prevention** — Nothing prevents creating multiple GRNs against the same PO for the same items. The GRNFormPage filters POs with status "ordered" but a partially-received PO remains selectable. While remaining qty is calculated, there's no DB-level uniqueness constraint. | Accidental double-receiving |
| 7 | **PR can be converted without approval** — `useConvertPRtoPO` only sets status to "converted" but `PRDetailPage` likely controls the button visibility based on status. However, the hook itself has no guard — any caller can convert a draft/rejected PR. | Unauthorized procurement |
| 8 | **No vendor active/approval check on PO creation** — `useCreatePurchaseOrder` accepts any `vendor_id`. The vendors table has `is_active` but no code checks it before creating a PO. Inactive vendors can receive orders. | Orders to deactivated vendors |
| 9 | **Stock adjustment `previous_quantity` always 0** — In `useVerifyGRN` line 345, `previous_quantity: 0` is hardcoded rather than querying actual current stock. Audit trail is misleading. | Incorrect audit records |
| 10 | **No 3-way matching enforcement** — While the system stores PO amounts, GRN `invoice_amount`, and vendor invoice details, there is no automated comparison or alert for PO↔GRN↔Invoice price/quantity discrepancies. | Overpayment risk |

### Low Priority

| # | Issue | Impact |
|---|-------|--------|
| 11 | **No role-based guard on procurement hooks** — All mutation hooks (create PO, approve PO, verify GRN, approve payment) check only for a valid `profile` but not for specific roles (`store_manager`, `warehouse_admin`, `finance_manager`). RLS policies may exist at DB level, but client-side shows all actions to all users. | UI shows unauthorized actions |
| 12 | **No advance payment workflow** — Vendor payments require a GRN/PO link for AP tracking, but there's no mechanism for advance payments (pay before delivery) which is common in procurement. | Can't track vendor advances |
| 13 | **GRN verification is not atomic** — `useVerifyGRN` performs 5+ sequential DB operations (update GRN, insert stock, update PO items, check PO status, create adjustments, update mappings) without a transaction. A failure mid-way leaves data in an inconsistent state. | Partial stock updates on failure |
| 14 | **No GRN QC rejection workflow** — While `quantity_rejected` and `rejection_reason` fields exist on `grn_items`, the GRNFormPage hardcodes `quantity_rejected: 0` and `quantity_accepted: quantity_received`. No UI to reject items during receiving. | Can't record quality issues |

---

## CRITICAL MISSING COMPONENTS

1. **GRN → AP Journal Entry**: The biggest gap. When a GRN is posted/verified, the system should auto-create:
   - DR: Inventory Asset (INV-001) for `total_accepted_value`
   - CR: Accounts Payable (AP-001) for `invoice_amount`
   This should be a DB trigger (`post_grn_to_journal`) similar to `post_vendor_payment_to_journal`.

2. **Reversing journal on payment cancellation**: When a vendor payment is cancelled, the original journal entry must be reversed (DR Cash/Bank, CR AP).

3. **GRN verification transaction wrapper**: All stock updates should happen in a single DB function/transaction to prevent partial updates.

---

## RECOMMENDED IMPROVEMENTS

### High Priority
- Add `post_grn_to_journal` DB trigger (DR Inventory, CR AP) on GRN status change to "verified"/"posted"
- Add duplicate-payment guard in `useApproveVendorPayment` (check status === "pending")  
- Add reversing journal entry logic to `useCancelVendorPayment`
- Make batch number required for medicine items in GRN form
- Add server-side qty validation (received ≤ ordered - already_received)

### Medium Priority
- Add `is_active` vendor check in PO creation
- Add 3-way match report (PO amount vs GRN amount vs Invoice amount) with variance alerts
- Query actual `previous_quantity` for stock adjustment records
- Add QC accept/reject UI to GRN receiving form
- Add role-based button visibility for approve/reject/convert actions

### Low Priority
- Add advance payment workflow for vendors
- Wrap GRN verification in a Supabase Edge Function for atomicity
- Add procurement dashboard with cycle time metrics (PR-to-PO time, PO-to-GRN time)
- Add duplicate PO detection (same vendor + same items within X days)

---

## REPORTING AVAILABILITY

| Report | Status |
|--------|--------|
| Vendor Performance | Exists (VendorPerformanceReport) |
| Stock Levels | Exists (StockLevelsPage) |
| Dead Stock | Exists (DeadStockReport) |
| AP Aging | Exists (PayablesPage with aging filter) |
| Audit Log | Exists (FinancialAuditLogPage) |
| Reorder Alerts | Exists (ReorderAlertsPage) |
| 3-Way Match Report | Missing |
| Procurement Cycle Time | Missing |
| GRN Discrepancy Report | Missing |
| Vendor Payment Aging | Partially (via PayablesPage) |

---

## SUMMARY

The procurement lifecycle is **functionally complete** end-to-end (PR→PO→GRN→Stock→Payment) with good UI coverage. The most critical gap is the **missing AP journal entry on GRN**, which means the Balance Sheet and Trial Balance understate liabilities. The second critical issue is **non-atomic GRN verification** and **no journal reversal on payment cancellation**. Addressing the 5 High Priority items would bring the system to production-grade accounting integrity.

