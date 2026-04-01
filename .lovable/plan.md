

# GRN Verification → Requisition Acceptance → Pharmacy Inventory Flow

## Current State

### What exists:
1. **GRN creation** works from PO (GRNFormPage selects PO → populates items → creates GRN)
2. **GRN verification** (`useVerifyGRN`) updates stock directly into `inventory_stock` or `medicine_inventory` immediately
3. **Requisition flow** has: draft → pending → approved → issued → received/disputed
4. **Requisition "Issue Stock"** deducts from `inventory_stock` (FIFO) and marks items issued
5. **Requisition "Accept Stock"** button exists for pharmacist role when status is `issued`

### What's missing:
- GRN has **no link to the originating requisition** — there's no `requisition_id` column on `goods_received_notes`
- When GRN is verified, stock goes directly to inventory — **the requesting department (pharmacy) is never notified**
- No workflow to notify the requisitioner that goods have arrived and need acceptance
- GRN detail page line 313 shows `item.item?.name` but **not `item.medicine?.name`** — medicine names show blank

### Bug found:
- GRN detail page (line 313): `{item.item?.name}` — does not fallback to `{item.medicine?.name}` for medicine-type items

## Plan

### Step 1: Fix GRN Detail — medicine name display
**File: `src/pages/app/inventory/GRNDetailPage.tsx`**
- Line 313: Change `{item.item?.name}` to `{item.item?.name || item.medicine?.name || 'Unknown'}`

### Step 2: Add `requisition_id` to `goods_received_notes` table
**Migration**: Add nullable `requisition_id` column with FK to `stock_requisitions`:
```sql
ALTER TABLE goods_received_notes 
ADD COLUMN requisition_id UUID REFERENCES stock_requisitions(id);
```

### Step 3: Link GRN to requisition in GRNFormPage
**File: `src/pages/app/inventory/GRNFormPage.tsx`**
- Accept `?requisitionId=` search param
- When PO is linked to a requisition, auto-populate `requisition_id`
- Pass `requisition_id` through to `useCreateGRN`

**File: `src/hooks/useGRN.ts`**
- Add `requisition_id` to `useCreateGRN` mutation payload and insert

### Step 4: Add GRN verification → requisition notification flow
**File: `src/hooks/useGRN.ts` — `useVerifyGRN`**
Currently: Verification immediately adds to `medicine_inventory` / `inventory_stock`.
Change: 
- When GRN has a `requisition_id`, after stock is added, auto-update the linked requisition status to `issued` (goods arrived, pending department acceptance)
- This triggers the existing "Accept Stock / Dispute" buttons on the requisition detail page for the pharmacist

### Step 5: On requisition acceptance → update pharmacy inventory
**File: `src/hooks/useRequisitions.ts`** or **`src/pages/app/inventory/RequisitionDetailPage.tsx`**
- When pharmacist clicks "Accept Stock" on a requisition linked to a GRN with medicine items, the `medicine_inventory` records are already created by GRN verification
- Update requisition status to `received`
- This completes the flow

### Step 6: Add "Notify Requester" button on GRN detail
**File: `src/pages/app/inventory/GRNDetailPage.tsx`**
- When GRN is verified and has a `requisition_id`, show a banner: "Goods received for Requisition REQ-XXXX — Requester has been notified"
- Link to the requisition detail page

### Step 7: Translations (EN/AR/UR)
Add translation keys for:
- "Linked Requisition", "Requester Notified", "Goods received for requisition", "Accept Delivery", "Dispute Delivery"

## Flow Summary

```text
CURRENT FLOW:
  Requisition (Pharmacy) → Approved → Create PO → Vendor ships → GRN created → Verified → Stock added immediately

NEW FLOW:
  Requisition (Pharmacy) → Approved → Create PO → Vendor ships
  → GRN created (linked to requisition)
  → GRN Verified (stock added + requisition marked "issued")
  → Pharmacist sees "Accept Stock" on requisition
  → Pharmacist accepts → Requisition status = "received" ✓
  → If dispute → Requisition status = "disputed"
```

## Files Changed
- `src/pages/app/inventory/GRNDetailPage.tsx` — medicine name fix + requisition link display
- `src/hooks/useGRN.ts` — add `requisition_id` to create/verify mutations
- `src/pages/app/inventory/GRNFormPage.tsx` — pass `requisition_id` from PO/search params
- `src/lib/i18n/translations/en.ts`, `ar.ts`, `ur.ts` — new keys
- **Migration**: add `requisition_id` column to `goods_received_notes`

